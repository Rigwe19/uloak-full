import { Users } from 'lucide-react';
import React from 'react';
import type { TaggedStoryPerson } from '@/types/feed';

interface TaggedPeopleProps {
    people?: TaggedStoryPerson[];
    /**
     * Base path for person-room links, e.g. `/dashboard/rooms`,
     * `/house/rooms`, `/family/rooms`, `/share/rooms`, `/client/rooms`.
     */
    basePath: string;
    /** Profile path for people without a person room (dashboard only). */
    profilePath?: string;
    className?: string;
}

/**
 * "Ada · Chidi · Ngozi" — tagged people on a story. Each name links to
 * the person's archive (Person Room when one exists, profile otherwise).
 * Renders nothing when nobody is tagged.
 */
export function TaggedPeople({
    people = [],
    basePath,
    profilePath,
    className = '',
}: TaggedPeopleProps) {
    if (people.length === 0) {
        return null;
    }

    return (
        <span
            className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 ${className}`}
        >
            <Users size={12} className="shrink-0 text-accent-gold" />
            {people.map((person, i) => {
                const href = person.person_room_slug
                    ? `${basePath}/${person.person_room_slug}`
                    : profilePath
                      ? `${profilePath}/${person.uuid}`
                      : null;
                const name = (
                    <span className="transition-colors hover:text-accent-gold">
                        {person.display_name}
                    </span>
                );
                return (
                    <React.Fragment key={person.id}>
                        {i > 0 && <span className="text-text-muted">·</span>}
                        {href ? (
                            <a
                                href={href}
                                onClick={(e) => e.stopPropagation()}
                                className="text-text-muted transition-colors hover:text-accent-gold"
                            >
                                {name}
                            </a>
                        ) : (
                            <span className="text-text-muted">{name}</span>
                        )}
                    </React.Fragment>
                );
            })}
        </span>
    );
}
