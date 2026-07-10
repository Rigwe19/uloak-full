import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Globe,
    Shield,
    Bell,
    Mail,
    Cpu,
    Save
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/dashboard/ui';
import AdminLayout from '@/layouts/admin-layout';

const tabs = [
    { id: 'general', label: 'General Settings', icon: Globe },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'email', label: 'Email Configuration', icon: Mail },
    { id: 'maintenance', label: 'System Maintenance', icon: Cpu },
];

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <AdminLayout>
            <Head title="Global Settings" />
            
            <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-32 pt-4 md:p-8 md:pb-8 lg:p-10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                        System Configuration
                    </h1>
                    <p className="mt-2 text-sm text-text-muted md:text-base">
                        Manage global platform parameters and system behavior.
                    </p>
                </div>

                {/* Mobile Tab Selector */}
                <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-border-subtle bg-surface/50 p-1.5 md:hidden">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-bold transition-all md:text-xs ${
                                activeTab === tab.id
                                    ? 'bg-accent-gold text-bg-dark shadow-lg shadow-accent-gold/20'
                                    : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                            }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                    {/* Desktop Navigation */}
                    <div className="hidden space-y-2 lg:col-span-1 lg:block">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex w-full items-center gap-4 rounded-2xl px-6 py-4 text-sm font-bold transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-accent-gold/10 text-accent-gold shadow-lg shadow-accent-gold/5'
                                        : 'text-text-muted hover:bg-surface/50 hover:text-text-primary'
                                }`}
                            >
                                <tab.icon size={20} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="space-y-10 lg:col-span-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                {activeTab === 'general' && (
                                    <section className="space-y-8 rounded-3xl border border-border-subtle bg-surface/20 p-6 md:p-10">
                                        <div className="flex items-center gap-4 border-b border-border-subtle pb-6">
                                            <div className="rounded-xl bg-accent-gold/10 p-3 text-accent-gold">
                                                <Globe size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-text-primary md:text-xl">General Configuration</h2>
                                                <p className="text-xs text-text-muted">Core platform metadata and defaults.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
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
                                )}

                                {activeTab === 'security' && (
                                    <section className="space-y-8 rounded-3xl border border-border-subtle bg-surface/20 p-6 md:p-10">
                                        <div className="flex items-center gap-4 border-b border-border-subtle pb-6">
                                            <div className="rounded-xl bg-accent-gold/10 p-3 text-accent-gold">
                                                <Shield size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-text-primary md:text-xl">Security & Auth</h2>
                                                <p className="text-xs text-text-muted">Authentication and access control settings.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Session Lifetime (minutes)</label>
                                                <input 
                                                    type="number" 
                                                    defaultValue="120"
                                                    className="h-12 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Max Login Attempts</label>
                                                <input 
                                                    type="number" 
                                                    defaultValue="5"
                                                    className="h-12 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 md:col-span-2">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="rounded border-border-subtle bg-surface text-accent-gold focus:ring-accent-gold/20"
                                                />
                                                <span className="text-sm text-text-primary">Require email verification for new accounts</span>
                                            </div>
                                            <div className="flex items-center gap-3 md:col-span-2">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="rounded border-border-subtle bg-surface text-accent-gold focus:ring-accent-gold/20"
                                                />
                                                <span className="text-sm text-text-primary">Enable two-factor authentication</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button className="gap-2">
                                                <Save size={18} /> Save Changes
                                            </Button>
                                        </div>
                                    </section>
                                )}

                                {activeTab === 'notifications' && (
                                    <section className="space-y-8 rounded-3xl border border-border-subtle bg-surface/20 p-6 md:p-10">
                                        <div className="flex items-center gap-4 border-b border-border-subtle pb-6">
                                            <div className="rounded-xl bg-accent-gold/10 p-3 text-accent-gold">
                                                <Bell size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-text-primary md:text-xl">Notifications</h2>
                                                <p className="text-xs text-text-muted">Configure platform notification channels and defaults.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-dark/50 p-4">
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">Email Notifications</p>
                                                    <p className="text-xs text-text-muted">Send notifications via email</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="rounded border-border-subtle bg-surface text-accent-gold focus:ring-accent-gold/20"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-dark/50 p-4">
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">In-App Notifications</p>
                                                    <p className="text-xs text-text-muted">Show notifications within the dashboard</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="rounded border-border-subtle bg-surface text-accent-gold focus:ring-accent-gold/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button className="gap-2">
                                                <Save size={18} /> Save Changes
                                            </Button>
                                        </div>
                                    </section>
                                )}

                                {activeTab === 'email' && (
                                    <section className="space-y-8 rounded-3xl border border-border-subtle bg-surface/20 p-6 md:p-10">
                                        <div className="flex items-center gap-4 border-b border-border-subtle pb-6">
                                            <div className="rounded-xl bg-accent-gold/10 p-3 text-accent-gold">
                                                <Mail size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-text-primary md:text-xl">Email Configuration</h2>
                                                <p className="text-xs text-text-muted">Configure email sending settings.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Mail Driver</label>
                                                <select className="h-12 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden">
                                                    <option>SMTP</option>
                                                    <option>Mailgun</option>
                                                    <option>Postmark</option>
                                                    <option>Sendmail</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">From Address</label>
                                                <input 
                                                    type="email" 
                                                    defaultValue="noreply@uloak.com"
                                                    className="h-12 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">SMTP Host</label>
                                                <input 
                                                    type="text" 
                                                    defaultValue="smtp.mailtrap.io"
                                                    className="h-12 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">SMTP Port</label>
                                                <input 
                                                    type="number" 
                                                    defaultValue="587"
                                                    className="h-12 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button className="gap-2">
                                                <Save size={18} /> Save Changes
                                            </Button>
                                        </div>
                                    </section>
                                )}

                                {activeTab === 'maintenance' && (
                                    <section className="space-y-8 rounded-3xl border border-border-subtle bg-surface/20 p-6 md:p-10">
                                        <div className="flex items-center gap-4 border-b border-border-subtle pb-6">
                                            <div className="rounded-xl bg-accent-gold/10 p-3 text-accent-gold">
                                                <Cpu size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-text-primary md:text-xl">System Maintenance</h2>
                                                <p className="text-xs text-text-muted">System tools and maintenance actions.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-dark/50 p-4 md:flex-row md:items-center">
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">Clear Application Cache</p>
                                                    <p className="text-xs text-text-muted">Remove cached views, routes, and config files.</p>
                                                </div>
                                                <Button variant="outline" size="sm">Clear Cache</Button>
                                            </div>
                                            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-dark/50 p-4 md:flex-row md:items-center">
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">Optimize Application</p>
                                                    <p className="text-xs text-text-muted">Cache routes, config, and views for better performance.</p>
                                                </div>
                                                <Button variant="outline" size="sm">Optimize</Button>
                                            </div>
                                        </div>

                                        <div className="space-y-6 rounded-3xl border border-red-500/10 bg-red-500/5 p-6 md:p-8">
                                            <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
                                            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                                                <div>
                                                    <p className="text-sm font-bold text-red-400">Maintenance Mode</p>
                                                    <p className="text-xs text-text-muted">Take the entire platform offline for updates.</p>
                                                </div>
                                                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 shrink-0">
                                                    Enable Maintenance
                                                </Button>
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}