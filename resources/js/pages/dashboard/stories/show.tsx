import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronLeft,
    ChevronRight,
    Heart,
    MessageCircle,
    Share2,
    MoreVertical,
    Calendar,
    User,
    Play,
    Tag,
    Plus,
    Hash,
    Download,
    FileText,
    Mic,
    Info,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, TouchEvent } from 'react';
import { toast } from 'sonner';
import { Button, Badge } from '@/components/dashboard/ui';
import { VoiceRecorder } from '@/components/dashboard/voice-recorder';
import AudioWaveformPlayer from '@/components/media/AudioWaveformPlayer';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { VideoSocialOverlay } from '@/components/media/VideoSocialOverlay';
import type { PlayerVideo } from '@/types/video-player';

interface Comment {
    id: number;
    content: string;
    author: string;
    date: string;
}

interface StoryData {
    uuid: string;
    id: number;
    title: string;
    description: string;
    type: string;
    thumbnail: string;
    author: string;
    date: string;
    tags: string[];
    assets: any[];
    fileUrl?: string;
    sprite?: any;
    transcript?: any;
    comments: Comment[];
}

interface StoryPreview {
    uuid: string;
    id: number;
    title: string;
    thumbnail: string;
}

interface StoryViewerProps {
    story: StoryData;
    room: {
        id: number;
        slug: string;
        name: string;
    };
    prevStory: StoryPreview | null;
    nextStory: StoryPreview | null;
}

const SWIPE_THRESHOLD = 60;

