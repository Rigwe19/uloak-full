import React, { useState } from 'react';
import {
    Search,
    Grid,
    List as ListIcon,
    MoreHorizontal,
    MessageSquare,
    Clock,
    Filter,
    Layers,
} from 'lucide-react';
import { Button } from '../../components/UI';

export default function Rooms() {
    const [view, setView] = useState<'grid' | 'list'>('grid');

    const rooms = [
        {
            id: '1',
            name: 'Grandma’s Kitchen',
            owner: 'Chioma Ade',
            memories: 24,
            lastUpdate: '2 hours ago',
            image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29b?w=800&q=80',
        },
        {
            id: '2',
            name: 'Accra Office 1962',
            owner: 'Kwame Mensah',
            memories: 115,
            lastUpdate: '1 day ago',
            image: 'https://images.unsplash.com/photo-1522071823991-b99c123adbb0?w=800&q=80',
        },
        {
            id: '3',
            name: 'The Wedding Chest',
            owner: 'Zainab Bello',
            memories: 42,
            lastUpdate: '3 days ago',
            image: 'https://images.unsplash.com/photo-1529209076408-5a115ec9f1c0?w=800&q=80',
        },
        {
            id: '4',
            name: 'Freetown Sketches',
            owner: 'Kofi Annan',
            memories: 12,
            lastUpdate: '1 week ago',
            image: 'https://images.unsplash.com/photo-1516281703302-99b0010cd36e?w=800&q=80',
        },
        {
            id: '5',
            name: 'Legacy Library',
            owner: 'Reinhard I',
            memories: 256,
            lastUpdate: 'Just now',
            image: 'https://images.unsplash.com/photo-1507679799987-c7377bc58529?w=800&q=80',
        },
        {
            id: '6',
            name: 'Ancestral Maps',
            owner: 'Sarah J',
            memories: 8,
            lastUpdate: '2 weeks ago',
            image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=800&q=80',
        },
    ];

    return (
        <div className="animate-in space-y-8 duration-700 fade-in">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                        Rooms Directory
                    </h1>
                    <p className="mt-2 text-text-muted">
                        Oversee all spaces created within the platform by users.
                    </p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-1.5">
                    <button
                        onClick={() => setView('grid')}
                        className={`rounded-xl p-2 transition-all ${view === 'grid' ? 'bg-accent-gold text-bg-dark' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`rounded-xl p-2 transition-all ${view === 'list' ? 'bg-accent-gold text-bg-dark' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        <ListIcon size={18} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="relative w-full md:max-w-md">
                    <Search
                        className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search rooms or owners..."
                        className="w-full rounded-2xl border border-border-subtle bg-surface py-3.5 pr-4 pl-12 text-sm text-text-primary transition-all outline-none focus:border-accent-gold"
                    />
                </div>
                <div className="flex w-full items-center gap-4 md:w-auto">
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-surface px-6 py-3 text-xs font-bold text-text-muted transition-all hover:text-text-primary md:flex-none">
                        <Filter size={16} /> Filter
                    </button>
                    <div className="hidden h-8 w-px bg-border-subtle md:block" />
                    <p className="text-xs font-bold tracking-widest text-text-muted uppercase">
                        {rooms.length} Active Spaces
                    </p>
                </div>
            </div>

            {view === 'grid' ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="group overflow-hidden rounded-[2.5rem] border border-border-subtle bg-surface transition-all hover:border-accent-gold/40 hover:shadow-2xl hover:shadow-accent-gold/5"
                        >
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={room.image}
                                    alt={room.name}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="absolute top-4 right-4 rounded-full border border-white/10 bg-bg-dark/80 px-3 py-1.5 text-[9px] font-bold tracking-widest capitalize backdrop-blur-md">
                                    Active Space
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-text-primary transition-colors group-hover:text-accent-gold">
                                        {room.name}
                                    </h3>
                                    <button className="text-text-muted transition-colors hover:text-text-primary">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                                <p className="mb-8 text-xs font-medium text-text-muted">
                                    Owned by{' '}
                                    <span className="text-text-primary">
                                        {room.owner}
                                    </span>
                                </p>

                                <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-text-muted">
                                            <Layers size={14} />
                                            <span className="text-[10px] font-bold tracking-tight uppercase">
                                                {room.memories} Items
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-text-muted">
                                            <MessageSquare size={14} />
                                            <span className="text-[10px] font-bold tracking-tight uppercase">
                                                12 Chat
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-accent-gold">
                                        <Clock size={12} />
                                        <span className="text-[9px] font-bold tracking-widest uppercase">
                                            {room.lastUpdate}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-hidden rounded-[2rem] border border-border-subtle bg-surface">
                    <table className="w-full text-left">
                        <thead className="border-b border-border-subtle bg-bg-dark/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Space Name
                                </th>
                                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Owner
                                </th>
                                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Activity
                                </th>
                                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Items
                                </th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {rooms.map((room) => (
                                <tr
                                    key={room.id}
                                    className="hover:bg-surface-light transition-colors"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border-subtle">
                                                <img
                                                    src={room.image}
                                                    alt={room.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-text-primary">
                                                {room.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-text-muted">
                                        {room.owner}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-text-primary">
                                                Modified
                                            </span>
                                            <span className="text-[10px] text-text-muted italic">
                                                {room.lastUpdate}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-dark px-3 py-1 text-[10px] font-bold text-accent-gold">
                                            <Layers size={10} />
                                            {room.memories}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-text-muted transition-colors hover:text-accent-gold">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
