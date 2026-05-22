import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge, AvatarGroup } from '@/components/dashboard/ui';
import { RoomCard } from '@/components/dashboard/room-card';
import { AnnexMemoryModal } from '@/components/dashboard/annex-memory-modal';
import { store as storeRoom } from '@/routes/dashboard/rooms';
import { store as storeEvent } from '@/routes/dashboard/events';
import {
    Plus,
    Camera,
    Video,
    MessageSquare,
    Files,
    Share2,
    X,
    Search,
    Calendar,
    Lock,
    Globe,
} from 'lucide-react';
import { Portal } from '@/components/portal';

interface DashboardProps {
    dashboardData: {
        rooms: any[];
        recentStories: any[];
        stats: {
            name: string;
            icon: string;
            count: number;
        }[];
        notifications: any[];
    };
    auth: {
        user: any;
    };
}

export default function Dashboard({ dashboardData, auth }: DashboardProps) {
    const { rooms, stats, recentStories, notifications } = dashboardData;
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isNewStoryOpen, setIsNewStoryOpen] = useState(false);
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
    const [createMode, setCreateMode] = useState<'room' | 'event'>('room');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        privacy: 'public',
        thumbnail: null as File | null,
        event_date: '',
    });

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!isCreateRoomOpen) return;

        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = original;
        };
    }, [isCreateRoomOpen]);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('thumbnail', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        const url = createMode === 'room' ? storeRoom().url : storeEvent().url;

        post(url, {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateRoomOpen(false);
                setThumbnailPreview(null);
                reset();
                setCreateMode('room');
            },
        });
    };

    const categories = useMemo(() => [
        { name: 'Photos', icon: Camera, count: stats.find(s => s.name === 'Photos')?.count || 0 },
        { name: 'Videos', icon: Video, count: stats.find(s => s.name === 'Videos')?.count || 0 },
        { name: 'Voices', icon: MessageSquare, count: stats.find(s => s.name === 'Audio')?.count || 0 },
        { name: 'Members', icon: Share2, count: stats.find(s => s.name === 'Family Members')?.count || 0 },
        { name: 'Documents', icon: Files, count: stats.find(s => s.name === 'Documents')?.count || 0 },
    ], [stats]);

    const filteredRooms = useMemo(() => {
        const query = searchQuery.toLowerCase();

        return rooms.filter((room) => {
            const matchesSearch =
                !searchQuery ||
                room.name.toLowerCase().includes(query) ||
                (room.description || '').toLowerCase().includes(query);

            const matchesCategory =
                !activeCategory ||
                (activeCategory === 'Photos' && (room.photos_count > 0)) ||
                (activeCategory === 'Videos' && (room.videos_count > 0)) ||
                (activeCategory === 'Voices' && (room.audios_count > 0)) ||
                (activeCategory === 'Documents' && (room.documents_count > 0)) ||
                (activeCategory === 'Members' && (room.members?.length > 0));

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory, rooms]);

    return (
        <div className="mx-auto max-w-7xl p-5 pb-32 md:p-8 md:pb-8 lg:p-16">
            <Head title="Dashboard" />

            {/* Dashboard Header */}
            <header className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-semibold tracking-widest text-accent-gold uppercase md:text-xs">
                        The {auth.user.name}'s Homestead
                    </span>
                    <h1 className="text-3xl leading-tight font-bold tracking-tight text-text-primary md:text-5xl">
                        Legacy. Love.
                        <br className="md:hidden" /> Together.
                    </h1>
                </div>
                <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
                    <div className="hidden items-center gap-2 lg:flex">
                        <AvatarGroup users={[{ name: auth.user.name, avatar: auth.user.avatar }]} />
                        <div className="mx-2 h-8 w-px bg-border-subtle" />
                    </div>
                    <div className="group relative grow">
                        <Search
                            className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search rooms or memories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-border-subtle bg-surface py-3 pr-10 pl-12 text-sm text-text-primary shadow-inner transition-all focus:border-accent-gold/50 focus:outline-none md:w-64 xl:w-80"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <Button
                        variant="primary"
                        icon={Plus}
                        className="py-4 text-sm md:py-3"
                        onClick={() => setIsNewStoryOpen(true)}
                    >
                        New Story
                    </Button>
                </div>
            </header>

            {/* Categories Grid */}
            <section className="mb-16 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mb-20 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
                {categories.map((cat) => (
                    <motion.div
                        key={cat.name}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                            setActiveCategory(
                                activeCategory === cat.name
                                    ? null
                                    : cat.name,
                            )
                        }
                        className={`group cursor-pointer rounded-2xl border p-4 transition-all md:p-6 ${activeCategory === cat.name ? 'border-accent-gold bg-accent-gold shadow-lg shadow-accent-gold/20' : 'border-border-subtle bg-surface hover:border-accent-gold/40'}`}
                    >
                        <cat.icon
                            className={`mb-3 transition-colors md:mb-4 ${activeCategory === cat.name ? 'text-bg-dark' : 'text-text-muted group-hover:text-accent-gold'}`}
                            size={20}
                        />
                        <div className="flex items-end justify-between">
                            <span
                                className={`text-xs font-semibold tracking-wide md:text-sm ${activeCategory === cat.name ? 'text-bg-dark' : 'text-text-primary'}`}
                            >
                                {cat.name}
                            </span>
                            <span
                                className={`text-[10px] md:text-xs ${activeCategory === cat.name ? 'text-bg-dark/70' : 'text-text-muted'}`}
                            >
                                {cat.count}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* Room Grid Header */}
            <section>
                <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-text-primary md:text-2xl">
                                {searchQuery ? 'Search Results' : 'Preservation Chambers'}
                            </h2>
                            <Badge>{filteredRooms.length}</Badge>
                        </div>
                        <p className="text-xs text-text-muted md:text-sm">
                            {searchQuery
                                ? `Found ${filteredRooms.length} rooms matching your search.`
                                : 'Explore the different spaces of your family legacy.'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    {filteredRooms.map((room) => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                    <motion.div
                        layout
                        onClick={() => setIsCreateRoomOpen(true)}
                        className="group flex cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-white/10 bg-surface/20 transition-all hover:border-accent-gold/40 hover:bg-surface/40 h-[400px]"
                    >
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/5 bg-bg-dark text-text-muted transition-all group-hover:scale-110 group-hover:text-accent-gold">
                            <Plus size={32} />
                        </div>
                        <span className="text-xs font-bold tracking-[0.3em] text-text-primary uppercase transition-colors group-hover:text-accent-gold">
                            Create
                        </span>
                    </motion.div>
                </div>
            </section>

            {/* Recent Stories Section */}
            {recentStories && recentStories.length > 0 && (
                <section className="mt-20">
                    <div className="mb-10 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold text-text-primary md:text-2xl">Recent Echoes</h2>
                            <p className="text-xs text-text-muted md:text-sm">The latest artifacts preserved in your heritage.</p>
                        </div>
                        <Button variant="ghost" className="text-xs font-bold tracking-widest text-accent-gold uppercase">View All</Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {recentStories.map((story) => (
                            <Link
                                key={story.id}
                                href={`/dashboard/stories/${story.id}`}
                                className="group relative aspect-square overflow-hidden rounded-[32px] border border-white/5 bg-surface/40"
                            >
                                <img
                                    src={story.thumbnail}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={story.title}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-bg-dark/90 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                                <div className="absolute inset-x-0 bottom-0 p-6">
                                    <Badge className="mb-2 border-white/10 bg-bg-dark/60 text-[8px] tracking-[0.2em] uppercase backdrop-blur-md">
                                        {story.type}
                                    </Badge>
                                    <h3 className="text-lg font-bold text-text-primary line-clamp-1 group-hover:text-accent-gold transition-colors">
                                        {story.title}
                                    </h3>
                                    <span className="text-[10px] text-text-muted">{story.date}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            {/* New Story Modal */}
            <AnnexMemoryModal
                isOpen={isNewStoryOpen}
                onClose={() => setIsNewStoryOpen(false)}
                rooms={rooms}
            />

            {/* Create Room / Event Modal */}
            <AnimatePresence>
                {isCreateRoomOpen && (
                    <Portal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 grid place-items-end md:place-items-center bg-black/80 p-4 backdrop-blur-md"
                            onClick={() => {
                                setIsCreateRoomOpen(false);
                                setCreateMode('room');
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                                transition={{
                                    type: "spring",
                                    damping: 28,
                                    stiffness: 260,
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-xl max-h-[80vh] md:max-h-[85vh] overflow-y-auto overscroll-contain rounded-[32px] border border-white/10 bg-surface p-8 shadow-2xl ring-1 ring-white/5 md:p-10"
                            >
                                <div className="absolute top-4 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-white/10 md:hidden" />

                                <button
                                    onClick={() => {
                                        setIsCreateRoomOpen(false);
                                        setCreateMode('room');
                                    }}
                                    className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary md:top-8 md:right-8"
                                >
                                    <X size={24} />
                                </button>

                                {/* Mode Tabs */}
                                <div className="mb-8">
                                    <div className="mb-6 inline-flex rounded-2xl border border-white/5 bg-bg-dark p-1">
                                        <button
                                            type="button"
                                            onClick={() => setCreateMode('room')}
                                            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-all ${createMode === 'room'
                                                ? 'bg-accent-gold text-bg-dark shadow-lg shadow-accent-gold/20'
                                                : 'text-text-muted hover:text-text-primary'
                                                }`}
                                        >
                                            <Plus size={14} />
                                            Room
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCreateMode('event')}
                                            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-all ${createMode === 'event'
                                                ? 'bg-accent-gold text-bg-dark shadow-lg shadow-accent-gold/20'
                                                : 'text-text-muted hover:text-text-primary'
                                                }`}
                                        >
                                            <Calendar size={14} />
                                            Event
                                        </button>
                                    </div>

                                    <h2 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">
                                        {createMode === 'room' ? 'Open a New Room' : 'Create a New Event'}
                                    </h2>
                                    <p className="text-sm leading-relaxed text-text-muted">
                                        {createMode === 'room'
                                            ? 'Each room is a dedicated sanctuary for a family branch or heritage collection.'
                                            : 'An event gathers memories around a special occasion or moment in time.'}
                                    </p>
                                </div>

                                <form onSubmit={handleCreate} className="flex flex-col gap-6">
                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            {createMode === 'room' ? 'Room Name' : 'Event Name'}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={createMode === 'room' ? 'e.g., The Heritage Hall' : 'e.g., Grandma\'s 80th Birthday'}
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                            required
                                        />
                                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            {createMode === 'room' ? 'Room Description' : 'Event Description'}
                                        </label>
                                        <textarea
                                            placeholder={createMode === 'room' ? 'Describe the purpose of this space...' : 'Describe this special occasion...'}
                                            rows={3}
                                            value={data.description}
                                            onChange={(e) =>
                                                setData('description', e.target.value)
                                            }
                                            className="w-full resize-none rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                        />
                                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                                    </div>

                                    {/* Event Date - only for events */}
                                    {createMode === 'event' && (
                                        <div className="space-y-2">
                                            <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                <Calendar size={12} />
                                                Event Date
                                            </label>
                                            <input
                                                type="date"
                                                value={data.event_date}
                                                onChange={(e) =>
                                                    setData('event_date', e.target.value)
                                                }
                                                className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                            />
                                            {errors.event_date && <p className="mt-1 text-xs text-red-500">{errors.event_date}</p>}
                                        </div>
                                    )}

                                    {/* Privacy Toggle */}
                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Privacy
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setData('privacy', 'public')}
                                                className={`flex flex-1 items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm transition-all ${data.privacy === 'public'
                                                    ? 'border-accent-gold/50 bg-accent-gold/5 text-accent-gold'
                                                    : 'border-border-subtle bg-bg-dark text-text-muted hover:border-accent-gold/30'
                                                    }`}
                                            >
                                                <Globe size={18} />
                                                <div className="flex flex-col items-start">
                                                    <span className="text-xs font-semibold">Public</span>
                                                    <span className="text-[10px] text-text-muted">Anyone with the link can view</span>
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('privacy', 'private')}
                                                className={`flex flex-1 items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm transition-all ${data.privacy === 'private'
                                                    ? 'border-accent-gold/50 bg-accent-gold/5 text-accent-gold'
                                                    : 'border-border-subtle bg-bg-dark text-text-muted hover:border-accent-gold/30'
                                                    }`}
                                            >
                                                <Lock size={18} />
                                                <div className="flex flex-col items-start">
                                                    <span className="text-xs font-semibold">Private</span>
                                                    <span className="text-[10px] text-text-muted">Only invited members</span>
                                                </div>
                                            </button>
                                        </div>
                                        {errors.privacy && <p className="mt-1 text-xs text-red-500">{errors.privacy}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            {createMode === 'room' ? 'Room Thumbnail' : 'Event Thumbnail'}
                                        </label>
                                        <div
                                            onClick={() => document.getElementById('create-thumbnail-input')?.click()}
                                            className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border-subtle bg-bg-dark transition-all hover:border-accent-gold/40"
                                        >
                                            {thumbnailPreview ? (
                                                <img src={thumbnailPreview} className="h-full w-full object-cover" alt="Preview" />
                                            ) : (
                                                <div className="flex h-full flex-col items-center justify-center gap-2 text-text-muted">
                                                    <Camera size={24} />
                                                    <span className="text-xs">Add a cover image</span>
                                                </div>
                                            )}
                                            <input
                                                id="create-thumbnail-input"
                                                type="file"
                                                className="hidden"
                                                onChange={handleThumbnailChange}
                                                accept="image/*"
                                            />
                                        </div>
                                        {errors.thumbnail && <p className="mt-1 text-xs text-red-500">{errors.thumbnail}</p>}
                                    </div>

                                    <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setIsCreateRoomOpen(false);
                                                setCreateMode('room');
                                            }}
                                            type="button"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="w-full"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {createMode === 'room' ? 'Create Room' : 'Create Event'}
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    </Portal>
                )}
            </AnimatePresence>
        </div>
    );
}

