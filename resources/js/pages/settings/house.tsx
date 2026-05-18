import { Head } from '@inertiajs/react';
import { User, MessageSquare, Files, ChevronRight, Trash2 } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/dashboard/ui';
import DashboardLayout from '@/layouts/dashboard-layout';

export default function House() {
    // Mock stats for now, these should eventually come from props
    const stats = [
        {
            label: 'Total Members',
            value: 12,
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
    ];

    return (
        <>
            <Head title="House Settings" />

            <div className="space-y-8">
                <div>
                    <h3 className="mb-2 text-xl font-bold text-text-primary">
                        The Adeyemi Family House
                    </h3>
                    <p className="text-sm text-text-muted">
                        Manage the overall configuration and identity of your digital house.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {stats.map((stat) => (
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
                            <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
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
        </>
    );
}

