import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/stores/video-player-store';

const HIDE_DELAY = 2000;

export function useVideoOverlay() {
    const showOverlay = usePlayerStore((s) => s.showOverlay);
    const hideOverlay = usePlayerStore((s) => s.hideOverlay);
    const overlayVisible = usePlayerStore((s) => s.overlayVisible);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleActivity = useCallback(() => {
        showOverlay();
        clearTimer();
        timerRef.current = setTimeout(() => {
            hideOverlay();
        }, HIDE_DELAY);
    }, [showOverlay, hideOverlay, clearTimer]);

    useEffect(() => {
        return () => clearTimer();
    }, [clearTimer]);

    return { overlayVisible, handleActivity };
}
