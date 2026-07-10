import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Activity as ActivityIcon, 
    Search,
    Filter,
    Calendar,
    User,
    Globe,
    Clock,
    Mail,
    UserX
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/dashboard/ui';
import AdminLayout from '@/layouts/admin-layout';

interface Actor {
    type: 'user' | 'guest';
    name: string;
    email?: string;
}

interface LogEntry {
    id: number;
    actor: Actor;
    description: string;
    ip_address: string;
    created_at: string;
    properties: Record<string, any>;
}

interface Filters {
    search?: string;
    user_id?: string;
    action?: string;
    from?: string;
    to?: string;
}

interface Props {
    logs: {
        data: LogEntry[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Filters;
}

export default function AdminActivityLogs({ logs, filters }: Props) {
    return (
        <AdminLayout>
            <Head title="Activity Logs" />
            
            <div className="space-y-10 p-6 md:p-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                            Activity Logs
                        </h1>
                        <p className="mt-2 text-text-muted">
                            Monitor all actions performed by users and guests on the platform.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-3xl border border-border-subtle bg-surface/20 p-6 backdrop-blur-md">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" size={16} />
                            <input 
                                type="text"
                                name="search"
                                placeholder="Search logs..."
                                defaultValue={filters.search}
                                className="h-10 w-full rounded-xl border border-border-subtle bg-surface/50 pl-10 pr-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" size={16} />
                            <input 
                                type="date"
                                name="from"
                                placeholder="From"
                                defaultValue={filters.from}
                                className="h-10 w-full rounded-xl border border-border-subtle bg-surface/50 pl-10 pr-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" size={16} />
                            <input 
                                type="date"
                                name="to"
                                placeholder="To"
                                defaultValue={filters.to}
                                className="h-10 w-full rounded-xl border border-border-subtle bg-surface/50 pl-10 pr-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter size={16} /> Apply Filters
                        </Button>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="overflow-hidden rounded-3xl border border-border-subtle bg-surface/20 backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-border-subtle bg-surface/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">Actor</th>
                                    <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">Action</th>
                                    <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">IP Address</th>
                                    <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-text-muted uppercase">Date/Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle/50">
                                {logs.data.map((log, i) => (
                                    <motion.tr 
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group transition-colors hover:bg-white/5"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`rounded-full p-2 ${log.actor.type === 'user' ? 'bg-accent-gold/20 text-accent-gold' : 'bg-text-muted/20 text-text-muted'}`}>
                                                    {log.actor.type === 'user' ? <User size={14} /> : <UserX size={14} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-text-primary">{log.actor.name}</span>
                                                    {log.actor.email && (
                                                        <span className="flex items-center gap-1 text-xs text-text-muted">
                                                            <Mail size={10} />
                                                            {log.actor.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm text-text-primary">{log.description}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-text-muted">
                                                <Globe size={14} />
                                                <span className="text-sm">{log.ip_address}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-text-muted">
                                                <Clock size={14} />
                                                <span className="text-sm">
                                                    {new Date(log.created_at).toLocaleString(undefined, { 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {logs.links.length > 3 && (
                        <div className="flex items-center justify-center gap-2 border-t border-border-subtle p-6">
                            {logs.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                                        link.active 
                                            ? 'bg-accent-gold text-white' 
                                            : link.url 
                                                ? 'bg-surface hover:bg-surface/80 text-text-primary' 
                                                : 'text-text-muted cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}