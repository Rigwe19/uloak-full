import { motion } from 'framer-motion';
import React from 'react';

interface VideoLoadingProps {
    visible: boolean;
}

export function VideoLoading({ visible }: VideoLoadingProps) {
    if (!visible) {
return null;
}

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
            <div className="flex flex-col items-center gap-3">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-accent-gold/30 border-t-accent-gold rounded-full"
                />
                <span className="text-[10px] font-mono tracking-wider text-white/60 uppercase">Loading</span>
            </div>
        </motion.div>
    );
}
