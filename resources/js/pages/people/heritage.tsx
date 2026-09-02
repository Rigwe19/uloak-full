import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Globe, Languages } from 'lucide-react';
import React from 'react';
import PersonLayout from '@/layouts/person-layout';
import type { Person } from '@/types/person';

interface HeritageProps {
    person: Person;
    heritage: any;
    languages: any[];
}

export default function Heritage({
    person,
    heritage,
    languages,
}: HeritageProps) {
    return (
        <PersonLayout person={person}>
            <Head title={(person.name || 'Heritage') + ' - Ulo of Stories'} />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {heritage && (
                    <section className="rounded-xl border border-border-subtle bg-surface p-5">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
                            <Globe size={16} /> Heritage
                        </h3>
                        <dl className="space-y-2 text-sm">
                            {heritage.nationality && (
                                <div>
                                    <dt className="inline text-text-muted">
                                        Nationality:{' '}
                                    </dt>
                                    <dd className="inline text-text-primary">
                                        {heritage.nationality}
                                    </dd>
                                </div>
                            )}
                            {heritage.ethnicity && (
                                <div>
                                    <dt className="inline text-text-muted">
                                        Ethnicity:{' '}
                                    </dt>
                                    <dd className="inline text-text-primary">
                                        {heritage.ethnicity}
                                    </dd>
                                </div>
                            )}
                            {heritage.tribe && (
                                <div>
                                    <dt className="inline text-text-muted">
                                        Tribe:{' '}
                                    </dt>
                                    <dd className="inline text-text-primary">
                                        {heritage.tribe}
                                    </dd>
                                </div>
                            )}
                            {heritage.clan && (
                                <div>
                                    <dt className="inline text-text-muted">
                                        Clan:{' '}
                                    </dt>
                                    <dd className="inline text-text-primary">
                                        {heritage.clan}
                                    </dd>
                                </div>
                            )}
                            {heritage.religion && (
                                <div>
                                    <dt className="inline text-text-muted">
                                        Religion:{' '}
                                    </dt>
                                    <dd className="inline text-text-primary">
                                        {heritage.religion}
                                    </dd>
                                </div>
                            )}
                            {heritage.migration_story && (
                                <div className="mt-3">
                                    <dt className="mb-1 text-sm font-bold text-text-primary">
                                        Migration Story
                                    </dt>
                                    <dd className="text-sm text-text-muted">
                                        {heritage.migration_story}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>
                )}

                {languages && languages.length > 0 && (
                    <section className="rounded-xl border border-border-subtle bg-surface p-5">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
                            <Languages size={16} /> Languages
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {languages.map((l: any) => (
                                <span
                                    key={l.id}
                                    className="rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-medium text-text-primary"
                                >
                                    {l.language}
                                    {l.dialect ? ` (${l.dialect})` : ''}
                                    <span className="ml-1 text-text-muted">
                                        · {l.proficiency}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {!heritage && languages.length === 0 && (
                    <div className="py-16 text-center text-sm text-text-muted italic">
                        No heritage data recorded.
                    </div>
                )}
            </motion.div>
        </PersonLayout>
    );
}
