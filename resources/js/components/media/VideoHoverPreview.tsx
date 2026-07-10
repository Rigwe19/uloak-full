import React from 'react';
import { useVideoHoverPreview } from '@/hooks/use-video-hover-preview';

interface VideoHoverPreviewProps {
    previewUrl: string | null;
    enabled?: boolean;
    children: React.ReactNode;
    className?: string;
}

export function VideoHoverPreview({ previewUrl, enabled = true, children, className = '' }: VideoHoverPreviewProps) {
    const { previewRef, handleMouseEnter, handleMouseLeave } = useVideoHoverPreview({ previewUrl, enabled });

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
}
