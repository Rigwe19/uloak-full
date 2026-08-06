import eventsRoutes from '@/routes/share/events';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Filter,
    Grid,
    List as ListIcon,
    Clock,
    User as UserIcon,
    Play,
    Calendar,
    Camera,
    Video,
    Music,
    FileText,
    ChevronLeft,
    ChevronRight,
    Download,
    DownloadCloud,
    File as FileIcon,
    Sparkles,
    ArrowRight,
    X,
    Loader,
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Button, Badge } from '@/components/dashboard/ui';
import { VideoPlaylistPlayer } from '@/components/dashboard/video-playlist-player';
import StoryFeed from '@/components/feed/StoryFeed';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import type { FeedStory } from '@/types/feed';
import { createPortal } from 'react-dom';

/* ─── animations ─────────────────────────────────────────── */
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 15 } },
};

/* ─── Props ───────────────────────────────────────────────── */
interface ShareEventProps {
    event: {
        id: string | number;
        slug: string;
        name: string;
        description: string;
        thumbnail: string;
        event_date?: string;
        stories_count: number;
        allow_download: boolean;
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
    flash?: {
        success?: string;
    };
}

/* ─── Ad Banner Section ─────────────────────────────────────── */
function AdBanner() {
    return (
        <section className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 lg:px-16 mt-8 mb-8">
            <Link
                href="/register"
                className="group relative block overflow-hidden rounded-3xl border border-accent-gold/20 bg-gradient-to-br from-accent-gold/10 via-bg-dark to-accent-gold/5 p-8 md:p-12 transition-all hover:border-accent-gold/40"
            >
                <div className="absolute top-0 right-0 h-64 w-64 translate-x-16 -translate-y-16 rounded-full bg-accent-gold/10 blur-[80px]" />
                <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-8 translate-y-8 rounded-full bg-accent-gold/5 blur-[60px]" />

                <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left md:justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <Sparkles size={16} className="text-accent-gold" />
                            <span className="text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase">Create Your Own</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-text-primary">
                            Your stories deserve a home.
                        </h3>
                        <p className="max-w-lg text-sm text-text-muted leading-relaxed">
                            Preserve your family's legacy, share memories, and create a lasting digital heritage — for free.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <span className="inline-flex items-center gap-2 rounded-xl bg-accent-gold px-6 py-3 text-xs font-bold tracking-widest text-bg-dark uppercase transition-all group-hover:bg-accent-gold/90 group-hover:shadow-lg group-hover:shadow-accent-gold/20">
                            Get Started Free
                            <ArrowRight size={14} />
                        </span>
                    </div>
                </div>
            </Link>
        </section>
    );
}

/* ─── Media Type Icon Helper ──────────────────────────────── */
function MediaTypeIcon({ type }: { type: string }) {
    const icons: Record<string, React.ReactNode> = {
        photo: <Camera size={14} />,
        video: <Video size={14} />,
        audio: <Music size={14} />,
        document: <FileText size={14} />,
        collection: <FileIcon size={14} />,
    };

    return <>{icons[type] || <FileText size={14} />}</>;
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
                                {/* Download button overlay */}
                                <a
                                    href={mediaUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-black/60 transition-all backdrop-blur-sm"
                                    title="Download"
                                >
                                    <Download size={18} />
                                </a>
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

/* ─── Main Page ──────────────────────────────────────────── */
export default function ShareEvent({ event, stories: initialStories = [], pagination }: ShareEventProps) {
    const [allStories, setAllStories] = useState<FeedStory[]>(initialStories);
    const [activeTab, setActiveTab] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

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

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        (allStories || []).forEach((s) => s.tags?.forEach((t: string) => tags.add(t)));
        return Array.from(tags);
    }, [allStories]);

    const viewerOpen = viewerIndex !== null;

    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Derive Cloudinary thumbnail URL by adding transformation params
    function getThumbnailUrl(url: string | null): string | null {
        if (!url) return null;
        if (url.includes('/image/upload/')) {
            return url.replace('/image/upload/', '/image/upload/w_640,h_640,c_limit,q_auto,f_auto/');
        }
        return url;
    }

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
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative min-h-screen bg-bg-dark">
                <Head title={`${event.name} - Ulo of Stories`} />

                {/* Atmosphere background */}
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                    <div className="atmosphere absolute inset-0 opacity-30" />
                    {event.thumbnail && (
                        <motion.img
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.08 }}
                            transition={{ duration: 3 }}
                            src={event.thumbnail}
                            className="h-full w-full object-cover blur-[100px]"
                            alt=""
                        />
                    )}
                    <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-accent-gold/5 blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-gold/5 blur-[120px]" />
                </div>

                {/* Video Playlist Player - full-width hero */}
                <div className="relative z-10">
                    <VideoPlaylistPlayer stories={initialStories} fullscreen />
                </div>

                <main className="relative z-10 mx-auto max-w-7xl p-5 pb-32 md:p-8 lg:p-16">
                    <header className="mb-16 mt-10">
                        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    {event.stories_count > 0 && (
                                        <><Badge>{event.stories_count} Memories</Badge><div className="h-px w-12 bg-accent-gold/30" /></>
                                    )}
                                    <span className="text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase">Public Event</span>
                                </div>
                                <div className="space-y-4">
                                    <h1 className="text-4xl leading-none font-bold tracking-tight text-text-primary md:text-7xl">{event.name}</h1>
                                    <p className="max-w-2xl text-lg leading-relaxed font-light text-text-muted">{event.description}</p>
                                    {event.event_date && (
                                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-accent-gold uppercase">
                                            <Calendar size={14} />
                                            <span>Event Date: {new Date(event.event_date).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                                        </div>
                                    )}
                                </div>
                                {/* Download ZIP button */}
                                {event.allow_download && <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={() => setShowDownloadModal(true)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-accent-gold/20 hover:border-accent-gold/40 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-accent-gold transition-all"
                                    >
                                        <DownloadCloud size={14} />
                                        Download All Media
                                    </button>
                                </div>}

                                {/* Email download modal */}
                                {showDownloadModal && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface p-6">
                                            <h3 className="text-lg font-bold text-text-primary">Download All Media</h3>
                                            <p className="mt-1 text-sm text-text-muted">Enter your email and we'll send you a download link.</p>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                setSubmitting(true);
                                                router.post('/downloads/request', {
                                                    email,
                                                    type: 'event',
                                                    slug: event.slug,
                                                }, {
                                                    onSuccess: () => {
                                                        setShowDownloadModal(false);
                                                        setEmail('');
                                                    },
                                                    onFinish: () => setSubmitting(false),
                                                });
                                            }} className="mt-4 space-y-3">
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@example.com"
                                                    className="w-full rounded-xl border border-white/10 bg-bg-dark px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted"
                                                />
                                                <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent-gold px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-bg-dark">
                                                    {submitting && <Loader size={14} className="animate-spin" />}
                                                    {submitting ? 'Sending...' : 'Send Link'}
                                                </button>
                                            </form>
                                            <button onClick={() => setShowDownloadModal(false)} className="mt-3 w-full text-center text-xs text-text-muted">Cancel</button>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Ad Banner Section */}
                    <AdBanner />

                    {/* Stories Grid */}
                    <section>
                        <div className="text-center space-y-3 mb-10">
                            <span className="text-[11px] font-mono tracking-[0.25em] text-accent-gold uppercase block">📖 Memory Archive</span>
                            <h2 className="font-serif text-3xl md:text-4xl text-text-primary font-light">All Memories</h2>
                            <div className="h-px w-20 bg-accent-gold/30 mx-auto mt-4" />
                        </div>

                        <StoryFeed
                            stories={displayStories}
                            nextCursor={pagination?.next_cursor ?? null}
                            routeParams={{ slug: event.slug }}
                            filters={{
                                tabs: ['All', 'Photo Gallery', 'Cinema Hall', 'Whispering Voices', 'Manuscripts'],
                                activeTab,
                                onTabChange: setActiveTab,
                                tags: allTags.filter((t) => t !== 'guest-contribution'),
                                selectedTag,
                                onTagChange: setSelectedTag,
                                viewMode,
                                onViewModeChange: setViewMode,
                            }}
                            emptyLabel="No memories have been shared for this event yet."
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
                                        <>
                                            <div className="relative aspect-4/3 overflow-hidden group">
                                                <img
                                                    src={story.thumbnail || '/logo-stacked.png'}
                                                    alt={story.title}
                                                    loading="lazy"
                                                    onError={(e) => { e.currentTarget.src = '/logo-stacked.png'; }}
                                                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <div className="flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-accent-gold text-bg-dark shadow-2xl transition-transform duration-500 group-hover:scale-100">
                                                        <Play size={24} fill="currentColor" className="ml-1" />
                                                    </div>
                                                </div>
                                                <div className="absolute top-6 left-6 flex items-center gap-2">
                                                    <Badge className="border-white/10 flex bg-bg-dark/60 text-[10px] tracking-widest uppercase backdrop-blur-md">
                                                        <MediaTypeIcon type={story.type} /><span className="ml-1.5">{story.type}</span>
                                                    </Badge>
                                                    {story.tags?.includes('guest-contribution') && (
                                                        <Badge className="border-accent-gold/20 bg-accent-gold/10 text-[9px] text-accent-gold tracking-widest uppercase backdrop-blur-md">Guest</Badge>
                                                    )}
                                                </div>
                                                {/* Individual download button overlay */}
                                                {(story.file_url) && (
                                                    <a
                                                        href={story.file_url.replace(
                                                            "/image/upload/",
                                                            "/image/upload/fl_attachment/"
                                                        )}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="absolute bottom-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 opacity-0 transition-all hover:bg-white/20 group-hover:opacity-100 backdrop-blur-md"
                                                        title="Download this media"
                                                    >
                                                        <Download size={14} />
                                                    </a>
                                                )}
                                            </div>
                                            {/* <div className="flex grow flex-col justify-between gap-6 p-8">
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-bold text-text-primary transition-colors">{story.title}</h3>
                                                <p className="line-clamp-2 text-sm font-light text-text-muted italic">"{story.description}"</p>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-white/5 pt-6 text-[10px] font-bold tracking-[0.2em] text-text-muted uppercase">
                                                <div className="flex items-center gap-2"><UserIcon size={12} className="text-accent-gold" /> {story.author}</div>
                                                <div className="flex items-center gap-2"><Clock size={12} className="text-accent-gold" /> {story.date}</div>
                                            </div>
                                        </div> */}
                                        </>
                                    ) : (
                                        <>
                                            <div className="relative aspect-video w-48 shrink-0 overflow-hidden rounded-2xl">
                                                <img
                                                    src={story.thumbnail || '/logo-stacked.png'}
                                                    alt={story.title}
                                                    onError={(e) => { e.currentTarget.src = '/logo-stacked.png'; }}
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/20">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"><Play size={16} fill="white" className="ml-0.5" /></div>
                                                </div>
                                            </div>
                                            <div className="grow space-y-2">
                                                <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                    <Badge className="border-white/10 bg-white/5"><MediaTypeIcon type={story.type} /><span className="ml-1.5">{story.type}</span></Badge>
                                                    <span className="flex items-center gap-1"><Clock size={12} className="text-accent-gold" /> {story.date}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <h3 className="text-2xl font-bold text-text-primary transition-colors">{story.title}</h3>
                                                    {/* Individual download button */}
                                                    {story.file_url && (
                                                        <a
                                                            href={story.file_url}
                                                            download
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-text-muted hover:text-accent-gold hover:border-accent-gold/30 transition-all"
                                                            title="Download"
                                                        >
                                                            <Download size={14} />
                                                        </a>
                                                    )}
                                                </div>
                                                <p className="text-sm text-text-muted italic">"{story.description}"</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </StoryFeed>
                    </section>

                    <section className="mt-20 max-w-4xl mx-auto text-center">
                        <div className="space-y-2">
                            <div className="h-px bg-accent-gold/40 w-full" />
                            <div className="h-px bg-accent-gold/20 w-full" />
                        </div>
                        <p className="mt-8 text-xs text-text-muted font-light">Every memory shared here becomes part of a lasting legacy.</p>
                    </section>
                </main>

                {/* Media Viewer Modal */}
            </motion.div>
            {viewerOpen && (
                <>
                    {createPortal(<MediaViewerModal
                        stories={displayStories}
                        initialIndex={viewerIndex}
                        onClose={() => setViewerIndex(null)}
                    />, document.body)}
                </>
            )}
        </>
    );
}