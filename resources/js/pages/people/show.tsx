import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Image, Clock, Globe } from 'lucide-react';
import React from 'react';
import PersonLayout from '@/layouts/person-layout';
import type { Person, PersonStats } from '@/types/person';

interface ShowProps {
    person: Person;
    stats: PersonStats;
}

export default function Show({ person, stats }: ShowProps) {
    return (
        <PersonLayout person={person} stats={stats}>
            <Head title={person.name + ' - Ulo of Storiesf Stories'} />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {person.biography && (
                    <section className="rounded-xl border border-border-subtle bg-surface p-5">
                        <h3 className="mb-2 text-sm font-bold text-text-primary">About</h3>
                        <p className="text-sm leading-relaxed text-text-muted">{person.biography}</p>
                    </section>
                )}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                        { label: 'Stories', value: stats.stories, icon: BookOpen, color: 'text-blue-400' },
                        { label: 'Photos', value: stats.photos, icon: Image, color: 'text-green-400' },
                        { label: 'Videos', value: stats.videos, icon: Image, color: 'text-purple-400' },
                        { label: 'Relationships', value: stats.relationships, icon: Users, color: 'text-accent-gold' },
                        { label: 'Events', value: stats.timeline_events, icon: Clock, color: 'text-orange-400' },
                        { label: 'Contributions', value: stats.contributions, icon: Globe, color: 'text-teal-400' },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-xl border border-border-subtle bg-surface p-4 text-center">
                            <stat.icon size={20} className={`mx-auto mb-1 ${stat.color}`} />
                            <p className="text-lg font-bold text-text-primary">{stat.value}</p>
                            <p className="text-[10px] text-text-muted">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </PersonLayout>
    );
}
