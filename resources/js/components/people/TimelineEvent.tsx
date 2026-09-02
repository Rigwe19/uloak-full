import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import React from 'react';
import type { TimelineEvent as TEvent } from '@/types/person';

export default function TimelineEvent({ event }: { event: TEvent }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative border-l-2 border-accent-gold/30 pb-8 pl-6 last:pb-0"
        >
            <div className="absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2 border-accent-gold bg-bg-dark" />
            <div className="rounded-xl border border-border-subtle bg-surface p-4">
                <h3 className="text-sm font-bold text-text-primary">
                    {event.title}
                </h3>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                    {event.date && (
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {event.date}
                        </span>
                    )}
                    {event.location && (
                        <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {event.location}
                        </span>
                    )}
                </div>
                {event.description && (
                    <p className="mt-2 text-xs leading-relaxed text-text-muted">
                        {event.description}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
