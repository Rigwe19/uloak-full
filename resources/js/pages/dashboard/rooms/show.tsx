import { SiWhatsapp } from '@icons-pack/react-simple-icons';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Clock,
    Download,
    DownloadCloud,
    Film,
    Headphones,
    Heart,
    Loader,
    Mail,
    MessageCircle,
    Music,
    Phone,
    Play,
    Plus,
    Settings,
    Trash2,
    Upload,
    User as UserIcon,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CandleSVG from '@/components/candleSVG';
import type { Candle } from '@/components/candleThemes';
import { AnnexMemoryModal } from '@/components/dashboard/annex-memory-modal';
import { EditRoomModal } from '@/components/dashboard/edit-room-modal';
import { ShareQRCode } from '@/components/dashboard/share-qr-code';
import { AvatarGroup, Badge, Button } from '@/components/dashboard/ui';
import { VideoPlaylistPlayer } from '@/components/dashboard/video-playlist-player';
import StoryFeed from '@/components/feed/StoryFeed';
import Hero from '@/components/hero';
import { MediaViewerModal } from '@/components/media/MediaViewerModal';
import { ResponsiveModal } from '@/components/responsive-modal';
import {
    ApprovedTributesSection,
    PendingTributesSection,
    SubmittedTributesSection,
} from "@/components/tribute-sections";
import { dashboard } from '@/routes';
import { approve } from '@/routes/dashboard/candles';
import roomsRoutes from '@/routes/dashboard/rooms';
import tributeRoutes from '@/routes/dashboard/tributes';
import type { FeedStory } from '@/types/feed';


interface RoomShowProps {
    room: {
        id: string;
        slug: string;
        name: string;
        description: string;
        thumbnail: string;
        stories_count: number;
        tributes_count: number;
        members: any[];
        enable_tributes: boolean;
        enable_condolence_attendance: boolean;
        enable_candle_lighting: boolean;
        room_type: string | null;
    };
    stories: FeedStory[];
    pagination?: {
        next_cursor: string | null;
        path: string;
        per_page: number;
    };
    pendingTributes: TributeDB[];
    approvedTributes: TributeDB[];
    allTributes: TributeDB[];
    candles: Candle[];
}

interface TributeDB {
    id: number;
    name: string;
    relationship: string | null;
    message: string;
    quote: string | null;
    images: string[] | null;
    video: string | null;
    is_approved: boolean;
    relation?: string | null;
    created_at: string;
}

interface CondolenceSignature {
    name: string;
    signature: string;
    createdAt: string;
}

