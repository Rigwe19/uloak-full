import { Head, useForm } from '@inertiajs/react';
import { Check, Lock } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/dashboard/ui';

interface Setting {
    id: string;
    title: string;
    desc: string;
    active: boolean;
}

interface PrivacyProps {
    title?: string;
    settings?: Setting[];
    flash?: { success?: string };
}

export default function Privacy({ settings: initialSettings = [] }: PrivacyProps) {
    const defaults: Setting[] =
        initialSettings.length > 0
            ? initialSettings
            : [
                  { id: 'global_discovery', title: 'Global Discovery', desc: 'Allow distant family to find this house via public search.', active: false },
                  { id: 'member_uploads', title: 'Member Uploads', desc: 'Let any member upload stories without moderator approval.', active: true },
                  { id: 'high_fidelity', title: 'High Fidelity Archive', desc: 'Enable full-quality archiving (uses more storage).', active: true },
              ];

    const { data, setData, put, processing } = useForm({
        settings: defaults,
    });

    const toggleSetting = (id: string) => {
        setData(
            'settings',
            data.settings.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/privacy', { preserveScroll: true });
    };

    return (
        <div className="space-y-8">
            <Head title="Privacy & Access" />

            <div>
                <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-text-primary">
                    <Lock size={20} className="text-accent-gold" />
                    Privacy &amp; Access
                </h3>
                <p className="text-sm text-text-muted">
                    Control who can view, edit, and contribute to your family
                    legacy.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-2">
                    {data.settings.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center justify-between gap-4 py-2"
                        >
                            <div>
                                <span className="mb-1 block font-bold text-text-primary">
                                    {p.title}
                                </span>
                                <span className="text-xs text-text-muted">
                                    {p.desc}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => toggleSetting(p.id)}
                                className={`relative h-6 w-12 shrink-0 rounded-full transition-all ${p.active ? 'bg-accent-gold' : 'bg-border-subtle'}`}
                                aria-pressed={p.active}
                            >
                                <div
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${p.active ? 'right-1' : 'left-1'}`}
                                />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="border-t border-border-subtle pt-6">
                    <Button
                        variant="primary"
                        icon={Check}
                        className="w-full sm:w-auto"
                        type="submit"
                        disabled={processing}
                    >
                        {processing ? 'Saving…' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
