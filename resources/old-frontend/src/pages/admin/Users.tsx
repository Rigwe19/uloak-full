import React, { useState } from 'react';
import {
    Search,
    UserPlus,
    MoreVertical,
    Shield,
    Mail,
    Trash2,
    Edit2,
    User,
    DoorOpen,
    X,
    Layers,
    Clock,
} from 'lucide-react';
import { Button } from '../../components/UI';
import { motion, AnimatePresence } from 'motion/react';

export default function Users() {
    const [search, setSearch] = useState('');
    const [selectedUserRooms, setSelectedUserRooms] = useState<any | null>(
        null,
    );
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [users, setUsers] = useState([
        {
            id: '1',
            name: 'Kwame Mensah',
            email: 'kwame@ghana.com',
            role: 'admin',
            joinedAt: '2024-03-15',
            status: 'active',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame',
            rooms: [
                {
                    id: '1',
                    name: 'Accra Office 1962',
                    items: 115,
                    lastUpdate: '1 day ago',
                    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
                },
            ],
        },
        {
            id: '2',
            name: 'Zainab Bello',
            email: 'zainab@nigeria.ng',
            role: 'user',
            joinedAt: '2024-03-20',
            status: 'active',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab',
            rooms: [
                {
                    id: '2',
                    name: 'The Wedding Chest',
                    items: 42,
                    lastUpdate: '3 days ago',
                    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80',
                },
            ],
        },
        {
            id: '3',
            name: 'Kofi Annan',
            email: 'kofi@ghana.com',
            role: 'user',
            joinedAt: '2024-04-01',
            status: 'pending',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kofi',
            rooms: [
                {
                    id: '3',
                    name: 'Freetown Sketches',
                    items: 12,
                    lastUpdate: '1 week ago',
                    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
                },
            ],
        },
        {
            id: '4',
            name: 'Chioma Ade',
            email: 'chioma@gmail.com',
            role: 'user',
            joinedAt: '2024-04-10',
            status: 'suspended',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma',
            rooms: [
                {
                    id: '4',
                    name: 'Grandma’s Kitchen',
                    items: 24,
                    lastUpdate: '2 hours ago',
                    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
                },
            ],
        },
    ]);

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="animate-in space-y-8 duration-700 fade-in slide-in-from-bottom-4">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                        User Management
                    </h1>
                    <p className="mt-2 text-text-muted">
                        Manage user identities, access levels, and account
                        statuses within Uloak.
                    </p>
                </div>
                <Button className="flex items-center gap-2">
                    <UserPlus size={18} />
                    Add New User
                </Button>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-border-subtle bg-surface shadow-xl">
                <div className="flex flex-col justify-between gap-6 border-b border-border-subtle bg-surface/50 p-8 backdrop-blur-xl md:flex-row md:items-center">
                    <div className="relative max-w-md flex-1">
                        <Search
                            className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-2xl border border-border-subtle bg-bg-dark py-3 pr-4 pl-12 text-sm text-text-primary transition-all outline-none focus:border-accent-gold"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold tracking-widest text-text-muted uppercase">
                            {filteredUsers.length} Users Found
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-bg-dark/50">
                                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    User
                                </th>
                                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Role
                                </th>
                                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Rooms
                                </th>
                                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Joined
                                </th>
                                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Status
                                </th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-surface-light group/row transition-colors"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-border-subtle">
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-text-primary">
                                                    {user.name}
                                                </p>
                                                <p className="truncate text-xs text-text-muted italic">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div
                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase ${
                                                user.role === 'admin'
                                                    ? 'bg-accent-gold/10 text-accent-gold'
                                                    : 'bg-surface-light border border-border-subtle text-text-muted'
                                            }`}
                                        >
                                            {user.role === 'admin' ? (
                                                <Shield size={10} />
                                            ) : (
                                                <User size={10} />
                                            )}
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() =>
                                                setSelectedUserRooms(user)
                                            }
                                            className="flex items-center gap-2 text-text-muted transition-colors hover:text-accent-gold"
                                        >
                                            <DoorOpen size={16} />
                                            <span className="text-sm font-bold">
                                                {user.rooms?.length || 0}
                                            </span>
                                            <span className="text-[10px] font-bold tracking-tight uppercase opacity-0 transition-opacity group-hover/row:opacity-100">
                                                View Rooms
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-text-muted">
                                        {new Date(
                                            user.joinedAt,
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span
                                            className={`inline-block rounded-full px-3 py-1 text-[9px] font-bold tracking-widest uppercase ${
                                                user.status === 'active'
                                                    ? 'bg-green-400/10 text-green-400'
                                                    : user.status === 'pending'
                                                      ? 'bg-amber-400/10 text-amber-400'
                                                      : 'bg-red-400/10 text-red-100'
                                            }`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="relative flex items-center justify-end">
                                            <button
                                                onClick={() =>
                                                    setActiveDropdown(
                                                        activeDropdown ===
                                                            user.id
                                                            ? null
                                                            : user.id,
                                                    )
                                                }
                                                className={`rounded-xl p-2 transition-all ${activeDropdown === user.id ? 'bg-accent-gold text-bg-dark' : 'hover:bg-surface-light text-text-muted hover:text-text-primary'}`}
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            <AnimatePresence>
                                                {activeDropdown === user.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() =>
                                                                setActiveDropdown(
                                                                    null,
                                                                )
                                                            }
                                                        />
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                scale: 0.95,
                                                                y: 10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                scale: 1,
                                                                y: 0,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                scale: 0.95,
                                                                y: 10,
                                                            }}
                                                            className="absolute top-full right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-2xl"
                                                        >
                                                            <div className="space-y-1 p-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveDropdown(
                                                                            null,
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-xs font-bold text-text-muted transition-all hover:bg-accent-gold/5 hover:text-accent-gold"
                                                                >
                                                                    <Edit2
                                                                        size={
                                                                            14
                                                                        }
                                                                    />{' '}
                                                                    Edit Profile
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveDropdown(
                                                                            null,
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-xs font-bold text-text-muted transition-all hover:bg-accent-gold/5 hover:text-accent-gold"
                                                                >
                                                                    <Shield
                                                                        size={
                                                                            14
                                                                        }
                                                                    />{' '}
                                                                    Change Role
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveDropdown(
                                                                            null,
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-xs font-bold text-text-muted transition-all hover:bg-accent-gold/5 hover:text-accent-gold"
                                                                >
                                                                    <Mail
                                                                        size={
                                                                            14
                                                                        }
                                                                    />{' '}
                                                                    Send Message
                                                                </button>
                                                                <div className="mx-2 my-1 h-px bg-border-subtle" />
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveDropdown(
                                                                            null,
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-xs font-bold text-red-400 transition-all hover:bg-red-400/5"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            14
                                                                        }
                                                                    />{' '}
                                                                    Delete User
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Slide-over for user rooms */}
                <AnimatePresence>
                    {selectedUserRooms && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedUserRooms(null)}
                                className="absolute inset-0 z-40 bg-bg-dark/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{
                                    type: 'spring',
                                    damping: 25,
                                    stiffness: 200,
                                }}
                                className="absolute top-0 right-0 bottom-0 z-50 w-full max-w-md overflow-y-auto border-l border-border-subtle bg-surface"
                            >
                                <div className="p-8">
                                    <div className="mb-8 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold tracking-tight text-text-primary">
                                                {selectedUserRooms.name}'s Rooms
                                            </h3>
                                            <p className="mt-1 text-xs text-text-muted italic">
                                                {selectedUserRooms.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setSelectedUserRooms(null)
                                            }
                                            className="bg-surface-light rounded-full border border-border-subtle p-3 text-text-muted transition-colors hover:text-text-primary"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {selectedUserRooms.rooms.map(
                                            (room: any) => (
                                                <div
                                                    key={room.id}
                                                    className="group overflow-hidden rounded-3xl border border-border-subtle bg-bg-dark transition-all hover:border-accent-gold/40"
                                                >
                                                    <div className="relative aspect-[4/3] overflow-hidden">
                                                        <img
                                                            src={room.image}
                                                            alt={room.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute top-3 right-3 rounded-full border border-white/10 bg-bg-dark/80 px-3 py-1 text-[9px] font-bold tracking-widest uppercase backdrop-blur-md">
                                                            Active Room
                                                        </div>
                                                    </div>
                                                    <div className="p-6">
                                                        <h4 className="mb-1 text-lg font-bold text-text-primary transition-colors group-hover:text-accent-gold">
                                                            {room.name}
                                                        </h4>
                                                        <div className="mt-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-4 text-text-muted">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Layers
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    <span className="text-[10px] font-bold tracking-tight uppercase">
                                                                        {
                                                                            room.items
                                                                        }{' '}
                                                                        Items
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-accent-gold">
                                                                <Clock
                                                                    size={12}
                                                                />
                                                                <span className="text-[9px] font-bold tracking-widest uppercase">
                                                                    {
                                                                        room.lastUpdate
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
