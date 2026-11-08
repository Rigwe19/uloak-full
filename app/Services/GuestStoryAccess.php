<?php

namespace App\Services;

use App\Models\Event;
use App\Models\GuestIdentity;
use App\Models\Media;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Cookie as SymfonyCookie;

/**
 * Guest ownership + private-room visibility for share surfaces.
 *
 * Identity is a signed httpOnly cookie holding the GuestIdentity UUID
 * (issued on first contribution, 1-year sliding). Legacy name/email
 * matching is kept as a fallback for pre-migration stories that were
 * never linked to a GuestIdentity.
 */
class GuestStoryAccess
{
    public const COOKIE = 'ulo_guest_identity';

    public const COOKIE_MINUTES = 525600; // 1 year

    /**
     * Resolve the guest from the signed cookie, scoped to the room/event.
     * Returns null for visitors without a matching, unexpired identity.
     */
    public function resolve(Request $request, ?Room $room = null, ?Event $event = null): ?GuestIdentity
    {
        $raw = $request->cookie(self::COOKIE);
        if (! is_string($raw) || trim($raw) === '') {
            return null;
        }

        $uuid = $this->unsign($raw);
        if ($uuid === null) {
            return null;
        }

        $guest = GuestIdentity::where('uuid', $uuid)->first();
        if (! $guest || $guest->isExpired()) {
            return null;
        }

        if ($room && (int) $guest->room_id !== (int) $room->id) {
            return null;
        }

        if ($event && (int) $guest->event_id !== (int) $event->id) {
            return null;
        }

        return $guest;
    }

    /**
     * Build the cookie to persist a guest identity on the response.
     * httpOnly so frontend JS cannot read/forge the uuid; the browser
     * still sends it on every share request.
     */
    public function cookieFor(GuestIdentity $guest): SymfonyCookie
    {
        return cookie(
            self::COOKIE,
            $this->sign($guest->uuid),
            self::COOKIE_MINUTES,
            '/',
            null,
            (bool) config('app.secure', false),
            true,
            false,
            'lax'
        );
    }

    public function sign(string $uuid): string
    {
        $key = (string) config('app.key', '');

        return $uuid.'.'.hash_hmac('sha256', $uuid, $key);
    }

    public function unsign(string $raw): ?string
    {
        $parts = explode('.', trim($raw), 2);
        if (count($parts) !== 2) {
            return null;
        }

        [$uuid, $signature] = $parts;
        $key = (string) config('app.key', '');
        $expected = hash_hmac('sha256', $uuid, $key);

        if (! hash_equals($expected, $signature)) {
            return null;
        }

        return $uuid;
    }

    /**
     * Privileged viewers (creator / room member / admin) always see
     * everything, including in private rooms.
     */
    public function isPrivileged(?User $user, Room|Event $space): bool
    {
        if (! $user) {
            return false;
        }

        if ((bool) $user->is_admin) {
            return true;
        }

        if ($space instanceof Room) {
            return $space->created_by === $user->id
                || $space->members()->where('users.id', $user->id)->exists();
        }

        return ($space->created_by ?? null) === $user->id;
    }

    /**
     * Whether the guest is delivery-filtered for this room/event:
     * private + not privileged.
     */
    public function isFiltered(?User $user, Room|Event $space): bool
    {
        return $space->isPrivate() && ! $this->isPrivileged($user, $space);
    }

    /**
     * Apply the private feed filter. Public rooms and privileged users
     * get the query untouched. Filtered guests without an identity see
     * nothing (empty feed), which is the correct private default.
     */
    public function applyPrivateFilter(Builder $query, ?User $user, Room|Event $space, ?GuestIdentity $guest): Builder
    {
        if (! $this->isFiltered($user, $space)) {
            return $query;
        }

        return $query->where(function ($q) use ($guest) {
            if (! $guest) {
                $q->whereRaw('1 = 0');

                return;
            }

            $name = strtolower(trim((string) $guest->name));
            $email = $guest->email ? strtolower(trim((string) $guest->email)) : null;

            $q->where('stories.guest_identity_id', $guest->id)
                ->orWhere(function ($legacy) use ($name, $email) {
                    $legacy->whereNull('stories.guest_identity_id')
                        ->whereRaw('LOWER(TRIM(stories.guest_name)) = ?', [$name]);

                    if ($email !== null) {
                        $legacy->where(function ($emailScope) use ($email) {
                            $emailScope->whereNull('stories.guest_email')
                                ->orWhereRaw('LOWER(TRIM(stories.guest_email)) = ?', [$email]);
                        });
                    }
                });
        });
    }

