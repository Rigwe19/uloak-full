import { storeGuestSubscription } from '@/actions/App/Http/Controllers/ShareController';
import StoryCard from '@/components/feed/StoryCard';
import StoryFeed from '@/components/feed/StoryFeed';
import Hero from '@/components/hero';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { ResponsiveModal } from '@/components/responsive-modal';
import { UploadDropzone } from '@/components/upload/UploadDropzone';
import { UploadQueue } from '@/components/upload/UploadQueue';
import { useGuestUploadQueue } from '@/hooks/use-guest-upload-queue';
import { useUploadStore } from '@/stores/upload-store';
import { usePlayerStore } from '@/stores/video-player-store';
import type { FeedStory } from '@/types/feed';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Camera,
    Check,
    Clock,
    Gift,
    Heart,
    Image as ImageIcon,
    Loader2,
    LogIn,
    LogOut,
    MessageCircle,
    Mic,
    Music,
    Pause,
    Play,
    Plus,
    RotateCcw,
    Send,
    Square,
    Upload,
    User,
    Users,
    Video,
    X
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

/* ─── Animations ─────────────────────────────────────────── */
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 60, damping: 15 },
    },
};

/* ─── Props ───────────────────────────────────────────────── */
interface ShareRoomProps {
    room: {
        id: number;
        slug: string;
        name: string;
        description: string;
        thumbnail: string;
        room_type: string;
        tribute_song: string | null;
        media_items: { url: string; type: string }[] | null;
        enable_tributes: boolean;
        enable_condolence_attendance: boolean;
        enable_candle_lighting: boolean;
        tribute_name: string | null;
    };
    stories: FeedStory[];
    pagination?: {
        next_cursor: string | null;
        path: string;
        per_page: number;
    };
    flash?: {
        success?: string;
    };
}

interface CommentData {
    id: number;
    content: string;
    author: string;
    date: string;
}

/* ─── Live Waveform ──────────────────────────────────────── */
function RecordingWaveform({ stream }: { stream: MediaStream | null }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        if (!stream) {
            return;
        }

        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const canvas = canvasRef.current;

        const draw = () => {
            rafRef.current = requestAnimationFrame(draw);

            if (!canvas) {
                return;
            }

            const c = canvas.getContext('2d');

            if (!c) {
                return;
            }

            analyser.getByteFrequencyData(data);
            c.clearRect(0, 0, canvas.width, canvas.height);
            const barW = canvas.width / data.length;
            data.forEach((v, i) => {
                const h = (v / 255) * canvas.height;
                c.fillStyle = `rgba(251,191,36,${0.4 + (v / 255) * 0.6})`;
                c.fillRect(i * barW, canvas.height - h, barW - 1, h);
            });
        };
        draw();

        return () => {
            cancelAnimationFrame(rafRef.current);
            ctx.close();
        };
    }, [stream]);

    return (
        <canvas
            ref={canvasRef}
            width={200}
            height={40}
            className="w-full rounded-lg"
        />
    );
}

/* ─── Fullscreen capture top bar ─────────────────────────── */
function CaptureTopBar({
    label,
    onBack,
}: {
    label: string;
    onBack: () => void;
}) {
    return (
        <div
            className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent px-4 pb-4"
            style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
            <button
                onClick={onBack}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all active:scale-90 active:bg-white/20"
            >
                <X size={20} />
            </button>
            <span className="font-mono text-[10px] tracking-[0.25em] text-white/70 uppercase">
                {label}
            </span>
            <div className="w-10" />
        </div>
    );
}

/* ─── Fullscreen submit loader ───────────────────────────── */
function SubmitLoader() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg-dark/90 backdrop-blur-sm"
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
                <Loader2 size={36} className="text-accent-gold" />
            </motion.div>
            <p className="font-mono text-xs tracking-[0.2em] text-white/70 uppercase">
                Sharing your memory…
            </p>
        </motion.div>
    );
}

/* ─── Success modal ───────────────────────────────────────── */
function SuccessModal({ onClose }: { onClose: () => void }) {
    return (
        <ResponsiveModal
            isOpen
            onClose={onClose}
            title="Memory Shared!"
            titleHidden
            desktopMaxWidth="max-w-sm"
        >
            <div className="p-8 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        delay: 0.1,
                        type: 'spring',
                        stiffness: 300,
                        damping: 14,
                    }}
                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15"
                >
                    <Check size={28} className="text-emerald-500" />
                </motion.div>
                <h3 className="mb-1.5 font-serif text-xl font-light text-text-primary">
                    Memory Shared!
                </h3>
                <p className="mb-6 text-xs leading-relaxed text-text-muted">
                    Your media has been added to the room for everyone to see.
                </p>
                <button
                    onClick={onClose}
                    className="w-full rounded-xl bg-accent-gold px-6 py-3 font-mono text-xs font-bold tracking-widest text-bg-dark uppercase transition-all hover:bg-accent-gold/80"
                >
                    Done
                </button>
            </div>
        </ResponsiveModal>
    );
}

