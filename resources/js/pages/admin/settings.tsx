import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    Settings as SettingsIcon,
    Globe,
    Shield,
    Bell,
    Mail,
    Database,
    Cpu,
    Save
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/dashboard/ui';

export default function AdminSettings() {
    return (
        <AdminLayout>
            <Head title="Global Settings" />
            
            <div className="mx-auto max-w-5xl space-y-12 p-6 md:p-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                        System Configuration
                    </h1>
                    <p className="mt-2 text-text-muted">
                        Manage global platform parameters and system behavior.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                    {/* Navigation */}
                    <div className="space-y-2 lg:col-span-1">
                        {[
                            { id: 'general', label: 'General Settings', icon: Globe },
                            { id: 'security', label: 'Security & Auth', icon: Shield },
                            { id: 'notifications', label: 'Notifications', icon: Bell },
                            { id: 'email', label: 'Email Configuration', icon: Mail },
                            { id: 'maintenance', label: 'System Maintenance', icon: Cpu },
                        ].map((item, i) => (
                            <button
                                key={item.id}
                                className={`flex w-full items-center gap-4 rounded-2xl px-6 py-4 text-sm font-bold transition-all ${
                                    i === 0 ? 'bg-accent-gold/10 text-accent-gold shadow-lg shadow-accent-gold/5' : 'text-text-muted hover:bg-surface/50 hover:text-text-primary'
                                }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="space-y-10 lg:col-span-2">
                        <section className="space-y-8 rounded-3xl border border-border-subtle bg-surface/20 p-8 md:p-10">
                            <div className="flex items-center gap-4 border-b border-border-subtle pb-6">
                                <div className="rounded-xl bg-accent-gold/10 p-3 text-accent-gold">
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary">General Configuration</h2>
                                    <p className="text-xs text-text-muted">Core platform metadata and defaults.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Platform Name</label>
                                    <input 
                                        type="text" 
                                        defaultValue="ULOAK"
                                        className="h-12 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Support Email</label>
                                    <input 
                                        type="email" 
                                        defaultValue="support@uloak.com"
                                        className="h-12 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Platform Description</label>
                                    <textarea 
                                        rows={4}
                                        defaultValue="The House of Stories. A spatial memory platform for preserving legacy."
                                        className="w-full rounded-xl border border-border-subtle bg-bg-dark p-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button className="gap-2">
                                    <Save size={18} /> Save Changes
                                </Button>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-red-500/10 bg-red-500/5 p-8 md:p-10">
                            <h3 className="mb-4 text-sm font-bold text-red-400">Danger Zone</h3>
                            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                                <div>
                                    <p className="text-sm font-bold text-red-400">Maintenance Mode</p>
                                    <p className="text-xs text-text-muted">Take the entire platform offline for updates.</p>
                                </div>
                                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                                    Enable Maintenance
                                </Button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
