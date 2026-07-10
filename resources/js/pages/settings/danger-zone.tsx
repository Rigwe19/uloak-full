import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2, Archive, Download } from 'lucide-react';
import React from 'react';


export default function SettingsDangerZone() {
    return (
        <>
            <Head title="Danger Zone - Uloak" />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="mb-2">
                    <h2 className="text-lg font-bold tracking-tight text-text-primary">Danger Zone</h2>
                    <p className="mt-1 text-sm text-text-muted">Irreversible actions for your profile and data.</p>
                </div>

                {/* Export Data */}
                <div className="rounded-2xl border border-border-subtle bg-surface/80 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-2 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gold/10">
                                    <Download size={15} className="text-accent-gold" />
                                </div>
                                <h3 className="text-sm font-bold tracking-wide text-text-primary">Export All Data</h3>
                            </div>
                            <p className="max-w-md text-xs leading-relaxed text-text-muted">
                                Download a complete archive of your profile data, memories, media, and family tree information in a portable format.
                            </p>
                        </div>
                        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[10px] font-medium text-text-muted">Coming soon</span>
                    </div>
                </div>

                {/* Archive Person */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-2 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                    <Archive size={15} className="text-amber-400" />
                                </div>
                                <h3 className="text-sm font-bold tracking-wide text-amber-300">Archive Profile</h3>
                            </div>
                            <p className="max-w-md text-xs leading-relaxed text-text-muted">
                                Archive your person profile. It will be hidden from public view but all data will be preserved. You can request reactivation later.
                            </p>
                        </div>
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[10px] font-medium text-amber-400">Coming soon</span>
                    </div>
                </div>

                {/* Delete Account */}
                <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-2 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                                    <Trash2 size={15} className="text-red-400" />
                                </div>
                                <h3 className="text-sm font-bold tracking-wide text-red-300">Delete Account</h3>
                            </div>
                            <p className="max-w-md text-xs leading-relaxed text-text-muted">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                        </div>
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-medium text-red-400">Coming soon</span>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
