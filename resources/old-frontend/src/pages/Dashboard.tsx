import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockUsers, mockNotifications } from '../data/mockData';
import { useData } from '../components/DataProvider';
import { Button, Badge, AvatarGroup } from '../components/UI';
import { RoomCard } from '../components/Rooms';
import { ThemeToggle } from '../components/ThemeToggle';
import {
    Plus,
    LayoutGrid,
    List,
    Settings,
    Search,
    Bell,
    Camera,
    Video,
    MessageSquare,
    Files,
    Share2,
    LogOut,
    X,
    Filter,
    ShieldCheck,
    User,
    Globe,
    Lock,
    Trash2,
    Check,
    Clock,
    Heart,
    ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

// --- Sub-Components for Different Views ---

function NotificationsView() {
    const [filter, setFilter] = useState('All');

    const filteredNotifications = mockNotifications.filter((n) => {
        if (filter === 'All') return true;
        if (filter === 'Unread') return n.unread;
        return true;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
        >
            <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center md:mb-12">
                <div>
                    <h2 className="mb-1 text-2xl leading-tight font-bold text-text-primary md:mb-2 md:text-3xl">
                        Notifications
                    </h2>
                    <p className="text-xs text-text-muted md:text-sm">
                        Stay updated with your family's latest legacy movements.
                    </p>
                </div>
                <div className="flex self-start rounded-xl border border-border-subtle bg-surface p-1 sm:self-auto">
                    {['All', 'Unread'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-lg px-4 py-1.5 text-[10px] font-bold transition-all md:text-xs ${filter === f ? 'bg-accent-gold text-bg-dark shadow-lg shadow-accent-gold/20' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 md:space-y-4">
                {filteredNotifications.map((n) => (
                    <div
                        key={n.id}
                        className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all md:gap-4 md:p-6 ${n.unread ? 'border-accent-gold/20 bg-accent-gold/5 shadow-[0_0_20px_rgba(198,161,91,0.05)]' : 'border-border-subtle bg-surface hover:border-accent-gold/20'}`}
                    >
                        <div className="relative">
                            <img
                                src={n.user.avatar}
                                className="h-10 w-10 shrink-0 rounded-xl object-cover md:h-12 md:w-12"
                                alt=""
                            />
                            {n.unread && (
                                <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-bg-dark bg-accent-gold md:h-3 md:w-3" />
                            )}
                        </div>
                        <div className="min-w-0 flex-grow">
                            <div className="mb-1 flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-bold text-text-primary transition-colors group-hover:text-accent-gold md:text-base">
                                    {n.title}
                                </span>
                                <span className="shrink-0 font-mono text-[9px] text-text-muted md:text-[10px]">
                                    {n.time}
                                </span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-relaxed text-text-muted md:line-clamp-none md:text-sm">
                                {n.message}
                            </p>
                        </div>
                        <div className="hidden self-center p-2 text-text-muted transition-colors group-hover:text-accent-gold sm:block">
                            <ChevronRight size={18} />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function SearchView({
    query,
    setQuery,
}: {
    query: string;
    setQuery: (q: string) => void;
}) {
    const { rooms } = useData();
    const recentSearches = [
        "Nana's wedding",
        'Harvest ceremony',
        'Arrival 1974',
        'Ancestors',
    ];

    const filteredResults = useMemo(() => {
        if (!query) return [];
        const q = query.toLowerCase();
        return rooms.filter(
            (room) =>
                room.name.toLowerCase().includes(q) ||
                room.description.toLowerCase().includes(q) ||
                room.members.some((m) => m.name.toLowerCase().includes(q)),
        );
    }, [query, rooms]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl"
        >
            <div className="mb-8 md:mb-12">
                <h2 className="mb-4 text-2xl leading-tight font-bold text-text-primary md:mb-6 md:text-3xl">
                    Archive Search
                </h2>
                <div className="group relative max-w-2xl">
                    <Search
                        className="absolute top-1/2 left-5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold md:left-6 md:size-[24px]"
                        size={20}
                    />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search for names, events, or members..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full rounded-2xl border border-border-subtle bg-surface py-4 pr-12 pl-14 text-base text-text-primary shadow-xl transition-all focus:border-accent-gold/50 focus:outline-none md:rounded-3xl md:py-6 md:pl-16 md:text-lg"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute top-1/2 right-6 -translate-y-1/2 text-text-muted hover:text-text-primary"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {!query ? (
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
                    <div>
                        <h3 className="mb-4 text-[10px] font-bold tracking-widest text-text-muted uppercase md:mb-6 md:text-xs">
                            Recent Searches
                        </h3>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {recentSearches.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setQuery(s)}
                                    className="group flex items-center gap-2 rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-xs text-text-muted transition-all hover:border-accent-gold/40 hover:text-text-primary md:gap-3 md:rounded-2xl md:px-5 md:py-3 md:text-sm"
                                >
                                    <Clock
                                        size={12}
                                        className="group-hover:text-accent-gold md:size-[14px]"
                                    />
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 text-[10px] font-bold tracking-widest text-text-muted uppercase md:mb-6 md:text-xs">
                            Discovery Categories
                        </h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                            {[
                                {
                                    label: 'Oral Histories',
                                    count: 42,
                                    icon: MessageSquare,
                                },
                                {
                                    label: 'Ancestral Maps',
                                    count: 12,
                                    icon: Globe,
                                },
                                {
                                    label: 'Film Archives',
                                    count: 18,
                                    icon: Video,
                                },
                                { label: 'Artifacts', count: 31, icon: Camera },
                            ].map((c) => (
                                <div
                                    key={c.label}
                                    className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border-subtle bg-surface/30 p-4 transition-all hover:border-accent-gold/20 md:block md:p-5"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface md:h-auto md:w-auto md:bg-transparent">
                                        <c.icon
                                            size={18}
                                            className="text-text-muted transition-colors group-hover:text-accent-gold"
                                        />
                                    </div>
                                    <div>
                                        <span className="block text-sm leading-tight font-bold text-text-primary">
                                            {c.label}
                                        </span>
                                        <span className="mt-0.5 block font-mono text-[9px] tracking-widest text-text-muted uppercase md:text-[10px]">
                                            {c.count} items
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4">
                        <h3 className="shrink-0 text-[10px] font-bold tracking-widest text-text-muted uppercase md:text-xs">
                            Search Results
                        </h3>
                        <div className="h-px flex-grow bg-border-subtle" />
                        <span className="shrink-0 text-[10px] font-bold text-accent-gold md:text-xs">
                            {filteredResults.length} found
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
                        {filteredResults.map((room) => (
                            <div key={room.id}>
                                <RoomCard room={room} />
                            </div>
                        ))}
                    </div>

                    {filteredResults.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border-subtle bg-surface text-text-muted opacity-50">
                                <Search size={32} />
                            </div>
                            <p className="text-sm text-text-muted italic">
                                No rooms found matching "{query}"
                            </p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}

function SettingsView() {
    const [activeSection, setActiveSection] = useState('Profile');

    const sections = [
        { id: 'Profile', icon: User, label: 'Profile' },
        { id: 'House', icon: Globe, label: 'House' },
        { id: 'Privacy', icon: Lock, label: 'Privacy' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex max-w-6xl flex-col gap-8 md:gap-12 lg:flex-row"
        >
            {/* Settings Navigation */}
            <div className="w-full shrink-0 lg:w-64">
                <h2 className="mb-6 text-2xl leading-tight font-bold text-text-primary md:mb-8 md:text-3xl">
                    Settings
                </h2>
                <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-border-subtle bg-surface/50 p-1.5 lg:flex-col">
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`flex shrink-0 items-center gap-2.5 rounded-xl p-3.5 text-[10px] font-bold transition-all md:gap-3 md:p-4 md:text-sm ${activeSection === s.id ? 'bg-accent-gold text-bg-dark shadow-lg shadow-accent-gold/20' : 'text-text-muted hover:bg-white/5 hover:text-text-primary'}`}
                        >
                            <s.icon size={16} className="md:size-[18px]" />
                            <span>{s.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Settings Content */}
            <div className="flex-grow">
                <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-xl md:p-8 lg:p-12">
                    {activeSection === 'Profile' && (
                        <div className="space-y-6 md:space-y-8">
                            <div className="flex flex-col items-center gap-6 sm:flex-row md:gap-8">
                                <div className="group relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                                        className="h-20 w-20 rounded-[32px] object-cover ring-4 ring-border-subtle md:h-24 md:w-24"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-[32px] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Camera
                                            size={20}
                                            className="text-white"
                                        />
                                    </div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg font-bold text-text-primary md:text-xl">
                                        Adebayo Adeyemi
                                    </h3>
                                    <p className="text-xs text-text-muted md:text-sm">
                                        Custodian since 2021
                                    </p>
                                    <button className="mt-2 text-[10px] font-bold tracking-widest text-accent-gold uppercase hover:underline">
                                        Change Avatar
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="Adebayo Adeyemi"
                                        className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-5 py-3.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50 md:px-6 md:py-4"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        defaultValue="ade@adeyemi.family"
                                        className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-5 py-3.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50 md:px-6 md:py-4"
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Role in House
                                    </label>
                                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-dark p-4 md:p-5">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <ShieldCheck
                                                size={18}
                                                className="shrink-0 text-accent-gold"
                                            />
                                            <span className="truncate text-xs font-bold text-text-primary md:text-sm">
                                                House Administrator
                                            </span>
                                        </div>
                                        <Badge className="shrink-0 border border-accent-gold/30 text-[9px] md:text-[10px]">
                                            Primary
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 md:pt-4">
                                <Button
                                    variant="primary"
                                    icon={Check}
                                    className="w-full px-8 shadow-lg shadow-accent-gold/10 sm:w-auto"
                                >
                                    Save Profile
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'House' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="mb-2 text-xl font-bold text-text-primary">
                                    The Adeyemi Family House
                                </h3>
                                <p className="text-sm text-text-muted">
                                    Manage the overall configuration and
                                    identity of your digital house.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {[
                                    {
                                        label: 'Total Members',
                                        value: mockUsers.length,
                                        icon: User,
                                    },
                                    {
                                        label: 'Stories Preserved',
                                        value: 248,
                                        icon: MessageSquare,
                                    },
                                    {
                                        label: 'Archival Space',
                                        value: '1.2 GB',
                                        icon: Files,
                                    },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-2xl border border-border-subtle bg-bg-dark p-5"
                                    >
                                        <stat.icon
                                            size={16}
                                            className="mb-4 text-accent-gold"
                                        />
                                        <span className="block text-2xl font-bold text-text-primary">
                                            {stat.value}
                                        </span>
                                        <span className="text-[10px] tracking-widest text-text-muted uppercase">
                                            {stat.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold tracking-widest text-text-muted uppercase">
                                    Quick Actions
                                </h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <button className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-dark p-5 text-left transition-all hover:border-accent-gold/40">
                                        <div>
                                            <span className="block font-bold text-text-primary">
                                                Export Archive
                                            </span>
                                            <span className="text-[10px] text-text-muted">
                                                Create a backup of all stories
                                            </span>
                                        </div>
                                        <ChevronRight
                                            size={18}
                                            className="text-text-muted"
                                        />
                                    </button>
                                    <button className="group flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-dark p-5 text-left transition-all hover:border-red-500/40">
                                        <div>
                                            <span className="block font-bold text-text-primary group-hover:text-red-400">
                                                Delete House
                                            </span>
                                            <span className="text-[10px] text-text-muted">
                                                Permanently erase all data
                                            </span>
                                        </div>
                                        <Trash2
                                            size={18}
                                            className="text-text-muted group-hover:text-red-400"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'Privacy' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="mb-2 text-xl font-bold text-text-primary">
                                    Privacy & Access
                                </h3>
                                <p className="text-sm text-text-muted">
                                    Control who can view, edit, and contribute
                                    to your family legacy.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    {
                                        title: 'Global Discovery',
                                        desc: 'Allow distant family to find this house via public search.',
                                        active: false,
                                    },
                                    {
                                        title: 'Member Uploads',
                                        desc: 'Let any member upload stories without moderator approval.',
                                        active: true,
                                    },
                                    {
                                        title: 'High Fidelity Archive',
                                        desc: 'Enable full-quality archiving (uses more storage).',
                                        active: true,
                                    },
                                ].map((p) => (
                                    <div
                                        key={p.title}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <div>
                                            <span className="mb-1 block font-bold text-text-primary">
                                                {p.title}
                                            </span>
                                            <span className="text-xs text-text-muted">
                                                {p.desc}
                                            </span>
                                        </div>
                                        <button
                                            className={`relative h-6 w-12 rounded-full transition-all ${p.active ? 'bg-accent-gold' : 'bg-border-subtle'}`}
                                        >
                                            <div
                                                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${p.active ? 'right-1' : 'left-1'}`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('grid'); // 'grid' or 'list'
    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'search', 'notifications', 'settings'
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
    const [roomPrivacy, setRoomPrivacy] = useState('Public');
    const [isNewStoryOpen, setIsNewStoryOpen] = useState(false);
    const { rooms, addRoom } = useData();
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDesc, setNewRoomDesc] = useState('');

    const handleCreateRoom = () => {
        if (!newRoomName) return;
        addRoom({
            name: newRoomName,
            description: newRoomDesc,
            thumbnail:
                'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', // Default placeholder
        });
        setNewRoomName('');
        setNewRoomDesc('');
        setIsCreateRoomOpen(false);
    };

    const categories = [
        { name: 'Photos', icon: Camera, count: 124 },
        { name: 'Videos', icon: Video, count: 48 },
        { name: 'Stories', icon: MessageSquare, count: 62 },
        { name: 'Family Members', icon: Share2, count: mockUsers.length },
        { name: 'Documents', icon: Files, count: 15 },
    ];

    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const sidebarItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    const filteredRooms = useMemo(() => {
        const query = searchQuery.toLowerCase();

        return rooms.filter((room) => {
            const matchesSearch =
                !searchQuery ||
                room.name.toLowerCase().includes(query) ||
                room.description.toLowerCase().includes(query) ||
                room.members.some((m) => m.name.toLowerCase().includes(query));

            const matchesCategory =
                !activeCategory ||
                (activeCategory === 'Photos' && room.storyCount > 0) || // Mocking category logic
                (activeCategory === 'Videos' && room.id === '1') ||
                (activeCategory === 'Stories' && room.storyCount > 5) ||
                true; // Fallback for other categories in this mock

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory, rooms]);

    return (
        <div className="flex h-dvh min-h-screen flex-col bg-bg-dark md:h-screen md:flex-row">
            {/* Side Rail - Desktop Only */}
            <aside className="sticky top-0 z-50 hidden h-screen w-20 shrink-0 flex-col items-center border-r border-border-subtle bg-bg-dark py-10 md:flex lg:w-24">
                <Link to="/" className="mb-12 shrink-0 px-4">
                    <img
                        src="/logo.png"
                        alt="ULOAK"
                        className="h-auto w-full object-contain"
                    />
                </Link>

                <div className="flex flex-grow flex-col gap-8">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`group relative rounded-2xl p-4 transition-all ${activeView === item.id ? 'bg-accent-gold/10 text-accent-gold shadow-lg shadow-accent-gold/5' : 'text-text-muted hover:bg-surface/50 hover:text-text-primary'}`}
                            title={item.label}
                        >
                            <item.icon size={22} />
                            {activeView === item.id && (
                                <motion.div
                                    layoutId="activeSide"
                                    className="absolute top-1/4 bottom-1/4 left-0 w-1 rounded-r-full bg-accent-gold"
                                />
                            )}
                        </button>
                    ))}
                    <div className="mt-4 flex justify-center">
                        <ThemeToggle />
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="mt-auto shrink-0 p-4 text-text-muted transition-colors hover:text-red-400"
                >
                    <LogOut size={22} />
                </button>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="pointer-events-none fixed right-0 bottom-0 left-0 z-[60] bg-gradient-to-t from-bg-dark via-bg-dark/95 to-transparent px-4 pt-4 pb-8 md:hidden">
                <div className="pointer-events-auto flex items-center justify-around rounded-[28px] border border-white/10 bg-surface/80 p-2 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
                    <button
                        onClick={() => setActiveView('search')}
                        className={`rounded-2xl p-3 transition-all ${activeView === 'search' ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted'}`}
                    >
                        <Search size={22} />
                    </button>
                    <button
                        onClick={() => setActiveView('notifications')}
                        className={`relative rounded-2xl p-3 transition-all ${activeView === 'notifications' ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted'}`}
                    >
                        <Bell size={22} />
                        <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full border border-surface bg-accent-gold" />
                    </button>

                    <button
                        onClick={() => setActiveView('dashboard')}
                        className={`-mt-10 flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-bg-dark transition-all ${activeView === 'dashboard' ? 'bg-accent-gold text-bg-dark shadow-[0_10px_30px_rgba(198,161,91,0.4)]' : 'bg-surface text-text-muted'}`}
                    >
                        <LayoutGrid size={24} />
                    </button>

                    <button
                        onClick={() => setActiveView('settings')}
                        className={`rounded-2xl p-3 transition-all ${activeView === 'settings' ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted'}`}
                    >
                        <Settings size={22} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="rounded-2xl p-3 text-text-muted transition-colors hover:text-red-400"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="w-full flex-grow overflow-y-auto p-5 pb-32 md:p-8 md:pb-8 lg:p-16">
                <div className="mx-auto max-w-7xl">
                    {/* Dashboard Header */}
                    <header className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-semibold tracking-widest text-accent-gold uppercase md:text-xs">
                                The Adeyemi Homestead
                            </span>
                            <h1 className="text-3xl leading-tight font-bold tracking-tight text-text-primary md:text-5xl">
                                Legacy. Love.
                                <br className="md:hidden" /> Together.
                            </h1>
                        </div>
                        <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
                            <div className="hidden items-center gap-2 lg:flex">
                                <AvatarGroup users={mockUsers} />
                                <div className="mx-2 h-8 w-px bg-border-subtle" />
                            </div>
                            <div className="group relative flex-grow">
                                <Search
                                    className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Search rooms or memories..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onFocus={() => {
                                        if (
                                            activeView !== 'dashboard' &&
                                            activeView !== 'search'
                                        ) {
                                            setActiveView('search');
                                        }
                                    }}
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

                    {activeView === 'dashboard' ? (
                        <>
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
                                                {searchQuery
                                                    ? `Results for "${searchQuery}"`
                                                    : 'Your Rooms'}
                                            </h2>
                                            {(searchQuery ||
                                                activeCategory) && (
                                                    <Badge className="border border-accent-gold/20 bg-accent-gold/5 py-1 text-accent-gold">
                                                        Filtered
                                                    </Badge>
                                                )}
                                        </div>
                                        {activeCategory && (
                                            <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                Showing:{' '}
                                                <span className="text-accent-gold">
                                                    {activeCategory}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        {/* Inline Search for Rooms */}
                                        <div className="group relative w-full sm:w-64">
                                            <Search
                                                size={14}
                                                className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Filter rooms..."
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-border-subtle bg-surface/50 py-2 pr-4 pl-10 text-xs text-text-primary transition-all focus:border-accent-gold/30 focus:outline-none"
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() =>
                                                        setSearchQuery('')
                                                    }
                                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-text-muted hover:text-text-primary"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {(searchQuery ||
                                                activeCategory) && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setActiveCategory(null);
                                                        }}
                                                        className="rounded-xl border border-accent-gold/20 bg-accent-gold/10 px-3 py-2 text-[10px] font-bold tracking-widest text-accent-gold uppercase transition-all hover:bg-accent-gold/20"
                                                    >
                                                        Clear All
                                                    </button>
                                                )}
                                            <div className="flex items-center gap-1 rounded-xl border border-border-subtle bg-surface p-1">
                                                <button
                                                    onClick={() =>
                                                        setActiveTab('grid')
                                                    }
                                                    className={`rounded-lg p-2 transition-all ${activeTab === 'grid' ? 'bg-accent-gold text-bg-dark shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                                >
                                                    <LayoutGrid size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setActiveTab('list')
                                                    }
                                                    className={`rounded-lg p-2 transition-all ${activeTab === 'list' ? 'bg-accent-gold text-bg-dark shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                                >
                                                    <List size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {activeTab === 'grid' ? (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
                                        <AnimatePresence mode="popLayout">
                                            {filteredRooms.map((room) => (
                                                <motion.div
                                                    key={room.id}
                                                    layout
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                >
                                                    <RoomCard room={room} />
                                                </motion.div>
                                            ))}

                                            {!searchQuery && (
                                                <motion.div
                                                    layout
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() =>
                                                        setIsCreateRoomOpen(
                                                            true,
                                                        )
                                                    }
                                                    className="group flex h-[300px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border-subtle bg-surface/20 p-8 text-center transition-colors hover:border-accent-gold/40 md:h-[400px]"
                                                >
                                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface text-text-muted transition-colors group-hover:border-accent-gold/40 group-hover:text-accent-gold md:mb-6 md:h-16 md:w-16">
                                                        <Plus size={32} />
                                                    </div>
                                                    <h3 className="mb-2 text-lg font-bold text-text-primary md:text-xl">
                                                        Create New Room
                                                    </h3>
                                                    <p className="text-xs text-text-muted md:text-sm">
                                                        Open a new space for
                                                        special memories.
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {filteredRooms.map((room) => (
                                            <Link
                                                to={`/app/room/${room.id}`}
                                                key={room.id}
                                                className="group flex flex-col justify-between gap-4 rounded-2xl border border-border-subtle bg-surface p-4 transition-all hover:border-accent-gold/40 sm:flex-row sm:items-center md:p-6"
                                            >
                                                <div className="flex items-center gap-4 md:gap-6">
                                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl shadow-lg md:h-16 md:w-16">
                                                        <img
                                                            src={room.thumbnail}
                                                            className="h-full w-full object-cover"
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-text-primary transition-colors group-hover:text-accent-gold md:text-base">
                                                            {room.name}
                                                        </h3>
                                                        <p className="max-w-[200px] truncate text-xs text-text-muted md:max-w-sm md:text-sm">
                                                            {room.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-4 pl-16 sm:justify-end sm:pl-0 md:gap-12">
                                                    <div className="text-left sm:text-right">
                                                        <span className="block text-sm font-bold text-text-primary md:text-base">
                                                            {room.storyCount}
                                                        </span>
                                                        <span className="text-[10px] tracking-widest text-text-muted uppercase">
                                                            Stories
                                                        </span>
                                                    </div>
                                                    <div className="xs:block hidden">
                                                        <AvatarGroup
                                                            users={room.members}
                                                        />
                                                    </div>
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-colors group-hover:text-accent-gold md:h-10 md:w-10">
                                                        <Plus size={16} />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {filteredRooms.length === 0 && (
                                    <div className="py-32 text-center">
                                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border-subtle bg-surface text-text-muted">
                                            <Search size={32} />
                                        </div>
                                        <h3 className="mb-2 text-xl font-bold text-text-primary">
                                            No matching rooms found
                                        </h3>
                                        <p className="text-text-muted">
                                            Try adjusting your search or
                                            category filters.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setActiveCategory(null);
                                            }}
                                            className="mt-6 font-bold text-accent-gold hover:underline"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                )}
                            </section>
                        </>
                    ) : activeView === 'notifications' ? (
                        <NotificationsView />
                    ) : activeView === 'search' ? (
                        <SearchView
                            query={searchQuery}
                            setQuery={setSearchQuery}
                        />
                    ) : (
                        <SettingsView />
                    )}
                </div>
            </main>

            {/* New Story Modal */}
            <AnimatePresence>
                {isNewStoryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-4 backdrop-blur-md md:items-center md:p-8"
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
                            className="relative mb-24 w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-surface p-8 shadow-2xl ring-1 ring-white/5 md:mb-0 md:p-10"
                        >
                            <div className="absolute top-4 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-white/10 md:hidden" />

                            <button
                                onClick={() => setIsNewStoryOpen(false)}
                                className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary md:top-8 md:right-8"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-gold/10 text-accent-gold md:mb-6 md:h-14 md:w-14">
                                    <ShieldCheck size={28} />
                                </div>
                                <h2 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">
                                    Preserving a New Memory
                                </h2>
                                <p className="text-sm leading-relaxed text-text-muted">
                                    Where should this story be placed? Choose a
                                    room to begin preservation.
                                </p>
                            </div>

                            <div className="grid max-h-[50vh] grid-cols-1 gap-3 overflow-y-auto pr-2 pb-10 md:max-h-[40vh] md:gap-4 md:pb-0">
                                {rooms.map((room) => (
                                    <button
                                        key={room.id}
                                        onClick={() => {
                                            // Navigate to room with "add story" context
                                            setIsNewStoryOpen(false);
                                        }}
                                        className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-dark p-4 text-left transition-all hover:border-accent-gold/40"
                                    >
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl md:h-12 md:w-12">
                                            <img
                                                src={room.thumbnail}
                                                className="h-full w-full object-cover"
                                                alt=""
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <span className="block text-sm font-bold text-text-primary transition-colors group-hover:text-accent-gold md:text-base">
                                                {room.name}
                                            </span>
                                            <span className="text-[10px] tracking-widest text-text-muted uppercase">
                                                {room.storyCount} Memories
                                            </span>
                                        </div>
                                        <Plus
                                            size={18}
                                            className="text-text-muted group-hover:text-accent-gold"
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setIsNewStoryOpen(false)}
                                >
                                    Maybe Later
                                </Button>
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => {
                                        setIsNewStoryOpen(false);
                                        setIsCreateRoomOpen(true);
                                    }}
                                >
                                    New Room
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Room Modal */}
            <AnimatePresence>
                {isCreateRoomOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-4 backdrop-blur-md md:items-center md:p-8"
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

                            <div className="flex flex-col gap-6 pb-12 md:pb-0">
                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Room Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., The Heritage Hall"
                                        value={newRoomName}
                                        onChange={(e) =>
                                            setNewRoomName(e.target.value)
                                        }
                                        className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Room Description
                                    </label>
                                    <textarea
                                        placeholder="Describe the purpose of this space..."
                                        rows={3}
                                        value={newRoomDesc}
                                        onChange={(e) =>
                                            setNewRoomDesc(e.target.value)
                                        }
                                        className="w-full resize-none rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Privacy Level
                                    </label>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {[
                                            {
                                                id: 'Public',
                                                icon: Globe,
                                                desc: 'Open to house',
                                            },
                                            {
                                                id: 'Private',
                                                icon: Lock,
                                                desc: 'Only you',
                                            },
                                            {
                                                id: 'Invite',
                                                icon: User,
                                                desc: 'By invitation',
                                            },
                                        ].map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() =>
                                                    setRoomPrivacy(p.id)
                                                }
                                                className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all ${roomPrivacy === p.id ? 'border-accent-gold bg-accent-gold/10 shadow-sm' : 'border-border-subtle bg-bg-dark text-text-muted hover:border-accent-gold/40'}`}
                                            >
                                                <p.icon
                                                    size={16}
                                                    className={
                                                        roomPrivacy === p.id
                                                            ? 'text-accent-gold'
                                                            : 'text-text-muted'
                                                    }
                                                />
                                                <div className="flex flex-col">
                                                    <span
                                                        className={`text-[10px] font-bold tracking-widest uppercase ${roomPrivacy === p.id ? 'text-text-primary' : 'text-text-muted'}`}
                                                    >
                                                        {p.id}
                                                    </span>
                                                    <span className="text-[8px] text-text-muted/60 lowercase">
                                                        {p.desc}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            setIsCreateRoomOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="w-full"
                                        onClick={handleCreateRoom}
                                    >
                                        Create Room
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
