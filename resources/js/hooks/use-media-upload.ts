import { useCallback } from 'react';
import {
  requestSignedUpload,
  uploadToCloudinary,
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

        const signed = await requestSignedUpload(
          file.type,
          file.size,
          file.name,
          mediaType,
        );

        updateMediaRef(id, signed.media_uuid, signed.media_id);
        updateStatus(id, 'uploading');

        let lastBytes = 0;
        let lastTime = Date.now();

        await uploadToCloudinary(
          file,
          signed,
          (percentage) => {
            const now = Date.now();
            const elapsed = (now - lastTime) / 1000;

            const uploadedBytes = Math.round(
              (percentage / 100) * file.size,
            );

            const delta = uploadedBytes - lastBytes;

            const speed =
              elapsed > 0
                ? Math.round(delta / elapsed)
                : 0;

            const remaining = file.size - uploadedBytes;

            const eta =
              speed > 0
                ? remaining / speed
                : null;

            lastBytes = uploadedBytes;
            lastTime = now;

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

        updateStatus(id, 'processing');

        return id;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Upload failed';

        setError(id, message);

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