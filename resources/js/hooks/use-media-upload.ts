import { useCallback } from 'react';
import {
    requestSignedUpload,
    pollMediaStatus,
} from '@/services/upload-service';
import { useUploadStore } from '@/stores/upload-store';
import { validateFile } from '@/utils/media-validation';

function uploadFileWithProgress(
    file: File,
    mediaType: 'photo' | 'video' | 'audio' | 'document',
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
                ? '/api/media/videos/upload'
                : '/api/media/images/upload';

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);

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
        xhr.withCredentials = true;

        xhr.send(formData);
    });
}

export function useMediaUpload() {
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
                updateStatus(id, 'uploading');

                const media = await uploadFileWithProgress(
                    file,
                    mediaType,
                    (percentage, speed, uploadedBytes, eta) => {
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

                // Initial state from upload response
                const initialStatus =
                    media.status === 'ready' ? 'ready' : 'processing';
                updateStatus(id, initialStatus);

                if (initialStatus === 'ready') {
                    updateProgress(id, 100, 0, file.size, null);
                } else {
                    // Poll for processing completion
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
        [updateProgress, updateStatus, updateMediaRef, setError],
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
