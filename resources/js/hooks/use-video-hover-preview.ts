import { useRef, useCallback, useEffect } from 'react';

interface UseVideoHoverPreviewOptions {
    previewUrl: string | null;
    enabled?: boolean;
}

export function useVideoHoverPreview({
    previewUrl,
    enabled = true,
}: UseVideoHoverPreviewOptions) {
    const previewRef = useRef<HTMLVideoElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showPreview = useCallback(() => {
        if (!enabled || !previewUrl) {
            return;
        }

        if (previewRef.current) {
            return;
        }

        const video = document.createElement('video');
        video.src = previewUrl;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.className = 'absolute inset-0 w-full h-full object-cover';
        video.load();
        video.play().catch(() => {});

        previewRef.current = video;
    }, [previewUrl, enabled]);

    const destroyPreview = useCallback(() => {
        if (previewRef.current) {
            previewRef.current.pause();
            previewRef.current.removeAttribute('src');
            previewRef.current.load();
            previewRef.current = null;
        }
    }, []);

    const handleMouseEnter = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(showPreview, 200);
    }, [showPreview]);

    const handleMouseLeave = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        destroyPreview();
    }, [destroyPreview]);

    useEffect(() => {
        return () => {
            destroyPreview();

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [destroyPreview]);

    return {
        previewRef,
        handleMouseEnter,
        handleMouseLeave,
        showPreview,
        destroyPreview,
    };
}
