import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    MapPin, Calendar, Globe, BookOpen, Award, Heart,
    Languages, Users, Quote, Star, Crosshair, Flag,
    Church, Map, TreePine, Sparkles,
} from 'lucide-react';
import React from 'react';
import PersonLayout from '@/layouts/person-layout';
import type { Person } from '@/types/person';

interface AboutProps {
    person: Person;
    identity: any;
    heritage: any;
    languages: any[];
    roles: any[];
    titles: any[];
    addresses: any[];
    personality: any[];
    milestones: any[];
    tags: any[];
}

const stagger = {
    container: { animate: { transition: { staggerChildren: 0.08 } } },
    item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } },
};

function DecoBlob({ className }: { className: string }) {
    return <div className={`pointer-events-none absolute rounded-full bg-accent-gold/5 blur-[100px] ${className}`} />;
}

function SectionCard({ icon: Icon, title, children, className = '', delay = 0 }: { icon: any; title: string; children: React.ReactNode; className?: string; delay?: number }) {
    return (
        <motion.section
            variants={stagger.item}
            className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-surface/80 p-6 backdrop-blur-sm transition-all hover:border-accent-gold/10 hover:shadow-[0_0_40px_rgba(198,161,91,0.04)] ${className}`}
        >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent-gold/[0.03] blur-[60px] transition-all group-hover:bg-accent-gold/[0.06]" />
            <div className="relative">
                <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gold/10">
                        <Icon size={15} className="text-accent-gold" />
                    </div>
                    <h3 className="text-sm font-bold tracking-wide text-text-primary">{title}</h3>
                </div>
                {children}
            </div>
        </motion.section>
    );
}

function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-text-primary backdrop-blur-sm transition-all hover:border-accent-gold/20 hover:bg-accent-gold/[0.04] ${className}`}>
            {children}
        </span>
    );
}

function Detail({ icon: Icon, label, value, className = '' }: { icon?: any; label: string; value: string; className?: string }) {
    if (!value) {
return null;
}

    return (
        <div className={`flex items-start gap-3 ${className}`}>
            {Icon && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.03]">
                    <Icon size={13} className="text-text-muted" />
                </div>
            )}
            <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase">{label}</p>
                <p className="text-sm font-medium text-text-primary">{value}</p>
            </div>
        </div>
    );
}

