import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge, AvatarGroup } from '@/components/dashboard/ui';
import { RoomCard } from '@/components/dashboard/room-card';
import { AnnexMemoryModal } from '@/components/dashboard/annex-memory-modal';
import {
    Plus,
    Camera,
    Video,
    MessageSquare,
    Files,
    Share2,
    X,
    Search,
} from 'lucide-react';

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
    const [roomPrivacy, setRoomPrivacy] = useState('Public');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        privacy: 'Public',
        thumbnail: null as File | null,
    });

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

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

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/rooms', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateRoomOpen(false);
                setThumbnailPreview(null);
                reset();
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

            {/* Create Room Modal */}
            <AnimatePresence>
                {isCreateRoomOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 flex items-end justify-center bg-black/80 p-4 backdrop-blur-md md:items-center md:p-8"
                    >
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{
                                type: 'spring',
                                damping: 30,
                                stiffness: 300,
                            }}
                            className="relative mb-24 w-full max-w-xl rounded-[32px] border border-white/10 bg-surface p-8 shadow-2xl ring-1 ring-white/5 md:mb-0 md:p-10"
                        >
                            <div className="absolute top-4 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-white/10 md:hidden" />

                            <button
                                onClick={() => setIsCreateRoomOpen(false)}
                                className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary md:top-8 md:right-8"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-gold/10 text-accent-gold md:mb-6 md:h-14 md:w-14">
                                    <Plus size={28} />
                                </div>
                                <h2 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">
                                    Open a New Room
                                </h2>
                                <p className="text-sm leading-relaxed text-text-muted">
                                    Each room is a dedicated sanctuary for a
                                    family branch or heritage collection.
                                </p>
                            </div>

                            <form onSubmit={handleCreateRoom} className="flex flex-col gap-6 pb-12 md:pb-0">
                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Room Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., The Heritage Hall"
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
                                        Room Description
                                    </label>
                                    <textarea
                                        placeholder="Describe the purpose of this space..."
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) =>
                                            setData('description', e.target.value)
                                        }
                                        className="w-full resize-none rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                    />
                                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Room Thumbnail
                                    </label>
                                    <div 
                                        onClick={() => document.getElementById('room-thumbnail-input')?.click()}
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
                                            id="room-thumbnail-input"
                                            type="file"
                                            className="hidden"
                                            onChange={handleThumbnailChange}
                                            accept="image/*"
                                        />
                                    </div>
                                    {errors.thumbnail && <p className="mt-1 text-xs text-red-500">{errors.thumbnail}</p>}
                                </div>

                                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            setIsCreateRoomOpen(false)
                                        }
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
                                        Create Room
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

