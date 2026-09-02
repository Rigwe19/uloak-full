import { useEffect } from 'react';
import { usePlayerStore } from '@/stores/video-player-store';
import { getActiveVideoElement } from '@/stores/video-player-store';

interface UseVideoKeyboardOptions {
    onClose?: () => void;
}

export function useVideoKeyboard({ onClose }: UseVideoKeyboardOptions = {}) {
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const toggleMute = usePlayerStore((s) => s.toggleMute);
    const toggleFullscreen = usePlayerStore((s) => s.toggleFullscreen);
    const currentTime = usePlayerStore((s) => s.currentTime);
    const seek = usePlayerStore((s) => s.seek);
    const isFullscreen = usePlayerStore((s) => s.isFullscreen);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;

            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            const el = getActiveVideoElement();

            if (!el) {
                return;
            }

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'm':
                case 'M':
                    toggleMute();
                    break;
                case 'f':
                case 'F':
                    toggleFullscreen();
                    break;
                case 'Escape':
                    if (isFullscreen) {
                        toggleFullscreen();
                    }

                    onClose?.();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    seek(Math.max(0, currentTime - 10));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    seek(Math.min(el.duration || 0, currentTime + 10));
                    break;
            }
        };

        window.addEventListener('keydown', handleKey);

        return () => window.removeEventListener('keydown', handleKey);
    }, [
        togglePlay,
        toggleMute,
        toggleFullscreen,
        currentTime,
        seek,
        isFullscreen,
        onClose,
    ]);
}
