import { motion } from 'framer-motion';
import React from 'react';

interface VideoStatusOverlayProps {
    status?: string;
    thumbnail?: string | null;
}

export function VideoStatusOverlay({
    status,
    thumbnail,
}: VideoStatusOverlayProps) {
    if (status !== 'processing') {
        return null;
    }

    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden rounded-2xl">
            {thumbnail && (
                <img
                    src={thumbnail}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
            )}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <div className="relative flex flex-col items-center gap-3">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'linear',
                    }}
                    className="h-10 w-10 rounded-full border-2 border-accent-gold/30 border-t-accent-gold"
                />
                <span className="font-mono text-xs tracking-wider text-white/70">
                    Optimizing your memory...
                </span>
            </div>
        </div>
    );
}
