import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    DoorOpen, 
    Users as UsersIcon,
    History,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Trash2,
    Lock,
    Unlock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/dashboard/ui';

interface Room {
    id: number;
    name: string;
    description: string;
    slug: string;
    created_at: string;
    members: any[];
}

interface Props {
    rooms: Room[];
}

export default function AdminRooms({ rooms }: Props) {
    return (
        <AdminLayout>
            <Head title="Manage Rooms" />
            
            <div className="space-y-10 p-6 md:p-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                            Memory Rooms
                        </h1>
                        <p className="mt-2 text-text-muted">
                            Oversee the spatial containers where legacy is preserved.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" size={16} />
                            <input 
                                type="text"
                                placeholder="Search rooms..."
                                className="h-10 w-64 rounded-xl border border-border-subtle bg-surface/50 pl-10 pr-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter size={16} /> Filter
                        </Button>
                    </div>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {rooms.map((room, i) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="group flex flex-col rounded-3xl border border-border-subtle bg-surface/20 p-6 transition-all hover:border-accent-gold/20 hover:shadow-2xl hover:shadow-accent-gold/5"
                        >
                            <div className="mb-6 flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-gold/10 text-accent-gold shadow-inner">
                                    <DoorOpen size={24} />
                                </div>
                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button className="rounded-lg p-2 text-text-muted transition-all hover:bg-surface hover:text-accent-gold" title="View Room">
                                        <Eye size={16} />
                                    </button>
                                    <button className="rounded-lg p-2 text-text-muted transition-all hover:bg-surface hover:text-red-400" title="Delete Room">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-auto space-y-2">
                                <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-gold transition-colors">
                                    {room.name}
                                </h3>
                                <p className="line-clamp-2 text-xs text-text-muted">
                                    {room.description || 'No description provided for this room.'}
                                </p>
                            </div>

                            <div className="mt-8 flex items-center justify-between border-t border-border-subtle/50 pt-6">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {room.members.slice(0, 3).map((member, j) => (
                                        <div key={j} className="h-7 w-7 rounded-lg border-2 border-bg-dark bg-surface shadow-sm ring-1 ring-white/5">
                                            {/* Fallback for member avatar */}
                                            <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-accent-gold">
                                                {member.name?.charAt(0) || 'U'}
                                            </div>
                                        </div>
                                    ))}
                                    {room.members.length > 3 && (
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-bg-dark bg-surface text-[8px] font-bold text-text-muted ring-1 ring-white/5">
                                            +{room.members.length - 3}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    <span className="flex items-center gap-1">
                                        <UsersIcon size={12} /> {room.members.length}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <History size={12} /> {new Date(room.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add Room Placeholder */}
                    <button className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border-subtle bg-transparent p-12 transition-all hover:border-accent-gold/30 hover:bg-accent-gold/5 group">
                        <div className="rounded-2xl bg-surface p-4 text-text-muted transition-all group-hover:scale-110 group-hover:text-accent-gold shadow-lg shadow-black/20">
                            <DoorOpen size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-text-primary">Create New Room</p>
                            <p className="text-xs text-text-muted">Initialize a new memory space</p>
                        </div>
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
