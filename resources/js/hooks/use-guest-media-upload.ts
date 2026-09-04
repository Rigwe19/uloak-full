import { useCallback } from 'react';
import { pollMediaStatus } from '@/services/upload-service';
import { useUploadStore } from '@/stores/upload-store';
import { validateFile } from '@/utils/media-validation';

interface GuestContext {
    roomSlug?: string | null;
    eventSlug?: string | null;
    guestName: string;
    guestEmail?: string | null;
}

function uploadGuestFileWithProgress(
    file: File,
    mediaType: 'photo' | 'video' | 'audio' | 'document',
    ctx: GuestContext,
    onProgress: (
        percentage: number,
        speed: number,
        uploadedBytes: number,
        eta: number | null,
    ) => void,
    signal: AbortSignal,
): Promise<{
    uuid: string;
    id: number;
    thumbnail_url: string | null;
    status: string;
}> {
    return new Promise((resolve, reject) => {
        const endpoint =
            mediaType === 'video'
                ? '/api/media/guest/videos/upload'
                : mediaType === 'photo'
                  ? '/api/media/guest/images/upload'
                  : '/api/media/guest/upload';

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);

        if (ctx.roomSlug) {
            formData.append('room_slug', ctx.roomSlug);
        }

        if (ctx.eventSlug) {
            formData.append('event_slug', ctx.eventSlug);
        }

        formData.append('guest_name', ctx.guestName);

        if (ctx.guestEmail) {
            formData.append('guest_email', ctx.guestEmail);
        }

        formData.append('type', mediaType === 'photo' ? 'image' : mediaType);

        let lastLoaded = 0;
        let lastTime = Date.now();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const loaded = event.loaded;
                const total = event.total;
                const percentage = Math.round((loaded / total) * 100);
                const now = Date.now();
                const timeDiff = (now - lastTime) / 1000;
                const bytesDiff = loaded - lastLoaded;

                if (timeDiff > 0) {
                    const speed = bytesDiff / timeDiff;
                    const remaining = total - loaded;
                    const eta = speed > 0 ? remaining / speed : null;

                    onProgress(percentage, speed, loaded, eta);
                }

                lastLoaded = loaded;
                lastTime = now;
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const json = JSON.parse(xhr.responseText);
                    resolve(json.data);
                } catch (e) {
                    reject(new Error('Invalid response from server'));
                }
            } else {
                const body = xhr.responseText;
                reject(
                    new Error(
                        body || `Upload failed with status ${xhr.status}`,
                    ),
                );
            }
        });

        xhr.addEventListener('error', () =>
            reject(new Error('Network error during upload')),
        );
        xhr.addEventListener('abort', () =>
            reject(new Error('Upload cancelled')),
        );

        signal.addEventListener('abort', () => xhr.abort());

        xhr.open('POST', endpoint);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        const csrf =
            (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)
                ?.content ?? '';
        if (csrf) {
            xhr.setRequestHeader('X-CSRF-TOKEN', csrf);
        }
        xhr.withCredentials = true;

        xhr.send(formData);
    });
}

export function useGuestMediaUpload(ctx: GuestContext) {
    const updateProgress = useUploadStore((s) => s.updateProgress);
    const updateStatus = useUploadStore((s) => s.updateStatus);
    const updateMediaRef = useUploadStore((s) => s.updateMediaRef);
    const setError = useUploadStore((s) => s.setError);

    const uploadFile = useCallback(
        async (
            id: string,
            file: File,
            mediaType: 'photo' | 'video' | 'audio' | 'document',
            callbacks?: {
                onStatusChange?: (status: string) => void;
                onThumbnailUpdate?: (url: string) => void;
            },
        ) => {
            const validation = validateFile(file, mediaType);

            if (!validation.valid) {
                setError(id, validation?.error ?? '');

                throw new Error(validation.error);
            }

            const controller = useUploadStore
                .getState()
                .uploads.find((u) => u.id === id)?.cancelController;

            if (!controller) {
                throw new Error('Upload no longer exists.');
            }

            try {
                updateStatus(id, 'queued');
                // Flip to uploading immediately so UploadQueueItem shows progress bar + speed/eta
                // (the XHR progress callback fires within ~100ms but status would stay "queued" without this)
                updateStatus(id, 'uploading');

                const media = await uploadGuestFileWithProgress(
                    file,
                    mediaType,
                    ctx,
                    (percentage, speed, uploadedBytes, eta) => {
                        // Keep status as uploading while XHR is streaming (pollMediaStatus later flips to processing)
                        updateStatus(id, 'uploading');
                        updateProgress(
                            id,
                            percentage,
                            speed,
                            uploadedBytes,
                            eta,
                        );
                    },
                    controller.signal,
                );

                updateMediaRef(id, media.uuid, media.id);

                const initialStatus =
                    media.status === 'ready' ? 'ready' : 'processing';
                updateStatus(id, initialStatus);

                if (initialStatus === 'ready') {
                    updateProgress(id, 100, 0, file.size, null);
                } else {
                    await pollMediaStatus(
                        media.uuid,
                        (percentage) => {
                            updateProgress(id, percentage, 0, file.size, null);
                        },
                        controller.signal,
                    );

                    updateStatus(id, 'ready');
                }

                callbacks?.onStatusChange?.('ready');

                return id;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Upload failed';

                setError(id, message);
                callbacks?.onStatusChange?.('failed');

                throw error;
            }
        },
        [ctx, updateProgress, updateStatus, updateMediaRef, setError],
    );

    const cancelUpload = useCallback((id: string) => {
        useUploadStore.getState().cancelUpload(id);
    }, []);

    const retryUpload = useCallback(
        async (
            id: string,
            mediaType: 'photo' | 'video' | 'audio' | 'document',
        ) => {
            const item = useUploadStore
                .getState()
                .uploads.find((u) => u.id === id);

            if (!item) {
                return;
            }

            useUploadStore.getState().retryUpload(id);

            await uploadFile(id, item.file, mediaType);
        },
        [uploadFile],
    );

    return {
        uploadFile,
        cancelUpload,
        retryUpload,
    };
}
