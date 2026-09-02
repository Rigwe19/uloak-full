import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import React from 'react';
import type { Person } from '@/types/person';

interface SettingsStoriesProps {
    person: Person | null;
    stories: any;
}

export default function SettingsStories({
    person,
    stories,
}: SettingsStoriesProps) {
    return (
        <>
            <Head title={(person?.name || 'Stories') + ' - Ulo of Stories'} />

            <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight text-text-primary">
                    Stories
                </h2>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
            >
                {stories?.data?.length > 0 ? (
                    stories.data.map((link: any) => (
                        <a
                            key={link.id}
                            href={
                                link.story
                                    ? `/dashboard/rooms/${link.story.room?.slug}/stories/${link.story.id}`
                                    : '#'
                            }
                            className="group flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-4 transition-all hover:border-accent-gold/30"
                        >
                            <BookOpen
                                size={20}
                                className="shrink-0 text-accent-gold"
                            />
                            <div className="min-w-0 grow">
                                <p className="truncate text-sm font-bold text-text-primary">
                                    {link.story?.title || 'Untitled Story'}
                                </p>
                                <p className="text-xs text-text-muted capitalize">
                                    Role: {link.role} ·{' '}
                                    {link.story?.type || 'story'}
                                </p>
                            </div>
                            <ChevronRight
                                size={16}
                                className="shrink-0 text-text-muted"
                            />
                        </a>
                    ))
                ) : (
                    <div className="flex flex-col items-center gap-3 py-16">
                        <BookOpen size={40} className="text-text-muted/30" />
                        <p className="text-sm text-text-muted italic">
                            No stories connected yet.
                        </p>
                    </div>
                )}
            </motion.div>
        </>
    );
}
