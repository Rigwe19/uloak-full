import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Camera,
    Video,
    MessageSquare,
    Files,
    Share2,
    X,
    Search,
    Lock,
    Globe,
    Heart,
    BookOpen,
    Image,
    Calendar,
    Tag,
    Music,
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { RoomCard } from '@/components/dashboard/room-card';
import { Button, Badge } from '@/components/dashboard/ui';
import { Portal } from '@/components/portal';
import { show } from '@/routes/house/rooms';

interface Room {
    id: number;
    slug: string;
    name: string;
    description: string;
    thumbnail: string | null;
    privacy: string;
    stories_count: number;
    tributes_count: number;
    members: any[];
    can_delete: boolean;
    photos_count?: number;
    videos_count?: number;
    audios_count?: number;
    documents_count?: number;
}

interface HouseDashboardProps {
    rooms: Room[];
    recentStories: any[];
    stats: {
        name: string;
        icon: string;
        count: number;
    }[];
    owner_name: string;
    house_member_name: string;
    house_thumbnail?: string | null;
}

export default function HouseDashboard({
    rooms,
    recentStories,
    stats,
    owner_name,
    house_member_name,
    house_thumbnail,
}: HouseDashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        privacy: 'public',
        thumbnail: null as File | null,
        room_type: 'general',
        enable_tributes: false,
        enable_condolence_attendance: false,
        enable_candle_lighting: false,
        tribute_name: '',
        tribute_song: null as File | null,
        media_items: [] as File[],
        start_date: '',
        end_date: '',
    });

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (!isCreateRoomOpen) {
            return;
        }

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

        post('/house/rooms', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateRoomOpen(false);
                setThumbnailPreview(null);
                reset();
            },
        });
    };

    const categories = useMemo(
        () => [
            {
                name: 'Photos',
                icon: Camera,
                count: stats.find((s) => s.name === 'Photos')?.count || 0,
            },
            {
                name: 'Videos',
                icon: Video,
                count: stats.find((s) => s.name === 'Videos')?.count || 0,
            },
            {
                name: 'Voices',
                icon: MessageSquare,
                count: stats.find((s) => s.name === 'Voices')?.count || 0,
            },
            {
                name: 'Members',
                icon: Share2,
                count: stats.find((s) => s.name === 'Members')?.count || 0,
            },
            {
                name: 'Documents',
                icon: Files,
                count: stats.find((s) => s.name === 'Documents')?.count || 0,
            },
        ],
        [stats],
    );

    const filteredRooms = useMemo(() => {
        const query = searchQuery.toLowerCase();

        return rooms.filter((room) => {
            const matchesSearch =
                !searchQuery ||
                room.name.toLowerCase().includes(query) ||
                (room.description || '').toLowerCase().includes(query);

            const matchesCategory =
                !activeCategory ||
                (activeCategory === 'Photos' && (room.photos_count ?? 0) > 0) ||
                (activeCategory === 'Videos' && (room.videos_count ?? 0) > 0) ||
                (activeCategory === 'Voices' && (room.audios_count ?? 0) > 0) ||
                (activeCategory === 'Documents' &&
                    (room.documents_count ?? 0) > 0) ||
                (activeCategory === 'Members' &&
                    (room.members?.length ?? 0) > 0);

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory, rooms]);

    return (
        <div className="mx-auto max-w-7xl p-5 pb-32 md:p-8 md:pb-8 lg:p-16">
            <Head title="House Dashboard" />

            {/* Dashboard Header */}
            <header className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-semibold tracking-widest text-accent-gold uppercase md:text-xs">
                        {owner_name}'s House
                    </span>
                    <h1 className="text-3xl leading-tight font-bold tracking-tight text-text-primary md:text-5xl">
                        Welcome, {house_member_name}.
                    </h1>
                </div>
                <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
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
                            className="w-full rounded-2xl border border-border-subtle bg-surface py-3 pr-10 pl-12 text-sm text-text-primary shadow-inner transition-all focus:border-accent-gold/50 focus:outline-none md:max-w-64 xl:max-w-80"
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
                </div>
            </header>

            {/* House Thumbnail Hero */}
            {house_thumbnail && (
                <div className="mb-12 overflow-hidden rounded-[32px] border border-border-subtle bg-surface/30 md:mb-16">
                    <img
                        src={house_thumbnail}
                        alt="House cover"
                        className="h-48 w-full object-cover md:h-72 lg:h-80"
                    />
                </div>
            )}

            {/* Categories Grid */}
            <section className="mb-16 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mb-20 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
                {categories.map((cat) => {
                    const CatIcon = cat.icon;

                    return (
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
                            <CatIcon
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
                    );
                })}
            </section>

            {/* Room Grid */}
            <section>
                <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-text-primary md:text-2xl">
                                {searchQuery
                                    ? 'Search Results'
                                    : 'Preservation Chambers'}
                            </h2>
                            <Badge>{filteredRooms.length}</Badge>
                        </div>
                        <p className="text-xs text-text-muted md:text-sm">
                            {searchQuery
                                ? `Found ${filteredRooms.length} rooms matching your search.`
                                : 'Explore the different spaces of this family legacy.'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    {filteredRooms.map((room) => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            roomUrl={show(room.slug).url}
                        />
                    ))}
                    <motion.div
                        layout
                        onClick={() => setIsCreateRoomOpen(true)}
                        className="group flex h-[400px] cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-white/10 bg-surface/20 transition-all hover:border-accent-gold/40 hover:bg-surface/40"
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
                            <h2 className="text-xl font-bold text-text-primary md:text-2xl">
                                Recent Echoes
                            </h2>
                            <p className="text-xs text-text-muted md:text-sm">
                                The latest artifacts preserved in this heritage.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {recentStories.map((story: any) => (
                            <Link
                                key={story.id}
                                href={`/house/rooms/${story.room_id}`}
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
                                    <h3 className="line-clamp-1 text-lg font-bold text-text-primary transition-colors group-hover:text-accent-gold">
                                        {story.title}
                                    </h3>
                                    <span className="text-[10px] text-text-muted">
                                        {story.date}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Create Room Modal */}
            <AnimatePresence>
                {isCreateRoomOpen && (
                    <Portal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 grid place-items-end bg-black/80 p-4 backdrop-blur-md md:place-items-center"
                            onClick={() => {
                                setIsCreateRoomOpen(false);
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                                transition={{
                                    type: 'spring',
                                    damping: 28,
                                    stiffness: 260,
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative max-h-[80vh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-[32px] border border-white/10 bg-surface p-8 shadow-2xl ring-1 ring-white/5 md:max-h-[85vh] md:p-10"
                            >
                                <div className="absolute top-4 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-white/10 md:hidden" />

                                <button
                                    onClick={() => {
                                        setIsCreateRoomOpen(false);
                                    }}
                                    className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary md:top-8 md:right-8"
                                >
                                    <X size={24} />
                                </button>

                                <div className="mb-8">
                                    <h2 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">
                                        Open a New Room
                                    </h2>
                                    <p className="text-sm leading-relaxed text-text-muted">
                                        Each room is a dedicated sanctuary for a
                                        family branch or heritage collection.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleCreate}
                                    className="flex flex-col gap-6"
                                >
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
                                        {errors.name && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Description
                                        </label>
                                        <textarea
                                            placeholder="Describe the purpose of this space..."
                                            rows={3}
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full resize-none rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Room Type */}
                                    <div className="space-y-2">
                                        <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            <Tag size={12} />
                                            Room Type
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                {
                                                    value: 'general',
                                                    label: 'General',
                                                    icon: Files,
                                                },
                                                {
                                                    value: 'birthday',
                                                    label: 'Birthday',
                                                    icon: Heart,
                                                },
                                                {
                                                    value: 'burial',
                                                    label: 'Burial',
                                                    icon: BookOpen,
                                                },
                                                {
                                                    value: 'wedding',
                                                    label: 'Wedding',
                                                    icon: Heart,
                                                },
                                                {
                                                    value: 'anniversary',
                                                    label: 'Anniversary',
                                                    icon: Heart,
                                                },
                                                {
                                                    value: 'memorial',
                                                    label: 'Memorial',
                                                    icon: BookOpen,
                                                },
                                                {
                                                    value: 'graduation',
                                                    label: 'Graduation',
                                                    icon: Heart,
                                                },
                                            ].map((type) => {
                                                const Icon = type.icon;
                                                const isSelected =
                                                    data.room_type ===
                                                    type.value;

                                                return (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() =>
                                                            setData(
                                                                'room_type',
                                                                type.value,
                                                            )
                                                        }
                                                        className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs transition-all ${
                                                            isSelected
                                                                ? 'border-accent-gold/50 bg-accent-gold/5 text-accent-gold'
                                                                : 'border-border-subtle bg-bg-dark text-text-muted hover:border-accent-gold/30'
                                                        }`}
                                                    >
                                                        <Icon size={16} />
                                                        {type.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.room_type && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.room_type}
                                            </p>
                                        )}
                                    </div>

                                    {/* Background Music */}
                                    <div className="space-y-2">
                                        <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            <Music size={12} />
                                            Background Music (Optional)
                                        </label>
                                        <div className="relative cursor-pointer rounded-xl border border-dashed border-accent-gold/20 bg-bg-dark p-4 text-center transition-all hover:border-accent-gold">
                                            <input
                                                type="file"
                                                accept=".mp3,.wav,.ogg"
                                                onChange={(e) =>
                                                    setData(
                                                        'tribute_song',
                                                        e.target.files?.[0] ||
                                                            null,
                                                    )
                                                }
                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                            />
                                            <div className="flex flex-col items-center gap-1">
                                                <Music className="h-5 w-5 text-accent-gold" />
                                                <span className="text-[11px] font-medium text-text-muted">
                                                    {data.tribute_song
                                                        ? data.tribute_song.name
                                                        : 'Upload background music (mp3, wav, ogg)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tribute Features */}
                                    <div className="space-y-4 rounded-2xl border border-white/5 bg-bg-dark/50 p-5">
                                        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase">
                                            <Heart size={14} />
                                            Tribute Features
                                        </div>

                                        <label className="flex cursor-pointer items-center justify-between gap-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold text-text-primary">
                                                    Accept Tributes
                                                </span>
                                                <span className="text-xs text-text-muted">
                                                    Allow visitors to leave
                                                    tribute messages
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        'enable_tributes',
                                                        !data.enable_tributes,
                                                    )
                                                }
                                                className={`relative h-7 w-12 shrink-0 rounded-full transition-all ${data.enable_tributes ? 'bg-accent-gold' : 'bg-white/10'}`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-bg-dark shadow transition-transform ${data.enable_tributes ? 'translate-x-5' : ''}`}
                                                >
                                                    {data.enable_tributes && (
                                                        <span className="text-[8px] text-accent-gold">
                                                            ✓
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        </label>

                                        <label className="flex cursor-pointer items-center justify-between gap-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold text-text-primary">
                                                    Condolence Attendance
                                                </span>
                                                <span className="text-xs text-text-muted">
                                                    Allow visitors to sign
                                                    condolence attendance
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        'enable_condolence_attendance',
                                                        !data.enable_condolence_attendance,
                                                    )
                                                }
                                                className={`relative h-7 w-12 shrink-0 rounded-full transition-all ${data.enable_condolence_attendance ? 'bg-accent-gold' : 'bg-white/10'}`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-bg-dark shadow transition-transform ${data.enable_condolence_attendance ? 'translate-x-5' : ''}`}
                                                >
                                                    {data.enable_condolence_attendance && (
                                                        <span className="text-[8px] text-accent-gold">
                                                            ✓
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        </label>

                                        <label className="flex cursor-pointer items-center justify-between gap-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold text-text-primary">
                                                    Light a Candle
                                                </span>
                                                <span className="text-xs text-text-muted">
                                                    Allow visitors to light a
                                                    virtual candle
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        'enable_candle_lighting',
                                                        !data.enable_candle_lighting,
                                                    )
                                                }
                                                className={`relative h-7 w-12 shrink-0 rounded-full transition-all ${data.enable_candle_lighting ? 'bg-accent-gold' : 'bg-white/10'}`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-bg-dark shadow transition-transform ${data.enable_candle_lighting ? 'translate-x-5' : ''}`}
                                                >
                                                    {data.enable_candle_lighting && (
                                                        <span className="text-[8px] text-accent-gold">
                                                            ✓
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        </label>
                                    </div>

                                    {/* Name of Celebrant/Deceased */}
                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Name of{' '}
                                            {data.room_type === 'burial' ||
                                            data.room_type === 'memorial'
                                                ? 'Deceased'
                                                : 'Celebrant'}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={
                                                data.room_type === 'burial' ||
                                                data.room_type === 'memorial'
                                                    ? 'e.g., John Doe'
                                                    : 'e.g., Jane Smith'
                                            }
                                            value={data.tribute_name}
                                            onChange={(e) =>
                                                setData(
                                                    'tribute_name',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                        />
                                    </div>

                                    {/* Start Date */}
                                    <div className="space-y-2">
                                        <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            <Calendar size={12} />
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) =>
                                                setData(
                                                    'start_date',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                        />
                                    </div>

                                    {/* End Date */}
                                    <div className="space-y-2">
                                        <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            <Calendar size={12} />
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) =>
                                                setData(
                                                    'end_date',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                        />
                                    </div>

                                    {/* Media Gallery Upload */}
                                    <div className="space-y-2">
                                        <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            <Image size={12} />
                                            Media Gallery (Carousel)
                                        </label>
                                        <p className="-mt-1 ml-1 text-[10px] leading-snug text-text-muted">
                                            Images and videos shown as a
                                            carousel at the top of the room
                                            page.
                                        </p>
                                        <div className="relative cursor-pointer rounded-xl border border-dashed border-accent-gold/20 bg-bg-dark p-4 text-center transition-all hover:border-accent-gold">
                                            <input
                                                type="file"
                                                multiple
                                                accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm"
                                                onChange={(e) => {
                                                    const files =
                                                        e.target.files;

                                                    if (files) {
                                                        setData('media_items', [
                                                            ...data.media_items,
                                                            ...Array.from(
                                                                files,
                                                            ),
                                                        ]);
                                                    }
                                                }}
                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                            />
                                            <div className="flex flex-col items-center gap-1">
                                                <Image className="h-5 w-5 text-accent-gold" />
                                                <span className="text-[11px] font-medium text-text-muted">
                                                    Add images & videos
                                                    (multiple)
                                                </span>
                                            </div>
                                        </div>
                                        {data.media_items.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {data.media_items.map(
                                                    (file, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-surface/30 px-2.5 py-1.5 text-[10px] text-text-muted"
                                                        >
                                                            <Camera
                                                                size={12}
                                                                className="shrink-0 text-accent-gold"
                                                            />
                                                            <span className="max-w-[120px] truncate">
                                                                {file.name}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated =
                                                                        data.media_items.filter(
                                                                            (
                                                                                _,
                                                                                i,
                                                                            ) =>
                                                                                i !==
                                                                                idx,
                                                                        );
                                                                    setData(
                                                                        'media_items',
                                                                        updated,
                                                                    );
                                                                }}
                                                                className="ml-1 text-red-400 hover:text-red-300"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Privacy */}
                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Privacy
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setData('privacy', 'public')
                                                }
                                                className={`flex flex-1 items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm transition-all ${
                                                    data.privacy === 'public'
                                                        ? 'border-accent-gold/50 bg-accent-gold/5 text-accent-gold'
                                                        : 'border-border-subtle bg-bg-dark text-text-muted hover:border-accent-gold/30'
                                                }`}
                                            >
                                                <Globe size={18} />
                                                <div className="flex flex-col items-start">
                                                    <span className="text-xs font-semibold">
                                                        Public
                                                    </span>
                                                    <span className="text-[10px] text-text-muted">
                                                        Anyone with the link can
                                                        view
                                                    </span>
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        'privacy',
                                                        'private',
                                                    )
                                                }
                                                className={`flex flex-1 items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm transition-all ${
                                                    data.privacy === 'private'
                                                        ? 'border-accent-gold/50 bg-accent-gold/5 text-accent-gold'
                                                        : 'border-border-subtle bg-bg-dark text-text-muted hover:border-accent-gold/30'
                                                }`}
                                            >
                                                <Lock size={18} />
                                                <div className="flex flex-col items-start">
                                                    <span className="text-xs font-semibold">
                                                        Private
                                                    </span>
                                                    <span className="text-[10px] text-text-muted">
                                                        Only invited members
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                        {errors.privacy && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.privacy}
                                            </p>
                                        )}
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Room Thumbnail
                                        </label>
                                        <div
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        'create-thumbnail-input',
                                                    )
                                                    ?.click()
                                            }
                                            className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border-subtle bg-bg-dark transition-all hover:border-accent-gold/40"
                                        >
                                            {thumbnailPreview ? (
                                                <img
                                                    src={thumbnailPreview}
                                                    className="h-full w-full object-cover"
                                                    alt="Preview"
                                                />
                                            ) : (
                                                <div className="flex h-full flex-col items-center justify-center gap-2 text-text-muted">
                                                    <Camera size={24} />
                                                    <span className="text-xs">
                                                        Add a cover image
                                                    </span>
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
                                        {errors.thumbnail && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.thumbnail}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-4 pt-2 sm:flex-row">
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
                    </Portal>
                )}
            </AnimatePresence>
        </div>
    );
}
