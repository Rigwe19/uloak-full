import { motion } from 'framer-motion';
import {
    Play,
    Music,
    ImageIcon,
    Mic,
    Clock,
    User,
    Plus,
    Video,
    Sparkles,
} from 'lucide-react';
import React, { useCallback } from 'react';
import { usePlayerStore } from '@/stores/video-player-store';
import type { PlayerVideo } from '@/types/video-player';
import { VideoHoverPreview } from './VideoHoverPreview';
import { VideoStatusOverlay } from './VideoStatusOverlay';

interface VideoCardProps {
    video: PlayerVideo;
    onClick?: () => void;
    showTypeBadge?: boolean;
    aspectRatio?: string;
}

export function VideoCard({
    video,
    onClick,
    showTypeBadge = true,
    aspectRatio = 'aspect-video',
}: VideoCardProps) {
    const activeVideoId = usePlayerStore((s) => s.activeVideoId);
    const isThisPlaying = activeVideoId === video.id;

    const fallbackThumb = '/logo-stacked.png';

    return (
        <div
            className={`relative ${aspectRatio} group cursor-pointer overflow-hidden rounded-2xl bg-bg-dark`}
            onClick={onClick}
        >
            {video.status === 'processing' ? (
                <VideoStatusOverlay
                    status={video.status}
                    thumbnail={video.thumbnail || fallbackThumb}
                />
            ) : (
                <VideoHoverPreview
                    previewUrl={video.preview}
                    enabled={!isThisPlaying}
                >
                    {video.thumbnail ? (
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.src = fallbackThumb;
                            }}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-gold/5 to-surface">
                            <Play size={32} className="text-accent-gold/40" />
                        </div>
                    )}

                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-gold/90 shadow-lg">
                            <Play
                                size={22}
                                fill="white"
                                className="ml-1 text-white"
                            />
                        </div>
                    </div>
                </VideoHoverPreview>
            )}

            {/* Type badge */}
            {showTypeBadge && (
                <div className="absolute top-3 left-3">
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-bg-dark/70 px-2.5 py-1 font-mono text-[9px] tracking-wider text-text-muted uppercase backdrop-blur-md">
                        <Video size={10} />
                        Video
                    </span>
                </div>
            )}
        </div>
    );
}
