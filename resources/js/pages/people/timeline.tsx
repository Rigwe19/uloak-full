import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import React from 'react';
import TimelineEvent from '@/components/people/TimelineEvent';
import PersonLayout from '@/layouts/person-layout';
import type { Person, TimelineEvent as TEvent } from '@/types/person';

interface TimelineProps {
    person: Person;
    events: TEvent[];
}

export default function Timeline({ person, events }: TimelineProps) {
    return (
        <PersonLayout person={person}>
            <Head
                title={
                    (person.name || 'Timeline') +
                    ' - Ulo of Storiesf Storiesf Stories'
                }
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {events.length > 0 ? (
                    <div className="space-y-0">
                        {events.map((event) => (
                            <TimelineEvent key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-16">
                        <Clock size={40} className="text-text-muted/30" />
                        <p className="text-sm text-text-muted italic">
                            No timeline events recorded yet.
                        </p>
                    </div>
                )}
            </motion.div>
        </PersonLayout>
    );
}
