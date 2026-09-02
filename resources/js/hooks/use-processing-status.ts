import { useState, useEffect, useRef } from 'react';
import { fetchMediaStatus } from '@/services/upload-service';
import { useUploadStore } from '@/stores/upload-store';
import type { MediaStatus, ProcessingState } from '@/types/media';

interface UseProcessingStatusOptions {
    interval?: number;
    maxDuration?: number;
    enabled?: boolean;
}

export function useProcessingStatus(
    mediaUuid: string | null,
    options: UseProcessingStatusOptions = {},
) {
    const { interval = 5000, maxDuration = 300000, enabled = true } = options;
    const updateStatus = useUploadStore((s) => s.updateStatusByUuid);
    const [status, setStatus] = useState<MediaStatus | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        if (!mediaUuid || !enabled) {
            return;
        }

        setIsProcessing(true);

        setError(null);
        setStatus(null);
        startTimeRef.current = Date.now();

        const doCheck = async () => {
            const elapsed = Date.now() - startTimeRef.current;

            if (elapsed > maxDuration) {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }

                setIsProcessing(false);
                setError('Processing timed out');

                return;
            }

            try {
                const result = await fetchMediaStatus(mediaUuid);

                setStatus(result);
                updateStatus(mediaUuid, result.status as ProcessingState);

                if (result.status === 'ready' || result.status === 'failed') {
                    if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                    }

                    setIsProcessing(false);

                    if (result.status === 'failed') {
                        setError('Media processing failed');
                    }
                }
            } catch (e) {
                if (e instanceof Error && e.message !== 'Media not found') {
                    setError(e.message);
                }
            }
        };

        doCheck();
        pollingRef.current = setInterval(doCheck, interval);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [mediaUuid, enabled, interval, maxDuration]);

    return {
        status,
        isProcessing,
        error,
        isReady: status?.status === 'ready',
        isFailed: status?.status === 'failed',
    };
}
