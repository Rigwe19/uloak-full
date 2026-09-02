import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ChevronDown,
    ArrowLeft,
    Plus,
    Save,
    Trash2,
    Check,
    Info,
} from 'lucide-react';
import React, { useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { show as peopleShow } from '@/routes/people';
import type { Person } from '@/types/person';

interface Option {
    value: string;
    label: string;
}

const inputClass =
    'w-full rounded-lg border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/40 outline-none transition-all focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30';
const selectClass =
    'w-full rounded-lg border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30';
const labelClass = 'mb-1.5 block text-xs font-medium text-text-muted';

function FieldHelp({ content }: { content: string }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger
                    type="button"
                    className="inline-flex items-center text-text-muted/40 transition-colors hover:text-accent-gold"
                >
                    <Info size={12} />
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    className="max-w-xs rounded-xl border border-white/[0.06] bg-surface/95 px-4 py-2.5 text-xs leading-relaxed text-text-muted shadow-xl backdrop-blur-xl"
                >
                    {content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function Section({
    title,
    count,
    total,
    defaultOpen = false,
    children,
}: {
    title: string;
    count?: number;
    total?: number | null;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const showBadge = count !== undefined && total !== null;

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-xl border border-border-subtle bg-surface px-5 py-3.5 text-left transition-colors hover:bg-white/5 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                <div className="flex items-center gap-3">
                    <ChevronDown
                        size={16}
                        className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}
                    />
                    <span className="text-sm font-bold text-text-primary">
                        {title}
                    </span>
                    {showBadge && (
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${count === total ? 'bg-green-500/10 text-green-400' : 'bg-accent-gold/10 text-accent-gold'}`}
                        >
                            {count}/{total}
                        </span>
                    )}
                    {!showBadge && count !== undefined && count > 0 && (
                        <span className="rounded-full bg-accent-gold/10 px-2 py-0.5 text-[10px] font-medium text-accent-gold">
                            {count} items
                        </span>
                    )}
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent asChild forceMount>
                <motion.div
                    initial={false}
                    animate={{
                        height: open ? 'auto' : 0,
                        opacity: open ? 1 : 0,
                    }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                >
                    <div className="rounded-b-xl border border-t-0 border-border-subtle bg-surface p-5">
                        {children}
                    </div>
                </motion.div>
            </CollapsibleContent>
        </Collapsible>
    );
}

function MiniList<T>({
    items,
    setItems,
    createBlank,
    renderItem,
    title,
}: {
    items: T[];
    setItems: (items: T[]) => void;
    createBlank: () => T;
    renderItem: (item: T, i: number, update: (v: T) => void) => React.ReactNode;
    title: string;
}) {
    const add = () => setItems([...items, createBlank()]);
    const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));

    return (
        <div>
            <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">
                    {title}{' '}
                    <span className="font-normal text-text-muted">
                        ({items.length})
                    </span>
                </span>
                <button
                    type="button"
                    onClick={add}
                    className="flex items-center gap-1 text-[11px] font-medium text-accent-gold transition-colors hover:text-accent-gold/80"
                >
                    <Plus size={12} /> Add
                </button>
            </div>
            {items.length === 0 && (
                <p className="py-2 text-xs text-text-muted/60 italic">
                    None added.
                </p>
            )}
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="group relative rounded-lg border border-border-subtle bg-bg-dark p-3 transition-all hover:border-white/10"
                    >
                        <button
                            type="button"
                            onClick={() => remove(i)}
                            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-red-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/30"
                        >
                            <Trash2 size={10} />
                        </button>
                        {renderItem(item, i, (v) => {
                            const u = [...items];
                            u[i] = v;
                            setItems(u);
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

interface EditProps {
    person: Person;
    identity: any;
    heritage: any;
    languages: any[];
    addresses: any[];
    milestones: any[];
    roles: any[];
    titles: any[];
    personality: any[];
    tags: any[];
    personTypes: Option[];
    livingStatuses: Option[];
    visibilities: Option[];
}

export default function Edit({
    person,
    identity,
    heritage,
    languages: il,
    addresses: ia,
    milestones: im,
    roles: ir,
    titles: it,
    tags: itg,
    personTypes,
    livingStatuses,
    visibilities,
}: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        legal_name: identity?.legal_name ?? '',
        display_name: identity?.display_name ?? '',
        nickname: identity?.nickname ?? '',
        traditional_name: identity?.traditional_name ?? '',
        type: person.type,
        living_status: person.living_status,
        family_branch: person.family_branch ?? '',
        clan: person.clan ?? '',
        kindred: person.kindred ?? '',
        ancestral_home: person.ancestral_home ?? '',
        diaspora_generation: person.diaspora_generation ?? '',
        birth_date: identity?.birth_date ?? '',
        death_date: identity?.death_date ?? '',
        birth_place: identity?.birth_place ?? '',
        death_place: identity?.death_place ?? '',
        burial_location: identity?.burial_location ?? '',
        gender: identity?.gender ?? '',
        biography: identity?.biography ?? '',
        short_introduction: identity?.short_introduction ?? '',
        age_visibility: identity?.age_visibility ?? 'public',
        heritage: {
            nationality: heritage?.nationality ?? '',
            ethnicity: heritage?.ethnicity ?? '',
            tribe: heritage?.tribe ?? '',
            clan: heritage?.clan ?? '',
            village: heritage?.village ?? '',
            town: heritage?.town ?? '',
            state: heritage?.state ?? '',
            country: heritage?.country ?? '',
            religion: heritage?.religion ?? '',
            migration_story: heritage?.migration_story ?? '',
        },
        languages: il?.length
            ? il.map((l: any) => ({
                  language: l.language,
                  dialect: l.dialect ?? '',
                  proficiency: l.proficiency ?? '',
              }))
            : [],
        addresses: ia?.length
            ? ia.map((a: any) => ({
                  type: a.type,
                  line1: a.line1 ?? '',
                  city: a.city ?? '',
                  town: a.town ?? '',
                  village: a.village ?? '',
                  state: a.state ?? '',
                  country: a.country ?? '',
              }))
            : [],
        milestones: im?.length
            ? im.map((m: any) => ({
                  title: m.title,
                  description: m.description ?? '',
                  date: m.date ?? '',
                  category: m.category ?? '',
              }))
            : [],
        roles: ir?.length
            ? ir.map((r: any) => ({ role: r.role, context: r.context ?? '' }))
            : [],
        titles: it?.length
            ? it.map((t: any) => ({
                  title: t.title,
                  is_traditional: t.is_traditional ?? false,
                  granted_by: t.granted_by ?? '',
                  year: t.year ?? '',
              }))
            : [],
        tags: itg?.length ? itg.map((t: any) => t.tag) : [],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(peopleShow(person.uuid).url, { preserveScroll: true });
    };

    const sections = [
        {
            id: 'identity',
            label: 'Identity',
            count: [data.legal_name, data.display_name, data.gender].filter(
                Boolean,
            ).length,
            total: 3,
        },
        {
            id: 'family',
            label: 'Family',
            count: [
                data.family_branch,
                data.clan,
                data.kindred,
                data.ancestral_home,
            ].filter(Boolean).length,
            total: 4,
        },
        {
            id: 'life',
            label: 'Life Events',
            count: [
                data.birth_date,
                data.death_date,
                data.burial_location,
                data.birth_place,
                data.death_place,
            ].filter(Boolean).length,
            total: 5,
        },
        {
            id: 'heritage',
            label: 'Heritage',
            count: Object.values(data.heritage).filter(Boolean).length,
            total: 10,
        },
        {
            id: 'background',
            label: 'Background',
            count: [data.short_introduction, data.biography].filter(Boolean)
                .length,
            total: 2,
        },
        {
            id: 'details',
            label: 'Details',
            count:
                data.languages.length +
                data.addresses.length +
                data.milestones.length +
                data.roles.length +
                data.titles.length +
                data.tags.length,
            total: null,
        },
    ];

    const scrollTo = (id: string) =>
        document
            .getElementById(`section-${id}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    return (
        <TooltipProvider>
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <Head
                    title={
                        'Edit ' +
                        (identity?.display_name ?? 'Profile') +
                        ' - Ulo of Stories'
                    }
                />

                <Link
                    href={peopleShow(person.uuid).url + '/about'}
                    className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-primary"
                >
                    <ArrowLeft size={16} /> Back
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="mb-5 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">
                            Edit Profile
                        </h1>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-1.5">
                        {sections.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => scrollTo(s.id)}
                                className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-[11px] font-medium text-text-muted transition-all hover:border-accent-gold/30 hover:text-accent-gold"
                            >
                                {s.total !== null &&
                                    s.count === s.total &&
                                    s.count > 0 && (
                                        <Check
                                            size={12}
                                            className="text-green-400"
                                        />
                                    )}
                                {s.label}
                                {s.count > 0 &&
                                    s.total !== null &&
                                    s.count < s.total && (
                                        <span className="text-[10px] text-accent-gold">
                                            ({s.count}/{s.total})
                                        </span>
                                    )}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={submit} className="space-y-3">
                        {/* 1. Core Identity */}
                        <div id="section-identity">
                            <Section
                                title="Core Identity"
                                count={sections[0].count}
                                total={sections[0].total}
                                defaultOpen
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>
                                            Full Legal Name{' '}
                                            <FieldHelp content="Official identity — the name on legal documents, birth certificate, or passport." />
                                        </label>
                                        <input
                                            value={data.legal_name}
                                            onChange={(e) =>
                                                setData(
                                                    'legal_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Adaeze Ngozi Okonkwo"
                                            className={inputClass}
                                        />
                                        {errors.legal_name && (
                                            <p className="mt-1 text-xs text-red-400">
                                                {errors.legal_name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                Preferred Display Name{' '}
                                                <FieldHelp content="How family members see and recognise the person on the family tree and profile." />
                                            </label>
                                            <input
                                                value={data.display_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'display_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Mama Adaeze, Ngozi, Aunty Ada"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Nickname / Pet Name{' '}
                                                <FieldHelp content="Family intimacy and recognition — what loved ones call them at home." />
                                            </label>
                                            <input
                                                value={data.nickname}
                                                onChange={(e) =>
                                                    setData(
                                                        'nickname',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Ada, Zee, Nene, Sweet Pea"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Native / Traditional Name{' '}
                                            <FieldHelp content="Birth name, indigenous name, or cultural name — important for African, Caribbean, and diaspora families." />
                                        </label>
                                        <input
                                            value={data.traditional_name}
                                            onChange={(e) =>
                                                setData(
                                                    'traditional_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Nwanyiocha, Chiamaka, Adaeze"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <label className={labelClass}>
                                                Profile Type
                                            </label>
                                            <select
                                                value={data.type}
                                                onChange={(e) =>
                                                    setData(
                                                        'type',
                                                        e.target.value,
                                                    )
                                                }
                                                className={selectClass}
                                            >
                                                {personTypes.map((t) => (
                                                    <option
                                                        key={t.value}
                                                        value={t.value}
                                                    >
                                                        {t.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Living Status{' '}
                                                <FieldHelp content="Living, deceased, or unknown — determines profile type and memorial features." />
                                            </label>
                                            <select
                                                value={data.living_status}
                                                onChange={(e) =>
                                                    setData(
                                                        'living_status',
                                                        e.target.value,
                                                    )
                                                }
                                                className={selectClass}
                                            >
                                                {livingStatuses.map((s) => (
                                                    <option
                                                        key={s.value}
                                                        value={s.value}
                                                    >
                                                        {s.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Gender{' '}
                                                <FieldHelp content="Optional — shown based on your age display preference. Helps tree language (son/daughter, brother/sister)." />
                                            </label>
                                            <input
                                                value={data.gender}
                                                onChange={(e) =>
                                                    setData(
                                                        'gender',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Male, Female, Prefer not to say"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Age Display Preference{' '}
                                            <FieldHelp content="Control how age is shown: full date of birth, age only, or completely hidden." />
                                        </label>
                                        <select
                                            value={data.age_visibility}
                                            onChange={(e) =>
                                                setData(
                                                    'age_visibility',
                                                    e.target.value,
                                                )
                                            }
                                            className={selectClass}
                                        >
                                            {visibilities.map((v) => (
                                                <option
                                                    key={v.value}
                                                    value={v.value}
                                                >
                                                    {v.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </Section>
                        </div>

                        {/* 2. Family & Lineage */}
                        <div id="section-family">
                            <Section
                                title="Family & Lineage"
                                count={sections[1].count}
                                total={sections[1].total}
                            >
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                Family Branch / House{' '}
                                                <FieldHelp content="Which side of the family — e.g. Adim family, mother's side, father's side, Ulo of Stories clan." />
                                            </label>
                                            <input
                                                value={data.family_branch}
                                                onChange={(e) =>
                                                    setData(
                                                        'family_branch',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Adim family, Mother's side, Okonkwo lineage"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Clan / Kindred{' '}
                                                <FieldHelp content="Useful for Igbo, African, Caribbean and diaspora family structures. Links to extended kinship networks." />
                                            </label>
                                            <input
                                                value={data.clan}
                                                onChange={(e) =>
                                                    setData(
                                                        'clan',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Umuada, Ndiokorie, Okafor kindred"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                Kindred / Lineage Group{' '}
                                                <FieldHelp content="Deeper kinship grouping within the clan. Helps track bloodline connections across generations." />
                                            </label>
                                            <input
                                                value={data.kindred}
                                                onChange={(e) =>
                                                    setData(
                                                        'kindred',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Ndi Nze, Isi village, Umu Okpara"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Ancestral Village / Hometown{' '}
                                                <FieldHelp content="Cultural heritage mapping — the family's place of origin, often important for identity and ceremonies." />
                                            </label>
                                            <input
                                                value={data.ancestral_home}
                                                onChange={(e) =>
                                                    setData(
                                                        'ancestral_home',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Enugu-Ukwu, Nnewi, Abiriba, Ohafia"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Diaspora Generation{' '}
                                            <FieldHelp content="First generation, second generation, third generation diaspora — helps map migration stories and generational distance from ancestral home." />
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.diaspora_generation}
                                            onChange={(e) =>
                                                setData(
                                                    'diaspora_generation',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. 1 (first generation), 2 (second generation)"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </Section>
                        </div>

                        {/* 3. Life Events */}
                        <div id="section-life">
                            <Section
                                title="Life Events"
                                count={sections[2].count}
                                total={sections[2].total}
                            >
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                Date of Birth{' '}
                                                <FieldHelp content="Used for timeline positioning, relationship calculations, and age display." />
                                            </label>
                                            <input
                                                type="date"
                                                value={data.birth_date}
                                                onChange={(e) =>
                                                    setData(
                                                        'birth_date',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                            {errors.birth_date && (
                                                <p className="mt-1 text-xs text-red-400">
                                                    {errors.birth_date}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Place of Birth{' '}
                                                <FieldHelp content="Heritage and origin mapping. Links to family migration stories and cultural identity." />
                                            </label>
                                            <input
                                                value={data.birth_place}
                                                onChange={(e) =>
                                                    setData(
                                                        'birth_place',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Enugu, Nigeria · London, UK · Atlanta, USA"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                Date of Death{' '}
                                                <FieldHelp content="If deceased — triggers memorial features, anniversary reminders, and timeline placement." />
                                            </label>
                                            <input
                                                type="date"
                                                value={data.death_date}
                                                onChange={(e) =>
                                                    setData(
                                                        'death_date',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                            {errors.death_date && (
                                                <p className="mt-1 text-xs text-red-400">
                                                    {errors.death_date}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Place of Death{' '}
                                                <FieldHelp content="Where they passed — useful for memorial planning and family history records." />
                                            </label>
                                            <input
                                                value={data.death_place}
                                                onChange={(e) =>
                                                    setData(
                                                        'death_place',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Lagos, Nigeria · Surrounded by family at home"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Burial / Memorial Location{' '}
                                            <FieldHelp content="Cemetery, family compound, memorial garden, or resting place — useful for family remembrance and reunion planning." />
                                        </label>
                                        <input
                                            value={data.burial_location}
                                            onChange={(e) =>
                                                setData(
                                                    'burial_location',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Okonkwo family compound, Enugu · Arlington Cemetery"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </Section>
                        </div>

                        {/* 4. Heritage & Cultural */}
                        <div id="section-heritage">
                            <Section
                                title="Heritage & Culture"
                                count={sections[3].count}
                                total={sections[3].total}
                            >
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                Nationality
                                            </label>
                                            <input
                                                value={
                                                    data.heritage.nationality
                                                }
                                                onChange={(e) =>
                                                    setData('heritage', {
                                                        ...data.heritage,
                                                        nationality:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Nigerian, Ghanaian, British, American"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Ethnic Group{' '}
                                                <FieldHelp content="Optional, user-controlled — important for cultural identity without being compulsory." />
                                            </label>
                                            <input
                                                value={data.heritage.ethnicity}
                                                onChange={(e) =>
                                                    setData('heritage', {
                                                        ...data.heritage,
                                                        ethnicity:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Igbo, Yoruba, Akan, Efik, Hausa"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                Tribe / Community{' '}
                                                <FieldHelp content="Optional — deeper community identity within the ethnic group." />
                                            </label>
                                            <input
                                                value={data.heritage.tribe}
                                                onChange={(e) =>
                                                    setData('heritage', {
                                                        ...data.heritage,
                                                        tribe: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Aro, Ikwerre, Ogonni"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Heritage Clan{' '}
                                                <FieldHelp content="The clan name as recorded in heritage records. May differ from lineage clan." />
                                            </label>
                                            <input
                                                value={data.heritage.clan}
                                                onChange={(e) =>
                                                    setData('heritage', {
                                                        ...data.heritage,
                                                        clan: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Umu Ire, Ndi Okeke"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <label className={labelClass}>
                                                Village of Origin
                                            </label>
                                            <input
                                                value={data.heritage.village}
                                                onChange={(e) =>
                                                    setData('heritage', {
                                                        ...data.heritage,
                                                        village: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Isi village, Amankwu"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Town
                                            </label>
                                            <input
                                                value={data.heritage.town}
                                                onChange={(e) =>
                                                    setData('heritage', {
                                                        ...data.heritage,
                                                        town: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Nnewi, Aba, Onitsha"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                State / Region
                                            </label>
                                            <input
                                                value={data.heritage.state}
                                                onChange={(e) =>
                                                    setData('heritage', {
                                                        ...data.heritage,
                                                        state: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Enugu, Rivers, Delta, Lagos"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                Country of Residence{' '}
                                                <FieldHelp content="Current location — helps with diaspora mapping and family reunion planning." />
                                            </label>
                                            <input
                                                value={data.heritage.country}
                                                onChange={(e) =>
                                                    setData('heritage', {
                                                        ...data.heritage,
                                                        country: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. United Kingdom, Canada, Nigeria"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Religion / Faith{' '}
                                                <FieldHelp content="Optional and private — shared based on permission settings." />
                                            </label>
                                            <input
                                                value={data.heritage.religion}
                                                onChange={(e) =>
                                                    setData('heritage', {
                                                        ...data.heritage,
                                                        religion:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Christianity, Islam, African traditional"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Migration Story{' '}
                                            <FieldHelp content="Where they moved from and when — powerful for diaspora families documenting their journey across generations." />
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={
                                                data.heritage.migration_story
                                            }
                                            onChange={(e) =>
                                                setData('heritage', {
                                                    ...data.heritage,
                                                    migration_story:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="e.g. Moved from Enugu to London in 1985 for education. Settled in Atlanta after marriage."
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </Section>
                        </div>

                        {/* 5. Personal Background */}
                        <div id="section-background">
                            <Section
                                title="Personal Background"
                                count={sections[4].count}
                                total={sections[4].total}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>
                                            Short Introduction{' '}
                                            <FieldHelp content="A 2–5 sentence introduction that captures who they are — shown at the top of their profile." />
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={data.short_introduction}
                                            onChange={(e) =>
                                                setData(
                                                    'short_introduction',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder='e.g. "I am the first daughter of Chief and Mrs. Okonkwo. A mother of three, educator, and keeper of our family recipes."'
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Life Summary / Biography{' '}
                                            <FieldHelp content="Full life story — childhood, career, family, legacy. This becomes part of their permanent family archive." />
                                        </label>
                                        <textarea
                                            rows={8}
                                            value={data.biography}
                                            onChange={(e) =>
                                                setData(
                                                    'biography',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Share their story — where they grew up, what they loved, what they taught us, how they will be remembered..."
                                            className={inputClass}
                                        />
                                        {errors.biography && (
                                            <p className="mt-1 text-xs text-red-400">
                                                {errors.biography}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Section>
                        </div>

                        {/* 6. Additional Details */}
                        <div id="section-details">
                            <Section
                                title="Additional Details"
                                count={sections[5].count}
                                total={sections[5].total}
                            >
                                <div className="space-y-6">
                                    <MiniList
                                        title="Languages Spoken"
                                        items={data.languages}
                                        setItems={(v) =>
                                            setData('languages', v)
                                        }
                                        createBlank={() => ({
                                            language: '',
                                            dialect: '',
                                            proficiency: '',
                                        })}
                                        renderItem={(item, i, update) => (
                                            <div className="grid gap-3 md:grid-cols-3">
                                                <input
                                                    value={item.language}
                                                    onChange={(e) =>
                                                        update({
                                                            ...item,
                                                            language:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="e.g. Igbo, Yoruba, English, Pidgin"
                                                    className={inputClass}
                                                />
                                                <input
                                                    value={item.dialect}
                                                    onChange={(e) =>
                                                        update({
                                                            ...item,
                                                            dialect:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="e.g. Enugu dialect, Rivers dialect"
                                                    className={inputClass}
                                                />
                                                <select
                                                    value={item.proficiency}
                                                    onChange={(e) =>
                                                        update({
                                                            ...item,
                                                            proficiency:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className={selectClass}
                                                >
                                                    <option value="">
                                                        Proficiency
                                                    </option>
                                                    <option value="native">
                                                        Native — Mother tongue
                                                    </option>
                                                    <option value="fluent">
                                                        Fluent — Speak and write
                                                        well
                                                    </option>
                                                    <option value="conversational">
                                                        Conversational — Can
                                                        hold a conversation
                                                    </option>
                                                    <option value="basic">
                                                        Basic — Understand but
                                                        cannot speak
                                                    </option>
                                                </select>
                                            </div>
                                        )}
                                    />

                                    <MiniList
                                        title="Addresses / Places Lived"
                                        items={data.addresses}
                                        setItems={(v) =>
                                            setData('addresses', v)
                                        }
                                        createBlank={() => ({
                                            type: 'current',
                                            line1: '',
                                            city: '',
                                            town: '',
                                            village: '',
                                            state: '',
                                            country: '',
                                        })}
                                        renderItem={(item, i, update) => (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-medium text-text-muted">
                                                        Type:
                                                    </span>
                                                    <select
                                                        value={item.type}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                type: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-xs text-text-primary outline-none"
                                                    >
                                                        <option value="current">
                                                            Current residence
                                                        </option>
                                                        <option value="previous">
                                                            Previous residence
                                                        </option>
                                                        <option value="birth">
                                                            Birthplace
                                                        </option>
                                                        <option value="ancestral">
                                                            Ancestral home
                                                        </option>
                                                        <option value="other">
                                                            Other
                                                        </option>
                                                    </select>
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <input
                                                        value={item.line1}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                line1: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="Street address"
                                                        className={inputClass}
                                                    />
                                                    <input
                                                        value={item.city}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                city: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="City"
                                                        className={inputClass}
                                                    />
                                                    <input
                                                        value={item.town}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                town: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="Town / Area"
                                                        className={inputClass}
                                                    />
                                                    <input
                                                        value={item.village}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                village:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="Village / Community"
                                                        className={inputClass}
                                                    />
                                                    <input
                                                        value={item.state}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                state: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="State / Region"
                                                        className={inputClass}
                                                    />
                                                    <input
                                                        value={item.country}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                country:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="Country"
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    />

                                    <MiniList
                                        title="Milestones & Major Life Events"
                                        items={data.milestones}
                                        setItems={(v) =>
                                            setData('milestones', v)
                                        }
                                        createBlank={() => ({
                                            title: '',
                                            description: '',
                                            date: '',
                                            category: 'general',
                                        })}
                                        renderItem={(item, i, update) => (
                                            <div className="space-y-3">
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <input
                                                        value={item.title}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                title: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="e.g. Graduation, Wedding, Migration, Chieftaincy"
                                                        className={inputClass}
                                                    />
                                                    <input
                                                        type="date"
                                                        value={item.date}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                date: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className={inputClass}
                                                    />
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        update({
                                                            ...item,
                                                            description:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="What happened? Why does it matter? Who was there?"
                                                    className={inputClass}
                                                />
                                            </div>
                                        )}
                                    />

                                    <MiniList
                                        title="Roles & Occupations"
                                        items={data.roles}
                                        setItems={(v) => setData('roles', v)}
                                        createBlank={() => ({
                                            role: '',
                                            context: '',
                                        })}
                                        renderItem={(item, i, update) => (
                                            <div className="grid gap-3 md:grid-cols-2">
                                                <input
                                                    value={item.role}
                                                    onChange={(e) =>
                                                        update({
                                                            ...item,
                                                            role: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="e.g. Teacher, Village Chief, Nurse, Storyteller"
                                                    className={inputClass}
                                                />
                                                <input
                                                    value={item.context}
                                                    onChange={(e) =>
                                                        update({
                                                            ...item,
                                                            context:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="e.g. University of Nigeria, Okonkwo Family Union"
                                                    className={inputClass}
                                                />
                                            </div>
                                        )}
                                    />

                                    <MiniList
                                        title="Titles & Honours"
                                        items={data.titles}
                                        setItems={(v) => setData('titles', v)}
                                        createBlank={() => ({
                                            title: '',
                                            is_traditional: false,
                                            granted_by: '',
                                            year: '',
                                        })}
                                        renderItem={(item, i, update) => (
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 text-xs text-text-muted">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            item.is_traditional
                                                        }
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                is_traditional:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                        className="rounded border-border-subtle bg-bg-dark"
                                                    />
                                                    Traditional / Cultural title{' '}
                                                    <FieldHelp content="e.g. Chief, Lolo, Eze, Nze, Ogbuefi, Opara — traditional titles from community or family." />
                                                </label>
                                                <div className="grid gap-3 md:grid-cols-3">
                                                    <input
                                                        value={item.title}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                title: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="e.g. Chief, Dr., Pastor, Ogbuefi, Lolo"
                                                        className={inputClass}
                                                    />
                                                    <input
                                                        value={item.granted_by}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                granted_by:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="e.g. Enugu Traditional Council, University"
                                                        className={inputClass}
                                                    />
                                                    <input
                                                        type="number"
                                                        value={item.year}
                                                        onChange={(e) =>
                                                            update({
                                                                ...item,
                                                                year: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="e.g. 1999"
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    />

                                    <MiniList
                                        title="Tags"
                                        items={data.tags}
                                        setItems={(v) => setData('tags', v)}
                                        createBlank={() => ''}
                                        renderItem={(item, i, update) => (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-gold/10 px-3 py-1.5 text-xs font-medium text-accent-gold">
                                                <input
                                                    value={item}
                                                    onChange={(e) =>
                                                        update(e.target.value)
                                                    }
                                                    className="w-24 bg-transparent text-accent-gold outline-none placeholder:text-accent-gold/50"
                                                    placeholder="e.g. storyteller, matriarch, chef"
                                                />
                                            </span>
                                        )}
                                    />
                                </div>
                            </Section>
                        </div>

                        {/* Sticky Save Bar */}
                        <div className="sticky bottom-4 z-40 mt-6">
                            <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface/95 px-5 py-3 shadow-lg ring-1 ring-white/5 backdrop-blur-xl">
                                <span className="text-xs text-text-muted">
                                    All sections saved together
                                </span>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={
                                            peopleShow(person.uuid).url +
                                            '/about'
                                        }
                                        className="rounded-full px-5 py-2 text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="hover:bg-opacity-90 inline-flex items-center gap-2 rounded-full bg-accent-gold px-5 py-2 text-xs font-bold text-bg-dark transition-all disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Save size={14} />
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </TooltipProvider>
    );
}
