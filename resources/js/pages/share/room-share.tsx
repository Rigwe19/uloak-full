import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
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
    Sparkles,
    Square,
    Upload,
    User,
    Users,
    Video,
    X,
} from 'lucide-react';
import React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { storeGuestSubscription } from '@/actions/App/Http/Controllers/ShareController';
import StoryCard from '@/components/feed/StoryCard';
import StoryFeed from '@/components/feed/StoryFeed';
import Hero from '@/components/hero';
import { VideoCard } from '@/components/media/VideoCard';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { VideoSocialOverlay } from '@/components/media/VideoSocialOverlay';
import { ResponsiveModal } from '@/components/responsive-modal';
import { UploadDropzone } from '@/components/upload/UploadDropzone';
import { usePlayerStore } from '@/stores/video-player-store';
import type { FeedStory } from '@/types/feed';
import type { PlayerVideo } from '@/types/video-player';

/* ─── Animations ─────────────────────────────────────────── */
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 60, damping: 15 } },
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

    return <canvas ref={canvasRef} width={200} height={40} className="w-full rounded-lg" />;
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
            className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 pb-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
            style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
            <button
                onClick={onBack}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all active:scale-90 active:bg-white/20"
            >
                <X size={20} />
            </button>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/70">{label}</span>
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
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/70">Sharing your memory…</p>
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
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 14 }}
                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30"
                >
                    <Check size={28} className="text-emerald-500" />
                </motion.div>
                <h3 className="font-serif text-xl text-text-primary font-light mb-1.5">Memory Shared!</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-6">
                    Your media has been added to the room for everyone to see.
                </p>
                <button
                    onClick={onClose}
                    className="w-full bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all"
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
                className="fixed inset-0 z-[120] bg-black flex flex-col"
                onClick={handleContainerClick}
            >
                {/* Close button */}
                <button onClick={(e) => {
 e.stopPropagation(); onClose(); 
}} className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm">
                    <X size={22} />
                </button>

                {/* Top info bar */}
                <motion.div
                    initial={false}
                    animate={{ opacity: overlayVisible ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-6 pb-12"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-gold/30 flex items-center justify-center text-accent-gold text-xs font-bold">
                            {story.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">{story.title}</h3>
                            <p className="text-xs text-white/60">{story.author} · {story.date}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main media area with description + comments overlay */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Video/Photo takes full area */}
                    {(story.type === 'video' || story.type === 'photo') && mediaUrl && (
                        <div className="absolute inset-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
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
                                    className="w-full h-full"
                                    videoClassName="w-full h-full object-contain"
                                    onClose={onClose}
                                />
                            ) : (
                                <img src={mediaUrl} alt={story.title} className="w-full h-full object-contain" />
                            )}
                        </div>
                    )}

                    {story.type === 'audio' && mediaUrl && (
                        <div className="absolute inset-0 flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-accent-gold/20 border-2 border-accent-gold/40 flex items-center justify-center">
                                    <Music size={40} className="text-accent-gold" />
                                </div>
                                <audio src={mediaUrl} controls autoPlay className="w-full max-w-md" />
                            </div>
                        </div>
                    )}

                    {!mediaUrl && (
                        <div className="absolute inset-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <ImageIcon size={48} className="text-white/30 mx-auto mb-4" />
                            <p className="text-white/50">No media available</p>
                        </div>
                    )}

                    {/* Description overlay on video (shown over bottom of video) */}
                    {story.description && overlayVisible && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-6 pt-16 pb-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="text-sm text-white/80 italic max-w-xl">"{story.description}"</p>
                        </motion.div>
                    )}
                </div>

                {/* Bottom: scrollable comments */}
                <div className="relative z-10 bg-black" onClick={(e) => e.stopPropagation()}>
                    <div className="max-h-[30vh] overflow-y-auto px-6 py-3 space-y-2 border-t border-white/5">
                        {story.comments.length > 0 ? (
                            story.comments.map((c) => (
                                <div key={c.id} className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-accent-gold/20 shrink-0 flex items-center justify-center text-[8px] font-bold text-accent-gold mt-0.5">
                                        {c.author.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-accent-gold">{c.author}</span>
                                            <span className="text-[8px] text-white/40">{c.date}</span>
                                        </div>
                                        <p className="text-xs text-white/70 leading-relaxed">{c.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center">
                                <p className="text-[10px] text-white/40">No comments yet</p>
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
                const story = data.stories.find(s => s.id === storyId);

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
                            const data = page.props as unknown as ShareRoomProps;
                            const story = data.stories.find(s => s.id === storyId);

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
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-surface border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0">
                    <h3 className="text-sm font-bold text-text-primary">Comments</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Comments list - scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-accent-gold border-t-transparent rounded-full" />
                        </div>
                    ) : localComments.length > 0 ? (
                        localComments.map((c) => (
                            <div key={c.id} className="bg-bg-dark/40 rounded-xl p-3 border border-white/[0.03]">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-accent-gold/20 flex items-center justify-center text-[9px] font-bold text-accent-gold">
                                        {c.author.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[11px] font-bold text-accent-gold">{c.author}</span>
                                    <span className="text-[9px] text-text-muted">{c.date}</span>
                                </div>
                                <p className="text-xs text-text-muted leading-relaxed pl-8">{c.content}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-text-muted text-xs">No comments yet. Be the first!</div>
                    )}
                </div>

                {/* Comment input - sticky bottom */}
                <div className="sticky bottom-0 bg-surface border-t border-white/5 px-6 py-4 shrink-0">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gold"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !commentText.trim()}
                            className="bg-accent-gold/20 hover:bg-accent-gold/40 text-accent-gold p-2.5 rounded-xl transition-all disabled:opacity-40"
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
        <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
            <button
                onClick={() => onViewAll(storyId)}
                className="flex items-center gap-2 text-text-muted hover:text-accent-gold transition-colors w-full"
            >
                <MessageCircle size={12} />
                <span className="text-[10px] font-mono tracking-wider uppercase">
                    {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
                </span>
            </button>

            {visibleComments.length > 0 && (
                <div className="space-y-2">
                    {visibleComments.map((c) => (
                        <div key={c.id} className="bg-bg-dark/40 rounded-xl p-3 border border-white/[0.03]">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold text-accent-gold">{c.author}</span>
                                <span className="text-[9px] text-text-muted">{c.date}</span>
                            </div>
                            <p className="text-xs text-text-muted leading-relaxed">{c.content}</p>
                        </div>
                    ))}
                    {commentsCount > 2 && (
                        <button onClick={() => onViewAll(storyId)} className="text-[10px] font-mono tracking-wider text-accent-gold hover:underline uppercase">
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
                    className="flex-1 bg-bg-dark border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-gold"
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="bg-accent-gold/20 hover:bg-accent-gold/40 text-accent-gold p-2 rounded-xl transition-all disabled:opacity-40"
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
            router.post(storeGuestSubscription.url(roomSlug), { name: name.trim(), email: email.trim() }, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const slides = [
        {
            title: "What's your name?",
            subtitle: "Let everyone know who shared this memory",
            icon: User,
            field: 'name',
            placeholder: "Enter your full name"
        },
        {
            title: "Your email address",
            subtitle: "Optional - receive updates about this room",
            icon: MessageCircle,
            field: 'email',
            placeholder: "name@example.com"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md"
        >

            <form onSubmit={handleSubmit} className="bg-surface/40 space-y-6">
                {/* <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center mx-auto">
                        <User className="w-7 h-7 text-accent-gold" />
                    </div>
                    <h2 className="font-serif text-2xl text-text-primary font-light">Introduce Yourself</h2>
                    <p className="text-sm text-text-muted">Share your name so we know who contributed.</p>
                </div> */}
                <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1.5">
                        Your Name <span className="text-accent-gold">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full bg-bg-dark border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold"
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1.5">
                        Email <span className="text-text-muted font-normal">(Optional)</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-bg-dark border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all"
                >
                    Continue
                </button>
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

    // Video recording states
    const [videoRecState, setVideoRecState] = useState<'idle' | 'recording' | 'preview'>('idle');
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [videoSeconds, setVideoSeconds] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const videoChunksRef = useRef<Blob[]>([]);
    const videoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Audio recording states
    const [audioRecState, setAudioRecState] = useState<'idle' | 'recording' | 'preview'>('idle');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
    const [audioSeconds, setAudioSeconds] = useState(0);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const audioRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Upload states
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Description
    const [description, setDescription] = useState('');

    // Submit / success
    const [isSubmittingMedia, setIsSubmittingMedia] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Keep the live <video> element wired to the active stream once it mounts in the fullscreen overlay
    useEffect(() => {
        if ((mode === 'camera' || mode === 'video') && videoRef.current && streamRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => { });
        }
    }, [mode, cameraActive]);

    // Cleanup streams
    const stopAllStreams = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }

        if (audioStream) {
            audioStream.getTracks().forEach((t) => t.stop());
            setAudioStream(null);
        }

        // Clean up video preview URL to prevent memory leaks
        if (videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
            setVideoPreviewUrl(null);
        }
    }, [audioStream, videoPreviewUrl]);

    useEffect(() => {
        return () => stopAllStreams();
    }, [stopAllStreams]);

    useEffect(() => {
        if (mode !== null) {
            document.body.style.overflow = 'hidden'
        }else{
            document.body.style.overflow = 'auto';
        }
    }, [mode]);
    const startCamera = useCallback(async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            streamRef.current = s;
            // DON'T set srcObject here — the useEffect will do it after the video element renders
            setCameraActive(true);
            setMode('camera');
        } catch {
            toast.error('Could not access camera. Please allow camera access and try again.');
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
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setCameraActive(false);
        setCameraReady(false);
    }, []);

    const retakePhoto = useCallback(() => {
        setCapturedPhoto(null);
        startCamera();
    }, [startCamera]);

    const startVideoRecording = useCallback(async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false,  // video only
            });
            streamRef.current = s;

            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
                    ? 'video/webm;codecs=vp8'
                    : 'video/webm';

            const mr = new MediaRecorder(s, { mimeType });
            videoChunksRef.current = [];

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) {
videoChunksRef.current.push(e.data);
}
            };

            mr.onstop = () => {
                const blob = new Blob(videoChunksRef.current, { type: mr.mimeType });
                const url = URL.createObjectURL(blob);
                setVideoBlob(blob);
                setVideoPreviewUrl(url);
                setVideoRecState('preview');
                s.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            };

            mediaRecorderRef.current = mr;
            mr.start(100);

            setVideoRecState('recording');
            setVideoSeconds(0);
            videoTimerRef.current = setInterval(() => setVideoSeconds((p) => p + 1), 1000);
            setCameraActive(true);
            setMode('video');
        } catch (err) {
            console.error('Video recording error:', err);
            toast.error('Could not access camera. Please allow access and try again.');
        }
    }, []);

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
            streamRef.current.getTracks().forEach(t => t.stop());
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
            const s = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(s);
            const mr = new MediaRecorder(s, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
            audioChunksRef.current = [];
            mr.ondataavailable = (e) => {
 if (e.data.size > 0) {
audioChunksRef.current.push(e.data);
} 
};
            mr.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: mr.mimeType });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioBlobUrl(url);
                setAudioRecState('preview');
                s.getTracks().forEach((t) => t.stop());
                setAudioStream(null);
            };
            mr.start();
            audioRecorderRef.current = mr;
            setAudioSeconds(0);
            setAudioRecState('recording');
            setMode('audio');
            audioTimerRef.current = setInterval(() => setAudioSeconds((p) => p + 1), 1000);
        } catch {
            toast.error('Could not access microphone. Please allow microphone access and try again.');
        }
    }, []);

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

    const handleUploadFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length > 0) {
            setUploadFiles((prev) => [...prev, ...files]);
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setUploadPreviews((prev) => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
            setMode('upload');
        }

        e.target.value = '';
    }, []);

    const removeUploadFile = useCallback((index: number) => {
        setUploadFiles((prev) => prev.filter((_, i) => i !== index));
        setUploadPreviews((prev) => prev.filter((_, i) => i !== index));
    }, []);

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
        setUploadFiles([]);
        setUploadPreviews([]);
        setDescription('');
    }, [stopAllStreams]);

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append('guest_name', guestName);
        formData.append('guest_email', guestEmail);
        formData.append('description', description);

        if (capturedPhoto) {
            const blob = dataURLtoBlob(capturedPhoto);
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            formData.append('files[]', file);
            formData.append('type', 'photo');
        } else if (videoBlob) {
            const file = new File([videoBlob], `video-${Date.now()}.webm`, { type: 'video/webm' });
            formData.append('recording', file);
            formData.append('type', 'video');
        } else if (audioBlob) {
            const file = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
            formData.append('recording', file);
            formData.append('type', 'audio');
        } else if (uploadFiles.length > 0) {
            uploadFiles.forEach((f) => formData.append('files[]', f));
            const firstFile = uploadFiles[0];
            const mime = firstFile.type;
            let detectedType = 'photo';

            if (mime.startsWith('video/')) {
                detectedType = 'video';
            } else if (mime.startsWith('audio/')) {
                detectedType = 'audio';
            }

            formData.append('type', detectedType);
        } else {
            return;
        }

        setIsSubmittingMedia(true);

        router.post(`/share/rooms/${roomSlug}/stories`, formData, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsSubmittingMedia(false);
                closeFullscreen();
                onSubmit();
                setShowSuccess(true);
            },
            onError: () => {
                setIsSubmittingMedia(false);
                toast.error('Something went wrong sharing your memory. Please try again.');
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

    const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const hasMedia = !!(capturedPhoto || (videoBlob && videoRecState === 'preview') || (audioBlob && audioRecState === 'preview') || uploadFiles.length > 0);
    const isFullscreenActive = mode !== null;

    const modeLabel = mode === 'camera' ? 'Photo' : mode === 'video' ? 'Video' : mode === 'audio' ? 'Voice Memo' : mode === 'upload' ? 'Upload' : '';

    return (
        <div className="space-y-6">
            {/* Mode Selection — stays inline in the card */}
            {!mode && (
                <div className="grid grid-cols-4 sm:grid-cols-4 md:gap-3">
                    {[
                        { key: 'camera' as CaptureMode, icon: Camera, label: 'Photo', color: 'bg-blue-500/10 text-blue-500' },
                        { key: 'video' as CaptureMode, icon: Video, label: 'Record Video', color: 'bg-red-500/10 text-red-500' },
                        { key: 'audio' as CaptureMode, icon: Mic, label: 'Record Audio', color: 'bg-accent-gold/10 text-accent-gold' },
                        { key: 'upload' as CaptureMode, icon: Upload, label: 'Upload', color: 'bg-emerald-500/10 text-emerald-500' },
                    ].map((item) => (
                        <motion.button
                            key={item.key}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                                if (item.key === 'camera') {
startCamera();
} else if (item.key === 'video') {
startVideoRecording();
} else if (item.key === 'audio') {
startAudioRecording();
} else {
 setMode('upload'); fileInputRef.current?.click(); 
}
                            }}
                            className="flex flex-col items-center gap-3 rounded-2xl md:border md:border-border-subtle bg-surface/30 md:p-5 transition-all hover:border-accent-gold/40 hover:bg-surface/60"
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}>
                                <item.icon size={22} />
                            </div>
                            <span className="text-[11px] font-bold text-text-primary text-center hidden sm:block">{item.label}</span>
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Hidden file input lives outside the fullscreen tree so it survives mode changes */}
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*,audio/*" onChange={handleUploadFiles} />

            {/* ── Fullscreen capture overlay ─────────────────────── */}
            <AnimatePresence>
                {isFullscreenActive && (
                    <>{createPortal(<motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-2000 bg-black flex flex-col overflow-hidden"
                    >
                        <canvas ref={canvasRef} className="hidden" />

                        {/* ── Review step (after something has been captured/chosen) ── */}
                        {hasMedia ? (
                            <div className="relative flex h-full flex-col">
                                <CaptureTopBar label="Add Details" onBack={closeFullscreen} />

                                {/* Scrollable preview */}
                                <div className="flex-1 overflow-y-auto pt-20 pb-4">
                                    {capturedPhoto && (
                                        <div className="relative">
                                            <img src={capturedPhoto} alt="Captured" className="max-h-[55vh] w-full object-contain bg-black" />
                                            <button
                                                onClick={retakePhoto}
                                                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3.5 py-2 text-[11px] font-mono uppercase tracking-wider text-white active:scale-95 transition-transform"
                                            >
                                                <RotateCcw size={12} /> Retake
                                            </button>
                                        </div>
                                    )}

                                    {videoBlob && videoPreviewUrl && (
                                        <div className="relative">
                                            <video src={videoPreviewUrl} controls className="max-h-[55vh] w-full bg-black" />
                                            <div className="flex items-center justify-between px-4 pt-3">
                                                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-accent-gold">
                                                    <Check size={12} /> {fmt(videoSeconds)} recorded
                                                </span>
                                                <button
                                                    onClick={rerecordVideo}
                                                    className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-wider text-white active:scale-95 transition-transform"
                                                >
                                                    <RotateCcw size={12} /> Re-record
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {audioBlob && audioBlobUrl && (
                                        <div className="flex flex-col items-center gap-5 px-6 py-10">
                                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-gold/15 border-2 border-accent-gold/40">
                                                <Music size={36} className="text-accent-gold" />
                                            </div>
                                            <span className="text-[11px] font-mono uppercase tracking-wider text-accent-gold flex items-center gap-1.5">
                                                <Check size={12} /> {fmt(audioSeconds)} recorded
                                            </span>
                                            <audio src={audioBlobUrl} controls className="w-full max-w-sm rounded-lg" />
                                            <button
                                                onClick={rerecordAudio}
                                                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-wider text-white active:scale-95 transition-transform"
                                            >
                                                <RotateCcw size={12} /> Re-record
                                            </button>
                                        </div>
                                    )}

                                    {uploadFiles.length > 0 && (
                                        <div className="px-4">
                                            <div className="grid grid-cols-3 gap-2">
                                                {uploadPreviews.map((url, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-bg-dark">
                                                        {uploadFiles[idx]?.type.startsWith('video/') ? (
                                                            <video src={url} className="w-full h-full object-cover" />
                                                        ) : uploadFiles[idx]?.type.startsWith('audio/') ? (
                                                            <div className="flex items-center justify-center h-full"><Music size={24} className="text-accent-gold" /></div>
                                                        ) : (
                                                            <img src={url} className="w-full h-full object-cover" alt="" />
                                                        )}
                                                        <button onClick={() => removeUploadFile(idx)} className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white p-1 rounded-full">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/15 text-white/50 active:scale-95 transition-transform"
                                                >
                                                    <Plus size={20} />
                                                    <span className="text-[9px] font-mono uppercase tracking-wider">Add more</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sticky description + actions */}
                                <div
                                    className="border-t border-white/10 bg-black px-4 pt-4 space-y-3"
                                    style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
                                >
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add a short description or story behind this media..."
                                        rows={2}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-gold resize-none"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={closeFullscreen}
                                            className="px-5 py-3 text-xs flex items-center gap-2 font-bold uppercase tracking-widest text-white/50 hover:text-white transition-all"
                                        >
                                            <X size={14} /> Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="ml-auto bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <Send size={14} /> Share Memory
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>{isSubmittingMedia && <SubmitLoader />}</AnimatePresence>
                            </div>
                        ) : (
                            <>
                                {/* ── Live camera (photo) ── */}
                                {mode === 'camera' && (
                                    <div className="relative h-full">
                                        <CaptureTopBar label="Photo" onBack={closeFullscreen} />
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="absolute inset-0 h-full w-full object-cover"
                                            onLoadedData={() => setCameraReady(true)}
                                        />
                                        {/* Rule-of-thirds guide lines */}
                                        <div className="pointer-events-none absolute inset-0">
                                            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/10" />
                                            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/10" />
                                            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/10" />
                                            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/10" />
                                        </div>
                                        <div
                                            className="absolute bottom-0 inset-x-0 flex items-center justify-center bg-gradient-to-t from-black/85 via-black/30 to-transparent pt-12"
                                            style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
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
                                        <CaptureTopBar label="Video" onBack={closeFullscreen} />
                                        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
                                        {videoRecState === 'recording' && (
                                            <div className="absolute top-20 left-4 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-mono text-white">
                                                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="h-2 w-2 rounded-full bg-white" />
                                                REC {fmt(videoSeconds)}
                                            </div>
                                        )}
                                        <div
                                            className="absolute bottom-0 inset-x-0 flex items-center justify-center bg-gradient-to-t from-black/85 via-black/30 to-transparent pt-12"
                                            style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
                                        >
                                            <button
                                                onClick={stopVideoRecording}
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
                                        <CaptureTopBar label="Voice Memo" onBack={closeFullscreen} />
                                        <div className="flex h-full flex-col items-center justify-center gap-8 px-8">
                                            {audioRecState === 'idle' && (
                                                <>
                                                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-accent-gold/40 bg-accent-gold/10">
                                                        <Mic className="h-10 w-10 text-accent-gold" />
                                                    </div>
                                                    <button
                                                        onClick={startAudioRecording}
                                                        className="flex items-center gap-2 rounded-full bg-accent-gold px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-bg-dark transition-transform active:scale-95"
                                                    >
                                                        <Mic size={14} /> Start Recording
                                                    </button>
                                                </>
                                            )}
                                            {audioRecState === 'recording' && (
                                                <>
                                                    <div className="relative">
                                                        <motion.div
                                                            animate={{ scale: [1, 1.15, 1] }}
                                                            transition={{ repeat: Infinity, duration: 1.2 }}
                                                            className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-red-500 bg-red-500/20"
                                                        >
                                                            <Mic className="h-10 w-10 text-red-400" />
                                                        </motion.div>
                                                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                                                    </div>
                                                    <span className="font-mono text-2xl tracking-widest text-white">{fmt(audioSeconds)}</span>
                                                    <div className="w-full max-w-xs">
                                                        <RecordingWaveform stream={audioStream} />
                                                    </div>
                                                    <button
                                                        onClick={stopAudioRecording}
                                                        className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white transition-transform active:scale-95"
                                                    >
                                                        <Square size={14} fill="white" /> Stop Recording
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Upload picker (no files chosen yet) ── */}
                                {mode === 'upload' && (
                                    <div className="relative flex h-full flex-col">
                                        <CaptureTopBar label="Upload" onBack={closeFullscreen} />
                                        <div className="flex flex-1 flex-col items-center justify-center px-6">
                                            <div className="w-full max-w-sm">
                                                <UploadDropzone
                                                    onFilesSelected={(files) => {
                                                        setUploadFiles((prev) => [...prev, ...files]);
                                                        files.forEach((file) => {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setUploadPreviews((prev) => [...prev, reader.result as string]);
                                                            };
                                                            reader.readAsDataURL(file);
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
                    </motion.div>, document.body)}</>
                )}
            </AnimatePresence>

            {/* Success modal */}
            <AnimatePresence>
                {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
            </AnimatePresence>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function RoomShare({ room, stories: initialStories, pagination, flash }: ShareRoomProps) {
    const [allStories, setAllStories] = useState<FeedStory[]>(initialStories);
    const [guestName, setGuestName] = useState(() => localStorage.getItem('room-share-name') || '');
    const [guestEmail, setGuestEmail] = useState(() => localStorage.getItem('room-share-email') || '');
    const [isIdentified, setIsIdentified] = useState(() => !!localStorage.getItem('room-share-name'));
    const [viewerStory, setViewerStory] = useState<FeedStory | null>(null);
    const [commentsStoryId, setCommentsStoryId] = useState<number | null>(null);

    // Merge paginated stories & handle reset
    useEffect(() => {
        const handleAppended = (e: CustomEvent) => {
            const { stories: newStories } = e.detail;
            setAllStories((prev) => {
                const existingIds = new Set(prev.map((s) => s.id));
                const unique = newStories.filter((s: FeedStory) => !existingIds.has(s.id));

                return [...prev, ...unique];
            });
        };
        const handleReset = (e: CustomEvent) => {
            setAllStories(e.detail.stories);
        };
        window.addEventListener('feed:appended', handleAppended as EventListener);
        window.addEventListener('feed:reset', handleReset as EventListener);

        return () => {
            window.removeEventListener('feed:appended', handleAppended as EventListener);
            window.removeEventListener('feed:reset', handleReset as EventListener);
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
                window.dispatchEvent(new CustomEvent('feed:reset', {
                    detail: { stories: data.stories ?? [] }
                }));
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
            audioRef.current.play().catch(() => { });
        }

        setIsPlayingSong(!isPlayingSong);
    }, [isPlayingSong, room.tribute_song]);
    const clearSession = useCallback(() => {
        localStorage.removeItem('room-share-name');
        localStorage.removeItem('room-share-email');
        setIsIdentified(false)
    }, []);

    return (
        <div className="relative min-h-screen bg-bg-dark">
            <Head title={`${room.name} - Uloak, House of Stories`} />

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

            <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-32 md:px-8 lg:px-16 overflow-x-hidden">
                {/* Hero */}
                <header className="mb-16 max-w-4xl mx-auto text-center">
                    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
                        <span className="text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase block">
                            {room.room_type === 'birthday' ? <><Gift size={12} className="inline-block mb-0.5" /> Birthday Room</> : room.room_type === 'burial' || room.room_type === 'memorial' ? <><Heart size={12} className="inline-block mb-0.5" /> Memorial Room</> : <><Users size={12} className="inline-block mb-0.5" /> Memory Room</>}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-serif text-text-primary font-light leading-tight">{room.name}</h1>
                        {room.description && (
                            <p className="text-lg text-text-muted font-light max-w-2xl mx-auto leading-relaxed">{room.description}</p>
                        )}
                        <div className="h-px w-20 bg-accent-gold/30 mx-auto" />
                    </motion.div>
                </header>

                {/* Identity Gate or Capture Hub */}
                <section className="max-w-4xl mx-auto mb-16">
                    <div className="bg-surface/40 border border-white/10 p-6 md:p-10 rounded-3xl">
                        <div className="text-center space-y-3 mb-8 relative">
                            <span className="text-[11px] font-mono tracking-[0.25em] text-accent-gold uppercase block">
                                {isIdentified ? <><Camera size={12} className="inline-block mb-0.5" /> Capture & Share</> : <><LogIn size={12} className="inline-block mb-0.5" /> Join the Room</>}
                            </span>
                            <h2 className="font-serif text-2xl md:text-3xl text-text-primary font-light">
                                {isIdentified ? 'Share Your Memories' : 'Introduce Yourself'}
                            </h2>
                            <div className="h-px w-16 bg-accent-gold/30 mx-auto mt-3" />
                            {isIdentified && <button onClick={clearSession} className="absolute right-2 top-2 rounded-full">
                                <LogOut className='text-red-700' />
                            </button>}
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
                <section className="max-w-6xl mx-auto">
                    <div className="text-center space-y-3 mb-12">
                        <span className="text-[11px] font-mono tracking-[0.25em] text-accent-gold uppercase block"><Video size={12} className="inline-block mb-0.5" /> Memory Gallery</span>
                        <h2 className="font-serif text-3xl md:text-4xl text-text-primary font-light">
                            Shared Memories
                        </h2>
                        <div className="h-px w-20 bg-accent-gold/30 mx-auto mt-4" />
                    </div>

                    <StoryFeed
                        stories={allStories}
                        nextCursor={pagination?.next_cursor ?? null}
                        routeName="share.rooms.show"
                        routeParams={{ slug: room.slug }}
                        emptyLabel="Be the first to share a memory! Introduce yourself above and capture a photo, record a video, or upload media."
                    >
                        {(story) => (
                            <div className="bg-surface/30 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent-gold/20 hover:bg-surface/50">
                                <StoryCard story={story} onClick={() => setViewerStory(story)} />
                                <div className="p-5 space-y-3">
                                    <h3 className="text-sm font-bold text-text-primary leading-snug">{story.title}</h3>
                                    <p className="text-xs text-text-muted italic line-clamp-2">{story.description || 'No description'}</p>
                                    <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-text-muted uppercase">
                                        <span className="flex items-center gap-1.5">
                                            <User size={10} className="text-accent-gold" /> {story.author}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={10} className="text-accent-gold" /> {story.date}
                                        </span>
                                    </div>
                                    {story.follow_ups && story.follow_ups.length > 0 && (
                                        <div className="flex items-center gap-2 text-[10px] text-accent-gold font-mono tracking-wider">
                                            <Plus size={10} />
                                            <span>{story.follow_ups.length} follow-up{story.follow_ups.length > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        {isIdentified && (
                                            <CommentSection
                                                storyId={story.id}
                                                comments={story.comments}
                                                commentsCount={story.comments_count}
                                                roomSlug={room.slug}
                                                guestName={guestName}
                                                guestEmail={guestEmail}
                                                onViewAll={(id) => setCommentsStoryId(id)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </StoryFeed>
                </section>

                {/* Footer */}
                <section className="mt-20 max-w-4xl mx-auto text-center">
                    <div className="space-y-2">
                        <div className="h-px bg-accent-gold/40 w-full" />
                        <div className="h-px bg-accent-gold/20 w-full" />
                    </div>
                    <p className="mt-8 text-xs text-text-muted font-light">
                        Every moment shared here becomes part of a lasting legacy.
                    </p>
                </section>
            </main>

            {/* Tribute Song Player */}
            {room.tribute_song && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={toggleTributeSong}
                        className={`flex items-center gap-2 rounded-full px-4 py-3 text-xs font-mono tracking-wider uppercase transition-all shadow-lg ${isPlayingSong ? 'bg-accent-gold text-bg-dark' : 'bg-surface border border-white/10 text-text-muted hover:text-text-primary'}`}
                    >
                        {isPlayingSong ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
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
                <MediaViewerModal story={viewerStory} onClose={() => setViewerStory(null)} />
            )}

        </div>
    );
}