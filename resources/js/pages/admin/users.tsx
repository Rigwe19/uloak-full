import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Users as UsersIcon,
    MoreHorizontal,
    Search,
    Filter,
    Shield,
    ShieldCheck,
    UserX,
    Edit3,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/dashboard/ui';
import AdminLayout from '@/layouts/admin-layout';

interface User {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    avatar_url: string;
    created_at: string;
}

interface Props {
    users: User[];
}

export default function AdminUsers({ users }: Props) {
    return (
        <AdminLayout>
            <Head title="Manage Custodians" />

            <div className="space-y-10 p-6 md:p-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                            Custodians
                        </h1>
                        <p className="mt-2 text-text-muted">
                            Manage the guardians of memories on the Ulo of
                            Stories platform.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Search custodians..."
                                className="h-10 w-full rounded-xl border border-border-subtle bg-surface/50 pr-4 pl-10 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden md:w-64"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter size={16} /> Filter
                        </Button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-3xl border border-border-subtle bg-surface/20 backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-border-subtle bg-surface/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Custodian
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Role
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Joined
                                    </th>
                                    <th className="px-8 py-5 text-right text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle/50">
                                {users.map((user, i) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group transition-colors hover:bg-white/5"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-black/20">
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-text-primary">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-xs text-text-muted">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {user.is_admin ? (
                                                <div className="flex items-center gap-2 text-accent-gold">
                                                    <ShieldCheck size={14} />
                                                    <span className="text-[10px] font-bold tracking-widest uppercase">
                                                        Admin
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-text-muted">
                                                    <Shield size={14} />
                                                    <span className="text-[10px] font-bold tracking-widest uppercase">
                                                        User
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-sm text-text-muted">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button
                                                    className="rounded-lg p-2 text-text-muted transition-all hover:bg-surface hover:text-accent-gold"
                                                    title="Edit User"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    className="rounded-lg p-2 text-text-muted transition-all hover:bg-surface hover:text-red-400"
                                                    title="Deactivate User"
                                                >
                                                    <UserX size={16} />
                                                </button>
                                                <button className="rounded-lg p-2 text-text-muted transition-all hover:bg-surface hover:text-text-primary">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
