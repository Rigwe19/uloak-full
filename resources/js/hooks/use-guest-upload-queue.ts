import { useCallback, useEffect, useRef } from 'react';
import { useUploadStore } from '@/stores/upload-store';
import type { UploadItem } from '@/types/media';
import { useGuestMediaUpload } from './use-guest-media-upload';

const MAX_CONCURRENT = 1;

interface GuestCtx {
    roomSlug?: string | null;
    eventSlug?: string | null;
    guestName: string;
    guestEmail?: string | null;
}

export function useGuestUploadQueue(ctx: GuestCtx) {
    const { uploadFile, cancelUpload, retryUpload } = useGuestMediaUpload(ctx);
    const activeCountRef = useRef(0);
    const queueRef = useRef<
        {
            id: string;
            file: File;
            mediaType: 'photo' | 'video' | 'audio' | 'document';
        }[]
    >([]);
    const processQueueRef = useRef<() => void>(() => {});

    const uploads = useUploadStore((s) => s.uploads);
    const removeUpload = useUploadStore((s) => s.removeUpload);

    useEffect(() => {
        processQueueRef.current = () => {
            while (
                queueRef.current.length > 0 &&
                activeCountRef.current < MAX_CONCURRENT
            ) {
                const next = queueRef.current.shift();

                if (!next) {
                    continue;
                }

                activeCountRef.current++;

                uploadFile(next.id, next.file, next.mediaType)
                    .catch((e) => {
                        const message =
                            e?.response?.data?.message ||
                            e?.message ||
                            'Upload failed. Please try again.';

                        useUploadStore.getState().setError(next.id, message);
                    })
                    .finally(() => {
                        activeCountRef.current--;
                        processQueueRef.current();
                    });
            }
        };
    }, [uploadFile]);

    const addToQueue = useCallback(
        (file: File, mediaType: 'photo' | 'video' | 'audio' | 'document') => {
            const id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            const item: UploadItem = {
                id,
                file,
                previewUrl: URL.createObjectURL(file),
                status: 'pending',
                progress: 0,
                speed: 0,
                uploadedBytes: 0,
                totalBytes: file.size,
                eta: null,
                mediaUuid: null,
                mediaId: null,
                thumbnailUrl: null,
                errorMessage: null,
                cancelController: new AbortController(),
                startedAt: null,
            };

            useUploadStore.getState().addUpload(item);

            queueRef.current.push({
                id,
                file,
                mediaType,
            });

            processQueueRef.current();

            return id;
        },
        [],
    );

    const removeFromQueue = useCallback(
        (id: string) => {
            const item = uploads.find((u) => u.id === id);

            if (item) {
                URL.revokeObjectURL(item.previewUrl);
            }

            queueRef.current = queueRef.current.filter((q) => q.id !== id);
            removeUpload(id);
        },
        [uploads, removeUpload],
    );

    const clearCompleted = useCallback(() => {
        const completed = uploads.filter(
            (u) => u.status === 'ready' || u.status === 'failed',
        );

        completed.forEach((u) => URL.revokeObjectURL(u.previewUrl));
        useUploadStore.getState().clearCompleted();
        queueRef.current = queueRef.current.filter((q) =>
            uploads.some(
                (u) =>
                    u.id === q.id &&
                    u.status !== 'ready' &&
                    u.status !== 'failed',
            ),
        );
    }, [uploads]);

    const getUploadsByStatus = useCallback(
        (status: string) => uploads.filter((u) => u.status === status),
        [uploads],
    );

    const hasActiveUploads = useCallback(
        () =>
            uploads.some(
                (u) =>
                    u.status === 'uploading' ||
                    u.status === 'processing' ||
                    u.status === 'queued',
            ),
        [uploads],
    );

    return {
        addToQueue,
        removeFromQueue,
        cancelUpload,
        retryUpload,
        clearCompleted,
        getUploadsByStatus,
        hasActiveUploads,
        uploads,
    };
}
