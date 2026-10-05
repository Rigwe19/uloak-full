import { Check, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';

export interface TaggablePerson {
    id: number;
    uuid: string;
    display_name: string;
}

interface PeopleTagPickerProps {
    people: TaggablePerson[];
    selected: number[];
    onChange: (ids: number[]) => void;
    error?: string;
}

/**
 * "Who's in this story?" multi-select. Renders nothing when the family
 * archive has no people yet, so upload flows keep working regardless.
 */
export function PeopleTagPicker({
    people,
    selected,
    onChange,
    error,
}: PeopleTagPickerProps) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            return people;
        }
        return people.filter((p) =>
            p.display_name.toLowerCase().includes(q),
        );
    }, [people, query]);

    if (people.length === 0) {
        return null;
    }

    const toggle = (id: number) => {
        onChange(
            selected.includes(id)
                ? selected.filter((s) => s !== id)
                : [...selected, id],
        );
    };

    const initials = (name: string) =>
        name
            .split(' ')
            .map((w) => w.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase();

    return (
        <div className="space-y-2">
            <label className="ml-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                <Users size={12} />
                Who&rsquo;s in this story?
                {selected.length > 0 && (
                    <span className="text-accent-gold">
                        ({selected.length} selected)
                    </span>
                )}
            </label>

            {people.length > 6 && (
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search family..."
                    className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 transition-all focus:border-accent-gold/50 focus:outline-none"
                />
            )}

            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1">
                {filtered.map((person) => {
                    const active = selected.includes(person.id);
                    return (
                        <button
                            key={person.id}
                            type="button"
                            onClick={() => toggle(person.id)}
                            aria-pressed={active}
                            className={`flex items-center gap-2 rounded-full border py-1.5 pr-3 pl-1.5 text-xs font-bold transition-all ${
                                active
                                    ? 'border-accent-gold bg-accent-gold/15 text-accent-gold'
                                    : 'border-border-subtle bg-bg-dark text-text-muted hover:border-accent-gold/40 hover:text-text-primary'
                            }`}
                        >
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                                    active
                                        ? 'bg-accent-gold text-bg-dark'
                                        : 'bg-white/10 text-text-muted'
                                }`}
                            >
                                {active ? (
                                    <Check size={12} />
                                ) : (
                                    initials(person.display_name)
                                )}
                            </span>
                            {person.display_name}
                        </button>
                    );
                })}
                {filtered.length === 0 && (
                    <p className="text-xs text-text-muted">
                        No family members match &ldquo;{query}&rdquo;.
                    </p>
                )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
