import { Head, Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Upload,
    Clock,
    User as UserIcon,
    Play,
    Plus,
    Calendar,
    Download,
    X,
    ChevronLeft,
    ChevronRight,
    FileIcon,
    FileText,
    Music,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnnexEventMemoryModal } from '@/components/dashboard/annex-event-memory-modal';
import { ShareQRCode } from '@/components/dashboard/share-qr-code';
import { Button, Badge } from '@/components/dashboard/ui';
import { VideoPlaylistPlayer } from '@/components/dashboard/video-playlist-player';
import StoryFeed from '@/components/feed/StoryFeed';
import { dashboard } from '@/routes';
import eventsRoutes from '@/routes/dashboard/events';
import storiesRoutes from '@/routes/dashboard/stories';
import type { FeedStory } from '@/types/feed';
import { VideoPlayer } from '@/components/media/VideoPlayer';

interface EventShowProps {
    event: {
        id: string | number;
        slug: string;
        name: string;
        description: string;
        thumbnail: string;
        event_date?: string;
        stories_count: number;
        creator?: {
            name: string;
            avatar?: string;
        };
    };
    stories: FeedStory[];
    pagination?: {
        next_cursor: string | null;
        path: string;
        per_page: number;
    };
}

export default function EventShow({ event, stories: initialStories = [], pagination }: EventShowProps) {
    const [allStories, setAllStories] = useState<FeedStory[]>(initialStories);
    const [activeTab, setActiveTab] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [isAnnexModalOpen, setIsAnnexModalOpen] = useState(false);
    const viewerOpen = viewerIndex !== null;

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

    // Derive Cloudinary thumbnail URL by adding transformation params
    function getThumbnailUrl(url: string | null): string | null {
        if (!url) return null;
        if (url.includes('/image/upload/')) {
            return url.replace('/image/upload/', '/image/upload/w_640,h_640,c_limit,q_auto,f_auto/');
        }
        return url;
    }

    const getStoryThumbnail = (story: FeedStory) => {
        if (story.thumbnail) {
            return story.thumbnail;
        }

        return '/logo-stacked.png';
    };


    // Flatten collection stories into individual media items
    const displayStories = useMemo(() => {
        const flattened: (FeedStory & { assetIndex?: number })[] = [];
        allStories.forEach((story) => {
            if (story.type === 'collection' && story.assets && story.assets.length > 0) {
                story.assets.forEach((asset, index) => {
                    flattened.push({
                        ...story,
                        id: story.id * 1000 + index,
                        type: asset.type === 'pdf' ? 'document' : asset.type,
                        file_url: asset.url,
                        thumbnail: getThumbnailUrl(asset.url) || story.thumbnail,
                        title: asset.title || story.title,
                        assetIndex: index,
                    });
                });
            } else {
                if (story.type !== 'video' && story.type !== 'audio' && story.file_url && !story.thumbnail) {
                    flattened.push({ ...story, thumbnail: getThumbnailUrl(story.file_url) || story.thumbnail });
                } else {
                    flattened.push(story);
                }
            }
        });
        return flattened;
    }, [allStories]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-screen bg-bg-dark"
        >
            <Head title={event.name} />

            {/* Atmosphere background */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="atmosphere absolute inset-0 opacity-30" />
                {event.thumbnail && (
                    <motion.img
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.1 }}
                        transition={{ duration: 2 }}
                        src={event.thumbnail}
                        className="h-full w-full object-cover blur-[100px]"
                    />
                )}
            </div>

            <main className="relative z-10 mx-auto max-w-7xl p-5 pb-32 md:p-8 lg:p-16">
                <header className="mb-16">
                    <div className="mb-12 flex items-center justify-between">
                        <Link
                            href={dashboard().url}
                            className="group inline-flex items-center gap-2 text-text-muted transition-colors hover:text-text-primary"
                        >
                            <ArrowLeft
                                size={18}
                                className="transition-transform group-hover:-translate-x-1"
                            />
                            <span className="text-sm font-bold tracking-widest uppercase">
                                Dashboard
                            </span>
                        </Link>
                        <div className="flex gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <ShareQRCode roomType='events' roomSlug={event.slug} roomName={event.name} />
                                <a
                                    href={`/rooms/${event.slug}/download-media`}
                                    download
                                    className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-accent-gold/20 text-accent-gold hover:border-accent-gold/40 transition-all"
                                    title="Download all tribute media"
                                >
                                    <Download size={16} />
                                </a>
                                <div className="flex items-center gap-4" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-12 md:flex-row md:items-end">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Badge>{event.stories_count} Memories</Badge>
                                <div className="h-px w-12 bg-accent-gold/30" />
                                <span className="text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase">
                                    Public Legacy Event
                                </span>
                            </div>
                            <h1 className="text-4xl leading-none font-bold tracking-tight text-text-primary md:text-7xl">
                                {event.name}
                            </h1>
                            <p className="max-w-2xl text-lg leading-relaxed font-light text-text-muted">
                                {event.description}
                            </p>

                            {event.event_date && (
                                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-accent-gold uppercase">
                                    <Calendar size={14} />
                                    <span>Event Date: {new Date(event.event_date).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <Button
                                icon={Upload}
                                onClick={() => setIsAnnexModalOpen(true)}
                                className="shadow-[0_20px_40px_rgba(198,161,91,0.15)]"
                            >
                                Upload
                            </Button>
                        </div>
                    </div>
                </header>

                {/* YouTube Style Video Playlist Player */}
                <section className="mb-16">
                    <VideoPlaylistPlayer stories={allStories} />
                </section>

                <section>
                    <StoryFeed
                        stories={displayStories}
                        nextCursor={pagination?.next_cursor ?? null}
                        urlBuilder={(...args) => eventsRoutes.show.url(args[0] as any, args[1] as any)}
                        routeParams={{ event: event.slug }}
                        filters={{
                            tabs: ['All', 'Photo Gallery', 'Cinema Hall', 'Whispering Voices', 'Manuscripts'],
                            activeTab,
                            onTabChange: setActiveTab,
                            tags: Array.from(new Set(allStories.flatMap((s) => s.tags ?? []))),
                            selectedTag,
                            onTagChange: setSelectedTag,
                            viewMode,
                            onViewModeChange: setViewMode,
                        }}
                        emptyLabel="No memories have been shared yet."
                        addCard={
                            <div onClick={() => setIsAnnexModalOpen(true)}
                                className={`group flex cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-white/10 bg-surface/20 transition-all hover:border-accent-gold/40 hover:bg-surface/40 ${viewMode === 'grid' ? 'h-[400px]' : 'h-32 flex-row gap-6'}`}>
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/5 bg-bg-dark text-text-muted transition-all group-hover:scale-110 group-hover:text-accent-gold">
                                    <Plus size={32} />
                                </div>
                                <span className="text-xs font-bold tracking-[0.3em] text-text-primary uppercase transition-colors group-hover:text-accent-gold">
                                    Upload
                                </span>
                            </div>
                        }
                    >
                        {(story) => (
                            <div
                                onClick={() => setViewerIndex(displayStories.findIndex((s) => s.id === story.id))}
                                className={`${viewMode === 'grid'
                                    ? 'surface-glow flex h-full flex-col overflow-hidden rounded-[32px] border border-white/5 bg-surface/40 transition-all duration-500 hover:border-accent-gold/20 cursor-pointer'
                                    : 'surface-glow flex items-center gap-8 rounded-3xl border border-white/5 bg-surface/40 p-6 transition-all hover:border-accent-gold/20 cursor-pointer'
                                    }`}
                            >
                                {viewMode === 'grid' ? (
                                    <div className="surface-glow flex h-full flex-col overflow-hidden rounded-[32px] border border-white/5 bg-surface/40 transition-all duration-500 hover:border-accent-gold/20">
                                        <div className="relative aspect-4/3 overflow-hidden group">
                                            <img
                                                src={getStoryThumbnail(story)}
                                                alt={story.title}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/logo-stacked.png';
                                                }}
                                                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <div className="flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-accent-gold text-bg-dark shadow-2xl transition-transform duration-500 group-hover:scale-100">
                                                    <Play size={24} fill="currentColor" className="ml-1" />
                                                </div>
                                            </div>
                                            {/* <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <div className="flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-accent-gold text-bg-dark shadow-2xl transition-transform duration-500 group-hover:scale-100">
                                                    <Play
                                                        size={24}
                                                        fill="currentColor"
                                                        className="ml-1"
                                                    />
                                                </div>
                                            </div> */}
                                            <div className="absolute top-6 left-6">
                                                <Badge className="border-white/10 bg-bg-dark/60 text-[10px] tracking-widest uppercase backdrop-blur-md">
                                                    {story.type}
                                                </Badge>
                                            </div>
                                        </div>
                                        {/* <div className="flex grow flex-col justify-between gap-6 p-8">
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-bold text-text-primary transition-colors group-hover:text-accent-gold">
                                                    {story.title}
                                                </h3>
                                                <p className="line-clamp-2 text-sm font-light text-text-muted italic">
                                                    "{story.description}"
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-white/5 pt-6 text-[10px] font-bold tracking-[0.2em] text-text-muted uppercase">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon
                                                        size={12}
                                                        className="text-accent-gold"
                                                    />{' '}
                                                    {story.author}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock
                                                        size={12}
                                                        className="text-accent-gold"
                                                    />{' '}
                                                    {story.date}
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                ) : (
                                    <div className="surface-glow flex items-center gap-8 rounded-3xl border border-white/5 bg-surface/40 p-6 transition-all hover:border-accent-gold/20">
                                        <div className="relative aspect-video w-48 shrink-0 overflow-hidden rounded-2xl">
                                            <img
                                                src={getStoryThumbnail(story)}
                                                alt={story.title}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/logo-stacked.png';
                                                }}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/20">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                                                    <Play
                                                        size={16}
                                                        fill="white"
                                                        className="ml-0.5"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grow space-y-2">
                                            <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                <Badge className="border-white/10 bg-white/5">
                                                    {story.type}
                                                </Badge>
                                                <span className="flex items-center gap-1">
                                                    <Clock
                                                        size={12}
                                                        className="text-accent-gold"
                                                    />{' '}
                                                    {story.date}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-text-primary transition-colors group-hover:text-accent-gold">
                                                {story.title}
                                            </h3>
                                            <p className="text-sm text-text-muted italic">
                                                "{story.description}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </StoryFeed>
                </section>
            </main>

            {/* Annex Event Memory Modal */}
            {createPortal(<AnnexEventMemoryModal
                isOpen={isAnnexModalOpen}
                onClose={() => setIsAnnexModalOpen(false)}
                event={event}
            />, document.body)}

            {/* Media Viewer Modal */}
            {viewerOpen && (
                <>
                    {createPortal(<MediaViewerModal
                        stories={displayStories}
                        initialIndex={viewerIndex}
                        onClose={() => setViewerIndex(null)}
                    />, document.body)}
                </>
            )}
        </motion.div>
    );
}


/* ─── Media Viewer Modal ──────────────────────────────────── */
interface MediaViewerModalProps {
    stories: any[];
    initialIndex: number;
    onClose: () => void;
}

function MediaViewerModal({ stories, initialIndex, onClose }: MediaViewerModalProps) {
    const [currentIdx, setCurrentIdx] = useState(initialIndex);
    const [isPlaying, setIsPlaying] = useState(false);

    const story = stories[currentIdx];
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx < stories.length - 1;

    const mediaUrl = story?.file_url || story?.assets?.[0]?.url || null;
    const isDocument = story?.type === 'document' || story?.type === 'collection';

    // Preload adjacent images for instant navigation
    useEffect(() => {
        const urls: string[] = [];
        for (const offset of [-2, -1, 1, 2]) {
            const idx = currentIdx + offset;
            if (idx >= 0 && idx < stories.length) {
                const s = stories[idx];
                const url = s?.file_url || s?.assets?.[0]?.url || null;
                if (url && (s?.type === 'photo' || (!s?.type?.startsWith('video') && !s?.type?.startsWith('audio')))) {
                    urls.push(url);
                }
            }
        }
        urls.forEach((url) => {
            const img = new Image();
            img.src = url;
        });
    }, [currentIdx, stories]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && hasPrev) setCurrentIdx((p) => p - 1);
            if (e.key === 'ArrowRight' && hasNext) setCurrentIdx((p) => p + 1);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, hasPrev, hasNext]);

    useEffect(() => {
        setIsPlaying(false);
    }, [currentIdx]);

    if (!story) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-xl"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
                >
                    <X size={24} />
                </button>

                <div className="absolute top-6 left-6 z-10 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-mono tracking-wider text-white/80">
                    {currentIdx + 1} / {stories.length}
                </div>

                {hasPrev && (
                    <button
                        onClick={() => setCurrentIdx((p) => p - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                    >
                        <ChevronLeft size={28} />
                    </button>
                )}

                {hasNext && (
                    <button
                        onClick={() => setCurrentIdx((p) => p + 1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                    >
                        <ChevronRight size={28} />
                    </button>
                )}

                <div className="w-full max-w-5xl mx-auto px-4 md:px-16 flex flex-col items-center">
                    <div className="text-center mb-6 w-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white">{story.title}</h3>
                        <p className="text-sm text-white/50 mt-1">{story.author} · {story.date}</p>
                    </div>

                    <div className="w-full flex items-center justify-center">
                        {(story.type === 'video' && mediaUrl) ? (
                            <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl">
                                <VideoPlayer
                                    video={{
                                        id: story.id,
                                        storyId: story.id,
                                        title: story.title,
                                        url: mediaUrl,
                                        thumbnail: story.thumbnail || null,
                                        preview: null,
                                        sprite: null,
                                    }}
                                    autoPlay
                                    showControls
                                    showSpeedControl
                                    showPip
                                    showVolumeSlider
                                    className="w-full max-h-[60vh]"
                                    videoClassName="w-full max-h-[60vh] object-contain"
                                    onEnded={() => setIsPlaying(false)}
                                />
                            </div>
                        ) : (story.type === 'audio' && mediaUrl) ? (
                            <div className="w-full max-w-lg">
                                <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-24 h-24 rounded-full bg-accent-gold/20 border-2 border-accent-gold/40 flex items-center justify-center">
                                        <Music size={40} className="text-accent-gold" />
                                    </div>
                                    <audio src={mediaUrl} controls autoPlay className="w-full" />
                                    {story.description && <p className="text-sm text-white/60 italic text-center">"{story.description}"</p>}
                                </div>
                            </div>
                        ) : (story.type === 'photo' && mediaUrl) ? (
                            <div className="relative max-w-full max-h-[65vh]">
                                <img src={mediaUrl} alt={story.title} className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-2xl" />
                            </div>
                        ) : isDocument ? (
                            <div className="w-full max-w-lg text-center">
                                <div className="flex flex-col items-center gap-6 p-12 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-24 h-24 rounded-2xl bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                                        <FileIcon size={40} className="text-accent-gold" />
                                    </div>
                                    <h3 className="text-lg text-white font-bold">{story.title}</h3>
                                    {story.description && <p className="text-sm text-white/60 italic">"{story.description}"</p>}
                                    {mediaUrl && (
                                        <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all inline-flex items-center gap-2">
                                            <Download size={14} /> View Document
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-lg text-center">
                                <div className="flex flex-col items-center gap-4 p-12 rounded-2xl bg-white/5 border border-white/10">
                                    <FileText size={48} className="text-white/30" />
                                    <p className="text-white/50">No media available for this story.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {story.description && story.type !== 'audio' && (
                        <p className="mt-6 text-sm text-white/50 italic text-center max-w-2xl">"{story.description}"</p>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
