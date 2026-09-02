import { useForm, Head, usePage } from '@inertiajs/react';
import {
    Camera,
    Pencil,
    X,
    Save,
    MapPin,
    Calendar,
    Star,
    Heart,
    Users,
    Globe,
    BookOpen,
    Map,
    Flag,
    Church,
    TreePine,
    Sparkles,
    Languages,
    Quote,
    Crosshair,
    Award,
} from 'lucide-react';
import React, { useState } from 'react';
import InputError from '@/components/input-error';
import type { Person } from '@/types/person';

interface AboutProps {
    person: Person | null;
    identity: any;
    heritage: any;
    languages: any[];
    roles: any[];
    titles: any[];
    addresses: any[];
    personality: any[];
    milestones: any[];
    tags: any[];
    mustVerifyEmail: boolean;
    status?: string;
}

function SectionCard({
    icon: Icon,
    title,
    children,
    className = '',
}: {
    icon: any;
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-2xl border border-white/[0.06] bg-surface/80 p-6 backdrop-blur-sm ${className}`}
        >
            <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gold/10">
                    <Icon size={15} className="text-accent-gold" />
                </div>
                <h3 className="text-sm font-bold tracking-wide text-text-primary">
                    {title}
                </h3>
            </div>
            {children}
        </div>
    );
}

function Detail({
    icon: Icon,
    label,
    value,
}: {
    icon?: any;
    label: string;
    value?: string | null;
}) {
    if (!value) {
        return null;
    }

    return (
        <div className="flex items-start gap-3">
            {Icon && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.03]">
                    <Icon size={13} className="text-text-muted" />
                </div>
            )}
            <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase">
                    {label}
                </p>
                <p className="text-sm font-medium text-text-primary">{value}</p>
            </div>
        </div>
    );
}

function InlineEditSection({
    title,
    icon: Icon,
    children,
    onSave,
    isEditing: controlledEdit,
    onToggle,
}: {
    title: string;
    icon: any;
    children: React.ReactNode;
    onSave?: () => void;
    isEditing?: boolean;
    onToggle?: () => void;
}) {
    const [internalEditing, setInternalEditing] = useState(false);
    const editing = controlledEdit ?? internalEditing;
    const toggle = onToggle ?? (() => setInternalEditing((p) => !p));

    return (
        <div className="group relative rounded-2xl border border-white/[0.06] bg-surface/80 p-6 backdrop-blur-sm transition-all hover:border-accent-gold/10">
            <button
                onClick={toggle}
                className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-accent-gold/10 hover:text-accent-gold"
            >
                {editing ? <X size={14} /> : <Pencil size={14} />}
            </button>
            <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gold/10">
                    <Icon size={15} className="text-accent-gold" />
                </div>
                <h3 className="text-sm font-bold tracking-wide text-text-primary">
                    {title}
                </h3>
            </div>
            {children}
            {editing && onSave && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onSave}
                        className="flex items-center gap-1.5 rounded-lg bg-accent-gold px-4 py-2 text-xs font-bold text-bg-dark transition-all hover:bg-accent-gold/90"
                    >
                        <Save size={14} />
                        Save
                    </button>
                </div>
            )}
        </div>
    );
}

export default function SettingsAbout({
    person,
    identity,
    heritage,
    languages,
    roles,
    titles,
    addresses,
    personality,
    milestones,
    tags,
    mustVerifyEmail,
    status,
}: AboutProps) {
    const { auth } = usePage().props as any;

    const [preview, setPreview] = useState<string | null>(
        auth.user?.avatar_url ?? null,
    );
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const {
        data: accountData,
        setData: setAccountData,
        post: postAccount,
        processing: accountProcessing,
        errors: accountErrors,
    } = useForm({
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        avatar: null as File | null,
        _method: 'patch',
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setAccountData('avatar', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const submitAccount = (e: React.FormEvent) => {
        e.preventDefault();
        postAccount('/settings/profile', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    if (!person) {
        return (
            <>
                <Head title="About - Ulo of Storiesf Stories" />
                <div className="flex flex-col items-center justify-center py-16">
                    <BookOpen size={40} className="text-text-muted/30" />
                    <p className="mt-4 text-sm text-text-muted">
                        No person profile yet.
                    </p>
                </div>
            </>
        );
    }

    const hasIdentity =
        identity &&
        (identity.legal_name ||
            identity.display_name ||
            identity.nickname ||
            identity.gender);
    const hasHeritage =
        heritage &&
        (heritage.nationality ||
            heritage.ethnicity ||
            heritage.tribe ||
            heritage.clan ||
            heritage.religion);
    const hasRoles = roles?.length > 0;
    const hasTitles = titles?.length > 0;
    const hasLanguages = languages?.length > 0;
    const hasAddresses = addresses?.length > 0;
    const hasMilestones = milestones?.length > 0;
    const hasTags = tags?.length > 0;

    return (
        <>
            <Head
                title={
                    (identity?.display_name ?? 'About') +
                    ' - Ulo of Storiesf Storiesf Storiesf Storiesf Storiesf Stories'
                }
            />

            <div className="space-y-6">
                {/* Account Section */}
                <InlineEditSection
                    title="Account"
                    icon={Star}
                    onSave={submitAccount}
                >
                    <form onSubmit={submitAccount} className="space-y-6">
                        <div className="flex flex-col items-center gap-6 sm:flex-row">
                            <div className="group relative">
                                <img
                                    src={
                                        preview ||
                                        '/images/01-ulo-team-studio.jpg'
                                    }
                                    className="h-20 w-20 rounded-[32px] object-cover ring-4 ring-border-subtle md:h-24 md:w-24"
                                    alt=""
                                />
                                <div
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-[32px] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                    <Camera size={20} className="text-white" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Full Name
                                    </label>
                                    <input
                                        value={accountData.name}
                                        onChange={(e) =>
                                            setAccountData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50"
                                    />
                                    <InputError message={accountErrors.name} />
                                </div>
                                <div>
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={accountData.email}
                                        onChange={(e) =>
                                            setAccountData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50"
                                    />
                                    <InputError message={accountErrors.email} />
                                </div>
                            </div>
                        </div>
                    </form>
                </InlineEditSection>

                {/* Biography */}
                {identity?.biography && (
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-surface/90 via-surface/50 to-surface/30 p-7 backdrop-blur-sm sm:p-9">
                        <div className="pointer-events-none absolute -top-20 -left-20 h-60 w-60 rounded-full bg-accent-gold/5 blur-[100px]" />
                        <div className="pointer-events-none absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-accent-gold/5 blur-[100px]" />
                        <div className="relative">
                            <div className="mb-4 flex items-center gap-2">
                                <Quote
                                    size={16}
                                    className="text-accent-gold/60"
                                />
                                <span className="text-[11px] font-bold tracking-widest text-accent-gold/60 uppercase">
                                    Biography
                                </span>
                            </div>
                            <p className="text-base leading-relaxed whitespace-pre-wrap text-text-primary/90 sm:text-lg sm:leading-8">
                                {identity.biography}
                            </p>
                        </div>
                    </div>
                )}

                {/* Short Introduction */}
                {identity?.short_introduction && !identity?.biography && (
                    <div className="rounded-2xl border border-accent-gold/10 bg-gradient-to-r from-accent-gold/[0.04] to-transparent px-6 py-4">
                        <p className="text-sm text-text-muted/80 italic">
                            &ldquo;{identity.short_introduction}&rdquo;
                        </p>
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        {
                            icon: Heart,
                            label: 'Living Status',
                            value:
                                person.living_status === 'living'
                                    ? 'Living'
                                    : 'Deceased',
                            color:
                                person.living_status === 'living'
                                    ? 'text-emerald-400'
                                    : 'text-slate-400',
                        },
                        {
                            icon: TreePine,
                            label: 'Type',
                            value: person.type?.replace(/_/g, ' ') ?? '—',
                        },
                        {
                            icon: Star,
                            label: 'Featured',
                            value: person.is_featured ? 'Featured' : '—',
                        },
                        {
                            icon: Users,
                            label: 'Role',
                            value: person.family_branch || 'Member',
                        },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-white/[0.06] bg-surface/50 px-4 py-3 backdrop-blur-sm"
                        >
                            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
                                <stat.icon
                                    size={12}
                                    className={stat.color || 'text-accent-gold'}
                                />
                                {stat.label}
                            </div>
                            <p className="text-sm font-bold text-text-primary capitalize">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Identity & Heritage */}
                <div className="grid gap-5 md:grid-cols-2">
                    {hasIdentity && (
                        <SectionCard icon={BookOpen} title="Identity">
                            <div className="space-y-4">
                                <Detail
                                    icon={MapPin}
                                    label="Legal Name"
                                    value={identity.legal_name}
                                />
                                {identity.display_name && (
                                    <Detail
                                        icon={Star}
                                        label="Known As"
                                        value={identity.display_name}
                                    />
                                )}
                                {identity.nickname && (
                                    <Detail
                                        icon={Heart}
                                        label="Nickname"
                                        value={identity.nickname}
                                    />
                                )}
                                {identity.gender && (
                                    <Detail
                                        icon={Users}
                                        label="Gender"
                                        value={identity.gender}
                                    />
                                )}
                                {identity.birth_date && (
                                    <Detail
                                        icon={Calendar}
                                        label="Birth"
                                        value={`${identity.birth_date}${identity.birth_place ? ` · ${identity.birth_place}` : ''}`}
                                    />
                                )}
                                {identity.death_date && (
                                    <Detail
                                        icon={Calendar}
                                        label="Death"
                                        value={`${identity.death_date}${identity.death_place ? ` · ${identity.death_place}` : ''}`}
                                    />
                                )}
                                {identity.burial_location && (
                                    <Detail
                                        icon={MapPin}
                                        label="Burial"
                                        value={identity.burial_location}
                                    />
                                )}
                            </div>
                        </SectionCard>
                    )}

                    {hasHeritage && (
                        <SectionCard icon={Globe} title="Heritage">
                            <div className="space-y-4">
                                {heritage.nationality && (
                                    <Detail
                                        icon={Flag}
                                        label="Nationality"
                                        value={heritage.nationality}
                                    />
                                )}
                                {heritage.ethnicity && (
                                    <Detail
                                        icon={Users}
                                        label="Ethnicity"
                                        value={heritage.ethnicity}
                                    />
                                )}
                                {heritage.tribe && (
                                    <Detail
                                        icon={Map}
                                        label="Tribe"
                                        value={heritage.tribe}
                                    />
                                )}
                                {heritage.clan && (
                                    <Detail
                                        icon={Users}
                                        label="Clan"
                                        value={heritage.clan}
                                    />
                                )}
                                {heritage.religion && (
                                    <Detail
                                        icon={Church}
                                        label="Religion"
                                        value={heritage.religion}
                                    />
                                )}
                                {heritage.village && (
                                    <Detail
                                        icon={MapPin}
                                        label="Village"
                                        value={heritage.village}
                                    />
                                )}
                                {heritage.town && (
                                    <Detail
                                        icon={MapPin}
                                        label="Town"
                                        value={heritage.town}
                                    />
                                )}
                                {heritage.state && (
                                    <Detail
                                        icon={MapPin}
                                        label="State"
                                        value={heritage.state}
                                    />
                                )}
                                {heritage.country && (
                                    <Detail
                                        icon={Flag}
                                        label="Country"
                                        value={heritage.country}
                                    />
                                )}
                                {heritage.migration_story && (
                                    <Detail
                                        icon={Map}
                                        label="Migration"
                                        value={heritage.migration_story}
                                    />
                                )}
                            </div>
                        </SectionCard>
                    )}

                    {(person.family_branch ||
                        person.clan ||
                        person.kindred ||
                        person.ancestral_home) && (
                        <SectionCard icon={TreePine} title="Lineage">
                            <div className="space-y-4">
                                {person.family_branch && (
                                    <Detail
                                        icon={Map}
                                        label="Branch"
                                        value={person.family_branch}
                                    />
                                )}
                                {person.clan && (
                                    <Detail
                                        icon={Users}
                                        label="Clan"
                                        value={person.clan}
                                    />
                                )}
                                {person.kindred && (
                                    <Detail
                                        icon={Heart}
                                        label="Kindred"
                                        value={person.kindred}
                                    />
                                )}
                                {person.ancestral_home && (
                                    <Detail
                                        icon={MapPin}
                                        label="Ancestral Home"
                                        value={person.ancestral_home}
                                    />
                                )}
                                {person.diaspora_generation != null && (
                                    <Detail
                                        icon={Globe}
                                        label="Diaspora Gen"
                                        value={`${person.diaspora_generation}`}
                                    />
                                )}
                            </div>
                        </SectionCard>
                    )}

                    {hasAddresses && (
                        <SectionCard icon={MapPin} title="Addresses">
                            <div className="space-y-4">
                                {addresses.map((a: any) => (
                                    <div
                                        key={a.id}
                                        className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
                                    >
                                        <p className="text-[11px] font-bold tracking-wider text-accent-gold uppercase">
                                            {a.type}
                                        </p>
                                        <p className="mt-0.5 text-sm text-text-primary">
                                            {[
                                                a.line1,
                                                a.city,
                                                a.town,
                                                a.village,
                                                a.state,
                                                a.country,
                                            ]
                                                .filter(Boolean)
                                                .join(', ')}
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
                                    <div
                                        key={r.id}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-gold/60" />
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">
                                                {r.role}
                                            </p>
                                            {r.context && (
                                                <p className="text-xs text-text-muted">
                                                    {r.context}
                                                </p>
                                            )}
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
                                    <div
                                        key={t.id}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-gold/60" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-text-primary">
                                                    {t.title}
                                                </p>
                                                {t.is_traditional && (
                                                    <span className="rounded-full bg-accent-gold/10 px-2 py-0.5 text-[10px] font-medium text-accent-gold">
                                                        Traditional
                                                    </span>
                                                )}
                                            </div>
                                            {t.granted_by && (
                                                <p className="text-xs text-text-muted">
                                                    by {t.granted_by}
                                                </p>
                                            )}
                                            {t.year && (
                                                <p className="text-xs text-text-muted">
                                                    {t.year}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </div>

                {/* Milestones */}
                {hasMilestones && (
                    <SectionCard icon={Sparkles} title="Milestones">
                        <div className="relative space-y-5">
                            <div className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-accent-gold/40 via-accent-gold/20 to-transparent" />
                            {milestones.map((m: any) => (
                                <div
                                    key={m.id}
                                    className="relative flex items-start gap-4 pl-6"
                                >
                                    <div className="absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full border-2 border-accent-gold bg-bg-dark" />
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-baseline gap-2">
                                            <p className="text-sm font-bold text-text-primary">
                                                {m.title}
                                            </p>
                                            {m.date && (
                                                <span className="text-[11px] text-text-muted">
                                                    {m.date}
                                                </span>
                                            )}
                                        </div>
                                        {m.description && (
                                            <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                                                {m.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}

                {/* Languages & Tags */}
                <div className="grid gap-5 md:grid-cols-2">
                    {hasLanguages && (
                        <SectionCard icon={Languages} title="Languages">
                            <div className="flex flex-wrap gap-2">
                                {languages.map((l: any) => (
                                    <span
                                        key={l.id}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-text-primary backdrop-blur-sm"
                                    >
                                        {l.language}
                                        {l.dialect ? ` (${l.dialect})` : ''}
                                        <span className="ml-0.5 text-text-muted">
                                            · {l.proficiency}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {hasTags && (
                        <SectionCard icon={Star} title="Tags">
                            <div className="flex flex-wrap gap-2">
                                {tags.map((t: any) => (
                                    <span
                                        key={t.id}
                                        className="inline-flex items-center rounded-full bg-accent-gold/[0.07] px-3 py-1.5 text-xs font-medium text-accent-gold backdrop-blur-sm"
                                    >
                                        #{t.tag}
                                    </span>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </div>

                {/* Empty state */}
                {!hasIdentity &&
                    !hasHeritage &&
                    !hasLanguages &&
                    !hasRoles &&
                    !hasTitles &&
                    !hasMilestones &&
                    !hasTags &&
                    !identity?.biography &&
                    !person.family_branch && (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-16">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-gold/10">
                                <BookOpen
                                    size={24}
                                    className="text-accent-gold/60"
                                />
                            </div>
                            <p className="text-sm font-medium text-text-muted">
                                No details added yet
                            </p>
                            <p className="mt-1 text-xs text-text-muted/60">
                                Edit this profile to add biographical
                                information
                            </p>
                        </div>
                    )}
            </div>
        </>
    );
}
