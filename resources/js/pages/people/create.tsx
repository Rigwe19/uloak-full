import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/dashboard/ui';
import InputError from '@/components/input-error';

interface Option {
    value: string;
    label: string;
}

interface CreateProps {
    personTypes: Option[];
    livingStatuses: Option[];
    visibilities: Option[];
}

export default function Create({ personTypes, livingStatuses }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        legal_name: '',
        display_name: '',
        type: 'family_member',
        living_status: 'living',
        birth_date: '',
        death_date: '',
        gender: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/people', { preserveScroll: true });
    };

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <Head title="Create Person - Uloak" />

            <Link
                href="/dashboard"
                className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-primary"
            >
                <ArrowLeft size={16} />
                Dashboard
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="mb-8 text-2xl font-bold text-text-primary">Create Person</h1>

                <form onSubmit={submit} className="space-y-8">
                    <section className="rounded-xl border border-border-subtle bg-surface p-6">
                        <h2 className="mb-4 text-sm font-bold text-text-primary">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-text-muted">Legal Name *</label>
                                <input
                                    value={data.legal_name}
                                    onChange={(e) => setData('legal_name', e.target.value)}
                                    placeholder="Full legal name"
                                    className="w-full rounded-lg border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30"
                                />
                                <InputError message={errors.legal_name} />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-text-muted">Display Name</label>
                                <input
                                    value={data.display_name}
                                    onChange={(e) => setData('display_name', e.target.value)}
                                    placeholder="Name shown on profile"
                                    className="w-full rounded-lg border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-text-muted">Type</label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full rounded-lg border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30"
                                    >
                                        {personTypes.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.type} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-text-muted">Living Status</label>
                                    <select
                                        value={data.living_status}
                                        onChange={(e) => setData('living_status', e.target.value)}
                                        className="w-full rounded-lg border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30"
                                    >
                                        {livingStatuses.map((s) => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.living_status} />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-text-muted">Gender</label>
                                <input
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    placeholder="e.g. Male, Female, Non-binary"
                                    className="w-full rounded-lg border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30"
                                />
                                <InputError message={errors.gender} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-text-muted">Birth Date</label>
                                    <input
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                        className="w-full rounded-lg border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30"
                                    />
                                    <InputError message={errors.birth_date} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-text-muted">Death Date</label>
                                    <input
                                        type="date"
                                        value={data.death_date}
                                        onChange={(e) => setData('death_date', e.target.value)}
                                        className="w-full rounded-lg border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30"
                                    />
                                    <InputError message={errors.death_date} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-6 py-3 text-sm font-medium text-text-muted transition-all hover:bg-white/5 hover:text-text-primary"
                        >
                            Cancel
                        </Link>
                        <Button type="submit" disabled={processing} icon={Plus}>
                            {processing ? 'Creating...' : 'Create Person'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
