import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import React from 'react';
import { usePlayerStore } from '@/stores/video-player-store';

interface VideoSocialOverlayProps {
    likes?: number;
    isLiked?: boolean;
    commentsCount?: number;
    onLike?: () => void;
    onComment?: () => void;
    onShare?: () => void;
    onMore?: () => void;
}

export function VideoSocialOverlay({
    likes = 0,
    isLiked = false,
    commentsCount = 0,
    onLike,
    onComment,
    onShare,
    onMore,
}: VideoSocialOverlayProps) {
    const overlayVisible = usePlayerStore((s) => s.overlayVisible);

    const actions = [
        {
            icon: Heart,
            label: 'Like',
            count: likes,
            active: isLiked,
            activeColor: 'text-red-400',
            onClick: onLike,
        },
        {
            icon: MessageCircle,
            label: 'Comment',
            count: commentsCount,
            onClick: onComment,
        },
        {
            icon: Share2,
            label: 'Share',
            onClick: onShare,
        },
        {
            icon: MoreHorizontal,
            label: 'More',
            onClick: onMore,
        },
    ];

    return (
        <motion.div
            initial={false}
            animate={{ opacity: overlayVisible ? 1 : 0.6 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute right-3 bottom-20 z-20 flex flex-col items-center gap-5"
        >
            {actions.map((action) => (
                <button
                    key={action.label}
                    onClick={action.onClick}
                    className="group pointer-events-auto flex flex-col items-center gap-1"
                    aria-label={action.label}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-all group-hover:bg-white/20">
                        <action.icon
                            size={18}
                            className={`transition-all ${
                                action.active
                                    ? action.activeColor + ' fill-current'
                                    : 'text-white group-hover:text-white'
                            }`}
                        />
                    </div>
                    {action.count !== undefined && (
                        <span className="font-mono text-[10px] text-white/60">
                            {action.count}
                        </span>
                    )}
                </button>
            ))}
        </motion.div>
    );
}
