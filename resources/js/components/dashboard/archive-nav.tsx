import { ArrowRight, Crown, Home, User } from 'lucide-react';
import React from 'react';

export interface ArchiveNavEntry {
    id: number;
    slug: string;
    name: string;
    kind: 'root' | 'branch' | 'person' | string;
    thumbnail: string | null;
    person_name?: string | null;
    archive_count: number;
}

interface ArchiveNavProps {
    entries: ArchiveNavEntry[];
}

/**
 * Family Archive navigation strip above the room grid. Root first, then
 * branches, then people with content (empty person rooms stay hidden until
 * they hold meaningful content). Renders nothing when the family has no
 * structural rooms yet, leaving the existing grid untouched.
 */
export function ArchiveNav({ entries }: ArchiveNavProps) {
    if (entries.length === 0) {
        return null;
    }

    const roots = entries.filter((e) => e.kind === 'root');
    const branches = entries.filter((e) => e.kind === 'branch');
    const people = entries.filter(
        (e) => e.kind === 'person' && e.archive_count > 0,
    );

    const roomUrl = (slug: string) => `/dashboard/rooms/${slug}`;

    return (
        <section className="mb-16 md:mb-20">
            <div className="mb-6 flex items-center gap-3">
                <h2 className="text-xl font-bold text-text-primary md:text-2xl">
                    Family Archive
                </h2>
                <span className="rounded-full border border-accent-gold/20 bg-accent-gold/5 px-3 py-1 text-[10px] font-bold tracking-widest text-accent-gold uppercase">
                    {entries.length}{' '}
                    {entries.length === 1 ? 'Archive' : 'Archives'}
                </span>
            </div>

            {roots.map((root) => (
                <a
                    key={root.id}
                    href={roomUrl(root.slug)}
                    className="group mb-4 flex items-center gap-4 rounded-3xl border border-accent-gold/20 bg-surface p-4 transition-all hover:border-accent-gold/50 md:p-6"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent-gold/10 text-accent-gold md:h-14 md:w-14">
                        {root.thumbnail ? (
                            <img
                                src={root.thumbnail}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Crown size={24} />
                        )}
                    </div>
                    <div className="min-w-0 grow">
                        <p className="truncate text-base font-bold text-text-primary transition-colors group-hover:text-accent-gold md:text-lg">
                            {root.name}
                        </p>
                        <p className="text-xs text-text-muted">
                            {root.archive_count}{' '}
                            {root.archive_count === 1
                                ? 'memory'
                                : 'memories'}{' '}
                            preserved
                        </p>
                    </div>
                    <ArrowRight
                        size={18}
                        className="shrink-0 text-text-muted transition-all group-hover:translate-x-1 group-hover:text-accent-gold"
                    />
                </a>
            ))}

            {branches.length > 0 && (
                <div className="mb-4">
                    <p className="mb-3 ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                        Branches
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {branches.map((branch) => (
                            <a
                                key={branch.id}
                                href={roomUrl(branch.slug)}
                                className="group flex min-w-52 shrink-0 items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-3 transition-all hover:border-accent-gold/40"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5 text-accent-gold">
                                    {branch.thumbnail ? (
                                        <img
                                            src={branch.thumbnail}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Home size={18} />
                                    )}
                                </div>
                                <div className="min-w-0 grow">
                                    <p className="truncate text-sm font-bold text-text-primary transition-colors group-hover:text-accent-gold">
                                        {branch.name}
                                    </p>
                                    <p className="text-[11px] text-text-muted">
                                        {branch.archive_count} memories
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {people.length > 0 && (
                <div>
                    <p className="mb-3 ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                        People
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {people.map((person) => (
                            <a
                                key={person.id}
                                href={roomUrl(person.slug)}
                                className="group flex items-center gap-2 rounded-full border border-border-subtle bg-surface py-1.5 pr-4 pl-1.5 transition-all hover:border-accent-gold/40"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-gold/10 text-[10px] font-bold text-accent-gold">
                                    <User size={13} />
                                </span>
                                <span className="text-xs font-bold text-text-primary transition-colors group-hover:text-accent-gold">
                                    {person.person_name || person.name}
                                </span>
                                <span className="text-[11px] text-text-muted">
                                    {person.archive_count}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
