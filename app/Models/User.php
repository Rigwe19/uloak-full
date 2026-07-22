<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Passkeys\Contracts\PasskeyUser;
use Laravel\Passkeys\Passkey;
use Laravel\Passkeys\PasskeyAuthenticatable;
use NotificationChannels\WebPush\HasPushSubscriptions;

#[Fillable(['name', 'email', 'avatar', 'password', 'is_admin', 'role', 'house_thumbnail', 'house_pattern', 'house_pattern_upload'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    use HasFactory;
    use HasPushSubscriptions;
    use Notifiable;
    use PasskeyAuthenticatable;
    use TwoFactorAuthenticatable;

    protected $appends = ['avatar_url', 'house_thumbnail_url', 'house_pattern_upload_url'];

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return str_starts_with($this->avatar, 'http')
                ? $this->avatar
                : Storage::url($this->avatar);
        }

        return 'https://ui-avatars.com/api/?name='.urlencode($this->name).'&color=C0A060&background=1A1A1A';
    }

    public function getHouseThumbnailUrlAttribute(): ?string
    {
        if ($this->house_thumbnail) {
            $path = $this->house_thumbnail;
            $storageUrl = Storage::url('');

            if (str_starts_with($path, $storageUrl)) {
                $path = substr($path, strlen($storageUrl));
            }

            return str_starts_with($path, 'http')
                ? $path
                : Storage::url($path);
        }

        return null;
    }

    public function getHousePatternUploadUrlAttribute(): ?string
    {
        if ($this->house_pattern_upload) {
            $path = $this->house_pattern_upload;
            $storageUrl = Storage::url('');

            if (str_starts_with($path, $storageUrl)) {
                $path = substr($path, strlen($storageUrl));
            }

            return str_starts_with($path, 'http')
                ? $path
                : Storage::url($path);
        }

        return null;
    }

    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    public function passkeys(): HasMany
    {
        return $this->hasMany(Passkey::class, 'user_id');
    }

    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(Room::class);
    }

    public function houseMembers(): HasMany
    {
        return $this->hasMany(HouseMember::class, 'owner_id');
    }

    public function createdRooms(): HasMany
    {
        return $this->hasMany(Room::class, 'created_by');
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'created_by');
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_admin' => 'boolean',
            'role' => 'string',
        ];
    }

    /**
     * Get the display name for passkey UI.
     */
    public function getPasskeyDisplayName(): string
    {
        return $this->name ?? $this->email;
    }

    /**
     * Get the user handle (binary-safe identifier).
     */
    public function getPasskeyUserHandle(): string
    {
        // Use the primary key as the handle; ensure it's string
        return (string) $this->getKey();
    }

    /**
     * Determine if the user has any registered passkeys.
     */
    public function hasPasskeysEnabled(): bool
    {
        return $this->passkeys()->exists();
    }

    public function isBusinessAdmin(): bool
    {
        return $this->role === 'business_admin';
    }

    public function clients(): HasMany
    {
        return $this->hasMany(Client::class, 'business_user_id');
    }

    public function person(): HasOne
    {
        return $this->hasOne(Person::class);
    }

    public function notifications(): MorphMany
    {
        return $this->morphMany(DatabaseNotification::class, 'notifiable');
    }

    public function markAllAsRead()
    {
        $this->notifications()->update(['read_at' => now()]);
    }
}
