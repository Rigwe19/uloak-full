import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import React from 'react';
import PersonLayout from '@/layouts/person-layout';
import type { Person } from '@/types/person';

interface StoriesProps {
    person: Person;
    stories: any;
}

export default function Stories({ person, stories }: StoriesProps) {
    return (
        <PersonLayout person={person}>
            <Head title={(person.name || 'Stories') + ' - Ulo of Storiesf Stories'} />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {stories?.data?.length > 0 ? (
                    stories.data.map((link: any) => (
                        <a
                            key={link.id}
                            href={link.story ? `/dashboard/rooms/${link.story.room?.slug}/stories/${link.story.id}` : '#'}
                            className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-4 transition-all hover:border-accent-gold/30"
                        >
                            <BookOpen size={20} className="shrink-0 text-accent-gold" />
                            <div className="min-w-0 grow">
                                <p className="text-sm font-bold text-text-primary truncate">
                                    {link.story?.title || 'Untitled Story'}
                                </p>
                                <p className="text-xs text-text-muted capitalize">
                                    Role: {link.role} · {link.story?.type || 'story'}
                                </p>
                            </div>
                            <ChevronRight size={16} className="shrink-0 text-text-muted" />
                        </a>
                    ))
                ) : (
                    <div className="flex flex-col items-center gap-3 py-16">
                        <BookOpen size={40} className="text-text-muted/30" />
                        <p className="text-sm text-text-muted italic">No stories connected yet.</p>
                    </div>
                )}
            </motion.div>
        </PersonLayout>
    );
}
