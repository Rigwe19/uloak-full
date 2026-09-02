import { useMemo } from 'react';
import type { SpriteData, ScrubFrame } from '@/types/video-player';

interface UseSpriteScrubOptions {
    sprite: SpriteData | null;
    duration: number;
}

export function useSpriteScrub({ sprite, duration }: UseSpriteScrubOptions) {
    const frames = useMemo(() => {
        if (!sprite || !duration || duration <= 0) {
            return null;
        }

        const cols = sprite.columns || 1;
        const rows = sprite.rows || 1;
        const total = sprite.total_frames || cols * rows;
        const frameW = sprite.frame_width || 160;
        const frameH = sprite.frame_height || 90;
        const interval = sprite.interval || duration / total;

        return {
            cols,
            rows,
            total,
            frameW,
            frameH,
            interval,
            imageUrl: sprite.image_url || '',
        };
    }, [sprite, duration]);

    const getFrameAtTime = (time: number): ScrubFrame | null => {
        if (!frames || !duration) {
            return null;
        }

        const idx = Math.min(
            Math.floor(time / frames.interval),
            frames.total - 1,
        );
        const col = idx % frames.cols;
        const row = Math.floor(idx / frames.cols);

        return {
            x: col * frames.frameW,
            y: row * frames.frameH,
            width: frames.frameW,
            height: frames.frameH,
            timestamp: idx * frames.interval,
        };
    };

    const getBackgroundStyle = (time: number) => {
        const frame = getFrameAtTime(time);

        if (!frame || !frames?.imageUrl) {
            return null;
        }

        return {
            backgroundImage: `url(${frames.imageUrl})`,
            backgroundPosition: `-${frame.x}px -${frame.y}px`,
            backgroundSize: `${frames.cols * frame.width}px ${frames.rows * frame.height}px`,
            width: frame.width,
            height: frame.height,
        };
    };

    const formatTimestamp = (time: number): string => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);

        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return { frames, getFrameAtTime, getBackgroundStyle, formatTimestamp };
}
