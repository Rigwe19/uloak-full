<?php

namespace App\Services;

use App\Media\Enums\ProcessingState;
use App\Models\Media;
use App\Models\MediaEvent;
use App\Models\MediaSession;
use App\Models\MediaView;
use App\Models\ProcessingLog;
use App\Models\Story;
use App\Models\User;
use Illuminate\Http\Request;

class AnalyticsService
{
    protected string $ipSalt;

    public function __construct(
        protected ?Request $request = null,
    ) {
        $this->ipSalt = config('analytics.ip_salt', 'default-analytics-salt');
    }

    public function track(
        string $eventName,
        ?Media $media = null,
        ?Story $story = null,
        array $properties = [],
    ): MediaEvent {
        $data = [
            'event_name' => $eventName,
            'eventable_id' => $media?->id,
            'eventable_type' => $media ? Media::class : null,
            'story_id' => $story?->id ?? $media?->story_id,
            'room_id' => $story?->room_id ?? $media?->story?->room_id,
            'user_id' => $this->request?->user()?->id,
            'media_type' => $media?->type,
            'device' => $this->parseDevice(),
            'browser' => $this->parseBrowser(),
            'country' => $properties['country'] ?? null,
            'session_id' => $properties['session_id'] ?? null,
            'anonymous_id' => $properties['anonymous_id'] ?? null,
            'ip_address' => $this->hashIp($this->request?->ip()),
            'metadata' => $properties['metadata'] ?? null,
        ];

        return MediaEvent::create($data);
    }

    public function recordView(Story $story, array $data = []): MediaView
    {
        return MediaView::create([
            'story_id' => $story->id,
            'session_id' => $data['session_id'] ?? null,
            'user_id' => $this->request?->user()?->id,
            'watch_time' => $data['watch_time'] ?? 0,
            'completed' => $data['completed'] ?? false,
            'device' => $this->parseDevice(),
            'browser' => $this->parseBrowser(),
            'country' => $data['country'] ?? null,
            'referrer' => $data['referrer'] ?? $this->request?->header('referer'),
            'ip_hash' => $this->hashIp($this->request?->ip()),
            'playback_events' => $data['playback_events'] ?? null,
        ]);
    }

    public function startSession(
        string $sessionId,
        ?User $user = null,
        ?string $anonymousId = null,
        array $data = [],
    ): MediaSession {
        return MediaSession::create([
            'session_id' => $sessionId,
            'user_id' => $user?->id,
            'anonymous_id' => $anonymousId,
            'ip_hash' => $this->hashIp($this->request?->ip()),
            'user_agent' => $data['user_agent'] ?? $this->parseUserAgent(),
            'started_at' => now(),
            'last_activity_at' => now(),
        ]);
    }

    public function logProcessing(
        Media $media,
        ?ProcessingState $fromState,
        ProcessingState $toState,
        ?string $exception = null,
        int $retryCount = 0,
        ?int $durationMs = null,
        array $metadata = [],
    ): ProcessingLog {
        return ProcessingLog::create([
            'media_id' => $media->id,
            'media_uuid' => $media->uuid,
            'from_state' => $fromState?->value,
            'to_state' => $toState->value,
            'duration_ms' => $durationMs,
            'exception' => $exception,
            'retry_count' => $retryCount,
            'cloudinary_public_id' => $media->cloudinary_public_id,
            'metadata' => $metadata ?: null,
        ]);
    }

    public function trackSessionActivity(string $sessionId): void
    {
        MediaSession::where('session_id', $sessionId)
            ->whereNull('user_id')
            ->where('last_activity_at', '<', now()->subMinutes(5))
            ->update(['last_activity_at' => now()]);
    }

    protected function hashIp(?string $ip): ?string
    {
        if ($ip === null) {
            return null;
        }

        return hash('sha256', $ip.$this->ipSalt);
    }

    protected function parseDevice(): ?string
    {
        $ua = $this->request?->userAgent();

        if ($ua === null) {
            return null;
        }

        if (preg_match('/Mobile|Android|iPhone|iPad|iPod/i', $ua)) {
            return 'mobile';
        }

        if (preg_match('/Tablet|iPad/i', $ua)) {
            return 'tablet';
        }

        return 'desktop';
    }

    protected function parseBrowser(): ?string
    {
        $ua = $this->request?->userAgent();

        if ($ua === null) {
            return null;
        }

        if (str_contains($ua, 'Chrome') && ! str_contains($ua, 'Edg')) {
            return 'chrome';
        }

        if (str_contains($ua, 'Safari') && ! str_contains($ua, 'Chrome')) {
            return 'safari';
        }

        if (str_contains($ua, 'Firefox')) {
            return 'firefox';
        }

        if (str_contains($ua, 'Edg')) {
            return 'edge';
        }

        return 'other';
    }

    protected function parseUserAgent(): array
    {
        $ua = $this->request?->userAgent();

        return [
            'raw' => $ua,
            'device' => $this->parseDevice(),
            'browser' => $this->parseBrowser(),
        ];
    }
}