export default function About({ person, identity, heritage, languages, roles, titles, addresses, personality, milestones, tags }: AboutProps) {
    const hasIdentity = identity && (identity.legal_name || identity.display_name || identity.nickname || identity.gender);
    const hasHeritage = heritage && (heritage.nationality || heritage.ethnicity || heritage.tribe || heritage.clan || heritage.religion);
    const hasLifeEvents = identity?.birth_date || identity?.death_date || identity?.burial_location;
    const hasRoles = roles?.length > 0;
    const hasTitles = titles?.length > 0;
    const hasLanguages = languages?.length > 0;
    const hasAddresses = addresses?.length > 0;
    const hasMilestones = milestones?.length > 0;
    const hasTags = tags?.length > 0;
    const hasPersonality = personality?.length > 0;

    return (
        <div>
            <Head title={(identity?.display_name ?? 'About') + ' - Ulo of Stories'} />

            <motion.div variants={stagger.container} initial="initial" animate="animate" className="relative space-y-5">
                {/* Biography Hero */}
                {identity?.biography && (
                    <motion.section variants={stagger.item} className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-surface/90 via-surface/50 to-surface/30 p-7 backdrop-blur-sm sm:p-9">
                        <DecoBlob className="-left-20 -top-20 h-60 w-60" />
                        <DecoBlob className="-bottom-20 -right-20 h-40 w-40" />
                        <div className="relative">
                            <div className="mb-4 flex items-center gap-2">
                                <Quote size={16} className="text-accent-gold/60" />
                                <span className="text-[11px] font-bold tracking-widest text-accent-gold/60 uppercase">Biography</span>
                            </div>
                            <p className="whitespace-pre-wrap text-base leading-relaxed text-text-primary/90 sm:text-lg sm:leading-8">
                                {identity.biography}
                            </p>
                        </div>
                    </motion.section>
                )}

                {/* Short Introduction as an accent bar */}
                {identity?.short_introduction && !identity?.biography && (
                    <motion.div variants={stagger.item} className="relative rounded-2xl border border-accent-gold/10 bg-gradient-to-r from-accent-gold/[0.04] to-transparent px-6 py-4">
                        <p className="text-sm italic text-text-muted/80">&ldquo;{identity.short_introduction}&rdquo;</p>
                    </motion.div>
                )}

                {/* Stats Row */}
                {person && (
                    <motion.div variants={stagger.item} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { icon: Heart, label: 'Living Status', value: person.living_status === 'living' ? 'Living' : 'Deceased', color: person.living_status === 'living' ? 'text-emerald-400' : 'text-slate-400' },
                            { icon: TreePine, label: 'Type', value: person.type?.replace(/_/g, ' ') ?? '—' },
                            { icon: Star, label: 'Featured', value: person.is_featured ? 'Featured' : '—' },
                            { icon: Users, label: 'Role', value: person.family_branch || 'Member' },
                        ].map((stat, i) => (
                            <div key={i} className="rounded-xl border border-white/[0.06] bg-surface/50 px-4 py-3 backdrop-blur-sm">
                                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
                                    <stat.icon size={12} className={stat.color || 'text-accent-gold'} />
                                    {stat.label}
                                </div>
                                <p className="text-sm font-bold text-text-primary capitalize">{stat.value}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Identity & Heritage 2-col grid */}
                <div className="grid gap-5 md:grid-cols-2">
                    {hasIdentity && (
                        <SectionCard icon={BookOpen} title="Identity">
                            <div className="space-y-4">
                                <Detail icon={MapPin} label="Legal Name" value={identity.legal_name} />
                                {identity.display_name && <Detail icon={Star} label="Known As" value={identity.display_name} />}
                                {identity.nickname && <Detail icon={Heart} label="Nickname" value={identity.nickname} />}
                                {identity.gender && <Detail icon={Users} label="Gender" value={identity.gender} />}
                                {identity.birth_date && (
                                    <Detail icon={Calendar} label="Birth" value={`${identity.birth_date}${identity.birth_place ? ` · ${identity.birth_place}` : ''}`} />
                                )}
                                {identity.death_date && (
                                    <Detail icon={Calendar} label="Death" value={`${identity.death_date}${identity.death_place ? ` · ${identity.death_place}` : ''}`} />
                                )}
                                {identity.burial_location && <Detail icon={MapPin} label="Burial" value={identity.burial_location} />}
                            </div>
                        </SectionCard>
                    )}

                    {hasHeritage && (
                        <SectionCard icon={Globe} title="Heritage">
                            <div className="space-y-4">
                                {heritage.nationality && <Detail icon={Flag} label="Nationality" value={heritage.nationality} />}
                                {heritage.ethnicity && <Detail icon={Users} label="Ethnicity" value={heritage.ethnicity} />}
                                {heritage.tribe && <Detail icon={Map} label="Tribe" value={heritage.tribe} />}
                                {heritage.clan && <Detail icon={Users} label="Clan" value={heritage.clan} />}
                                {heritage.religion && <Detail icon={Church} label="Religion" value={heritage.religion} />}
                                {heritage.village && <Detail icon={MapPin} label="Village" value={heritage.village} />}
                                {heritage.town && <Detail icon={MapPin} label="Town" value={heritage.town} />}
                                {heritage.state && <Detail icon={MapPin} label="State" value={heritage.state} />}
                                {heritage.country && <Detail icon={Flag} label="Country" value={heritage.country} />}
                                {heritage.migration_story && <Detail icon={Map} label="Migration" value={heritage.migration_story} />}
                            </div>
                        </SectionCard>
                    )}

                    {/* Family & Lineage */}
                    {(person.family_branch || person.clan || person.kindred || person.ancestral_home) && (
                        <SectionCard icon={TreePine} title="Lineage">
                            <div className="space-y-4">
                                {person.family_branch && <Detail icon={Map} label="Branch" value={person.family_branch} />}
                                {person.clan && <Detail icon={Users} label="Clan" value={person.clan} />}
                                {person.kindred && <Detail icon={Heart} label="Kindred" value={person.kindred} />}
                                {person.ancestral_home && <Detail icon={MapPin} label="Ancestral Home" value={person.ancestral_home} />}
                                {person.diaspora_generation != null && <Detail icon={Globe} label="Diaspora Gen" value={`${person.diaspora_generation}`} />}
                            </div>
                        </SectionCard>
                    )}

                    {/* Addresses */}
                    {hasAddresses && (
                        <SectionCard icon={MapPin} title="Addresses">
                            <div className="space-y-4">
                                {addresses.map((a: any) => (
                                    <div key={a.id} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                                        <p className="text-[11px] font-bold tracking-wider text-accent-gold uppercase">{a.type}</p>
                                        <p className="mt-0.5 text-sm text-text-primary">
                                            {[a.line1, a.city, a.town, a.village, a.state, a.country].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </div>

                {/* Roles & Titles */}
                <div className="grid gap-5 md:grid-cols-2">
                    {hasRoles && (
                        <SectionCard icon={Award} title="Roles">
                            <div className="space-y-3">
                                {roles.map((r: any) => (
                                    <div key={r.id} className="flex items-start gap-3">
                                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-gold/60" />
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">{r.role}</p>
                                            {r.context && <p className="text-xs text-text-muted">{r.context}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {hasTitles && (
                        <SectionCard icon={Crosshair} title="Titles">
                            <div className="space-y-3">
                                {titles.map((t: any) => (
                                    <div key={t.id} className="flex items-start gap-3">
                                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-gold/60" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-text-primary">{t.title}</p>
                                                {t.is_traditional && (
                                                    <span className="rounded-full bg-accent-gold/10 px-2 py-0.5 text-[10px] font-medium text-accent-gold">Traditional</span>
                                                )}
                                            </div>
                                            {t.granted_by && <p className="text-xs text-text-muted">by {t.granted_by}</p>}
                                            {t.year && <p className="text-xs text-text-muted">{t.year}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </div>

                {/* Milestones Timeline */}
                {hasMilestones && (
                    <SectionCard icon={Sparkles} title="Milestones" className="md:col-span-2">
                        <div className="relative space-y-5">
                            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-gold/40 via-accent-gold/20 to-transparent" />
                            {milestones.map((m: any, i: number) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06, duration: 0.35 }}
                                    className="relative flex items-start gap-4 pl-6"
                                >
                                    <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-accent-gold bg-bg-dark" />
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-baseline gap-2">
                                            <p className="text-sm font-bold text-text-primary">{m.title}</p>
                                            {m.date && <span className="text-[11px] text-text-muted">{m.date}</span>}
                                        </div>
                                        {m.description && <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{m.description}</p>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </SectionCard>
                )}

                {/* Languages & Tags row */}
                <div className="grid gap-5 md:grid-cols-2">
                    {hasLanguages && (
                        <SectionCard icon={Languages} title="Languages">
                            <div className="flex flex-wrap gap-2">
                                {languages.map((l: any) => (
                                    <Pill key={l.id}>
                                        {l.language}
                                        {l.dialect ? ` (${l.dialect})` : ''}
                                        <span className="ml-0.5 text-text-muted">· {l.proficiency}</span>
                                    </Pill>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {hasTags && (
                        <SectionCard icon={Star} title="Tags">
                            <div className="flex flex-wrap gap-2">
                                {tags.map((t: any) => (
                                    <span key={t.id} className="inline-flex items-center rounded-full bg-accent-gold/[0.07] px-3 py-1.5 text-xs font-medium text-accent-gold backdrop-blur-sm transition-all hover:bg-accent-gold/[0.12]">
                                        #{t.tag}
                                    </span>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </div>

                {/* Empty state */}
                {!hasIdentity && !hasHeritage && !hasLifeEvents && !hasLanguages && !hasRoles && !hasTitles && !hasMilestones && !hasTags && !identity?.biography && !person.family_branch && (
                    <motion.div variants={stagger.item} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-16">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-gold/10">
                            <BookOpen size={24} className="text-accent-gold/60" />
                        </div>
                        <p className="text-sm font-medium text-text-muted">No details added yet</p>
                        <p className="mt-1 text-xs text-text-muted/60">Edit this profile to add biographical information</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
