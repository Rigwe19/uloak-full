import { Head, Link, useForm, router } from '@inertiajs/react';
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
    Calendar,
    Lock,
    Globe,
    Heart,
    BookOpen,
    Tag,
    Music,
    Image,
    UserPlus,
    Briefcase,
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { AnnexMemoryModal } from '@/components/dashboard/annex-memory-modal';
import { RoomCard } from '@/components/dashboard/room-card';
import { Button, Badge, AvatarGroup } from '@/components/dashboard/ui';
import { Portal } from '@/components/portal';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { store as storeEvent, show as showEvent } from '@/routes/dashboard/events';
import { store as storeRoom, show as showRoom } from '@/routes/dashboard/rooms';

interface DashboardProps {
    dashboardData: {
        rooms: any[];
        events: any[];
        recentStories: any[];
        stats: {
            name: string;
            icon: string;
            count: number;
        }[];
        house_members?: {
            id: number;
            name: string;
            avatar: string | null;
        }[];
        notifications: any[];
    };
    auth: {
        user: any;
    };
}

export default function Dashboard({ dashboardData, auth }: DashboardProps) {
    const { rooms, events, stats, recentStories, notifications, house_members } = dashboardData;
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isNewStoryOpen, setIsNewStoryOpen] = useState(false);
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
    const INITIAL_MODE = auth.user.role === 'business_admin' ? 'event' : 'room';
    const [createMode, setCreateMode] = useState<'room' | 'event'>(INITIAL_MODE);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        privacy: 'public',
        thumbnail: null as File | null,
        event_date: '',
        room_type: 'general',
        enable_tributes: false,
        enable_condolence_attendance: false,
        enable_candle_lighting: false,
        tribute_name: '',
        tribute_song: null as File | null,
        media_items: [] as File[],
        allow_download: false,
        start_date: '',
        end_date: '',
        client_id: '',
    });

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    // Client management for business_admin
    const [clients, setClients] = useState<any[]>([]);
    const [clientsLoaded, setClientsLoaded] = useState(false);
    const [showClientForm, setShowClientForm] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', company: '' });
    const [clientSubmitting, setClientSubmitting] = useState(false);
    const [clientFilter, setClientFilter] = useState('');

    const isBusinessAdmin = auth.user.role === 'business_admin';

    useEffect(() => {
        if (isBusinessAdmin && isCreateRoomOpen && !clientsLoaded) {
            fetch('/clients')
                .then(res => res.json())
                .then(data => {
                    setClients(data.clients ?? []);
                    setClientsLoaded(true);
                })
                .catch(() => { });
        }
    }, [isBusinessAdmin, isCreateRoomOpen, clientsLoaded]);

    const handleAddClient = async () => {
        if (!newClient.name || !newClient.email) {
return;
}

        setClientSubmitting(true);

        try {
            const res = await fetch('/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '' },
                body: JSON.stringify(newClient),
            });
            const data = await res.json();

            if (data.client) {
                setClients(prev => [...prev, data.client]);
                setData('client_id', String(data.client.id));
                setShowClientForm(false);
                setNewClient({ name: '', email: '', phone: '', company: '' });
            }
        } catch { }

        setClientSubmitting(false);
    };

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

        const url = createMode === 'room' ? storeRoom().url : storeEvent().url;

        // If room doesn't need tributes, reset tribute flags
        const tributeTypes = ['birthday', 'burial', 'wedding', 'anniversary', 'memorial'];

        if (createMode === 'room' && !tributeTypes.includes(data.room_type)) {
            setData('enable_tributes', false);
            setData('enable_condolence_attendance', false);
            setData('enable_candle_lighting', false);
        }

        post(url, {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateRoomOpen(false);
                setThumbnailPreview(null);
                reset();
                setCreateMode(INITIAL_MODE);
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
                        <AvatarGroup users={[
                            { name: auth.user.name, avatar: auth.user.avatar },
                            ...(house_members ?? []).map((m: any) => ({ name: m.name, avatar: m.avatar })),
                        ]} />
                        <div className="mx-2 h-8 w-px bg-border-subtle" />
                    </div>
                    <div className="group relative grow">
                        <Search
                            className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder={`Search ${isBusinessAdmin ? 'projects' : 'rooms or memories'}...`}
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
                    <Button
                        variant="primary"
                        icon={Plus}
                        className="py-4 text-sm md:py-3"
                        onClick={() => setIsCreateRoomOpen(true)}
                    >
                        Add {isBusinessAdmin ? 'Project' : 'Room'}
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
            {!isBusinessAdmin && <section>
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
            </section>}

            {/* Projects/Events Grid - Business Admin Only */}
            {isBusinessAdmin && events && events.length > 0 && (
                <section className="mt-20">
                    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold text-text-primary md:text-2xl">Your Projects</h2>
                            <p className="text-xs text-text-muted md:text-sm">Events and projects you've created for clients.</p>
                        </div>
                        {clients.length > 0 && (
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Client</label>
                                <select
                                    value={clientFilter}
                                    onChange={(e) => setClientFilter(e.target.value)}
                                    className="rounded-xl border border-border-subtle bg-surface px-3 py-2 text-xs text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                >
                                    <option value="">All Clients</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
                        {events.map((event) => (
                            <Link
                                key={event.id}
                                href={showEvent(event.slug).url}
                                className="group relative h-100 cursor-pointer overflow-hidden rounded-3xl border border-border-subtle bg-surface transition-all"
                            >
                                <div className="absolute inset-0 z-0 transition-transform duration-500">
                                    {event.thumbnail ? (
                                        <img
                                            src={event.thumbnail}
                                            alt={event.name}
                                            className="h-full w-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="bg-surface-light flex h-full w-full items-center justify-center">
                                            <span className="text-4xl font-bold text-text-muted opacity-20">
                                                {event.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-bg-dark via-bg-dark/40 to-transparent" />
                                </div>

                                <div className="absolute right-0 bottom-0 left-0 z-10 flex flex-col gap-4 p-8">
                                    <Badge className="bg-accent-gold/20 text-accent-gold transition-colors duration-500 w-fit">
                                        {event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Event'}
                                    </Badge>
                                    <h3 className="text-2xl font-bold text-text-primary transition-colors duration-500 group-hover:text-accent-gold">
                                        {event.name}
                                    </h3>
                                    <p className="line-clamp-2 text-sm text-text-muted transition-all duration-500">
                                        {event.description}
                                    </p>
                                </div>
                            </Link>
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
        )}

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
                                setCreateMode(INITIAL_MODE);
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
                                        setCreateMode(INITIAL_MODE);
                                    }}
                                    className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary md:top-8 md:right-8"
                                >
                                    <X size={24} />
                                </button>

                                {/* Role-based Create Header */}
                                <div className="mb-8">
                                    {isBusinessAdmin ? (
                                        <>
                                            <h2 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">Create a New Project</h2>
                                            <p className="text-sm leading-relaxed text-text-muted">An event gathers memories around a special occasion or moment in time.</p>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">Open a New Room</h2>
                                            <p className="text-sm leading-relaxed text-text-muted">Each room is a dedicated sanctuary for a family branch or heritage collection.</p>
                                        </>
                                    )}
                                </div>

                                <form onSubmit={handleCreate} className="flex flex-col gap-6">
                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            {createMode === 'room' ? 'Room Name' : 'Project Name'}
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

                                    {/* Room Type - only for rooms */}
                                    {createMode === 'room' && (
                                        <div className="space-y-2">
                                            <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                <Tag size={12} />
                                                Room Type
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { value: 'general', label: 'General', icon: Files },
                                                    { value: 'birthday', label: 'Birthday', icon: Heart },
                                                    { value: 'burial', label: 'Burial', icon: BookOpen },
                                                    { value: 'wedding', label: 'Wedding', icon: Heart },
                                                    { value: 'anniversary', label: 'Anniversary', icon: Heart },
                                                    { value: 'memorial', label: 'Memorial', icon: BookOpen },
                                                    { value: 'graduation', label: 'Graduation', icon: Heart },
                                                ].map((type) => {
                                                    const Icon = type.icon;
                                                    const isSelected = data.room_type === type.value;

                                                    return (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setData('room_type', type.value);
                                                            }}
                                                            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs transition-all ${isSelected
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
                                            {errors.room_type && <p className="mt-1 text-xs text-red-500">{errors.room_type}</p>}
                                        </div>
                                    )}

                                    {/* Background Music - available for all room types */}
                                    {createMode === 'room' && (
                                        <div className="space-y-2">
                                            <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                <Music size={12} />
                                                Background Music (Optional)
                                            </label>
                                            <div className="relative border border-dashed border-accent-gold/20 rounded-xl bg-bg-dark p-4 transition-all hover:border-accent-gold text-center cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept=".mp3,.wav,.ogg"
                                                    onChange={(e) => {
                                                        setData('tribute_song', e.target.files?.[0] || null);
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center gap-1">
                                                    <Music className="w-5 h-5 text-accent-gold" />
                                                    <span className="text-[11px] font-medium text-text-muted">
                                                        {data.tribute_song ? data.tribute_song.name : 'Upload background music (mp3, wav, ogg)'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tribute Features */}
                                    {createMode === 'room' && (
                                        <div className="space-y-4 rounded-2xl border border-white/5 bg-bg-dark/50 p-5">
                                            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase">
                                                <Heart size={14} />
                                                Tribute Features
                                            </div>

                                            {/* Enable Tributes */}
                                            <label className="flex cursor-pointer items-center justify-between gap-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-semibold text-text-primary">Accept Tributes</span>
                                                    <span className="text-xs text-text-muted">Allow visitors to leave tribute messages</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('enable_tributes', !data.enable_tributes)}
                                                    className={`relative h-7 w-12 shrink-0 rounded-full transition-all ${data.enable_tributes ? 'bg-accent-gold' : 'bg-white/10'}`}
                                                >
                                                    <span className={`absolute top-0.5 left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-bg-dark shadow transition-transform ${data.enable_tributes ? 'translate-x-5' : ''}`}>
                                                        {data.enable_tributes && <span className="text-[8px] text-accent-gold">✓</span>}
                                                    </span>
                                                </button>
                                            </label>

                                            {/* Enable Condolence Attendance */}
                                            <label className="flex cursor-pointer items-center justify-between gap-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-semibold text-text-primary">Condolence Attendance</span>
                                                    <span className="text-xs text-text-muted">Allow visitors to sign condolence attendance</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('enable_condolence_attendance', !data.enable_condolence_attendance)}
                                                    className={`relative h-7 w-12 shrink-0 rounded-full transition-all ${data.enable_condolence_attendance ? 'bg-accent-gold' : 'bg-white/10'}`}
                                                >
                                                    <span className={`absolute top-0.5 left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-bg-dark shadow transition-transform ${data.enable_condolence_attendance ? 'translate-x-5' : ''}`}>
                                                        {data.enable_condolence_attendance && <span className="text-[8px] text-accent-gold">✓</span>}
                                                    </span>
                                                </button>
                                            </label>

                                            {/* Enable Candle Lighting */}
                                            <label className="flex cursor-pointer items-center justify-between gap-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-semibold text-text-primary">Light a Candle</span>
                                                    <span className="text-xs text-text-muted">Allow visitors to light a virtual candle</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('enable_candle_lighting', !data.enable_candle_lighting)}
                                                    className={`relative h-7 w-12 shrink-0 rounded-full transition-all ${data.enable_candle_lighting ? 'bg-accent-gold' : 'bg-white/10'}`}
                                                >
                                                    <span className={`absolute top-0.5 left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-bg-dark shadow transition-transform ${data.enable_candle_lighting ? 'translate-x-5' : ''}`}>
                                                        {data.enable_candle_lighting && <span className="text-[8px] text-accent-gold">✓</span>}
                                                    </span>
                                                </button>
                                            </label>
                                        </div>
                                    )}

                                    {/* Name of Celebrant/Deceased */}
                                    {createMode === 'room' && (
                                        <div className="space-y-2">
                                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                Name of {data.room_type === 'burial' || data.room_type === 'memorial' ? 'Deceased' : 'Celebrant'}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={data.room_type === 'burial' || data.room_type === 'memorial' ? "e.g., John Doe" : "e.g., Jane Smith"}
                                                value={data.tribute_name}
                                                onChange={(e) => setData('tribute_name', e.target.value)}
                                                className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                            />
                                        </div>
                                    )}
                                    {/* Start Date */}
                                    {createMode === 'room' && (
                                        <div className="space-y-2">
                                            <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                <Calendar size={12} />
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                            />
                                        </div>
                                    )}

                                    {/* End Date */}
                                    {createMode === 'room' && (
                                        <div className="space-y-2">
                                            <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                <Calendar size={12} />
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                                className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                            />
                                        </div>
                                    )}

                                    {/* Media Gallery Upload */}
                                    {createMode === 'room' && (
                                        <div className="space-y-2">
                                            <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                <Image size={12} />
                                                Media Gallery (Carousel)
                                            </label>
                                            <p className="text-[10px] text-text-muted -mt-1 leading-snug ml-1">Images and videos shown as a carousel at the top of the room page.</p>
                                            <div className="relative border border-dashed border-accent-gold/20 rounded-xl bg-bg-dark p-4 transition-all hover:border-accent-gold text-center cursor-pointer">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm"
                                                    onChange={(e) => {
                                                        const files = e.target.files;

                                                        if (files) {
                                                            setData('media_items', [...data.media_items, ...Array.from(files)]);
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center gap-1">
                                                    <Image className="w-5 h-5 text-accent-gold" />
                                                    <span className="text-[11px] font-medium text-text-muted">Add images & videos (multiple)</span>
                                                </div>
                                            </div>
                                            {data.media_items.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {data.media_items.map((file, idx) => (
                                                        <div key={idx} className="flex items-center gap-1.5 bg-surface/30 border border-white/5 px-2.5 py-1.5 rounded-lg text-[10px] text-text-muted">
                                                            <Camera size={12} className="text-accent-gold shrink-0" />
                                                            <span className="truncate max-w-[120px]">{file.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = data.media_items.filter((_, i) => i !== idx);
                                                                    setData('media_items', updated);
                                                                }}
                                                                className="text-red-400 hover:text-red-300 ml-1"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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
                                    {isBusinessAdmin && (
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="allow-download"
                                                checked={data.allow_download}
                                                onCheckedChange={(checked) => setData('allow_download', checked)}
                                            />
                                            <Label htmlFor="allow-download">Allow download of media by clients</Label>
                                        </div>
                                    )}

                                    {/* Client Assignment - Business Admin Only */}
                                    {isBusinessAdmin && (
                                        <div className="space-y-3 rounded-2xl border border-accent-gold/20 bg-accent-gold/5 p-5">
                                            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase">
                                                <Briefcase size={14} />
                                                Client Assignment
                                            </div>
                                            <p className="text-[10px] text-text-muted leading-relaxed">
                                                Assign this {createMode === 'room' ? 'project' : 'event'} to a client. The client will be able to view it from their portal.
                                            </p>

                                            {/* Client Dropdown */}
                                            {!showClientForm && (
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={data.client_id}
                                                        onValueChange={(val) => setData('client_id', val)}
                                                    >
                                                        <SelectTrigger className="w-full rounded-xl border border-white/10 bg-bg-dark px-4 py-3 text-sm text-text-primary outline-none">
                                                            <SelectValue placeholder="Select a client..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="border-white/10 bg-surface text-text-primary">
                                                            {clients.length === 0 && (
                                                                <SelectItem value="__none__" disabled>No clients yet</SelectItem>
                                                            )}
                                                            {clients.map((c: any) => (
                                                                <SelectItem key={c.id} value={String(c.id)}>
                                                                    {c.name} ({c.email})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowClientForm(true)}
                                                        className="flex shrink-0 items-center gap-2 rounded-xl border border-dashed border-accent-gold/40 px-4 py-3 text-[10px] font-bold tracking-widest text-accent-gold uppercase transition-all hover:border-accent-gold hover:bg-accent-gold/10"
                                                        title="Add new client"
                                                    >
                                                        <UserPlus size={16} />
                                                        <span className="hidden sm:inline">Add Client</span>
                                                    </button>
                                                </div>
                                            )}

                                            {/* Add Client Form (shown when + is clicked) */}
                                            {showClientForm && (
                                                <div className="space-y-3 rounded-xl border border-white/10 bg-bg-dark/50 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold tracking-widest text-accent-gold uppercase">New Client</span>
                                                        <button type="button" onClick={() => setShowClientForm(false)} className="text-text-muted hover:text-text-primary">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Client name *"
                                                        value={newClient.name}
                                                        onChange={(e) => setNewClient(p => ({ ...p, name: e.target.value }))}
                                                        className="w-full rounded-xl border border-white/10 bg-bg-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold/50"
                                                    />
                                                    <input
                                                        type="email"
                                                        placeholder="Email *"
                                                        value={newClient.email}
                                                        onChange={(e) => setNewClient(p => ({ ...p, email: e.target.value }))}
                                                        className="w-full rounded-xl border border-white/10 bg-bg-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold/50"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Phone"
                                                            value={newClient.phone}
                                                            onChange={(e) => setNewClient(p => ({ ...p, phone: e.target.value }))}
                                                            className="w-full rounded-xl border border-white/10 bg-bg-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold/50"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Company"
                                                            value={newClient.company}
                                                            onChange={(e) => setNewClient(p => ({ ...p, company: e.target.value }))}
                                                            className="w-full rounded-xl border border-white/10 bg-bg-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold/50"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddClient}
                                                        disabled={clientSubmitting || !newClient.name || !newClient.email}
                                                        className="w-full rounded-xl bg-accent-gold px-4 py-2.5 text-xs font-bold tracking-widest text-bg-dark uppercase transition-all hover:opacity-90 disabled:opacity-50"
                                                    >
                                                        {clientSubmitting ? 'Adding...' : 'Add Client & Assign'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setIsCreateRoomOpen(false);
                                                setCreateMode(INITIAL_MODE);
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