export default function RoomShow({ room, candles, stories: initialStories = [], pagination, pendingTributes: initialPending = [], approvedTributes: initialApproved = [], allTributes: tributes }: RoomShowProps) {
    const [allStories, setAllStories] = useState<FeedStory[]>(initialStories);
    const [pendingTributes, setPendingTributes] = useState<TributeDB[]>(initialPending);
    const [approvedTributes, setApprovedTributes] = useState<TributeDB[]>(initialApproved);
    const [activeTab, setActiveTab] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const viewerOpen = viewerIndex !== null;

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

    const [isAnnexModalOpen, setIsAnnexModalOpen] = useState(false);
    const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);

    // Tribute state
    const tributeFormRef = useRef<HTMLDivElement>(null);

    // Condolence state
    const [condolenceSignatures, setCondolenceSignatures] = useState<CondolenceSignature[]>([]);
    const [showCondolenceForm, setShowCondolenceForm] = useState(false);

    // Optional Service modal
    const [showOptionalService, setShowOptionalService] = useState(false);

    // Download All modal state
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Delete confirmation state
    const [storyToDelete, setStoryToDelete] = useState<any | null>(null);

    const canModify = true;

    const handleDownloadRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/downloads/request', {
            email,
            type: 'room',
            slug: room.slug,
        }, {
            onSuccess: () => setShowDownloadModal(false),
            onFinish: () => setSubmitting(false),
        });
    };

    // ── Story Delete handler ──
    const handleDeleteStory = useCallback((story: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setStoryToDelete(story);
    }, []);
    const [deleting, setDeleting] = useState(false);

    const confirmDeleteStory = useCallback(() => {
        if (!storyToDelete) {
            return;
        }

        setDeleting(true);
        router.delete(`/dashboard/stories/${storyToDelete.uuid}`, {
            preserveScroll: true,
            onSuccess: () => {
                setStoryToDelete(null);
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
            },
            onFinish: () => setDeleting(false)
        });
    }, [storyToDelete]);

    // ── Tribute Approval handlers ──

    const handleApproveTribute = useCallback((tribute: TributeDB) => {
        router.patch(tributeRoutes.approve(tribute.id).url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setPendingTributes(prev => prev.filter(t => t.id !== tribute.id));
                setApprovedTributes(prev => [{ ...tribute, is_approved: true }, ...prev]);
            },
        });
    }, []);

    const handleDeleteTribute = useCallback((tribute: TributeDB) => {
        router.delete(tributeRoutes.destroy(tribute.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setPendingTributes(prev => prev.filter(t => t.id !== tribute.id));
                setApprovedTributes(prev => prev.filter(t => t.id !== tribute.id));
            },
        });
    }, []);

    // ── Filters ──

    // ── Candle Approval handler ──
    const handleApproveCandle = (candleId: number) => {
        router.patch(approve(candleId).url, {}, {
            preserveScroll: true,
        });
    };
    // Derive Cloudinary thumbnail URL by adding transformation params
    function getThumbnailUrl(url: string | null): string | null {
        if (!url) {
            return null;
        }

        return url;
    }

    const getStoryThumbnail = (story: FeedStory) => {
        if (story.type === 'video' && story.thumbnail) {
            return story.thumbnail;
        }

        if (story.type === 'photo') {
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-screen bg-bg-dark"
        >
            <Head title={room.name} />

            {/* Atmosphere background */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="atmosphere absolute inset-0 opacity-30" />
                <motion.img
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.1 }}
                    transition={{ duration: 2 }}
                    src={room.thumbnail}
                    className="h-full w-full object-cover blur-[100px]"
                />
            </div>

            <main className="relative z-10 mx-auto max-w-7xl p-5 pb-32 md:p-8 lg:p-16">
                <header className="mb-16">
                    <div className="mb-12 flex items-center justify-between">
                        <Link
                            href={dashboard().url}
                            className="group inline-flex items-center gap-2 md:text-text-muted transition-colors border border-red-600/20 text-red-600/70 p-3 rounded-full md:border-none md:rounded-none hover:text-text-primary"
                        >
                            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                            <span className="text-sm font-bold tracking-widest uppercase hidden md:block">House</span>
                        </Link>
                        <div className="flex gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <ShareQRCode roomSlug={room.slug} roomName={room.name} />
                                <Button icon={Settings} variant="outline" onClick={() => setIsEditRoomModalOpen(true)} className="hidden md:inline-flex">
                                    Edit Room
                                </Button>
                                <Button variant='outline' onClick={() => setIsEditRoomModalOpen(true)} className="flex md:hidden items-center md:gap-2 px-3! rounded-full border-accent-gold/20 hover:border-accent-gold/40">
                                    <Settings size={18} />
                                </Button>
                                {!room.enable_tributes && (
                                    <>
                                        <Button icon={Upload} onClick={() => setIsAnnexModalOpen(true)} className="hidden md:inline-flex shadow-[0_20px_40px_rgba(198,161,91,0.15)]">
                                            Add Memory
                                        </Button>
                                        <Button variant='outline' onClick={() => setIsAnnexModalOpen(true)} className="flex md:hidden items-center md:gap-2 px-3! rounded-full border-accent-gold/20 hover:border-accent-gold/40">
                                            <Plus size={18} />
                                        </Button>
                                    </>
                                )}
                                <a
                                    href={`/rooms/${room.slug}/download-media`}
                                    download
                                    className="hidden md:inline-flex items-center gap-2 rounded-xl border border-accent-gold/20 hover:border-accent-gold/40 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-accent-gold transition-all"
                                >
                                    <Download size={14} />
                                    Download Media
                                </a>
                                <a
                                    href={`/rooms/${room.slug}/download-media`}
                                    download
                                    title="Download all tribute media"
                                >
                                    <Button variant='outline' className="flex items-center md:gap-2 px-3! rounded-full border-accent-gold/20 hover:border-accent-gold/40">
                                        <Download size={16} />
                                    </Button>

                                </a>
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
                                <div className="flex items-center gap-4">
                                    <AvatarGroup
                                        users={room.members.map((u) => ({ avatar: u.avatar_url, name: u.name }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-12 md:flex-row md:items-end">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Badge>{room.stories_count || room.tributes_count || 0} Memories</Badge>
                                <div className="h-px w-12 bg-accent-gold/30" />
                                <span className="text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase">A Shared Heritage</span>
                            </div>
                            <h1 className="text-4xl leading-none font-bold tracking-tight text-text-primary md:text-7xl">{room.name}</h1>
                            <p className="max-w-2xl text-lg leading-relaxed font-light text-text-muted">{room.description}</p>
                        </div>
                        {/* <div className="flex flex-wrap items-center gap-4">
                            <ShareQRCode roomSlug={room.slug} roomName={room.name} />
                            <Button icon={Settings} variant="outline" onClick={() => setIsEditRoomModalOpen(true)}>
                                Edit Room
                            </Button>
                            <Button icon={Upload} onClick={() => setIsAnnexModalOpen(true)} className="shadow-[0_20px_40px_rgba(198,161,91,0.15)]">
                                Annex Memory
                            </Button>
                        </div> */}
                    </div>
                </header>

                <section className="mb-16">
                    <Hero />
                    {!room.enable_tributes && <VideoPlaylistPlayer stories={allStories} />}
                </section>

                {/* ════════════════════════════════════════ */}
                {/*  TRIBUTE SECTION                        */}
                {/* ════════════════════════════════════════ */}


                <div className="mb-16 flex justify-center">
                    <button
                        onClick={() => setShowOptionalService(true)}
                        className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-accent-gold text-bg-dark text-sm font-bold tracking-wider uppercase transition-all hover:bg-accent-gold/90"
                    >
                        Request Story Editing Support
                    </button>
                </div>

                <ResponsiveModal
                    isOpen={showOptionalService}
                    onClose={() => setShowOptionalService(false)}
                    title="Optional Service"
                    desktopMaxWidth="max-w-2xl"
                >
                    <div className="relative p-8 md:p-10">
                        <button
                            onClick={() => setShowOptionalService(false)}
                            className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary"
                        >
                            <X size={24} />
                        </button>

                        <div className="space-y-6">
                            <span className="text-[10px] font-mono tracking-[0.25em] text-accent-gold uppercase block">
                                Optional Service
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                                Professional Memory Editing & Legacy Support
                            </h2>
                            <p className="text-sm leading-relaxed text-text-muted">
                                Families can request our professional support to organise, restore,
                                enhance, and edit photos, videos, tributes, stories, and other memories
                                uploaded into the room.
                            </p>
                            <p className="text-sm leading-relaxed text-text-muted">
                                This can be done after the event, or at any time when past family media,
                                random memories, or legacy content have been added.
                            </p>
                            <p className="text-sm leading-relaxed text-text-muted">
                                Our team can help turn your uploads into polished slideshows, tribute videos,
                                memory edits, story collections, or fuller family legacy pieces, prepared
                                with care, dignity, and clarity.
                            </p>
                            <p className="text-sm leading-relaxed text-text-muted">
                                To request this service for your room, please contact our team directly.
                                We will review your content and guide you on the best way to present it.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <a
                                    href="https://wa.me/447830129816"
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
                                >
                                    <SiWhatsapp size={18} />
                                    WhatsApp
                                </a>
                                <a
                                    href="tel:+447830129816"
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-text-primary hover:border-accent-gold/40 text-sm font-medium transition"
                                >
                                    <Phone size={16} />
                                    Call
                                </a>
                                <a
                                    href="mailto:hello@ulo of storiesstories.com"
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-text-primary hover:border-accent-gold/40 text-sm font-medium transition"
                                >
                                    <Mail size={16} />
                                    Email
                                </a>
                            </div>
                        </div>
                    </div>
                </ResponsiveModal>
                {room.enable_tributes && (
                    <section
                        id="share-tribute"
                        ref={tributeFormRef}
                        className="relative py-20 md:py-24 bg-surface/10 border-t border-b border-white/5 mb-16 scroll-mt-20"
                    >
                        <div className="max-w-3xl mx-auto px-6">
                            <div className="text-center space-y-3 mb-12">
                                <span className="text-[11px] font-mono tracking-[0.25em] text-accent-gold uppercase block">Contribution Form</span>
                                <h2 className="font-serif text-3xl md:text-4xl text-text-primary font-light">Share Your Tribute</h2>
                                <div className="h-px w-20 bg-accent-gold/30 mx-auto mt-4" />
                                <p className="text-sm text-text-muted max-w-lg mx-auto pt-3 leading-relaxed">
                                    Please use the form below to submit your tribute. You may share a written message,
                                    upload a short video tribute, upload pictures, or write down a memorable phrase.
                                </p>
                            </div>



                            {/* Pending tributes (approve/delete) */}
                            {room.room_type !== 'birthday' && <>
                                <PendingTributesSection
                                    pendingTributes={pendingTributes}
                                    onApprove={handleApproveTribute}
                                    onDelete={handleDeleteTribute}
                                />
                                <ApprovedTributesSection
                                    approvedTributes={approvedTributes}
                                    onDelete={handleDeleteTribute}
                                    context={{ room_type: room.room_type ?? '' }}
                                />
                            </>}
                            {room.room_type === 'birthday' && <SubmittedTributesSection tributes={tributes} />}
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════ */}
                {/*  CONDOLENCE ATTENDANCE SECTION           */}
                {/* ════════════════════════════════════════ */}
                {room.enable_condolence_attendance && (
                    <section className="mb-16">
                        <div className="max-w-3xl mx-auto px-6">
                            <div className="mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <BookOpen size={20} className="text-accent-gold" />
                                    <h2 className="text-2xl font-bold text-text-primary">Condolence Attendance</h2>
                                </div>
                                {!showCondolenceForm && (
                                    <Button variant="outline" icon={MessageCircle} onClick={() => setShowCondolenceForm(true)}>
                                        Sign Attendance
                                    </Button>
                                )}
                            </div>

                            {condolenceSignatures.length === 0 ? (
                                <p className="text-sm text-text-muted italic">No signatures yet. Be the first to sign.</p>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {condolenceSignatures.map((sig, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="rounded-2xl border border-white/5 bg-surface/20 p-5"
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-text-primary">{sig.name}</span>
                                                <span className="text-[10px] text-text-muted">{sig.createdAt}</span>
                                            </div>
                                            <p className="text-sm leading-relaxed text-text-muted italic">"{sig.signature}"</p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════ */}
                {/*  CANDLE LIGHTING SECTION                 */}
                {/* ════════════════════════════════════════ */}
                {room.enable_candle_lighting && (
                    <section className="mb-16">
                        <div className="bg-surface border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 blur-[100px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-gold/5 blur-[100px] rounded-full pointer-events-none" />

                            <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-8">
                                {/* Right: Candle Board */}
                                <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-5 md:p-6">
                                    <span className="text-[9px] font-mono tracking-[0.2em] text-text-muted uppercase font-semibold block mb-4 border-b border-white/5 pb-2">
                                        Vigil Board — Lighted by Loved Ones
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-1">
                                        <AnimatePresence>
                                            {candles.length === 0 ? (
                                                <div className="col-span-full flex flex-col items-center justify-center py-10 text-text-muted">
                                                    <Heart size={40} className="text-accent-gold/30 mb-3" />
                                                    <p className="text-sm italic">No candles lit yet. Be the first.</p>
                                                </div>
                                            ) : (
                                                candles.map((candle, idx) => (
                                                    <motion.div key={candle.id}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="flex flex-col items-center p-3 relative rounded-xl bg-white/[0.02] border border-white/[0.04] text-center group">
                                                        <div className="absolute top-2 right-2">
                                                            {candle.is_approved ? (
                                                                <span className="px-2 py-0.5 text-[9px] rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                                                    Approved
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 text-[9px] rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                        <CandleSVG candle={candle} delay={idx * 0.3} />

                                                        <span className="text-[11px] font-medium text-text-primary block truncate w-full">{candle.name}</span>
                                                        <span className="text-[8.5px] italic text-text-muted block truncate w-full">{candle.message || 'A silent prayer'}</span>
                                                        {!candle.is_approved && (
                                                            <button
                                                                onClick={() => handleApproveCandle(candle.id)}
                                                                className="mt-2 px-3 py-1 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════ */}
                {/*  STORIES SECTION                         */}
                {/* ════════════════════════════════════════ */}
                {!room.enable_tributes && (
                    <StoryFeed
                        stories={allStories}
                        nextCursor={pagination?.next_cursor ?? null}
                        urlBuilder={(...args) => roomsRoutes.show.url(args[0] as any, args[1] as any)}
                        routeParams={{ slug: room.slug }}
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
                        addCard={canModify ? (
                            <div onClick={() => setIsAnnexModalOpen(true)}
                                className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl md:rounded-4xl border-2 border-dashed border-white/10 bg-surface/20 transition-all hover:border-accent-gold/40 hover:bg-surface/40 ${viewMode === 'grid' ? 'h-100 gap-4' : 'h-20 md:h-32 flex-row gap-6'}`}>
                                <div className="flex h-12 md:h-16 aspect-square items-center justify-center rounded-full border border-white/5 bg-bg-dark text-text-muted transition-all group-hover:scale-110 group-hover:text-accent-gold">
                                    <Plus className='size-6 md:size-8' />
                                </div>
                                <span className="text-xs font-bold tracking-[0.3em] text-text-primary uppercase transition-colors group-hover:text-accent-gold">Add Memory</span>
                            </div>
                        ) : undefined}
                    >
                        {(story) => (
                            <div
                                onClick={() => setViewerIndex(displayStories.findIndex((s) => s.id === story.id))}
                                className="group block h-full cursor-pointer"
                            >
                                    {viewMode === 'grid' ? (
                                        <div className="surface-glow flex h-full flex-col overflow-hidden rounded-[32px] border border-white/5 bg-surface/40 transition-all duration-500 hover:border-accent-gold/20">
                                            {story.type === 'audio' ? (
                                                <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-amber-900/60 via-purple-900/40 to-bg-dark">
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Music className="text-accent-gold/20" size={80} strokeWidth={1} />
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-8">
                                                        {Array.from({ length: 24 }).map((_, j) => (
                                                            <motion.div
                                                                key={j}
                                                                className="w-[3px] rounded-full bg-accent-gold/60"
                                                                animate={{
                                                                    height: [8 + Math.random() * 40, 8 + Math.random() * 40, 8 + Math.random() * 40],
                                                                }}
                                                                transition={{
                                                                    duration: 0.8 + Math.random() * 0.6,
                                                                    repeat: Infinity,
                                                                    ease: 'easeInOut',
                                                                    delay: Math.random() * 0.4,
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold text-bg-dark shadow-2xl shadow-accent-gold/30">
                                                            <Headphones size={24} fill="currentColor" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-4 left-4">
                                                        <Badge className="border-amber-500/20 bg-amber-500/15 text-amber-300 text-[10px] tracking-widest uppercase backdrop-blur-md">
                                                            <Music size={10} className="mr-1 inline" /> Audio
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ) : story.type === 'video' ? (
                                                <div className="relative aspect-4/3 overflow-hidden">
                                                    <img 
                                                src={getStoryThumbnail(story)} alt={story.title}
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/logo-stacked.png';
                                                        }}
                                                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-bg-dark/60 to-transparent" />
                                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-bg-dark/60 to-transparent" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-bg-dark/20">
                                                        <div className="flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-accent-gold text-bg-dark shadow-2xl shadow-accent-gold/30 transition-transform duration-500 group-hover:scale-100">
                                                            <Play size={24} fill="currentColor" className="ml-1" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-4 left-4">
                                                        <Badge className="border-white/10 bg-bg-dark/60 text-[10px] tracking-widest uppercase backdrop-blur-md">
                                                            <Film size={10} className="mr-1 inline" /> Video
                                                        </Badge>
                                                    </div>
                                                    <div className="absolute top-4 right-4">
                                                        <Badge className="border-white/10 bg-bg-dark/60 px-3 py-1 text-[9px] font-bold tracking-wider text-text-muted uppercase backdrop-blur-md">HD</Badge>
                                                    </div>
                                                </div>
                                            ) : story.type === 'photo' ? (
                                                <div className="relative aspect-4/3 overflow-hidden">
                                                    <img src={getStoryThumbnail(story)} alt={story.title}
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/logo-stacked.png';
                                                        }}
                                                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-bg-dark/20">
                                                        <div className="flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-accent-gold text-bg-dark shadow-2xl shadow-accent-gold/30 transition-transform duration-500 group-hover:scale-100">
                                                            <Play size={24} fill="currentColor" className="ml-1" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-4 left-4">
                                                        <Badge className="border-white/10 bg-bg-dark/60 text-[10px] tracking-widest uppercase backdrop-blur-md">{story.type}</Badge>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative aspect-4/3 overflow-hidden">
                                                    <img src={getStoryThumbnail(story)} alt={story.title}
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/logo-stacked.png';
                                                        }}
                                                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-bg-dark/20" />
                                                    <div className="absolute top-4 left-4">
                                                        <Badge className="border-white/10 bg-bg-dark/60 text-[10px] tracking-widest uppercase backdrop-blur-md">{story.type}</Badge>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex grow flex-col justify-between gap-6 p-8">
                                                <div className="space-y-3">
                                                    <h3 className="text-xl font-bold text-text-primary transition-colors group-hover:text-accent-gold">{story.title}</h3>
                                                    <p className="line-clamp-2 text-sm font-light text-text-muted italic">"{story.description}"</p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-white/5 pt-6 text-[10px] font-bold tracking-[0.2em] text-text-muted uppercase">
                                                    <div className="flex items-center gap-2">
                                                        <UserIcon size={12} className="text-accent-gold" /> {story.author}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={(e) => handleDeleteStory(story, e)}
                                                            className="text-text-muted hover:text-red-400 transition-colors p-1" title="Delete story">
                                                            <Trash2 size={12} />
                                                        </button>
                                                        <Clock size={12} className="text-accent-gold" /> {story.date}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="surface-glow flex items-center gap-2 md:gap-8 rounded-3xl border border-white/5 bg-surface/40 p-2 md:p-6 transition-all hover:border-accent-gold/20">
                                            <div className="relative md:aspect-video md:w-48 aspect-square shrink-0 overflow-hidden rounded-2xl">
                                                {story.type === 'audio' ? (
                                                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-amber-900/60 via-purple-900/40 to-bg-dark p-4">
                                                        <div className="flex items-end gap-[2px] h-12">
                                                            {Array.from({ length: 16 }).map((_, j) => (
                                                                <motion.div key={j} className="w-[3px] rounded-full bg-accent-gold/60"
                                                                    animate={{ height: [6 + Math.random() * 28, 6 + Math.random() * 28, 6 + Math.random() * 28] }}
                                                                    transition={{ duration: 0.8 + Math.random() * 0.6, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 0.4 }} />
                                                            ))}
                                                        </div>
                                                        <div className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold/20 backdrop-blur-md">
                                                            <Headphones size={16} className="text-accent-gold" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <img src={story.thumbnail || '/logo-stacked.png'} alt={story.title}
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/logo-stacked.png';
                                                            }}
                                                            className="md:h-full h-18 md:w-full aspect-square object-cover" />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-bg-dark/20">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold/80 text-bg-dark shadow-lg backdrop-blur-md">
                                                                <Play size={16} fill="currentColor" className="ml-0.5" />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="grow space-y-0.5 md:space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 md:gap-4 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                        <Badge className="border-white/10 bg-white/5">{story.type === 'audio' ? <><Music size={10} className="mr-1 inline" /> Audio</> : story.type === 'video' ? <><Film size={10} className="mr-1 inline" /> Video</> : story.type}</Badge>
                                                        <span className="flex items-center gap-1"><Clock size={12} className="text-accent-gold" /> {story.date}</span>
                                                    </div>
                                                    <button type="button" onClick={(e) => handleDeleteStory(story, e)}
                                                        className="md:text-text-muted hover:text-red-400 p-1.5 border border-accent-gold/20 text-red-400 transition-colors rounded-full" title="Delete story">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                <h3 className="text-lg md:text-2xl font-bold text-text-primary transition-colors group-hover:text-accent-gold">{story.title}</h3>
                                                <p className="text-xs md:text-sm text-text-muted italic truncate">"{story.description}"</p>
                                                <div className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] text-text-muted uppercase flex items-center gap-2">
                                                    <UserIcon size={12} className="text-accent-gold" /> {story.author}
                                                </div>
</div>
                                </div>
                            )}
                                </div>
                        )}
                    </StoryFeed>
                )}
            </main>

            {/* Annex Memory Modal */}
            {createPortal(<AnnexMemoryModal isOpen={isAnnexModalOpen} onClose={() => setIsAnnexModalOpen(false)} room={room as any} />, document.body)}

            {/* Edit Room Modal */}
            <EditRoomModal
                isOpen={isEditRoomModalOpen}
                room={room as any}
                onClose={() => setIsEditRoomModalOpen(false)}
            />

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

            {/* Delete Confirmation Modal */}
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
                                    <p className="text-sm text-text-muted mt-1">This action cannot be undone. The memory and all its comments will be permanently deleted.</p>
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
                                    {deleting && <Loader size={14} className='animate-spin' />}
                                    {deleting ? 'Deleting' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>, document.body)}
        </motion.div>
    );
}
