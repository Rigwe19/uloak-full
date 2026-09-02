import { User, Calendar, MapPin } from 'lucide-react';
import React from 'react';
import type { Person } from '@/types/person';

export default function PersonHeader({
    person,
    compact = false,
}: {
    person: Person;
    compact?: boolean;
}) {
    return (
        <div className={`flex items-center gap-4 ${compact ? 'py-2' : 'py-6'}`}>
            <div
                className={`flex shrink-0 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold ${
                    compact ? 'h-10 w-10 text-sm' : 'h-16 w-16 text-2xl'
                }`}
            >
                {person.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
                <h2
                    className={`font-bold text-text-primary ${compact ? 'text-sm' : 'text-xl'}`}
                >
                    {person.name}
                </h2>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                    {person.birth_date && (
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {person.birth_date}
                            {person.death_date ? ` - ${person.death_date}` : ''}
                        </span>
                    )}
                    {person.birth_place && (
                        <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {person.birth_place}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
