import { useCallback } from 'react';
import {
    requestSignedUpload,
    pollMediaStatus,
} from '@/services/upload-service';
import { useUploadStore } from '@/stores/upload-store';
import { validateFile } from '@/utils/media-validation';

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

            const controller =
                useUploadStore
                    .getState()
                    .uploads.find((u) => u.id === id)
                    ?.cancelController;

            if (!controller) {
                throw new Error('Upload no longer exists.');
            }

            try {
                updateStatus(id, 'queued');

                const media = await requestSignedUpload(
                    file,
                    mediaType,
                );

                updateMediaRef(id, media.media_uuid, media.media_id);
                updateStatus(id, 'uploading');

                // Initial progress - file uploaded
                updateProgress(id, 50, 0, file.size, null);

                // Poll for processing completion
                await pollMediaStatus(
                    media.media_uuid,
                    (percentage) => {
                        updateProgress(id, percentage, 0, file.size, null);
                    },
                    controller.signal,
                );

                updateStatus(id, 'ready');
                callbacks?.onStatusChange?.('ready');

                return id;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Upload failed';

                setError(id, message);
                callbacks?.onStatusChange?.('failed');

                throw error;
            }
        },
        [
            updateProgress,
            updateStatus,
            updateMediaRef,
            setError,
        ],
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
