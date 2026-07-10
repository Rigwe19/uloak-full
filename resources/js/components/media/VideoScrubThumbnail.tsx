import { motion } from 'framer-motion';
import React from 'react';
import { useSpriteScrub } from '@/hooks/use-sprite-scrub';
import type { SpriteData } from '@/types/video-player';

interface VideoScrubThumbnailProps {
    sprite: SpriteData | null;
    time: number;
    duration: number;
}

export function VideoScrubThumbnail({ sprite, time, duration }: VideoScrubThumbnailProps) {
    const { getBackgroundStyle, formatTimestamp } = useSpriteScrub({ sprite, duration });
    const style = getBackgroundStyle(time);

    if (!style) {
        return (
            <div className="bg-black/90 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono text-white shadow-xl">
                {formatTimestamp(time)}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-1"
        >
            <div
                className="rounded-lg border border-white/10 shadow-xl overflow-hidden"
                style={{ width: style.width, height: style.height }}
            >
                <div
                    style={{
                        backgroundImage: style.backgroundImage,
                        backgroundPosition: style.backgroundPosition,
                        backgroundSize: style.backgroundSize,
                        width: '100%',
                        height: '100%',
                    }}
                />
            </div>
            <span className="text-[10px] font-mono text-white bg-black/80 px-1.5 py-0.5 rounded">
                {formatTimestamp(time)}
            </span>
        </motion.div>
    );
}
