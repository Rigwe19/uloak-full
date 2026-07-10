import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Globe, Languages, Pencil, X, Save, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { Person } from '@/types/person';

interface SettingsHeritageProps {
    person: Person | null;
    heritage: any;
    languages: any[];
}

export default function SettingsHeritage({ person, heritage, languages }: SettingsHeritageProps) {
    const [editing, setEditing] = useState(false);

    const { data, setData, put, processing, errors, wasSuccessful } = useForm({
        heritage: {
            nationality: heritage?.nationality ?? '',
            ethnicity: heritage?.ethnicity ?? '',
            tribe: heritage?.tribe ?? '',
            clan: heritage?.clan ?? '',
            religion: heritage?.religion ?? '',
            migration_story: heritage?.migration_story ?? '',
        },
    });

    useEffect(() => {
        if (wasSuccessful) {
            setEditing(false);
        }
    }, [wasSuccessful]);

    const handleSave = () => {
        put('/settings/person', {
            preserveScroll: true,
        });
    };

    const fields = [
        { key: 'nationality', label: 'Nationality' },
        { key: 'ethnicity', label: 'Ethnicity' },
        { key: 'tribe', label: 'Tribe' },
        { key: 'clan', label: 'Clan' },
        { key: 'religion', label: 'Religion' },
    ] as const;

    const updateField = (key: string, value: string) => {
        setData('heritage', { ...data.heritage, [key]: value });
    };

    return (
        <>
            <Head title={(person?.name || 'Heritage') + ' - Uloak'} />

            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-text-primary">Heritage</h2>
                {editing ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditing(false)}
                            className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-dark px-3 py-1.5 text-xs font-medium text-text-muted transition-all hover:border-red-500/30 hover:text-red-400"
                        >
                            <X size={14} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={processing}
                            className="flex items-center gap-1.5 rounded-lg bg-accent-gold px-3 py-1.5 text-xs font-bold text-bg-dark transition-all hover:bg-accent-gold/90 disabled:opacity-50"
                        >
                            {processing ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface/50 px-3 py-1.5 text-xs font-medium text-text-muted transition-all hover:border-accent-gold/30 hover:text-accent-gold"
                    >
                        <Pencil size={14} />
                        Edit
                    </button>
                )}
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {editing ? (
                    <section className="rounded-xl border border-border-subtle bg-surface p-5">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-text-primary">
                            <Globe size={16} /> Heritage
                        </h3>
                        <div className="space-y-4">
                            {fields.map(({ key, label }) => (
                                <div key={key}>
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">{label}</label>
                                    <input
                                        value={(data.heritage as any)[key]}
                                        onChange={(e) => updateField(key, e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent-gold/50"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">Migration Story</label>
                                <textarea
                                    value={data.heritage.migration_story}
                                    onChange={(e) => updateField('migration_story', e.target.value)}
                                    rows={4}
                                    className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent-gold/50"
                                />
                            </div>
                        </div>
                    </section>
                ) : (
                    heritage && (
                        <section className="rounded-xl border border-border-subtle bg-surface p-5">
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
                                <Globe size={16} /> Heritage
                            </h3>
                            <dl className="space-y-2 text-sm">
                                {heritage.nationality && <div><dt className="inline text-text-muted">Nationality: </dt><dd className="inline text-text-primary">{heritage.nationality}</dd></div>}
                                {heritage.ethnicity && <div><dt className="inline text-text-muted">Ethnicity: </dt><dd className="inline text-text-primary">{heritage.ethnicity}</dd></div>}
                                {heritage.tribe && <div><dt className="inline text-text-muted">Tribe: </dt><dd className="inline text-text-primary">{heritage.tribe}</dd></div>}
                                {heritage.clan && <div><dt className="inline text-text-muted">Clan: </dt><dd className="inline text-text-primary">{heritage.clan}</dd></div>}
                                {heritage.religion && <div><dt className="inline text-text-muted">Religion: </dt><dd className="inline text-text-primary">{heritage.religion}</dd></div>}
                                {heritage.migration_story && (
                                    <div className="mt-3">
                                        <dt className="mb-1 text-sm font-bold text-text-primary">Migration Story</dt>
                                        <dd className="text-sm text-text-muted">{heritage.migration_story}</dd>
                                    </div>
                                )}
                            </dl>
                        </section>
                    )
                )}

                {languages && languages.length > 0 && (
                    <section className="rounded-xl border border-border-subtle bg-surface p-5">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
                            <Languages size={16} /> Languages
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {languages.map((l: any) => (
                                <span key={l.id} className="rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-medium text-text-primary">
                                    {l.language}{l.dialect ? ` (${l.dialect})` : ''}
                                    <span className="ml-1 text-text-muted">· {l.proficiency}</span>
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {!heritage && languages.length === 0 && !editing && (
                    <div className="py-16 text-center text-sm italic text-text-muted">No heritage data recorded.</div>
                )}
            </motion.div>
        </>
    );
}
