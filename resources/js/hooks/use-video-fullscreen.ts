import { useEffect, useCallback } from 'react';
import { usePlayerStore } from '@/stores/video-player-store';
import { getActiveVideoElement } from '@/stores/video-player-store';

export function useVideoFullscreen() {
    const isFullscreen = usePlayerStore((s) => s.isFullscreen);
    const setIsFullscreen = usePlayerStore((s) => s.setIsFullscreen);
    const toggleFullscreen = usePlayerStore((s) => s.toggleFullscreen);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFsChange);

        return () =>
            document.removeEventListener('fullscreenchange', handleFsChange);
    }, [setIsFullscreen]);

    const enterFullscreen = useCallback(async () => {
        const el = getActiveVideoElement();

        if (!el) {
            return;
        }

        try {
            if (el.requestFullscreen) {
                await el.requestFullscreen();
            }
        } catch {
            // fallback: try parent container
            const parent = el.parentElement;

            if (parent && parent.requestFullscreen) {
                try {
                    await parent.requestFullscreen();
                } catch {}
            }
        }
    }, []);

    const exitFullscreen = useCallback(async () => {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        }
    }, []);

    const handleToggle = useCallback(async () => {
        if (isFullscreen) {
            await exitFullscreen();
        } else {
            await enterFullscreen();
        }

        toggleFullscreen();
    }, [isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen]);

    return { isFullscreen, enterFullscreen, exitFullscreen, handleToggle };
}