    /**
     * Whether a single story's follow-ups should be visible to the
     * viewer. Public/privileged sees all; filtered guests only their own.
     */
    public function storyVisibleTo(Story $story, ?User $user, Room|Event $space, ?GuestIdentity $guest): bool
    {
        if (! $this->isFiltered($user, $space)) {
            return true;
        }

        return $this->guestMatchesStory($story, $guest);
    }

    /**
     * Primary ownership check: signed-cookie identity link, with a
     * legacy name/email fallback for unlinked stories.
     */
    public function guestMatchesStory(Story $story, ?GuestIdentity $guest): bool
    {
        if (! $guest) {
            return false;
        }

        if ($story->guest_identity_id !== null) {
            return (int) $story->guest_identity_id === (int) $guest->id;
        }

        $storyName = strtolower(trim((string) $story->guest_name));
        $guestName = strtolower(trim((string) $guest->name));
        if ($storyName === '' || $storyName !== $guestName) {
            return false;
        }

        $storyEmail = $story->guest_email ? strtolower(trim((string) $story->guest_email)) : null;
        if ($storyEmail === null) {
            return true;
        }

        $guestEmail = $guest->email ? strtolower(trim((string) $guest->email)) : null;

        return $guestEmail !== null && $storyEmail === $guestEmail;
    }

    /**
     * Shared write-gate for guest delete/edit. Privileged users pass;
     * otherwise the cookie identity must own the story, with a
     * supplied name/email fallback for legacy rows (mirrors the
     * pre-existing destroyStory behaviour).
     */
    public function canGuestModifyStory(Story $story, ?User $user, ?GuestIdentity $guest, ?string $providedName = null, ?string $providedEmail = null): bool
    {
        if ($user) {
            if ($story->user_id !== null && $story->user_id === $user->id) {
                return true;
            }
            if ($story->room && $this->isPrivileged($user, $story->room)) {
                return true;
            }
            if ($story->event && $this->isPrivileged($user, $story->event)) {
                return true;
            }
            if ((bool) $user->is_admin) {
                return true;
            }
        }

        if ($this->guestMatchesStory($story, $guest)) {
            return true;
        }

        // Legacy fallback: explicit name/email supplied on the request.
        if ($providedName !== null && trim($providedName) !== '') {
            $providedName = strtolower(trim($providedName));
            $providedEmail = $providedEmail ? strtolower(trim($providedEmail)) : null;

            $storyName = $story->guest_name ? strtolower(trim((string) $story->guest_name)) : null;
            $storyEmail = $story->guest_email ? strtolower(trim((string) $story->guest_email)) : null;

            $nameMatch = $storyName === $providedName;
            $emailMatch = $storyEmail ? $storyEmail === $providedEmail : true;

            if ($nameMatch && $emailMatch) {
                return true;
            }

            // Media provenance fallback (pre-cookie uploads).
            $uuids = collect($story->assets ?? [])->pluck('media_uuid')->filter()->toArray();
            if ($uuids !== []) {
                $medias = Media::whereIn('uuid', $uuids)->get();
                foreach ($medias as $media) {
                    if ($media->guest_identity_id) {
                        $mediaGuest = GuestIdentity::find($media->guest_identity_id);
                        if ($mediaGuest && strtolower(trim((string) $mediaGuest->name)) === $providedName) {
                            $mediaEmail = $mediaGuest->email ? strtolower(trim((string) $mediaGuest->email)) : null;
                            $emailOk = $mediaEmail ? $mediaEmail === $providedEmail : true;
                            if ($emailOk) {
                                return true;
                            }
                        }
                    }
                    $metaName = $media->metadata['guest_name'] ?? null;
                    $metaEmail = $media->metadata['guest_email'] ?? null;
                    if ($metaName && strtolower(trim((string) $metaName)) === $providedName) {
                        $metaEmailNorm = $metaEmail ? strtolower(trim((string) $metaEmail)) : null;
                        $emailOk = $metaEmailNorm ? $metaEmailNorm === $providedEmail : true;
                        if ($emailOk) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }
}