export default function StoryViewer({ story: initialStory, room, prevStory: initialPrev, nextStory: initialNext }: StoryViewerProps) {
    const [currentStory, setCurrentStory] = useState<StoryData>(initialStory);
    const [prev, setPrev] = useState<StoryPreview | null>(initialPrev);
    const [next, setNext] = useState<StoryPreview | null>(initialNext);
    const [likes, setLikes] = useState(12);
    const [isLiked, setIsLiked] = useState(false);
    const [tags, setTags] = useState<string[]>(initialStory.tags || []);
    const [newTag, setNewTag] = useState('');
    const [showTagInput, setShowTagInput] = useState(false);
    const [activeAssetIndex, setActiveAssetIndex] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isAddingAsset, setIsAddingAsset] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [swipeDir, setSwipeDir] = useState<'up' | 'down' | null>(null);
    const [transitioning, setTransitioning] = useState(false);
    const touchStartY = useRef(0);
    const touchStartX = useRef(0);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const storyCache = useRef<Map<string, StoryData>>(new Map());

    const story = currentStory;

    const preloadStory = async (uuid: string) => {
        if (storyCache.current.has(uuid)) {
return;
}

        try {
            const res = await fetch(`/dashboard/stories/${uuid}/data`, {
                headers: { Accept: 'application/json' },
            });

            if (!res.ok) {
return;
}

            const data = await res.json();

            if (data.story) {
                storyCache.current.set(uuid, data.story);
            }

            if (data.prevStory) {
                setPrev(data.prevStory);
            }

            if (data.nextStory) {
                setNext(data.nextStory);
            }
        } catch {
            // silent
        }
    };

    const navigateTo = (uuid: string, preview: StoryPreview) => {
        setTransitioning(true);

        const cached = storyCache.current.get(uuid);

        if (cached) {
            setCurrentStory(cached);
        } else {
            setCurrentStory({
                uuid: preview.uuid,
                id: preview.id,
                title: preview.title,
                description: '',
                type: 'photo',
                thumbnail: preview.thumbnail,
                author: '',
                date: '',
                tags: [],
                assets: [],
                fileUrl: undefined,
                sprite: undefined,
                transcript: undefined,
                comments: [],
            });
            preloadStory(uuid).then(() => {
                const loaded = storyCache.current.get(uuid);

                if (loaded) {
                    setCurrentStory(loaded);
                }

                setTransitioning(false);
            });
        }

        setLikes(12);
        setIsLiked(false);
        setTags(storyCache.current.get(uuid)?.tags || []);
        setShowTagInput(false);
        setActiveAssetIndex(0);
        setShowInfoPanel(false);
        window.history.replaceState(null, '', `/dashboard/stories/${uuid}`);

        preloadStory(uuid);

        setTimeout(() => setTransitioning(false), 100);
    };

    useEffect(() => {
        storyCache.current.set(initialStory.uuid, initialStory);

        if (initialNext?.uuid) {
preloadStory(initialNext.uuid);
}

        if (initialPrev?.uuid) {
preloadStory(initialPrev.uuid);
}
    }, []);

    const handleClose = () => {
        router.get(`/dashboard/rooms/${room.slug}`);
    };

    useEffect(() => {
        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'ArrowUp' && prev?.uuid) {
                e.preventDefault();
                navigateTo(prev.uuid, prev);
            } else if (e.key === 'ArrowDown' && next?.uuid) {
                e.preventDefault();
                navigateTo(next.uuid, next);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [prev?.uuid, next?.uuid]);

    const handleTouchStart = (e: TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
        touchStartX.current = e.touches[0].clientX;
        setSwipeDir(null);
    };

    const handleTouchMove = (e: TouchEvent) => {
        const dy = e.touches[0].clientY - touchStartY.current;
        const dx = Math.abs(e.touches[0].clientX - touchStartX.current);

        if (Math.abs(dy) > 20 && Math.abs(dy) > dx * 1.5) {
            setSwipeDir(dy < 0 ? 'up' : 'down');
        } else {
            setSwipeDir(null);
        }
    };

    const handleTouchEnd = (e: TouchEvent) => {
        const dy = e.changedTouches[0].clientY - touchStartY.current;

        if (Math.abs(dy) > SWIPE_THRESHOLD) {
            if (dy < 0 && next?.uuid) {
                navigateTo(next.uuid, next);
            } else if (dy > 0 && prev?.uuid) {
                navigateTo(prev.uuid, prev);
            }
        }

        setSwipeDir(null);
    };

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newComment.trim()) {
return;
}

        setIsSubmittingComment(true);
        router.post(`/dashboard/stories/${story.uuid}/comments`, {
            content: newComment
        }, {
            onSuccess: () => {
                setNewComment('');
                setIsSubmittingComment(false);
            },
            onError: () => setIsSubmittingComment(false)
        });
    };

    const handleAddAsset = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        setIsAddingAsset(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.split('.')[0]);

        router.post(`/dashboard/stories/${story.uuid}/assets`, formData, {
            onSuccess: () => setIsAddingAsset(false),
            onError: () => setIsAddingAsset(false)
        });
    };

    const handleSaveVoice = (blob: Blob, duration: string) => {
        setIsAddingAsset(true);
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('recording', file);
        formData.append('title', `Voice Memo - ${new Date().toLocaleDateString()}`);

        router.post(`/dashboard/stories/${story.uuid}/assets`, formData, {
            onSuccess: () => {
                setIsAddingAsset(false);
                setShowVoiceRecorder(false);
            },
            onError: () => setIsAddingAsset(false)
        });
    };

    const toggleLike = () => {
        setIsLiked(!isLiked);
        setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
            setShowTagInput(false);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
addTag();
}
    };

    const videoPlayerVideo: PlayerVideo = {
        id: story.id,
        storyId: story.id,
        title: story.title,
        description: story.description,
        url: story.fileUrl || null,
        thumbnail: story.thumbnail || null,
        preview: null,
        sprite: story.sprite || null,
        author: story.author,
        date: story.date,
    };

    const collectionVideoAsset = (asset: any, idx: number): PlayerVideo => ({
        id: `story-${story.id}-asset-${idx}`,
        storyId: story.id,
        title: asset.title || `${story.title} - Video ${idx + 1}`,
        description: story.description,
        url: asset.url || null,
        thumbnail: story.thumbnail || null,
        preview: null,
        sprite: null,
    });

    const isVideo = story.type === 'video';

    return (
        <motion.div
            key={story.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-100 flex flex-col bg-bg-dark"
        >
            <Head title={story.title} />

            {/* Visual Content Section — fills available space for video */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`relative flex w-full items-center justify-center overflow-hidden bg-black ${
                    isVideo ? 'flex-1' : 'h-full min-h-0 lg:flex-1'
                }`}
            >
                {isVideo && videoPlayerVideo.url ? (
                    <div className="absolute inset-0">
                        <VideoPlayer
                            video={videoPlayerVideo}
                            autoPlay
                            showControls
                            showSpeedControl
                            showPip
                            showVolumeSlider
                            showStatusOverlay
                            className="h-full w-full"
                            videoClassName="h-full w-full object-contain"
                            topRight={
                                <button
                                    onClick={() => setShowInfoPanel(true)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/70 hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm border border-white/10"
                                    aria-label="Info"
                                >
                                    <Info size={16} />
                                </button>
                            }
                        />
                        <VideoSocialOverlay
                            likes={likes}
                            isLiked={isLiked}
                            commentsCount={story.comments.length}
                            onLike={toggleLike}
                            onComment={() => setShowInfoPanel(true)}
                            onMore={() => setShowInfoPanel(true)}
                        />
                    </div>
                ) : story.type === 'collection' && story.assets?.length > 0 ? (
                    <div className="relative flex h-full w-full items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeAssetIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex h-full w-full items-center justify-center p-4"
                            >
                                {(() => {
                                    const asset = story.assets[activeAssetIndex];

                                    switch (asset.type) {
                                        case 'video':
                                            return (
                                                <VideoPlayer
                                                    video={collectionVideoAsset(asset, activeAssetIndex)}
                                                    autoPlay
                                                    showControls
                                                    showSpeedControl={false}
                                                    showPip
                                                    showVolumeSlider
                                                    className="relative h-full w-full overflow-hidden rounded-2xl"
                                                    videoClassName="h-full w-full object-contain"
                                                />
                                            );

                                        case 'audio':
                                            return (
                                                <div className="flex h-full w-full items-center justify-center p-6 md:p-12">
                                                    <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
                                                        <div className="mb-8 flex items-center gap-6">
                                                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-accent-gold/10 text-accent-gold shadow-2xl">
                                                                <Play size={40} fill="currentColor" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="mb-2 text-xs font-bold tracking-[0.3em] text-accent-gold uppercase">
                                                                    Audio Archive
                                                                </p>

                                                                <h2 className="truncate text-2xl font-bold text-white md:text-3xl">
                                                                    {asset.title || story.title}
                                                                </h2>

                                                                <p className="mt-2 text-sm text-text-muted">
                                                                    Preserved voice memory
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <AudioWaveformPlayer
                                                            src={story.fileUrl!}
                                                            title={story.title}
                                                            transcript={story.transcript}
                                                        />

                                                        <div className="mt-6 flex items-center justify-between text-xs tracking-widest text-text-muted uppercase">
                                                            <span>Digital Preservation Artifact</span>
                                                            <span>Audio Format</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );

                                        case 'document':
                                        case 'pdf':
                                            return (
                                                <div className="flex h-full w-full items-center justify-center p-6 md:p-12">
                                                    <div className="group relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl transition-all hover:border-accent-gold/30">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 to-transparent opacity-50" />

                                                        <div className="relative flex flex-col items-center text-center">
                                                            <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-[28px] bg-accent-gold/10 text-accent-gold shadow-2xl">
                                                                <FileText size={64} />
                                                            </div>

                                                            <p className="mb-3 text-xs font-bold tracking-[0.35em] text-accent-gold uppercase">
                                                                Archived Document
                                                            </p>

                                                            <h2 className="mb-4 text-2xl font-bold text-white">
                                                                {asset.title || 'Untitled Document'}
                                                            </h2>

                                                            <p className="mb-8 max-w-md text-sm leading-relaxed text-text-muted">
                                                                This preserved artifact contains archival written material stored within the collection.
                                                            </p>

                                                            <a
                                                                href={asset.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-accent-gold/30 hover:bg-white/20"
                                                            >
                                                                <FileText size={16} />
                                                                Open Document
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            );

                                        default:
                                            return (
                                                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                                                    <img
                                                        src={asset.url}
                                                        alt={asset.title || ''}
                                                        className="h-full w-full object-contain lg:object-cover"
                                                    />

                                                    <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />
                                                </div>
                                            );
                                    }
                                })()}
                            </motion.div>
                        </AnimatePresence>

                        {/* Collection Pagers */}
                        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/40 p-2 backdrop-blur-md">
                            {story.assets.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveAssetIndex(idx)}
                                    className={`h-2 w-2 rounded-full transition-all ${activeAssetIndex === idx ? 'w-6 bg-accent-gold' : 'bg-white/20 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                ) : (() => {
                    switch (story.type) {
                        case 'audio':
                            return (
                                <div className="flex h-full w-full items-center justify-center p-6 md:p-12">
                                    <AudioWaveformPlayer
                                        src={story.fileUrl!}
                                        title={story.title}
                                        transcript={story.transcript}
                                    />
                                </div>
                            );

                        case 'document':
                        case 'pdf':
                            return (
                                <div className="flex h-full w-full items-center justify-center p-6 md:p-12">
                                    <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 to-transparent opacity-50" />

                                        <div className="relative flex flex-col items-center text-center">
                                            <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-[28px] bg-accent-gold/10 text-accent-gold shadow-2xl">
                                                <FileText size={64} />
                                            </div>

                                            <p className="mb-3 text-xs font-bold tracking-[0.35em] text-accent-gold uppercase">
                                                Archived Document
                                            </p>

                                            <h2 className="mb-4 text-2xl font-bold text-white">
                                                {story.title}
                                            </h2>

                                            <p className="mb-8 max-w-md text-sm leading-relaxed text-text-muted">
                                                This preserved artifact contains archival written material stored within the collection.
                                            </p>

                                            <a
                                                href={story.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-accent-gold/30 hover:bg-white/20"
                                            >
                                                <FileText size={16} />
                                                Open Document
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );

                        default:
                            return (
                                <motion.img
                                    layoutId={`story-${story.id}`}
                                    src={story.thumbnail}
                                    alt={story.title}
                                    className="h-full w-full object-contain lg:object-cover"
                                />
                            );
                    }
                })()}

                {/* Cinematic Overlays (non-video) */}
                {!isVideo && story.type === 'photo' && (
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                )}

                {/* Top Bar */}
                <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between p-4 md:p-8">
                    <button
                        onClick={handleClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/10 text-text-primary backdrop-blur-md transition-all hover:bg-white/20 md:h-12 md:w-12"
                    >
                        <X size={20} className="md:size-[24px]" />
                    </button>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button
                            variant="secondary"
                            className="px-3 py-2 text-[10px] sm:px-4 md:text-xs"
                            icon={Download}
                            onClick={() => toast.info('Collecting the Artifact for preservation...')}
                        >
                            Collect Artifact
                        </Button>
                        <Button
                            variant="secondary"
                            className="px-3 py-2 text-[10px] sm:px-4 md:text-xs"
                            icon={Share2}
                        >
                            Share
                        </Button>
                        {isVideo && (
                            <button
                                onClick={() => setShowInfoPanel(true)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/10 text-text-primary backdrop-blur-md transition-all hover:bg-white/20 md:h-12 md:w-12 lg:hidden"
                            >
                                <Info size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Swipe hint arrows — visible when prev/next exists */}
                {prev?.uuid && (
                    <div className="pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2">
                        <motion.div
                            animate={{ y: [0, 4, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="flex flex-col items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm"
                        >
                            <ChevronLeft size={12} className="rotate-90 text-white/50" />
                            <span className="text-[9px] font-medium tracking-wider text-white/40 uppercase">Prev</span>
                        </motion.div>
                    </div>
                )}
                {next?.uuid && (
                    <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="flex flex-col items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm"
                        >
                            <span className="text-[9px] font-medium tracking-wider text-white/40 uppercase">Next</span>
                            <ChevronRight size={12} className="rotate-90 text-white/50" />
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Info Slide-over Panel (for video stories) */}
            <AnimatePresence>
                {showInfoPanel && isVideo && (
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
                                <Badge className="w-fit">{story.type}</Badge>

                                <div>
                                    <h1 className="mb-4 text-3xl leading-tight font-bold text-text-primary md:text-4xl">
                                        {story.title}
                                    </h1>
                                    <div className="flex items-center gap-6 text-sm text-text-muted">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-accent-gold" />
                                            <span>{story.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-accent-gold" />
                                            <span>{story.date}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-border-subtle" />

                                {/* Engagement */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleLike}
                                        className="group flex grow items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface/50 p-4 transition-all hover:bg-surface"
                                    >
                                        <Heart
                                            size={20}
                                            className={`transition-all ${isLiked ? 'fill-red-400 text-red-400' : 'text-text-muted group-hover:text-red-400'}`}
                                        />
                                        <span className={`text-sm font-semibold ${isLiked ? 'text-text-primary' : 'text-text-muted'}`}>
                                            {likes}
                                        </span>
                                    </button>
                                    <button className="flex grow items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface/50 p-4 text-text-muted transition-all hover:bg-surface hover:text-text-primary">
                                        <MessageCircle size={20} />
                                        <span className="text-sm font-semibold text-text-primary">{story.comments.length}</span>
                                    </button>
                                    <button className="rounded-xl border border-border-subtle bg-surface/50 p-4 text-text-muted transition-all hover:bg-surface hover:text-text-primary">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <h3 className="text-xs font-bold tracking-widest text-accent-gold uppercase">Archive Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Archivist', value: story.author },
                                            { label: 'Preserved', value: story.date },
                                            { label: 'Format', value: story.type.toUpperCase() },
                                            { label: 'Archive ID', value: `HER-${String(story.id).substring(0, 8).toUpperCase()}` },
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
                                        "{story.description || 'No narrative description provided for this memory.'}"
                                    </p>
                                </div>

                                {/* Collection Management */}
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase">
                                            <Plus size={12} />
                                            Collection
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleAddAsset}
                                                className="hidden"
                                                accept="image/*,video/*,application/pdf"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isAddingAsset}
                                                className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-text-muted uppercase transition-colors hover:text-accent-gold disabled:opacity-50"
                                            >
                                                <Plus size={10} />
                                                {isAddingAsset ? 'Adding...' : 'Add Asset'}
                                            </button>
                                            <button
                                                onClick={() => setShowVoiceRecorder(true)}
                                                disabled={isAddingAsset}
                                                className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-text-muted uppercase transition-colors hover:text-accent-gold disabled:opacity-50"
                                            >
                                                <Mic size={10} />
                                                Record
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tagging System */}
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase">
                                            <Tag size={12} />
                                            Tags
                                        </h3>
                                        <button
                                            onClick={() => setShowTagInput(true)}
                                            className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-text-muted uppercase transition-colors hover:text-accent-gold"
                                        >
                                            <Plus size={10} />
                                            Add Tag
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <AnimatePresence mode="popLayout">
                                            {tags.map((tag) => (
                                                <motion.button
                                                    key={tag}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    onClick={() => removeTag(tag)}
                                                    className="group flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5 transition-all hover:border-red-400/30"
                                                >
                                                    <Hash size={10} className="text-accent-gold transition-colors group-hover:text-red-400" />
                                                    <span className="text-xs text-text-primary transition-colors group-hover:text-red-400">{tag}</span>
                                                </motion.button>
                                            ))}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {showTagInput && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    className="flex items-center gap-2 rounded-full border border-accent-gold/30 bg-surface px-3 py-1"
                                                >
                                                    <Hash size={10} className="text-accent-gold" />
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={newTag}
                                                        onChange={(e) => setNewTag(e.target.value)}
                                                        onKeyDown={handleKeyPress}
                                                        onBlur={() => !newTag && setShowTagInput(false)}
                                                        placeholder="Story tag..."
                                                        className="w-24 border-none bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted/40"
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold tracking-widest text-accent-gold uppercase">Narrative Responses</h3>
                                        <span className="text-[10px] font-bold text-text-muted uppercase">{story.comments.length} Memories</span>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {story.comments.map((comment) => (
                                            <div key={comment.id} className="group relative rounded-2xl border border-border-subtle bg-surface/30 p-4 transition-all hover:bg-surface/50">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-accent-gold">{comment.author}</span>
                                                    <span className="text-[10px] text-text-muted">{comment.date}</span>
                                                </div>
                                                <p className="text-sm leading-relaxed text-text-primary">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        ))}

                                        {story.comments.length === 0 && (
                                            <div className="rounded-2xl border border-dashed border-border-subtle p-8 text-center">
                                                <MessageCircle size={24} className="mx-auto mb-3 text-text-muted opacity-20" />
                                                <p className="text-xs text-text-muted italic">No responses shared yet. Be the first to leave a mark on this memory.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comment Form */}
                                    <form onSubmit={submitComment} className="mt-4 flex flex-col gap-3">
                                        <div className="relative">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Share your reflection on this memory..."
                                                className="min-h-[100px] w-full resize-none rounded-2xl border border-border-subtle bg-surface/50 p-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:border-accent-gold/30 focus:outline-none focus:ring-1 focus:ring-accent-gold/30"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isSubmittingComment || !newComment.trim()}
                                            className="w-full"
                                        >
                                            {isSubmittingComment ? 'Preserving...' : 'Share Reflection'}
                                        </Button>
                                    </form>
                                </div>

                                <div className="pt-8">
                                    <Button className="w-full" icon={Share2}>Share this memory</Button>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Voice Recorder Overlay */}
            <AnimatePresence>
                {showVoiceRecorder && (
                    <VoiceRecorder
                        onClose={() => setShowVoiceRecorder(false)}
                        onSave={handleSaveVoice}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
