import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Upload,
    Clock,
    Play,
    Plus,
    Calendar,
    Download,
    X,
    Trash2,
    Loader,
    DownloadCloud,
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnnexEventMemoryModal } from '@/components/dashboard/annex-event-memory-modal';
import { ShareQRCode } from '@/components/dashboard/share-qr-code';
import { Button, Badge } from '@/components/dashboard/ui';
import { VideoPlaylistPlayer } from '@/components/dashboard/video-playlist-player';
import StoryFeed from '@/components/feed/StoryFeed';
import { MediaViewerModal } from '@/components/media/MediaViewerModal';
import { dashboard } from '@/routes';
import eventsRoutes from '@/routes/dashboard/events';
import type { FeedStory } from '@/types/feed';

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

    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Delete story state
    const [storyToDelete, setStoryToDelete] = useState<any | null>(null);
    const [deletingStory, setDeletingStory] = useState(false);

    // Delete event state
    const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState(false);
    const [deletingEvent, setDeletingEvent] = useState(false);

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
        if (!url) {
            return null;
        }

        return url;
    }

    const getStoryThumbnail = (story: FeedStory) => {
        if(story.type === 'video' && story.thumbnail) {
            return story.thumbnail;
        }
        if(story.type === 'photo'){
            return story.thumbnail || story.file_url || '/logo-stacked.png';
        }

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

    // ── Story Delete handler ──
    const handleDeleteStory = useCallback((story: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setStoryToDelete(story);
    }, []);

    const confirmDeleteStory = useCallback(() => {
        if (!storyToDelete) {
            return;
        }

        setDeletingStory(true);
        router.delete(`/dashboard/stories/${storyToDelete.uuid}`, {
            preserveScroll: true,
            onSuccess: () => {
                setStoryToDelete(null);
                setAllStories((prev) => prev.filter((s) => s.id !== storyToDelete.id && s.uuid !== storyToDelete.uuid));
            },
            onFinish: () => setDeletingStory(false),
        });
    }, [storyToDelete]);

    // ── Event Delete handler ──
    const handleDeleteEvent = useCallback(() => {
        setDeletingEvent(true);
        router.delete(`/dashboard/events/${event.slug}`, {
            onSuccess: () => {
                // Redirect to dashboard after deletion
                window.location.href = '/dashboard';
            },
            onFinish: () => setDeletingEvent(false),
        });
    }, [event.slug]);

    const handleDownloadRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/downloads/request', {
            email,
            type: 'event',
            slug: event.slug,
        }, {
            onSuccess: () => setShowDownloadModal(false),
            onFinish: () => setSubmitting(false),
        });
    };

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

                                <button
                                    onClick={() => setShowDownloadModal(true)}
                                    className="hidden md:inline-flex items-center gap-2 rounded-xl border border-accent-gold/20 hover:border-accent-gold/40 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-accent-gold transition-all"
                                >
                                    <DownloadCloud size={14} />
                                    Download All
                                </button>
                                <button
                                    onClick={() => setShowDownloadModal(true)}
                                    className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-accent-gold/20 text-accent-gold hover:border-accent-gold/40 transition-all"
                                    title="Download all media"
                                >
                                    <DownloadCloud size={16} />
                                </button>

                                {/* Email download modal */}
                                {showDownloadModal && (
                                    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4">
                                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface p-6">
                                            <h3 className="text-lg font-bold text-text-primary">Download All Media</h3>
                                            <p className="mt-1 text-sm text-text-muted">Enter your email and we'll send you a download link.</p>
                                            <form onSubmit={handleDownloadRequest} className="mt-4 space-y-3">
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
                                            <button type="button" onClick={() => setShowDownloadModal(false)} className="mt-3 w-full text-center text-xs text-text-muted">Cancel</button>
                                        </motion.div>
                                    </div>
                                )}

                                {/* Delete Event Button */}
                                <button
                                    onClick={() => setShowDeleteEventConfirm(true)}
                                    className="hidden md:inline-flex items-center gap-2 rounded-xl border border-red-500/20 hover:border-red-500/40 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-red-400 transition-all"
                                >
                                    <Trash2 size={14} />
                                    Delete Project
                                </button>
                                <button
                                    onClick={() => setShowDeleteEventConfirm(true)}
                                    className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 text-red-400 hover:border-red-500/40 transition-all"
                                    title="Delete project"
                                >
                                    <Trash2 size={16} />
                                </button>

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
                                className={`group flex cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-white/10 bg-surface/20 transition-all hover:border-accent-gold/40 hover:bg-surface/40 ${viewMode === 'grid' ? 'aspect-4/3' : 'h-32 flex-row gap-6'}`}>
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
                                    <div className="surface-glow flex h-full aspect-4/3 flex-col overflow-hidden rounded-[32px] border border-white/5 bg-surface/40 transition-all duration-500 hover:border-accent-gold/20">
                                        <div className="relative aspect-4/3 overflow-hidden group">
                                            <img
                                                src={getStoryThumbnail(story)}
                                                alt={story.title}
                                                // onError={(e) => {
                                                //     e.currentTarget.src = '/logo-stacked.png';
                                                // }}
                                                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <div className="flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-accent-gold text-bg-dark shadow-2xl transition-transform duration-500 group-hover:scale-100">
                                                    <Play size={24} fill="currentColor" className="ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute top-6 left-6">
                                                <Badge className="border-white/10 bg-bg-dark/60 text-[10px] tracking-widest uppercase backdrop-blur-md">
                                                    {story.type}
                                                </Badge>
                                            </div>
                                            {/* Delete button overlay */}
                                            <button
                                                onClick={(e) => handleDeleteStory(story, e)}
                                                className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400 opacity-0 transition-all hover:bg-red-500/40 group-hover:opacity-100 backdrop-blur-md"
                                                title="Delete this memory"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            {/* Download button overlay */}
                                            {(story.file_url) && (
                                                <a
                                                    href={story.file_url}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="absolute bottom-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 opacity-0 transition-all hover:bg-white/20 group-hover:opacity-100 backdrop-blur-md"
                                                    title="Download this media"
                                                >
                                                    <Download size={14} />
                                                </a>
                                            )}
                                        </div>
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
                                                <span className="flex items-center gap-1 w-fit">
                                                    <Clock
                                                        size={12}
                                                        className="text-accent-gold"
                                                    />{' '}
                                                    {story.date}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {/* Download button */}
                                                    {story.file_url && (
                                                        <a
                                                            href={story.file_url}
                                                            download
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-text-muted hover:text-accent-gold hover:border-accent-gold/30 transition-all"
                                                            title="Download"
                                                        >
                                                            <Download size={14} />
                                                        </a>
                                                    )}
                                                    {/* Delete button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDeleteStory(story, e)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
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

            {/* Delete Story Confirmation Modal */}
            {createPortal(<AnimatePresence>
                {storyToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-150 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                        onClick={() => setStoryToDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-sm bg-surface border border-white/10 rounded-3xl p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center space-y-4">
                                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                                    <Trash2 size={24} className="text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary">Delete Memory?</h3>
                                    <p className="text-sm text-text-muted mt-1">This action cannot be undone. The memory and all its associated media will be permanently deleted from Cloudinary too.</p>
                                </div>
                                {storyToDelete && (
                                    <p className="text-xs text-text-muted italic bg-bg-dark/40 rounded-xl px-3 py-2 border border-white/5">"{storyToDelete.title}"</p>
                                )}
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setStoryToDelete(null)}
                                    className="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary border border-white/10 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteStory}
                                    className="flex-1 flex gap-2 justify-center items-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all"
                                >
                                    {deletingStory && <Loader size={14} className='animate-spin' />}
                                    {deletingStory ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>, document.body)}

            {/* Delete Event Confirmation Modal */}
            {createPortal(<AnimatePresence>
                {showDeleteEventConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-150 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                        onClick={() => setShowDeleteEventConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-surface border border-white/10 rounded-3xl p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center space-y-4">
                                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                                    <Trash2 size={24} className="text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary">Delete Project?</h3>
                                    <p className="text-sm text-text-muted mt-2">
                                        This will permanently delete the entire project <strong>"{event.name}"</strong> and <strong>all</strong> of its memories, comments, and media files — including those stored on Cloudinary. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowDeleteEventConfirm(false)}
                                    className="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary border border-white/10 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteEvent}
                                    className="flex-1 flex gap-2 justify-center items-center px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all"
                                >
                                    {deletingEvent && <Loader size={14} className='animate-spin' />}
                                    {deletingEvent ? 'Deleting...' : 'Delete Project'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>, document.body)}
        </motion.div>
    );
}