/* ─── TikTok-style Media Viewer Modal ──────────────────────── */
function MediaViewerModal({
    story,
    onClose,
}: {
    story: FeedStory | null;
    onClose: () => void;
}) {
    const overlayVisible = usePlayerStore((s) => s.overlayVisible);
    const showOverlay = usePlayerStore((s) => s.showOverlay);

    if (!story) {
        return null;
    }

    const mediaUrl = story.file_url || story.assets?.[0]?.url || null;

    const handleContainerClick = useCallback(() => {
        showOverlay();
    }, [showOverlay]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[120] flex flex-col bg-black"
                onClick={handleContainerClick}
            >
                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
                >
                    <X size={22} />
                </button>

                {/* Top info bar */}
                <motion.div
                    initial={false}
                    animate={{ opacity: overlayVisible ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-0 right-0 left-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-6 pb-12"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-gold/30 text-xs font-bold text-accent-gold">
                            {story.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">
                                {story.title}
                            </h3>
                            <p className="text-xs text-white/60">
                                {story.author} · {story.date}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Main media area with description + comments overlay */}
                <div className="relative flex flex-1 flex-col overflow-hidden">
                    {/* Video/Photo takes full area */}
                    {(story.type === 'video' || story.type === 'photo') &&
                        mediaUrl && (
                            <div
                                className="absolute inset-0 flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {story.type === 'video' ? (
                                    <VideoPlayer
                                        video={{
                                            id: `modal-${story.id}`,
                                            storyId: story.id,
                                            title: story.title,
                                            url: mediaUrl,
                                            thumbnail: story.thumbnail || null,
                                            preview: null,
                                            sprite: null,
                                            author: story.author,
                                            date: story.date,
                                        }}
                                        autoPlay
                                        showControls
                                        showSpeedControl
                                        showPip
                                        showVolumeSlider
                                        className="h-full w-full"
                                        videoClassName="w-full h-full object-contain"
                                        onClose={onClose}
                                    />
                                ) : (
                                    <img
                                        src={mediaUrl}
                                        alt={story.title}
                                        className="h-full w-full object-contain"
                                    />
                                )}
                            </div>
                        )}

                    {story.type === 'audio' && mediaUrl && (
                        <div
                            className="absolute inset-0 flex items-center justify-center p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent-gold/40 bg-accent-gold/20">
                                    <Music
                                        size={40}
                                        className="text-accent-gold"
                                    />
                                </div>
                                <audio
                                    src={mediaUrl}
                                    controls
                                    autoPlay
                                    className="w-full max-w-md"
                                />
                            </div>
                        </div>
                    )}

                    {!mediaUrl && (
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ImageIcon
                                size={48}
                                className="mx-auto mb-4 text-white/30"
                            />
                            <p className="text-white/50">No media available</p>
                        </div>
                    )}

                    {/* Description overlay on video (shown over bottom of video) */}
                    {story.description && overlayVisible && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute right-0 bottom-0 left-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-6 pt-16 pb-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="max-w-xl text-sm text-white/80 italic">
                                "{story.description}"
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Bottom: scrollable comments */}
                <div
                    className="relative z-10 bg-black"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="max-h-[30vh] space-y-2 overflow-y-auto border-t border-white/5 px-6 py-3">
                        {story.comments.length > 0 ? (
                            story.comments.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-start gap-2"
                                >
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-gold/20 text-[8px] font-bold text-accent-gold">
                                        {c.author.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-accent-gold">
                                                {c.author}
                                            </span>
                                            <span className="text-[8px] text-white/40">
                                                {c.date}
                                            </span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-white/70">
                                            {c.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center">
                                <p className="text-[10px] text-white/40">
                                    No comments yet
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

/* ─── Comments Modal (Facebook-style full page) ──────────── */
function CommentsModal({
    storyId,
    roomSlug,
    guestName,
    guestEmail,
    onClose,
}: {
    storyId: number;
    roomSlug: string;
    guestName: string;
    guestEmail: string;
    onClose: () => void;
}) {
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localComments, setLocalComments] = useState<CommentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all comments via reload with only stories
    useEffect(() => {
        router.visit(window.location.pathname, {
            only: ['stories'],
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const data = page.props as unknown as ShareRoomProps;
                const story = data.stories.find((s) => s.id === storyId);

                if (story) {
                    setLocalComments(story.comments);
                }

                setIsLoading(false);
            },
            onError: () => setIsLoading(false),
        });
    }, [storyId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!commentText.trim()) {
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/share/rooms/${roomSlug}/comments`,
            {
                story_id: storyId,
                content: commentText,
                guest_name: guestName,
                guest_email: guestEmail,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setCommentText('');
                    setIsSubmitting(false);
                    // Reload comments
                    router.visit(window.location.pathname, {
                        only: ['stories'],
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: (page) => {
                            const data =
                                page.props as unknown as ShareRoomProps;
                            const story = data.stories.find(
                                (s) => s.id === storyId,
                            );

                            if (story) {
                                setLocalComments(story.comments);
                            }
                        },
                    });
                },
                onError: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <ResponsiveModal
            isOpen
            onClose={onClose}
            title="Comments"
            fullHeight
            desktopMaxWidth="max-w-lg"
        >
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/5 bg-surface px-6 py-4">
                    <h3 className="text-sm font-bold text-text-primary">
                        Comments
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-text-muted transition-colors hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Comments list - scrollable */}
                <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1,
                                    ease: 'linear',
                                }}
                                className="h-5 w-5 rounded-full border-2 border-accent-gold border-t-transparent"
                            />
                        </div>
                    ) : localComments.length > 0 ? (
                        localComments.map((c) => (
                            <div
                                key={c.id}
                                className="rounded-xl border border-white/[0.03] bg-bg-dark/40 p-3"
                            >
                                <div className="mb-1 flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-gold/20 text-[9px] font-bold text-accent-gold">
                                        {c.author.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[11px] font-bold text-accent-gold">
                                        {c.author}
                                    </span>
                                    <span className="text-[9px] text-text-muted">
                                        {c.date}
                                    </span>
                                </div>
                                <p className="pl-8 text-xs leading-relaxed text-text-muted">
                                    {c.content}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-xs text-text-muted">
                            No comments yet. Be the first!
                        </div>
                    )}
                </div>

                {/* Comment input - sticky bottom */}
                <div className="sticky bottom-0 shrink-0 border-t border-white/5 bg-surface px-6 py-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 rounded-xl border border-white/10 bg-bg-dark px-4 py-2.5 text-xs text-text-primary focus:border-accent-gold focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !commentText.trim()}
                            className="rounded-xl bg-accent-gold/20 p-2.5 text-accent-gold transition-all hover:bg-accent-gold/40 disabled:opacity-40"
                        >
                            <Send size={14} />
                        </button>
                    </form>
                </div>
            </div>
        </ResponsiveModal>
    );
}

/* ─── Gallery Comment Section ────────────────────────────── */
function CommentSection({
    storyId,
    comments,
    commentsCount,
    roomSlug,
    guestName,
    guestEmail,
    onViewAll,
}: {
    storyId: number;
    comments: CommentData[];
    commentsCount: number;
    roomSlug: string;
    guestName: string;
    guestEmail: string;
    onViewAll: (storyId: number) => void;
}) {
    const visibleComments = comments.slice(0, 2);

    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!commentText.trim()) {
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/share/rooms/${roomSlug}/comments`,
            {
                story_id: storyId,
                content: commentText,
                guest_name: guestName,
                guest_email: guestEmail,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setCommentText('');
                    setIsSubmitting(false);
                    router.visit(window.location.pathname, {
                        only: ['stories'],
                        preserveScroll: true,
                        preserveState: true,
                    });
                },
                onError: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
            <button
                onClick={() => onViewAll(storyId)}
                className="flex w-full items-center gap-2 text-text-muted transition-colors hover:text-accent-gold"
            >
                <MessageCircle size={12} />
                <span className="font-mono text-[10px] tracking-wider uppercase">
                    {commentsCount}{' '}
                    {commentsCount === 1 ? 'Comment' : 'Comments'}
                </span>
            </button>

            {visibleComments.length > 0 && (
                <div className="space-y-2">
                    {visibleComments.map((c) => (
                        <div
                            key={c.id}
                            className="rounded-xl border border-white/[0.03] bg-bg-dark/40 p-3"
                        >
                            <div className="mb-1 flex items-center gap-2">
                                <span className="text-[11px] font-bold text-accent-gold">
                                    {c.author}
                                </span>
                                <span className="text-[9px] text-text-muted">
                                    {c.date}
                                </span>
                            </div>
                            <p className="text-xs leading-relaxed text-text-muted">
                                {c.content}
                            </p>
                        </div>
                    ))}
                    {commentsCount > 2 && (
                        <button
                            onClick={() => onViewAll(storyId)}
                            className="font-mono text-[10px] tracking-wider text-accent-gold uppercase hover:underline"
                        >
                            View all {commentsCount} comments
                        </button>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmitComment} className="flex gap-2">
                <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-xl border border-white/10 bg-bg-dark px-3 py-2 text-xs text-text-primary focus:border-accent-gold focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="rounded-xl bg-accent-gold/20 p-2 text-accent-gold transition-all hover:bg-accent-gold/40 disabled:opacity-40"
                >
                    <Send size={14} />
                </button>
            </form>
        </div>
    );
}

/* ─── Guest Identity Gate ────────────────────────────────── */
function GuestIdentityGate({
    onComplete,
    initialName,
    initialEmail,
    roomSlug,
}: {
    onComplete: (name: string, email: string) => void;
    initialName: string;
    initialEmail: string;
    roomSlug: string;
}) {
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        onComplete(name.trim(), email.trim());

        // Save to database for upload reminders
        if (email.trim()) {
            router.post(
                storeGuestSubscription.url(roomSlug),
                { name: name.trim(), email: email.trim() },
                {
                    preserveScroll: true,
                    preserveState: true,
                },
            );
        }
    };

    const slides = [
        {
            title: "What's your name?",
            subtitle: 'Let everyone know who shared this memory',
            icon: User,
            field: 'name',
            placeholder: 'Enter your full name',
        },
        {
            title: 'Your email address',
            subtitle: 'Optional - receive updates about this room',
            icon: MessageCircle,
            field: 'email',
            placeholder: 'name@example.com',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-3xl border border-white/10 bg-surface/40 p-8 backdrop-blur"
            >
                <div className="text-center">
                    <p className="font-mono text-[11px] font-bold tracking-[0.28em] text-accent-gold uppercase">
                        Join the Room
                    </p>
                    <h2 className="mt-2 font-serif text-2xl font-light text-text-primary">
                        You&apos;re Part of the Story
                    </h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
                        Tell us your name so we know who these memories are
                        coming from.
                    </p>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-text-muted uppercase">
                        Your Name
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        autoComplete="name"
                        className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-text-muted uppercase">
                        Email (Optional)
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        autoComplete="email"
                        inputMode="email"
                        className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold focus:outline-none"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full rounded-xl bg-accent-gold px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-bg-dark uppercase transition-all hover:bg-accent-gold/80"
                >
                    Continue
                </button>
                <p className="text-center text-[11px] leading-relaxed text-text-muted/70">
                    Your name will appear with your contribution. Email is only
                    used for room updates if you choose to share it.
                </p>
            </form>
        </motion.div>
    );
}

/* ─── Media Capture Hub ───────────────────────────────────── */
type CaptureMode = 'camera' | 'video' | 'audio' | 'upload' | null;

function MediaCaptureHub({
    onSubmit,
    guestName,
    guestEmail,
    roomSlug,
}: {
    onSubmit: () => void;
    guestName: string;
    guestEmail: string;
    roomSlug: string;
}) {
    const [mode, setMode] = useState<CaptureMode>(null);

    // Camera states
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraReady, setCameraReady] = useState(false);

    // Video recording states — 4GB VPS guard: cap at 120s, 50MB
    const VIDEO_MAX_SECONDS = 120;
    const AUDIO_MAX_SECONDS = 180;
    const [videoRecState, setVideoRecState] = useState<
        'idle' | 'recording' | 'preview'
    >('idle');
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [videoSeconds, setVideoSeconds] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const videoChunksRef = useRef<Blob[]>([]);
    const videoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Audio recording states
    const [audioRecState, setAudioRecState] = useState<
        'idle' | 'recording' | 'preview'
    >('idle');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
    const [audioSeconds, setAudioSeconds] = useState(0);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const audioRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Upload states — parity with annex-memory-modal via guest pipeline
    const fileInputRef = useRef<HTMLInputElement>(null);
    const guestQueue = useGuestUploadQueue({
        roomSlug,
        guestName,
        guestEmail,
    });
    const { uploads, addToQueue, removeFromQueue, cancelUpload, retryUpload } =
        guestQueue;
    const completedUploads = uploads.filter((u) => u.status === 'ready');
    const hasReadyUploads = completedUploads.length > 0;

    // Description
    const [description, setDescription] = useState('');

    // Submit / success
    const [isSubmittingMedia, setIsSubmittingMedia] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Keep the live <video> element wired to the active stream once it mounts in the fullscreen overlay
    useEffect(() => {
        if (
            (mode === 'camera' || mode === 'video') &&
            videoRef.current &&
            streamRef.current &&
            !videoRef.current.srcObject
        ) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
        }
    }, [mode, cameraActive]);

    // Cleanup streams + timers + object URLs (prevent leaks on 4GB VPS / mobile)
    const stopAllStreams = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }

        if (audioStream) {
            audioStream.getTracks().forEach((t) => t.stop());
            setAudioStream(null);
        }

        if (videoTimerRef.current) {
            clearInterval(videoTimerRef.current);
            videoTimerRef.current = null;
        }
        if (audioTimerRef.current) {
            clearInterval(audioTimerRef.current);
            audioTimerRef.current = null;
        }

        // Clean up video/audio preview URLs to prevent memory leaks
        if (videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
            setVideoPreviewUrl(null);
        }
        if (audioBlobUrl) {
            URL.revokeObjectURL(audioBlobUrl);
            setAudioBlobUrl(null);
        }
    }, [audioStream, videoPreviewUrl, audioBlobUrl]);

    useEffect(() => {
        return () => stopAllStreams();
    }, [stopAllStreams]);

    useEffect(() => {
        const original = document.body.style.overflow;
        if (mode !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = original || 'auto';
        }
        return () => {
            document.body.style.overflow = original || 'auto';
        };
    }, [mode]);

    // ESC to close fullscreen + focus trap
    useEffect(() => {
        if (mode === null) {
            return;
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeFullscreen();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mode, closeFullscreen]);
    const startCamera = useCallback(async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            });
            streamRef.current = s;
            // DON'T set srcObject here — the useEffect will do it after the video element renders
            setCameraActive(true);
            setMode('camera');
        } catch {
            toast.error(
                'Could not access camera. Please allow camera access and try again.',
            );
        }
    }, []);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !streamRef.current) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // If video dimensions aren't ready, retry on next frame
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            requestAnimationFrame(capturePhoto);

            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(dataUrl);
        // Parity: enqueue via guest pipeline (watermarked + async) so submit uses media_uuids
        try {
            const blob = (() => {
                const arr = dataUrl.split(',');
                const mimeMatch = arr[0].match(/:(.*?);/);
                const mime = mimeMatch?.[1] || 'image/jpeg';
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], { type: mime });
            })();
            const file = new File([blob], `photo-${Date.now()}.jpg`, {
                type: 'image/jpeg',
            });
            addToQueue(file, 'photo');
        } catch {}
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setCameraActive(false);
        setCameraReady(false);
    }, [addToQueue]);

    const retakePhoto = useCallback(() => {
        setCapturedPhoto(null);
        startCamera();
    }, [startCamera]);

    const startVideoRecording = useCallback(async () => {
        try {
            let s: MediaStream;
            try {
                s = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        sampleRate: 48000,
                    },
                });
            } catch (e: any) {
                // Fallback for desktop / OverconstrainedError (no environment camera)
                if (e?.name === 'OverconstrainedError' || e?.name === 'NotFoundError') {
                    s = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                        },
                    });
                } else {
                    throw e;
                }
            }
            streamRef.current = s;

            // Safari (iOS) does not support webm — prefer mp4 if available
            const mimeType = MediaRecorder.isTypeSupported(
                'video/webm;codecs=vp9',
            )
                ? 'video/webm;codecs=vp9'
                : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
                  ? 'video/webm;codecs=vp8'
                  : MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
                    ? 'video/mp4;codecs=avc1'
                    : MediaRecorder.isTypeSupported('video/mp4')
                      ? 'video/mp4'
                      : 'video/webm';

            const mr = new MediaRecorder(s, { mimeType });
            videoChunksRef.current = [];

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    videoChunksRef.current.push(e.data);
                }
            };

            mr.onstop = () => {
                const blob = new Blob(videoChunksRef.current, {
                    type: mr.mimeType,
                });
                const url = URL.createObjectURL(blob);
                setVideoBlob(blob);
                setVideoPreviewUrl(url);
                setVideoRecState('preview');
                // Parity: also enqueue for guest pipeline (watermarked)
                try {
                    const file = new File([blob], `video-${Date.now()}.webm`, {
                        type: blob.type || 'video/webm',
                    });
                    addToQueue(file, 'video');
                } catch {}
                s.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            };

            mediaRecorderRef.current = mr;
            mr.start(100);

            setVideoRecState('recording');
            setVideoSeconds(0);
            videoTimerRef.current = setInterval(() => {
                setVideoSeconds((p) => {
                    const next = p + 1;
                    if (next >= VIDEO_MAX_SECONDS) {
                        // Auto-stop at cap to avoid huge files / OOM
                        setTimeout(() => {
                            toast.info(`Video limit is ${Math.floor(VIDEO_MAX_SECONDS / 60)}:${String(VIDEO_MAX_SECONDS % 60).padStart(2, '0')} — stopping`);
                            stopVideoRecording();
                        }, 0);
                    }
                    return next;
                });
            }, 1000);
            setCameraActive(true);
            setMode('video');
        } catch (err) {
            console.error('Video recording error:', err);
            toast.error(
                'Could not access camera. Please allow access and try again.',
            );
        }
    }, [addToQueue]);

    const stopVideoRecording = useCallback(() => {
        if (videoTimerRef.current) {
            clearInterval(videoTimerRef.current);
        }

        mediaRecorderRef.current?.stop();
        setCameraActive(false);
    }, []);

    const rerecordVideo = useCallback(() => {
        if (videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }

        setVideoBlob(null);
        setVideoPreviewUrl(null);
        setVideoSeconds(0);
        setVideoRecState('idle');
        setCameraActive(false);
        startVideoRecording();
    }, [videoPreviewUrl, startVideoRecording]);

    const startAudioRecording = useCallback(async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            setAudioStream(s);
            const mr = new MediaRecorder(s, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4',
            });
            audioChunksRef.current = [];
            mr.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };
            mr.onstop = () => {
                const blob = new Blob(audioChunksRef.current, {
                    type: mr.mimeType,
                });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioBlobUrl(url);
                setAudioRecState('preview');
                try {
                    const file = new File([blob], `audio-${Date.now()}.webm`, {
                        type: blob.type || 'audio/webm',
                    });
                    addToQueue(file, 'audio');
                } catch {}
                s.getTracks().forEach((t) => t.stop());
                setAudioStream(null);
            };
            mr.start();
            audioRecorderRef.current = mr;
            setAudioSeconds(0);
            setAudioRecState('recording');
            setMode('audio');
            audioTimerRef.current = setInterval(() => {
                setAudioSeconds((p) => {
                    const next = p + 1;
                    if (next >= AUDIO_MAX_SECONDS) {
                        setTimeout(() => {
                            toast.info(`Audio limit is ${Math.floor(AUDIO_MAX_SECONDS / 60)}:${String(AUDIO_MAX_SECONDS % 60).padStart(2, '0')} — stopping`);
                            stopAudioRecording();
                        }, 0);
                    }
                    return next;
                });
            }, 1000);
        } catch {
            toast.error(
                'Could not access microphone. Please allow microphone access and try again.',
            );
        }
    }, [addToQueue]);

    const stopAudioRecording = useCallback(() => {
        if (audioTimerRef.current) {
            clearInterval(audioTimerRef.current);
        }

        audioRecorderRef.current?.stop();
    }, []);

    const rerecordAudio = useCallback(() => {
        if (audioBlobUrl) {
            URL.revokeObjectURL(audioBlobUrl);
        }

        setAudioBlob(null);
        setAudioBlobUrl(null);
        setAudioSeconds(0);
        setAudioRecState('idle');
        startAudioRecording();
    }, [audioBlobUrl, startAudioRecording]);

    const handleUploadFiles = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);

            if (files.length > 0) {
                files.forEach((file) => {
                    const type: 'photo' | 'video' | 'audio' =
                        file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'photo';
                    addToQueue(file, type);
                });
                setMode('upload');
            }

            e.target.value = '';
        },
        [addToQueue],
    );

    const removeUploadFile = useCallback(
        (uploadId: string) => {
            removeFromQueue(uploadId);
        },
        [removeFromQueue],
    );

    // Full reset back to the entry grid, stopping any active stream
    const closeFullscreen = useCallback(() => {
        stopAllStreams();
        setMode(null);
        setCapturedPhoto(null);
        setVideoBlob(null);
        setVideoPreviewUrl(null);
        setVideoRecState('idle');
        setAudioBlob(null);
        setAudioBlobUrl(null);
        setAudioRecState('idle');
        // keep queue for submit, but clear previews — do not wipe uploads here if we have ready media
        // uploads are cleared on successful submit instead
        setDescription('');
    }, [stopAllStreams]);

    const handleSubmit = () => {
        // Pending response: allow video queued for compressing — show placeholder and let queue finish
        const hasQueueMedia = uploads.length > 0;

        if (!hasQueueMedia && !capturedPhoto && !videoBlob && !audioBlob) {
            toast.error('Please add a photo, video or audio first.');
            return;
        }

        // Only block while XHR is still uploading (no mediaUuid yet). Processing (ffmpeg) is OK — we show placeholder.
        const stillUploading = uploads.filter(
            (u) => u.status === 'uploading' || u.status === 'queued' || u.status === 'pending',
        );

        if (stillUploading.length > 0) {
            toast.error('Uploading… please wait a moment.');
            return;
        }

        const withMedia = uploads.filter((u) => u.mediaUuid);
        const mediaUuids = withMedia.map((u) => u.mediaUuid).filter(Boolean) as string[];

        if (mediaUuids.length === 0) {
            toast.error('Your media is still uploading — please wait a moment and try again.');
            return;
        }

        // For multiple images/videos, create one story per media (parity with annex-memory-modal)
        // so each appears as its own card instead of only the first showing.
        if (withMedia.length > 1) {
            setIsSubmittingMedia(true);
            withMedia.forEach((item, index) => {
                const fd = new FormData();
                fd.append('guest_name', guestName);
                fd.append('guest_email', guestEmail);
                fd.append('description', description);
                const t: 'video' | 'audio' | 'photo' =
                    item.file.type.startsWith('video/') ? 'video' : item.file.type.startsWith('audio/') ? 'audio' : 'photo';
                fd.append('type', t);
                fd.append('media_uuids[]', item.mediaUuid!);
                router.post(`/share/rooms/${roomSlug}/stories`, fd, {
                    forceFormData: true,
                    preserveScroll: true,
                    preserveState: index < withMedia.length - 1,
                    onSuccess: () => {
                        if (index === withMedia.length - 1) {
                            setIsSubmittingMedia(false);
                            closeFullscreen();
                            // Hide queue immediately — feed will show "Video is processing and it will show soon" placeholder
                            try {
                                useUploadStore.getState().clearAll();
                            } catch {}
                            onSubmit();
                            setShowSuccess(true);
                        }
                    },
                    onError: () => {
                        if (index === withMedia.length - 1) {
                            setIsSubmittingMedia(false);
                            toast.error('Something went wrong sharing your memory. Please try again.');
                        }
                    },
                });
            });
            return;
        }

        const firstType: 'video' | 'audio' | 'photo' = (() => {
            const first = withMedia[0];
            const mime = first?.file.type ?? '';
            if (mime.startsWith('video/')) {
                return 'video';
            }
            if (mime.startsWith('audio/')) {
                return 'audio';
            }
            return 'photo';
        })();

        const formData = new FormData();
        formData.append('guest_name', guestName);
        formData.append('guest_email', guestEmail);
        formData.append('description', description);
        formData.append('type', firstType);
        mediaUuids.forEach((uuid) => formData.append('media_uuids[]', uuid));

        setIsSubmittingMedia(true);

        router.post(`/share/rooms/${roomSlug}/stories`, formData, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsSubmittingMedia(false);
                closeFullscreen();
                // Hide queue — feed placeholder takes over (Video is processing and it will show soon)
                try {
                    useUploadStore.getState().clearAll();
                } catch {}
                onSubmit();
                setShowSuccess(true);
            },
            onError: () => {
                setIsSubmittingMedia(false);
                toast.error(
                    'Something went wrong sharing your memory. Please try again.',
                );
            },
        });
    };

    const dataURLtoBlob = (dataurl: string) => {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });
    };

    const fmt = (s: number) =>
        `${Math.floor(s / 60)
            .toString()
            .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const hasMedia = !!(
        capturedPhoto ||
        (videoBlob && videoRecState === 'preview') ||
        (audioBlob && audioRecState === 'preview') ||
        uploads.length > 0
    );
    const isFullscreenActive = mode !== null;

    const modeLabel =
        mode === 'camera'
            ? 'Photo'
            : mode === 'video'
              ? 'Video'
              : mode === 'audio'
                ? 'Voice Memo'
                : mode === 'upload'
                  ? 'Upload'
                  : '';

    return (
        <div className="space-y-6">
            {/* Mode Selection — stays inline in the card */}
            {!mode && (
                <div className="grid grid-cols-4 sm:grid-cols-4 md:gap-3">
                    {[
                        {
                            key: 'camera' as CaptureMode,
                            icon: Camera,
                            label: 'Photo',
                            color: 'bg-blue-500/10 text-blue-500',
                        },
                        {
                            key: 'video' as CaptureMode,
                            icon: Video,
                            label: 'Record Video',
                            color: 'bg-red-500/10 text-red-500',
                        },
                        {
                            key: 'audio' as CaptureMode,
                            icon: Mic,
                            label: 'Record Audio',
                            color: 'bg-accent-gold/10 text-accent-gold',
                        },
                        {
                            key: 'upload' as CaptureMode,
                            icon: Upload,
                            label: 'Upload',
                            color: 'bg-emerald-500/10 text-emerald-500',
                        },
                    ].map((item) => (
                        <motion.button
                            key={item.key}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            aria-label={item.label}
                            onClick={() => {
                                if (item.key === 'camera') {
                                    startCamera();
                                } else if (item.key === 'video') {
                                    startVideoRecording();
                                } else if (item.key === 'audio') {
                                    startAudioRecording();
                                } else {
                                    setMode('upload');
                                    fileInputRef.current?.click();
                                }
                            }}
                            className="flex flex-col items-center gap-3 rounded-2xl bg-surface/30 transition-all hover:border-accent-gold/40 hover:bg-surface/60 md:border md:border-border-subtle md:p-5"
                        >
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}
                            >
                                <item.icon size={22} />
                            </div>
                            <span className="hidden text-center text-[11px] font-bold text-text-primary sm:block">
                                {item.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Hidden file input lives outside the fullscreen tree so it survives mode changes */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={handleUploadFiles}
            />

            {/* ── Fullscreen capture overlay ─────────────────────── */}
            <AnimatePresence>
                {isFullscreenActive && (
                    <>
                        {createPortal(
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-2000 flex flex-col overflow-hidden bg-black"
                            >
                                <canvas ref={canvasRef} className="hidden" />

                                {/* ── Review step (after something has been captured/chosen) ── */}
                                {hasMedia ? (
                                    <div className="relative flex h-full flex-col">
                                        <CaptureTopBar
                                            label="Add Details"
                                            onBack={closeFullscreen}
                                        />

                                        {/* Scrollable preview */}
                                        <div className="flex-1 overflow-y-auto pt-20 pb-4">
                                            {capturedPhoto && (
                                                <div className="relative">
                                                    <img
                                                        src={capturedPhoto}
                                                        alt="Captured"
                                                        className="max-h-[55vh] w-full bg-black object-contain"
                                                    />
                                                    <button
                                                        onClick={retakePhoto}
                                                        className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3.5 py-2 font-mono text-[11px] tracking-wider text-white uppercase backdrop-blur-md transition-transform active:scale-95"
                                                    >
                                                        <RotateCcw size={12} />{' '}
                                                        Retake
                                                    </button>
                                                </div>
                                            )}

                                            {videoBlob && videoPreviewUrl && (
                                                <div className="relative">
                                                    <video
                                                        src={videoPreviewUrl}
                                                        controls
                                                        className="max-h-[55vh] w-full bg-black"
                                                    />
                                                    <div className="flex items-center justify-between px-4 pt-3">
                                                        <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-accent-gold uppercase">
                                                            <Check size={12} />{' '}
                                                            {fmt(videoSeconds)}{' '}
                                                            recorded
                                                        </span>
                                                        <button
                                                            onClick={
                                                                rerecordVideo
                                                            }
                                                            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 font-mono text-[11px] tracking-wider text-white uppercase transition-transform active:scale-95"
                                                        >
                                                            <RotateCcw
                                                                size={12}
                                                            />{' '}
                                                            Re-record
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {audioBlob && audioBlobUrl && (
                                                <div className="flex flex-col items-center gap-5 px-6 py-10">
                                                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent-gold/40 bg-accent-gold/15">
                                                        <Music
                                                            size={36}
                                                            className="text-accent-gold"
                                                        />
                                                    </div>
                                                    <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-accent-gold uppercase">
                                                        <Check size={12} />{' '}
                                                        {fmt(audioSeconds)}{' '}
                                                        recorded
                                                    </span>
                                                    <audio
                                                        src={audioBlobUrl}
                                                        controls
                                                        className="w-full max-w-sm rounded-lg"
                                                    />
                                                    <button
                                                        onClick={rerecordAudio}
                                                        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 font-mono text-[11px] tracking-wider text-white uppercase transition-transform active:scale-95"
                                                    >
                                                        <RotateCcw size={12} />{' '}
                                                        Re-record
                                                    </button>
                                                </div>
                                            )}

                                            {uploads.length > 0 && (
                                                <div className="px-4">
                                                    <UploadQueue
                                                        uploads={uploads}
                                                        onCancel={cancelUpload}
                                                        onRetry={(id) => {
                                                            const item = uploads.find((u) => u.id === id);
                                                            const type: 'photo' | 'video' | 'audio' = item?.file.type.startsWith('video/') ? 'video' : item?.file.type.startsWith('audio/') ? 'audio' : 'photo';
                                                            retryUpload(id, type);
                                                        }}
                                                        onRemove={removeFromQueue}
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            fileInputRef.current?.click()
                                                        }
                                                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/15 py-3 text-white/50 transition-transform active:scale-95"
                                                        >
                                                            <Plus size={20} />
                                                            <span className="font-mono text-[9px] tracking-wider uppercase">
                                                                Add more
                                                            </span>
                                                        </button>
                                                    </div>
                                            )}
                                        </div>

                                        {/* Sticky description + actions */}
                                        <div
                                            className="space-y-3 border-t border-white/10 bg-black px-4 pt-4"
                                            style={{
                                                paddingBottom:
                                                    'max(1.25rem, env(safe-area-inset-bottom))',
                                            }}
                                        >
                                            <textarea
                                                value={description}
                                                onChange={(e) =>
                                                    setDescription(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Add a short description or story behind this media..."
                                                rows={2}
                                                maxLength={500}
                                                aria-label="Description for your memory"
                                                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent-gold focus:outline-none"
                                            />
                                            <div className="flex justify-end">
                                                <span className="font-mono text-[10px] text-white/30">
                                                    {description.length}/500
                                                </span>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={closeFullscreen}
                                                    className="flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-widest text-white/50 uppercase transition-all hover:text-white"
                                                >
                                                    <X size={14} /> Cancel
                                                </button>
                                                <button
                                                    onClick={handleSubmit}
                                                    className="ml-auto flex items-center gap-2 rounded-xl bg-accent-gold px-6 py-3 font-mono text-xs font-bold tracking-widest text-bg-dark uppercase transition-all hover:bg-accent-gold/80"
                                                >
                                                    <Send size={14} /> Share
                                                    Memory
                                                </button>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isSubmittingMedia && (
                                                <SubmitLoader />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <>
                                        {/* ── Live camera (photo) ── */}
                                        {mode === 'camera' && (
                                            <div className="relative h-full">
                                                <CaptureTopBar
                                                    label="Photo"
                                                    onBack={closeFullscreen}
                                                />
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                    onLoadedData={() =>
                                                        setCameraReady(true)
                                                    }
                                                />
                                                {/* Rule-of-thirds guide lines */}
                                                <div className="pointer-events-none absolute inset-0">
                                                    <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/10" />
                                                    <div className="absolute top-0 bottom-0 left-2/3 w-px bg-white/10" />
                                                    <div className="absolute top-1/3 right-0 left-0 h-px bg-white/10" />
                                                    <div className="absolute top-2/3 right-0 left-0 h-px bg-white/10" />
                                                </div>
                                                <div
                                                    className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/85 via-black/30 to-transparent pt-12"
                                                    style={{
                                                        paddingBottom:
                                                            'max(2.5rem, env(safe-area-inset-bottom))',
                                                    }}
                                                >
                                                    <button
                                                        onClick={capturePhoto}
                                                        disabled={!cameraReady}
                                                        className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-white/90 transition-transform active:scale-90 disabled:opacity-40"
                                                    >
                                                        <div className="h-16 w-16 rounded-full bg-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Live video recording ── */}
                                        {mode === 'video' && (
                                            <div className="relative h-full">
                                                <CaptureTopBar
                                                    label="Video"
                                                    onBack={closeFullscreen}
                                                />
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                />
                                                {videoRecState ===
                                                    'recording' && (
                                                    <div className="absolute top-20 left-4 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1.5 font-mono text-xs text-white">
                                                        <motion.span
                                                            animate={{
                                                                opacity: [
                                                                    1, 0.3, 1,
                                                                ],
                                                            }}
                                                            transition={{
                                                                repeat: Infinity,
                                                                duration: 1,
                                                            }}
                                                            className="h-2 w-2 rounded-full bg-white"
                                                        />
                                                        REC {fmt(videoSeconds)} / {fmt(VIDEO_MAX_SECONDS)}
                                                    </div>
                                                )}
                                                <div
                                                    className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/85 via-black/30 to-transparent pt-12"
                                                    style={{
                                                        paddingBottom:
                                                            'max(2.5rem, env(safe-area-inset-bottom))',
                                                    }}
                                                >
                                                    <button
                                                        onClick={
                                                            stopVideoRecording
                                                        }
                                                        className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-white/90 transition-transform active:scale-90"
                                                    >
                                                        <div className="h-8 w-8 rounded-md bg-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Live audio recording ── */}
                                        {mode === 'audio' && (
                                            <div className="relative h-full bg-gradient-to-b from-bg-dark via-black to-black">
                                                <CaptureTopBar
                                                    label="Voice Memo"
                                                    onBack={closeFullscreen}
                                                />
                                                <div className="flex h-full flex-col items-center justify-center gap-8 px-8">
                                                    {audioRecState ===
                                                        'idle' && (
                                                        <>
                                                            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-accent-gold/40 bg-accent-gold/10">
                                                                <Mic className="h-10 w-10 text-accent-gold" />
                                                            </div>
                                                            <button
                                                                onClick={
                                                                    startAudioRecording
                                                                }
                                                                className="flex items-center gap-2 rounded-full bg-accent-gold px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-bg-dark uppercase transition-transform active:scale-95"
                                                            >
                                                                <Mic
                                                                    size={14}
                                                                />{' '}
                                                                Start Recording
                                                            </button>
                                                        </>
                                                    )}
                                                    {audioRecState ===
                                                        'recording' && (
                                                        <>
                                                            <div className="relative">
                                                                <motion.div
                                                                    animate={{
                                                                        scale: [
                                                                            1,
                                                                            1.15,
                                                                            1,
                                                                        ],
                                                                    }}
                                                                    transition={{
                                                                        repeat: Infinity,
                                                                        duration: 1.2,
                                                                    }}
                                                                    className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-red-500 bg-red-500/20"
                                                                >
                                                                    <Mic className="h-10 w-10 text-red-400" />
                                                                </motion.div>
                                                                <span className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-red-500" />
                                                            </div>
                                                            <span className="font-mono text-2xl tracking-widest text-white">
                                                                {fmt(
                                                                    audioSeconds,
                                                                )}
                                                            </span>
                                                            <div className="w-full max-w-xs">
                                                                <RecordingWaveform
                                                                    stream={
                                                                        audioStream
                                                                    }
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={
                                                                    stopAudioRecording
                                                                }
                                                                className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3.5 font-mono text-xs font-bold tracking-widest text-white uppercase transition-transform active:scale-95"
                                                            >
                                                                <Square
                                                                    size={14}
                                                                    fill="white"
                                                                />{' '}
                                                                Stop Recording
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Upload picker (no files chosen yet) ── */}
                                        {mode === 'upload' && (
                                            <div className="relative flex h-full flex-col">
                                                <CaptureTopBar
                                                    label="Upload"
                                                    onBack={closeFullscreen}
                                                />
                                                <div className="flex flex-1 flex-col items-center justify-center px-6">
                                                    <div className="w-full max-w-sm">
                                                        <UploadDropzone
                                                            onFilesSelected={(
                                                                files,
                                                            ) => {
                                                                files.forEach((file) => {
                                                                    const t: 'photo' | 'video' | 'audio' = file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'photo';
                                                                    addToQueue(file, t);
                                                                });
                                                                setMode('upload');
                                                            }}
                                                            multiple
                                                            accept="image/*,video/*,audio/*"
                                                            maxSizeMB={50}
                                                            label="Tap to browse files"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>,
                            document.body,
                        )}
                    </>
                )}
            </AnimatePresence>

            {/* Success modal */}
            <AnimatePresence>
                {showSuccess && (
                    <SuccessModal onClose={() => setShowSuccess(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function RoomShare({
    room,
    stories: initialStories,
    pagination,
    flash,
}: ShareRoomProps) {
    const [allStories, setAllStories] = useState<FeedStory[]>(initialStories);
    const [guestName, setGuestName] = useState(
        () => localStorage.getItem('room-share-name') || '',
    );
    const [guestEmail, setGuestEmail] = useState(
        () => localStorage.getItem('room-share-email') || '',
    );
    const [isIdentified, setIsIdentified] = useState(
        () => !!localStorage.getItem('room-share-name'),
    );
    const [viewerStory, setViewerStory] = useState<FeedStory | null>(null);
    const [commentsStoryId, setCommentsStoryId] = useState<number | null>(null);

    // Poll for video processing completion — while any story shows placeholder, refresh feed
    useEffect(() => {
        const hasProcessing = allStories.some((s) => (s as any).is_processing);
        if (! hasProcessing) {
            return;
        }
        const id = window.setInterval(() => {
            router.visit(window.location.pathname, {
                only: ['stories'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 5000);
        return () => window.clearInterval(id);
    }, [allStories]);

    // Merge paginated stories & handle reset
    useEffect(() => {
        const handleAppended = (e: CustomEvent) => {
            const { stories: newStories } = e.detail;
            setAllStories((prev) => {
                const existingIds = new Set(prev.map((s) => s.id));
                const unique = newStories.filter(
                    (s: FeedStory) => !existingIds.has(s.id),
                );

                return [...prev, ...unique];
            });
        };
        const handleReset = (e: CustomEvent) => {
            setAllStories(e.detail.stories);
        };
        window.addEventListener(
            'feed:appended',
            handleAppended as EventListener,
        );
        window.addEventListener('feed:reset', handleReset as EventListener);

        return () => {
            window.removeEventListener(
                'feed:appended',
                handleAppended as EventListener,
            );
            window.removeEventListener(
                'feed:reset',
                handleReset as EventListener,
            );
        };
    }, []);

    // Tribute song player state
    const [isPlayingSong, setIsPlayingSong] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Persist guest identity in localStorage to survive page reloads
    const completeIdentity = useCallback((name: string, email: string) => {
        setGuestName(name);
        setGuestEmail(email);
        setIsIdentified(true);
        localStorage.setItem('room-share-name', name);
        localStorage.setItem('room-share-email', email);
    }, []);

    // Refresh stories after submission
    const handleNewSubmission = useCallback(() => {
        router.visit(window.location.pathname, {
            only: ['stories'],
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const data = page.props as any;
                window.dispatchEvent(
                    new CustomEvent('feed:reset', {
                        detail: { stories: data.stories ?? [] },
                    }),
                );
            },
        });
    }, []);

    // Tribute song toggle
    const toggleTributeSong = useCallback(() => {
        if (!room.tribute_song) {
            return;
        }

        if (!audioRef.current) {
            audioRef.current = new Audio(room.tribute_song);
            audioRef.current.loop = true;
        }

        if (isPlayingSong) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => {});
        }

        setIsPlayingSong(!isPlayingSong);
    }, [isPlayingSong, room.tribute_song]);
    const clearSession = useCallback(() => {
        localStorage.removeItem('room-share-name');
        localStorage.removeItem('room-share-email');
        setIsIdentified(false);
    }, []);

    return (
        <div className="relative min-h-screen bg-bg-dark">
            <Head title={`${room.name} - Ulo of Stories`} />

            {/* Background */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="atmosphere absolute inset-0 opacity-30" />
                {room.thumbnail && (
                    <motion.img
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.08 }}
                        transition={{ duration: 3 }}
                        src={room.thumbnail}
                        className="h-full w-full object-cover blur-[100px]"
                        alt=""
                    />
                )}
            </div>
            <div className="mb-2">
                <Hero />
            </div>

            <main className="relative z-10 mx-auto w-full max-w-7xl overflow-x-hidden px-4 pb-32 md:px-8 lg:px-16">
                {/* Hero */}
                <header className="mx-auto mb-16 max-w-4xl text-center">
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        <span className="block text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase">
                            {room.room_type === 'birthday' ? (
                                <>
                                    <Gift
                                        size={12}
                                        className="mb-0.5 inline-block"
                                    />{' '}
                                    Birthday Room
                                </>
                            ) : room.room_type === 'burial' ||
                              room.room_type === 'memorial' ? (
                                <>
                                    <Heart
                                        size={12}
                                        className="mb-0.5 inline-block"
                                    />{' '}
                                    Memorial Room
                                </>
                            ) : (
                                <>
                                    <Users
                                        size={12}
                                        className="mb-0.5 inline-block"
                                    />{' '}
                                    Memory Room
                                </>
                            )}
                        </span>
                        <h1 className="font-serif text-4xl leading-tight font-light text-text-primary md:text-6xl">
                            {room.name}
                        </h1>
                        {room.description && (
                            <p className="mx-auto max-w-2xl text-lg leading-relaxed font-light text-text-muted">
                                {room.description}
                            </p>
                        )}
                        <div className="mx-auto h-px w-20 bg-accent-gold/30" />
                    </motion.div>
                </header>

                {/* Identity Gate or Capture Hub */}
                <section className="mx-auto mb-16 max-w-4xl">
                    <div className="rounded-3xl border border-white/10 bg-surface/40 p-6 md:p-10">
                        <div className="relative mb-8 space-y-3 text-center">
                            <span className="block font-mono text-[11px] tracking-[0.25em] text-accent-gold uppercase">
                                {isIdentified ? (
                                    <>
                                        <Camera
                                            size={12}
                                            className="mb-0.5 inline-block"
                                        />{' '}
                                        Capture & Share
                                    </>
                                ) : (
                                    <>
                                        <LogIn
                                            size={12}
                                            className="mb-0.5 inline-block"
                                        />{' '}
                                        Join the Room
                                    </>
                                )}
                            </span>
                            <h2 className="font-serif text-2xl font-light text-text-primary md:text-3xl">
                                {isIdentified
                                    ? 'Share Your Memories'
                                    : 'Introduce Yourself'}
                            </h2>
                            <div className="mx-auto mt-3 h-px w-16 bg-accent-gold/30" />
                            {isIdentified && (
                                <button
                                    onClick={clearSession}
                                    className="absolute top-2 right-2 rounded-full"
                                >
                                    <LogOut className="text-red-700" />
                                </button>
                            )}
                        </div>

                        {!isIdentified ? (
                            <GuestIdentityGate
                                onComplete={(name, email) => {
                                    completeIdentity(name, email);
                                }}
                                initialName={guestName}
                                initialEmail={guestEmail}
                                roomSlug={room.slug}
                            />
                        ) : (
                            <MediaCaptureHub
                                onSubmit={handleNewSubmission}
                                guestName={guestName}
                                guestEmail={guestEmail}
                                roomSlug={room.slug}
                            />
                        )}
                    </div>
                </section>

                {/* Media Gallery — Stories from others */}
                <section className="mx-auto max-w-6xl">
                    <div className="mb-12 space-y-3 text-center">
                        <span className="block font-mono text-[11px] tracking-[0.25em] text-accent-gold uppercase">
                            <Video size={12} className="mb-0.5 inline-block" />{' '}
                            Memory Gallery
                        </span>
                        <h2 className="font-serif text-3xl font-light text-text-primary md:text-4xl">
                            Shared Memories
                        </h2>
                        <div className="mx-auto mt-4 h-px w-20 bg-accent-gold/30" />
                    </div>

                    <StoryFeed
                        stories={allStories}
                        nextCursor={pagination?.next_cursor ?? null}
                        routeName="share.rooms.show"
                        routeParams={{ slug: room.slug }}
                        emptyLabel="Be the first to share a memory! Introduce yourself above and capture a photo, record a video, or upload media."
                    >
                        {(story) => (
                            <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface/30 transition-all duration-300 hover:border-accent-gold/20 hover:bg-surface/50">
                                <StoryCard
                                    story={story}
                                    onClick={() => setViewerStory(story)}
                                />
                                <div className="space-y-3 p-5">
                                    <h3 className="text-sm leading-snug font-bold text-text-primary">
                                        {story.title}
                                    </h3>
                                    <p className="line-clamp-2 text-xs text-text-muted italic">
                                        {story.description || 'No description'}
                                    </p>
                                    <div className="flex items-center justify-between font-mono text-[10px] tracking-wider text-text-muted uppercase">
                                        <span className="flex items-center gap-1.5">
                                            <User
                                                size={10}
                                                className="text-accent-gold"
                                            />{' '}
                                            {story.author}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock
                                                size={10}
                                                className="text-accent-gold"
                                            />{' '}
                                            {story.date}
                                        </span>
                                    </div>
                                    {story.follow_ups &&
                                        story.follow_ups.length > 0 && (
                                            <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-accent-gold">
                                                <Plus size={10} />
                                                <span>
                                                    {story.follow_ups.length}{' '}
                                                    follow-up
                                                    {story.follow_ups.length > 1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            </div>
                                        )}
                                    <div className="flex items-center justify-between border-t border-white/5 pt-2">
                                        {isIdentified && (
                                            <CommentSection
                                                storyId={story.id}
                                                comments={story.comments}
                                                commentsCount={
                                                    story.comments_count
                                                }
                                                roomSlug={room.slug}
                                                guestName={guestName}
                                                guestEmail={guestEmail}
                                                onViewAll={(id) =>
                                                    setCommentsStoryId(id)
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </StoryFeed>
                </section>

                {/* Footer */}
                <section className="mx-auto mt-20 max-w-4xl text-center">
                    <div className="space-y-2">
                        <div className="h-px w-full bg-accent-gold/40" />
                        <div className="h-px w-full bg-accent-gold/20" />
                    </div>
                    <p className="mt-8 text-xs font-light text-text-muted">
                        Every moment shared here becomes part of a lasting
                        legacy.
                    </p>
                </section>
            </main>

            {/* Tribute Song Player */}
            {room.tribute_song && (
                <div className="fixed right-6 bottom-6 z-50">
                    <button
                        onClick={toggleTributeSong}
                        className={`flex items-center gap-2 rounded-full px-4 py-3 font-mono text-xs tracking-wider uppercase shadow-lg transition-all ${isPlayingSong ? 'bg-accent-gold text-bg-dark' : 'border border-white/10 bg-surface text-text-muted hover:text-text-primary'}`}
                    >
                        {isPlayingSong ? (
                            <Pause size={14} fill="currentColor" />
                        ) : (
                            <Play size={14} fill="currentColor" />
                        )}
                        {isPlayingSong ? 'Playing' : 'Play Music'}
                    </button>
                </div>
            )}

            {/* Comments Modal */}
            {commentsStoryId && (
                <CommentsModal
                    storyId={commentsStoryId}
                    roomSlug={room.slug}
                    guestName={guestName}
                    guestEmail={guestEmail}
                    onClose={() => setCommentsStoryId(null)}
                />
            )}

            {/* Media Viewer Modal */}
            {viewerStory && (
                <MediaViewerModal
                    story={viewerStory}
                    onClose={() => setViewerStory(null)}
                />
            )}
        </div>
    );
}
