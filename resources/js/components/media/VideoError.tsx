import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import React from 'react';
import { usePlayerStore } from '@/stores/video-player-store';

export function VideoError() {
    const hasError = usePlayerStore((s) => s.hasError);
    const errorMessage = usePlayerStore((s) => s.errorMessage);

    if (!hasError) {
return null;
}

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-3"
        >
            <AlertTriangle size={24} className="text-white/40" />
            <p className="text-xs text-white/50 font-mono text-center max-w-[200px]">
                {errorMessage || 'Playback failed'}
            </p>
        </motion.div>
    );
}
