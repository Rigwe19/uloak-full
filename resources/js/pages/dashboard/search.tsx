import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Search as SearchIcon,
    X,
    Clock,
    MessageSquare,
    Globe,
    Video,
    Camera,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { RoomCard } from '@/components/dashboard/room-card';
import DashboardLayout from '@/layouts/dashboard-layout';

interface SearchProps {
    results: {
        rooms: any[];
        stories: any[];
    };
    query: string;
}

export default function Search({ results, query }: SearchProps) {
    const [searchTerm, setSearchTerm] = useState(query || '');

    const recentSearches = [
        "Nana's wedding",
        'Harvest ceremony',
        'Arrival 1974',
        'Ancestors',
    ];

    const handleSearch = (q: string) => {
        setSearchTerm(q);
        router.get('/dashboard/search', { q }, { preserveState: true });
    };

    return (
        <div className="mx-auto max-w-5xl p-5 pb-32 md:p-8 md:pb-8 lg:p-16">
            <Head title="Archive Search" />

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
                        <SearchIcon
                            className="absolute top-1/2 left-5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold md:left-6 md:size-[24px]"
                            size={20}
                        />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search for names, events, or members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSearch(searchTerm)
                            }
                            className="w-full rounded-2xl border border-border-subtle bg-surface py-4 pr-12 pl-14 text-base text-text-primary shadow-xl transition-all focus:border-accent-gold/50 focus:outline-none md:rounded-3xl md:py-6 md:pl-16 md:text-lg"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    handleSearch('');
                                }}
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
                                        onClick={() => handleSearch(s)}
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
                                    {
                                        label: 'Artifacts',
                                        count: 31,
                                        icon: Camera,
                                    },
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
                            <div className="h-px grow bg-border-subtle" />
                            <span className="shrink-0 text-[10px] font-bold text-accent-gold md:text-xs">
                                {results.rooms.length + results.stories.length}{' '}
                                found
                            </span>
                        </div>

                        {results.rooms.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold tracking-widest text-text-muted uppercase">
                                    Rooms
                                </h4>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
                                    {results.rooms.map((room) => (
                                        <div key={room.id}>
                                            <RoomCard room={room} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.stories.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold tracking-widest text-text-muted uppercase">
                                    Stories
                                </h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {results.stories.map((story) => (
                                        <div
                                            key={story.id}
                                            className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface p-4 transition-all hover:border-accent-gold/20"
                                        >
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-bg-dark">
                                                {story.media_url ? (
                                                    <img
                                                        src={story.media_url}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-text-muted">
                                                        <MessageSquare
                                                            size={20}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grow">
                                                <h5 className="text-sm font-bold text-text-primary group-hover:text-accent-gold">
                                                    {story.title}
                                                </h5>
                                                <p className="line-clamp-1 text-xs text-text-muted">
                                                    {story.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.rooms.length === 0 &&
                            results.stories.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border-subtle bg-surface text-text-muted opacity-50">
                                        <SearchIcon size={32} />
                                    </div>
                                    <p className="text-sm text-text-muted italic">
                                        No results found matching "{query}"
                                    </p>
                                </div>
                            )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
