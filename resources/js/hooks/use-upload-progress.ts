import { useUploadStore } from '@/stores/upload-store';

export function useUploadProgress(uploadId: string) {
    const item = useUploadStore((s) =>
        s.uploads.find((u) => u.id === uploadId),
    );

    if (!item) {
        return {
            percentage: 0,
            speed: 0,
            eta: null,
            uploadedBytes: 0,
            totalBytes: 0,
            status: null,
            errorMessage: null,
        };
    }

    return {
        percentage: item.progress,
        speed: item.speed,
        eta: item.eta,
        uploadedBytes: item.uploadedBytes,
        totalBytes: item.totalBytes,
        status: item.status,
        errorMessage: item.errorMessage,
    };
}
