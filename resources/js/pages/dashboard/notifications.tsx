import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { MoreVertical, Bell, ChevronRight } from 'lucide-react';
import React from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';

interface Notification {
    id: string;
    type: string;
    data: {
        title: string;
        message: string;
        action_url?: string;
        user_name?: string;
        user_avatar?: string;
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationsProps {
    notifications: {
        data: Notification[];
        links: any[];
    };
}

export default function Notifications({ notifications }: NotificationsProps) {
    const [filter, setFilter] = React.useState('All');

    const markAsRead = (id: string) => {
        router.post(`/dashboard/notifications/${id}/read`);
    };

    const filteredNotifications = notifications.data.filter((n) => {
        if (filter === 'All') {
return true;
}

        if (filter === 'Unread') {
return !n.read_at;
}

        return true;
    });

    return (
        <div className="mx-auto max-w-4xl p-5 pb-32 md:p-8 md:pb-8 lg:p-16">
            <Head title="Notifications" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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
                                className={`rounded-lg px-4 py-1.5 text-[10px] font-bold transition-all md:text-xs ${
                                    filter === f 
                                    ? 'bg-accent-gold text-bg-dark shadow-lg shadow-accent-gold/20' 
                                    : 'text-text-muted hover:text-text-primary'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => !n.read_at && markAsRead(n.id)}
                                className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all md:gap-4 md:p-6 ${
                                    !n.read_at 
                                    ? 'border-accent-gold/20 bg-accent-gold/5 shadow-[0_0_20px_rgba(198,161,91,0.05)]' 
                                    : 'border-border-subtle bg-surface hover:border-accent-gold/20'
                                }`}
                            >
                                <div className="relative">
                                    {n.data.user_avatar ? (
                                        <img
                                            src={n.data.user_avatar}
                                            className="h-10 w-10 shrink-0 rounded-xl object-cover md:h-12 md:w-12"
                                            alt=""
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-accent-gold md:h-12 md:w-12">
                                            <Bell size={20} />
                                        </div>
                                    )}
                                    {!n.read_at && (
                                        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-bg-dark bg-accent-gold md:h-3 md:w-3" />
                                    )}
                                </div>
                                <div className="min-w-0 grow">
                                    <div className="mb-1 flex items-center justify-between gap-2">
                                        <span className={`truncate text-sm font-bold transition-colors group-hover:text-accent-gold md:text-base ${
                                            !n.read_at ? 'text-text-primary' : 'text-text-primary/80'
                                        }`}>
                                            {n.data.title || 'Notification'}
                                        </span>
                                        <span className="shrink-0 font-mono text-[9px] text-text-muted md:text-[10px]">
                                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="line-clamp-2 text-xs leading-relaxed text-text-muted md:line-clamp-none md:text-sm">
                                        {n.data.message}
                                    </p>
                                </div>
                                <div className="hidden self-center p-2 text-text-muted transition-colors group-hover:text-accent-gold sm:block">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border-subtle bg-surface text-text-muted opacity-50">
                                <Bell size={32} />
                            </div>
                            <p className="text-sm text-text-muted italic">
                                No {filter === 'Unread' ? 'unread' : ''} notifications found
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

