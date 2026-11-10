import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, Archive, Download, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/dashboard/ui';

interface DangerZoneProps {
    archived?: boolean;
    hasPerson?: boolean;
}

export default function SettingsDangerZone({ archived = false, hasPerson = true }: DangerZoneProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [archiving, setArchiving] = useState(false);

    const handleArchive = () => {
        if (!confirm(archived ? 'Reactivate your profile?' : 'Archive your profile? It will be hidden but preserved.')) {
            return;
        }
        setArchiving(true);
        router.post(archived ? '/settings/danger-zone/restore' : '/settings/danger-zone/archive', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setArchiving(false);
                toast.success(archived ? 'Profile reactivated.' : 'Profile archived.');
            },
            onError: () => {
                setArchiving(false);
                toast.error('Could not update profile. Please try again.');
            },
        });
    };

    const handleDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            return;
        }
        setProcessing(true);
        router.delete('/settings/profile', {
            data: { password },
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Danger Zone - Ulo of Stories" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="mb-2">
                    <h2 className="text-lg font-bold tracking-tight text-text-primary">
                        Danger Zone
                    </h2>
                    <p className="mt-1 text-sm text-text-muted">
                        Irreversible actions for your profile and data.
                    </p>
                </div>

                {/* Export Data */}
                <div className="rounded-2xl border border-border-subtle bg-surface/80 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-2 flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gold/10">
                                    <Download size={15} className="text-accent-gold" />
                                </div>
                                <h3 className="text-sm font-bold tracking-wide text-text-primary">
                                    Export All Data
                                </h3>
                            </div>
                            <p className="max-w-md text-xs leading-relaxed text-text-muted">
                                Download a complete archive of your profile data, rooms, and stories in JSON.
                            </p>
                        </div>
                        <a
                            href="/settings/danger-zone/export"
                            className="shrink-0 rounded-full border border-accent-gold/30 bg-accent-gold/10 px-4 py-1.5 text-[10px] font-bold text-accent-gold uppercase transition hover:bg-accent-gold/20"
                        >
                            Download JSON
                        </a>
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
                                <h3 className="text-sm font-bold tracking-wide text-amber-300">
                                    {archived ? 'Profile Archived' : 'Archive Profile'}
                                </h3>
                            </div>
                            <p className="max-w-md text-xs leading-relaxed text-text-muted">
                                {archived
                                    ? 'Your profile is hidden from public view but all data is preserved. Reactivate it whenever you’re ready.'
                                    : 'Archive your person profile. It will be hidden from public view but all data will be preserved. You can request reactivation later.'}
                            </p>
                        </div>
                        {hasPerson ? (
                            <button
                                onClick={handleArchive}
                                disabled={archiving}
                                className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-[10px] font-bold text-amber-400 uppercase transition hover:bg-amber-500/20 disabled:opacity-50"
                            >
                                {archiving ? 'Working…' : archived ? 'Reactivate' : 'Archive'}
                            </button>
                        ) : (
                            <span className="shrink-0 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[10px] font-medium text-text-muted">
                                No profile
                            </span>
                        )}
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
                                <h3 className="text-sm font-bold tracking-wide text-red-300">
                                    Delete Account
                                </h3>
                            </div>
                            <p className="max-w-md text-xs leading-relaxed text-text-muted">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDelete(true)}
                            className="shrink-0 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-[10px] font-bold text-red-400 uppercase transition hover:bg-red-500/20"
                        >
                            Delete
                        </button>
                    </div>

                    {showDelete && (
                        <form
                            onSubmit={handleDelete}
                            className="mt-4 space-y-3 border-t border-red-500/10 pt-4"
                        >
                            <label className="block text-xs text-text-muted">
                                Enter your password to confirm deletion.
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Current password"
                                required
                                autoFocus
                                className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-red-400 focus:outline-none"
                            />
                            <div className="flex gap-2">
                                <Button type="submit" variant="danger" disabled={processing} size="sm">
                                    {processing ? 'Deleting…' : 'Permanently delete'}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowDelete(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </div>

                <p className="flex items-center gap-2 text-xs text-text-muted">
                    <AlertTriangle size={12} />
                    These actions cannot be undone except for profile archive, which can be reactivated.
                </p>
            </motion.div>
        </>
    );
}
