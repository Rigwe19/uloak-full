import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Heart, ChevronRight } from 'lucide-react';
import React from 'react';
import PersonLayout from '@/layouts/person-layout';
import type { Person } from '@/types/person';

interface MemoriesProps {
    person: Person;
    memories: any;
}

export default function Memories({ person, memories }: MemoriesProps) {
    return (
        <PersonLayout person={person}>
            <Head title={(person.name || 'Memories') + ' - Ulo of Stories'} />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {memories?.data?.length > 0 ? (
                    memories.data.map((link: any) => (
                        <a
                            key={link.id}
                            href={link.story ? `/dashboard/rooms/${link.story.room?.slug}/stories/${link.story.id}` : '#'}
                            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface/50 p-4 backdrop-blur-sm transition-all hover:border-accent-gold/30"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-gold/10">
                                <Heart size={18} className="text-accent-gold" />
                            </div>
                            <div className="min-w-0 grow">
                                <p className="truncate text-sm font-bold text-text-primary">
                                    {link.story?.title || 'Untitled Memory'}
                                </p>
                                <p className="text-xs text-text-muted capitalize">
                                    {link.role ? `Role: ${link.role}` : 'Shared memory'}
                                </p>
                            </div>
                            <ChevronRight size={16} className="shrink-0 text-text-muted" />
                        </a>
                    ))
                ) : (
                    <div className="flex flex-col items-center gap-3 py-16">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold/10">
                            <Heart size={32} className="text-accent-gold/60" />
                        </div>
                        <p className="text-sm text-text-muted italic">No memories shared yet.</p>
                        <p className="text-xs text-text-muted/60">Memories contributed by family members will appear here.</p>
                    </div>
                )}
            </motion.div>
        </PersonLayout>
    );
}
