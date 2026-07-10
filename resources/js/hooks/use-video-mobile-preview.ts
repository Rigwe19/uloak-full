import { useRef, useCallback, useEffect } from 'react';

interface UseVideoMobilePreviewOptions {
    previewUrl: string | null;
    enabled?: boolean;
}

export function useVideoMobilePreview({ previewUrl, enabled = true }: UseVideoMobilePreviewOptions) {
    const previewRef = useRef<HTMLVideoElement | null>(null);
    const isLongPress = useRef(false);
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startPreview = useCallback(() => {
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

    const stopPreview = useCallback(() => {
        if (previewRef.current) {
            previewRef.current.pause();
            previewRef.current.removeAttribute('src');
            previewRef.current.load();
            previewRef.current = null;
        }

        isLongPress.current = false;
    }, []);

    const handleTouchStart = useCallback(() => {
        if (!enabled || !previewUrl) {
return;
}

        pressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            startPreview();
        }, 300);
    }, [enabled, previewUrl, startPreview]);

    const handleTouchEnd = useCallback(() => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }

        if (isLongPress.current) {
            stopPreview();
        }
    }, [stopPreview]);

    const handleTouchMove = useCallback(() => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }

        if (isLongPress.current) {
            stopPreview();
        }
    }, [stopPreview]);

    useEffect(() => {
        return () => {
            if (pressTimer.current) {
clearTimeout(pressTimer.current);
}

            stopPreview();
        };
    }, [stopPreview]);

    return { previewRef, handleTouchStart, handleTouchEnd, handleTouchMove };
}
