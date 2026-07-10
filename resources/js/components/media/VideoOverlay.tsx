import { motion } from 'framer-motion';
import React from 'react';
import { useVideoOverlay } from '@/hooks/use-video-overlay';

interface VideoOverlayProps {
    children: React.ReactNode;
    topRight?: React.ReactNode;
    className?: string;
}

export function VideoOverlay({ children, topRight, className = '' }: VideoOverlayProps) {
    const { overlayVisible, handleActivity } = useVideoOverlay();

    return (
        <div className={`absolute inset-0 ${className}`} onMouseMove={handleActivity} onTouchStart={handleActivity}>
            {/* Top right corner */}
            {topRight && (
                <motion.div
                    initial={false}
                    animate={{ opacity: overlayVisible ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-4 right-4 z-30"
                >
                    {topRight}
                </motion.div>
            )}

            {/* Bottom bar */}
            <motion.div
                initial={false}
                animate={{ opacity: overlayVisible ? 1 : 0, y: overlayVisible ? 0 : 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-4 pt-12 pb-3"
            >
                {children}
            </motion.div>
        </div>
    );
}
