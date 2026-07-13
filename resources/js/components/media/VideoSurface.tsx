import React from 'react';
import { useVideoControls } from '@/hooks/use-video-controls';

interface VideoSurfaceProps {
    videoId: string | number;
    src: string | null;
    poster?: string | null;
    onTimeUpdate?: (time: number) => void;
    onEnded?: () => void;
    className?: string;
    preload?: 'none' | 'metadata' | 'auto';
}

export function VideoSurface({ videoId, src, poster, onTimeUpdate, onEnded, className = '', preload = 'metadata' }: VideoSurfaceProps) {
    const { videoRef, retry } = useVideoControls({ videoId, src, onTimeUpdate, onEnded });

    return (
        <video
            ref={videoRef}
            src={src || undefined}
            poster={poster || undefined}
            className={className}
            playsInline
            preload={preload}
            onClick={retry}
        />
    );
}
