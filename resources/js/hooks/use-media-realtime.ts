import { useEffect, useRef } from 'react';

import { getEcho } from '@/echo';
import { fetchMediaStatus } from '@/services/upload-service';
import { useUploadStore } from '@/stores/upload-store';

import type { ProcessingState } from '@/types/media';

interface MediaRealtimeCallbacks {
    onStatusChange?: (status: string) => void
    onProgress?: (progress: number) => void
}

type ProgressCallback = (progress: number) => void;
type StatusCallback = (status: string) => void;

// Module-level callback registries keyed by media uuid.
const progressCallbacks = new Map<string, Set<ProgressCallback>>();
const statusCallbacks = new Map<string, Set<StatusCallback>>();

let echoSubscribed = false;

/**
 * Subscribe to the Laravel Echo "media" broadcast channel exactly once.
 * Each incoming event is dispatched to every callback registered for the
 * matching media uuid (identified via the `id` payload field). The Zustand
 * store is updated directly so every component rendering an upload stays
 * in sync.
 */
function ensureEchoSubscription(): void {
    if (echoSubscribed) {
        return;
    }

    const echo = getEcho();

    if (!echo) {
        return;
    }

    echoSubscribed = true;

    const channel = echo.channel('media');

    channel.listen('.media.processing.progress', (e: { id: string; progress?: number }) => {
        if (!e.id) {
            return;
        }

        const progress = e.progress ?? 0;

        useUploadStore.getState().updateProgressByUuid(e.id, progress);
        progressCallbacks.get(e.id)?.forEach((cb) => cb(progress));
    });

    channel.listen('.media.processing.started', (e: { id: string }) => {
        if (!e.id) {
            return;
        }

        useUploadStore
            .getState()
            .updateStatusByUuid(e.id, 'processing' as ProcessingState);
        statusCallbacks.get(e.id)?.forEach((cb) => cb('processing'));
    });

    channel.listen('.media.processing.completed', (e: { id: string }) => {
        if (!e.id) {
            return;
        }

        useUploadStore.getState().updateProgressByUuid(e.id, 100);
        useUploadStore
            .getState()
            .updateStatusByUuid(e.id, 'ready' as ProcessingState);
        progressCallbacks.get(e.id)?.forEach((cb) => cb(100));
        statusCallbacks.get(e.id)?.forEach((cb) => cb('ready'));
    });

    channel.listen('.media.processing.failed', (e: { id: string }) => {
        if (!e.id) {
            return;
        }

        useUploadStore
            .getState()
            .updateStatusByUuid(e.id, 'failed' as ProcessingState);
        statusCallbacks.get(e.id)?.forEach((cb) => cb('failed'));
    });
}

function registerCallback(
    map: Map<string, Set<ProgressCallback | StatusCallback>>,
    uuid: string,
    cb: ProgressCallback | StatusCallback,
): () => void {
    let set = map.get(uuid);

    if (!set) {
        set = new Set();
        map.set(uuid, set);
    }

    set.add(cb);

    return () => {
        set!.delete(cb);

        if (set!.size === 0) {
            map.delete(uuid);
        }
    };
}

/**
 * Subscribes to real-time media processing events via Laravel Echo (Reverb).
 * When broadcasting is not configured it transparently falls back to polling
 * the media status endpoint every 3 s. The Zustand store is kept in sync in
 * both paths, so components reading from the store stay current.
 */
export function useMediaRealtime(
    uuid: string | null,
    callbacks: MediaRealtimeCallbacks = {},
) {
    const { onStatusChange, onProgress } = callbacks;

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const stoppedRef = useRef(false);

    useEffect(() => {
        if (!uuid) {
            return;
        }

        stoppedRef.current = false;

        const echo = getEcho();

        if (echo) {
            ensureEchoSubscription();

            const unsubProgress = registerCallback(progressCallbacks, uuid, (progress: number) => {
                onProgress?.(progress);
            });
            const unsubStatus = registerCallback(statusCallbacks, uuid, (status: string) => {
                onStatusChange?.(status);
            });

            // Seed current state so late-mounting components reflect server truth.
            fetchMediaStatus(uuid).catch(() => {
                /* ignore — realtime events will catch up */
            });

            return () => {
                unsubProgress();
                unsubStatus();
            };
        }

        // --- Polling fallback (no Echo / Reverb unreachable) ---
        const poll = async () => {
            if (stoppedRef.current) {
                return;
            }

            try {
                const media = await fetchMediaStatus(uuid);

                if (media.progress != null) {
                    useUploadStore.getState().updateProgressByUuid(uuid, media.progress);
                }

                const status = media.status;

                if (
                    status === 'ready' ||
                    status === 'failed' ||
                    status === 'processing' ||
                    status === 'uploading'
                ) {
                    useUploadStore
                        .getState()
                        .updateStatusByUuid(uuid, status as ProcessingState);

                    if (status === 'ready') {
                        useUploadStore.getState().updateProgressByUuid(uuid, 100);
                    }
                }
            } catch {
                /* silent — transient errors retried on the next tick */
            }
        };

        poll();
        pollRef.current = setInterval(poll, 3000);

        return () => {
            stoppedRef.current = true;

            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [uuid, onStatusChange, onProgress]);
}
