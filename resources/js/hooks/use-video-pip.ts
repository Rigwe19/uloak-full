import { useCallback } from 'react';
import { usePlayerStore } from '@/stores/video-player-store';
import { getActiveVideoElement } from '@/stores/video-player-store';

export function useVideoPip() {
    const isPip = usePlayerStore((s) => s.isPip);
    const togglePip = usePlayerStore((s) => s.togglePip);

    const handleTogglePip = useCallback(async () => {
        const el = getActiveVideoElement();

        if (!el) {
return;
}

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                togglePip();
            } else if (document.pictureInPictureEnabled && el.requestPictureInPicture) {
                await el.requestPictureInPicture();
                togglePip();
            }
        } catch {
            // PiP not supported or denied
            console.log('PiP not supported or denied')
        }
    }, [togglePip]);

    return { isPip, handleTogglePip };
}
