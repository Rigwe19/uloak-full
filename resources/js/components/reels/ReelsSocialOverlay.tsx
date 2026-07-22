import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, X, Calendar, User, Tag, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Badge } from '@/components/dashboard/ui';
import { usePlayerStore } from '@/stores/video-player-store';
import type { FeedVideoData } from '@/types/feed';

interface ReelsSocialOverlayProps {
    video: FeedVideoData;
    onClose: () => void;
    onLike: () => void;
    onComment: (showPanel: boolean) => void;
    likesCount: number;
    isLiked: boolean;
}

export function ReelsSocialOverlay({
    video,
    onClose,
    onLike,
    onComment,
    likesCount,
    isLiked,
}: ReelsSocialOverlayProps) {
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const overlayVisible = usePlayerStore((s) => s.overlayVisible);

    const handleLike = () => {
        onLike();
    };

    const handleComment = () => {
        setShowInfoPanel(true);
        onComment(true);
    };

    const handleShare = () => {
        // Share functionality
    };

    const handleMore = () => {
        setShowInfoPanel(true);
    };

    const actions = [
        {
            icon: Heart,
            label: 'Like',
            count: likesCount,
            active: isLiked,
            activeColor: 'text-red-400',
            onClick: handleLike,
        },
        {
            icon: MessageCircle,
            label: 'Comment',
            count: video.comments_count,
            onClick: handleComment,
        },
        {
            icon: Share2,
            label: 'Share',
            onClick: handleShare,
        },
        {
            icon: MoreVertical,
            label: 'More',
            onClick: handleMore,
        },
    ];

    return (
        <>
            {/* Social buttons on the right */}
            <motion.div
                initial={false}
                animate={{ opacity: overlayVisible ? 1 : 0.6 }}
                transition={{ duration: 0.2 }}
                className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-5 pointer-events-none"
            >
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={action.onClick}
                        className="pointer-events-auto flex flex-col items-center gap-1 group"
                        aria-label={action.label}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-all">
                            <action.icon
                                size={18}
                                className={`transition-all ${
                                    action.active ? action.activeColor + ' fill-current' : 'text-white group-hover:text-white'
                                }`}
                            />
                        </div>
                        {action.count !== undefined && (
                            <span className="text-[10px] font-mono text-white/60">
                                {action.count}
                            </span>
                        )}
                    </button>
                ))}
            </motion.div>

            {/* Top close button */}
            <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between p-4 md:p-8">
                <button
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/10 text-text-primary backdrop-blur-md transition-all hover:bg-white/20 md:h-12 md:w-12"
                >
                    <X size={20} className="md:size-[24px]" />
                </button>
            </div>

            {/* Info Slide-over Panel */}
            <AnimatePresence>
                {showInfoPanel && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowInfoPanel(false)}
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 z-40 h-full w-full max-w-md border-l border-white/5 bg-bg-dark/98 backdrop-blur-3xl overflow-y-auto shadow-2xl"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-bg-dark/90 p-4 backdrop-blur-md">
                                <span className="text-xs font-bold tracking-widest text-accent-gold uppercase">Archival Details</span>
                                <button
                                    onClick={() => setShowInfoPanel(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                <Badge className="w-fit">{video.type}</Badge>

                                <div>
                                    <h1 className="mb-4 text-3xl leading-tight font-bold text-text-primary md:text-4xl">
                                        {video.title}
                                    </h1>
                                    <div className="flex items-center gap-6 text-sm text-text-muted">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-accent-gold" />
                                            <span>{video.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-accent-gold" />
                                            <span>{video.date}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-border-subtle" />

                                {/* Engagement */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleLike}
                                        className="group flex grow items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface/50 p-4 transition-all hover:bg-surface"
                                    >
                                        <Heart
                                            size={20}
                                            className={`transition-all ${isLiked ? 'fill-red-400 text-red-400' : 'text-text-muted group-hover:text-red-400'}`}
                                        />
                                        <span className={`text-sm font-semibold ${isLiked ? 'text-text-primary' : 'text-text-muted'}`}>
                                            {likesCount}
                                        </span>
                                    </button>
                                    <button
                                        onClick={handleComment}
                                        className="flex grow items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface/50 p-4 text-text-muted transition-all hover:bg-surface hover:text-text-primary"
                                    >
                                        <MessageCircle size={20} />
                                        <span className="text-sm font-semibold text-text-primary">{video.comments_count}</span>
                                    </button>
                                    <button className="rounded-xl border border-border-subtle bg-surface/50 p-4 text-text-muted transition-all hover:bg-surface hover:text-text-primary">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <h3 className="text-xs font-bold tracking-widest text-accent-gold uppercase">Archive Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Archivist', value: video.author },
                                            { label: 'Preserved', value: video.date },
                                            { label: 'Format', value: video.type.toUpperCase() },
                                            { label: 'Archive ID', value: `HER-${String(video.id).substring(0, 8).toUpperCase()}` },
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-xl border border-border-subtle bg-surface p-3">
                                                <p className="mb-1 text-[10px] tracking-wider text-text-muted uppercase">{item.label}</p>
                                                <p className="text-xs font-bold text-text-primary">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <h3 className="text-xs font-bold tracking-widest text-accent-gold uppercase">Narrative</h3>
                                    <p className="border-l-2 border-accent-gold/30 py-2 pl-6 text-sm leading-relaxed text-text-muted italic md:text-base">
                                        "{video.description || 'No narrative description provided for this memory.'}"
                                    </p>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}