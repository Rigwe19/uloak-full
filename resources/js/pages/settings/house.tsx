import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import {
    User,
    MessageSquare,
    Files,
    Copy,
    UserPlus,
    Users,
    Link as LinkIcon,
    Share2,
    Camera,
    Image,
    Check,
    Trash2,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShareQRCode } from '@/components/dashboard/share-qr-code';
import { useConfirm } from '@/hooks/use-confirm';
import { HOUSE_PATTERNS } from '@/lib/house-patterns';

const FAMILY_POSITIONS = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'partner', label: 'Partner' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'grandchild', label: 'Grandchild' },
    { value: 'aunt_uncle', label: 'Aunt / Uncle' },
    { value: 'niece_nephew', label: 'Niece / Nephew' },
    { value: 'cousin', label: 'Cousin' },
    { value: 'in_law', label: 'In-law' },
    { value: 'godparent', label: 'Godparent' },
    { value: 'friend', label: 'Friend / Trusted' },
    { value: 'other', label: 'Other' },
] as const;

interface HouseMember {
    id: number;
    name: string;
    email: string;
    position: string | null;
    access_url: string;
    created_at: string;
}

interface HouseData {
    thumbnail: string | null;
    pattern: string | null;
    pattern_upload: string | null;
}

interface HouseProps {
    auth: {
        user: any;
    };
    house?: HouseData;
}

export default function House({ auth, house }: HouseProps) {
    const thumbInputRef = useRef<HTMLInputElement>(null);
    const patternUploadRef = useRef<HTMLInputElement>(null);
    const [members, setMembers] = useState<HouseMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberPosition, setNewMemberPosition] = useState('');
    const [addingMember, setAddingMember] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [sharingMember, setSharingMember] = useState<HouseMember | null>(
        null,
    );
    const [thumbPreview, setThumbPreview] = useState<string | null>(
        house?.thumbnail ?? null,
    );
    const [selectedPattern, setSelectedPattern] = useState(
        house?.pattern ?? 'none',
    );
    const [patternSaving, setPatternSaving] = useState(false);
    const [patternUploading, setPatternUploading] = useState(false);

    const loadMembers = useCallback(() => {
        setMembersLoading(true);
        fetch('/settings/house/members')
            .then((res) => res.json())
            .then((data) => {
                setMembers(data.members ?? []);
            })
            .catch(() => {})
            .finally(() => setMembersLoading(false));
    }, []);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    useEffect(() => {
        setSelectedPattern(house?.pattern ?? 'none');
    }, [house?.pattern]);

    useEffect(() => {
        setThumbPreview(house?.thumbnail ?? null);
    }, [house?.thumbnail]);

    const copyToClipboard = useCallback((url: string, id: number) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    }, []);

    const handleAddMember = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!newMemberName || !newMemberEmail) {
                return;
            }

            setAddingMember(true);
            const formData = new FormData();
            formData.append('name', newMemberName);
            formData.append('email', newMemberEmail);

            if (newMemberPosition) {
                formData.append('position', newMemberPosition);
            }

            router.post('/settings/house/members', formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setNewMemberName('');
                    setNewMemberEmail('');
                    setNewMemberPosition('');
                    setAddingMember(false);
                    loadMembers();
                },
                onError: () => {
                    setAddingMember(false);
                },
            });
        },
        [newMemberName, newMemberEmail, newMemberPosition, loadMembers],
    );

    const confirm = useConfirm();

    const handleRemoveMember = useCallback(
        async (memberId: number) => {
            const ok = await confirm(
                'Remove this house member? They will lose access to all rooms in your house.',
            );

            if (!ok) {
                return;
            }

            router.delete(`/settings/house/members/${memberId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    loadMembers();
                },
            });
        },
        [loadMembers, confirm],
    );

    const handleRegenerateToken = useCallback(
        async (memberId: number) => {
            const ok = await confirm(
                'Generate a new access link? The old link will stop working.',
            );

            if (!ok) {
                return;
            }

            router.post(
                `/settings/house/members/${memberId}/regenerate-token`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        loadMembers();
                    },
                },
            );
        },
        [loadMembers, confirm],
    );

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('thumbnail', file);
        setThumbPreview(URL.createObjectURL(file));

        router.post('/settings/house/thumbnail', formData, {
            forceFormData: true,
            preserveScroll: true,
            onError: () => {
                setThumbPreview(house?.thumbnail ?? null);
            },
        });
    };

    const handlePatternChange = (pattern: string) => {
        if (pattern === selectedPattern) {
            return;
        }

        setSelectedPattern(pattern);
        setPatternSaving(true);

        router.post(
            '/settings/house/pattern',
            { pattern },
            {
                preserveScroll: true,
                onFinish: () => setPatternSaving(false),
            },
        );
    };

    const handlePatternImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setPatternUploading(true);
        const formData = new FormData();
        formData.append('pattern_image', file);

        router.post('/settings/house/pattern-upload', formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setPatternUploading(false),
        });
    };

    const handleRemovePatternImage = () => {
        router.delete('/settings/house/pattern-upload', {
            preserveScroll: true,
        });
    };

    const stats = [
        {
            label: 'Total Members',
            value: members.length,
            icon: User,
        },
        {
            label: 'Stories Preserved',
            value: 0,
            icon: MessageSquare,
        },
        {
            label: 'Archival Space',
            value: '0 GB',
            icon: Files,
        },
    ];

    return (
        <>
            <Head title="House Settings" />

            <div className="space-y-8">
                <div>
                    <h3 className="mb-2 text-xl font-bold text-text-primary">
                        House of {auth.user.name} Family
                    </h3>
                    <p className="text-sm text-text-muted">
                        Manage house members and their access to your family
                        legacy.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-border-subtle bg-bg-dark p-5"
                        >
                            <stat.icon
                                size={16}
                                className="mb-4 text-accent-gold"
                            />
                            <span className="block text-2xl font-bold text-text-primary">
                                {stat.value}
                            </span>
                            <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* House Identity Section */}
                <div className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="flex items-center gap-2 text-accent-gold">
                        <Image size={16} />
                        <span className="text-xs font-bold tracking-widest uppercase">
                            House Identity
                        </span>
                    </div>
                    <p className="text-xs text-text-muted">
                        Customize the visual identity of this house — a cover
                        thumbnail and background pattern.
                    </p>

                    {/* Thumbnail Upload */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold tracking-wider text-text-muted uppercase">
                            House Thumbnail
                        </label>
                        <p className="-mt-1 text-[10px] text-text-muted/60">
                            This image appears as the cover of your house and as
                            preview when sharing the house link.
                        </p>
                        <div
                            onClick={() => thumbInputRef.current?.click()}
                            className="relative aspect-video w-full max-w-lg cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-bg-dark/50 transition-all hover:border-accent-gold/40"
                        >
                            {thumbPreview ? (
                                <img
                                    src={thumbPreview}
                                    className="h-full w-full object-cover"
                                    alt="House thumbnail"
                                />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-text-muted">
                                    <Camera size={24} />
                                    <span className="text-xs">
                                        Upload a house cover image
                                    </span>
                                </div>
                            )}
                            <input
                                ref={thumbInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleThumbnailChange}
                                accept="image/*"
                            />
                        </div>
                    </div>

                    {/* Pattern Upload */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
                            Upload Pattern Image
                        </label>
                        <p className="-mt-1 text-[10px] text-text-muted/60">
                            Upload a seamless tile image to use as the
                            background pattern.
                        </p>
                        <div className="flex items-center gap-4">
                            {house?.pattern_upload ? (
                                <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10">
                                    <img
                                        src={house.pattern_upload}
                                        alt="Pattern preview"
                                        className="h-full w-full object-cover"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemovePatternImage}
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                        <Trash2
                                            size={16}
                                            className="text-red-400"
                                        />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() =>
                                        patternUploadRef.current?.click()
                                    }
                                    disabled={patternUploading}
                                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-white/10 text-text-muted transition-all hover:border-accent-gold/40 hover:text-accent-gold"
                                >
                                    {patternUploading ? (
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
                                    ) : (
                                        <Camera size={20} />
                                    )}
                                </button>
                            )}
                            <span className="text-[11px] text-text-muted/70">
                                {house?.pattern_upload
                                    ? 'Click the image to remove it.'
                                    : 'Click to upload a tileable pattern image.'}
                            </span>
                            <input
                                ref={patternUploadRef}
                                type="file"
                                className="hidden"
                                onChange={handlePatternImageUpload}
                                accept="image/*"
                            />
                        </div>
                    </div>

                    {/* Predefined Pattern Selector */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
                                Or Choose a Preset Pattern
                            </label>
                            {patternSaving && (
                                <span className="animate-pulse text-[9px] text-accent-gold">
                                    Saving...
                                </span>
                            )}
                        </div>
                        <p className="-mt-1 text-[10px] text-text-muted/60">
                            A subtle CSS pattern applied as the background of
                            your house.
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {Object.entries(HOUSE_PATTERNS).map(
                                ([key, pattern]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handlePatternChange(key)}
                                        className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                                            selectedPattern === key
                                                ? 'border-accent-gold/50 bg-accent-gold/5 ring-1 ring-accent-gold/20'
                                                : 'border-white/10 bg-white/[0.02] hover:border-accent-gold/30'
                                        }`}
                                    >
                                        <div
                                            className="h-10 w-full rounded-lg border border-white/5"
                                            style={
                                                pattern.preview
                                                    ? {
                                                          background:
                                                              pattern.preview,
                                                          backgroundColor:
                                                              'rgba(192, 160, 96, 0.03)',
                                                      }
                                                    : {
                                                          backgroundColor:
                                                              'rgba(192, 160, 96, 0.03)',
                                                      }
                                            }
                                        />
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={`text-[10px] font-bold tracking-wider uppercase ${
                                                    selectedPattern === key
                                                        ? 'text-accent-gold'
                                                        : 'text-text-muted'
                                                }`}
                                            >
                                                {pattern.label}
                                            </span>
                                            {selectedPattern === key && (
                                                <Check
                                                    size={10}
                                                    className="shrink-0 text-accent-gold"
                                                />
                                            )}
                                        </div>
                                    </button>
                                ),
                            )}
                        </div>
                    </div>
                </div>

                {/* Add House Member Form */}
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <form onSubmit={handleAddMember} className="space-y-4">
                        <div className="flex items-center gap-2 text-accent-gold">
                            <UserPlus size={16} />
                            <span className="text-xs font-bold tracking-widest uppercase">
                                Add a House Member
                            </span>
                        </div>
                        <p className="text-xs text-text-muted">
                            Add a family member or trusted person to your house.
                            They will be able to view all rooms and create new
                            ones. House members access via a magic link — no
                            password needed.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-[10px] font-bold tracking-wider text-text-muted uppercase">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={newMemberName}
                                    onChange={(e) =>
                                        setNewMemberName(e.target.value)
                                    }
                                    placeholder="e.g. Mum"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 transition-colors outline-none focus:border-accent-gold/50"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold tracking-wider text-text-muted uppercase">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) =>
                                        setNewMemberEmail(e.target.value)
                                    }
                                    placeholder="mum@email.com"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 transition-colors outline-none focus:border-accent-gold/50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-[10px] font-bold tracking-wider text-text-muted uppercase">
                                Relationship / Position
                            </label>
                            <p className="mb-2 text-[10px] text-text-muted/60">
                                Used to build the family organogram.
                            </p>
                            <select
                                value={newMemberPosition}
                                onChange={(e) =>
                                    setNewMemberPosition(e.target.value)
                                }
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary transition-colors outline-none focus:border-accent-gold/50"
                            >
                                <option value="">Select relationship...</option>
                                {FAMILY_POSITIONS.map((pos) => (
                                    <option key={pos.value} value={pos.value}>
                                        {pos.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={
                                    addingMember ||
                                    !newMemberName ||
                                    !newMemberEmail
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-accent-gold px-5 py-2.5 text-xs font-bold tracking-widest text-bg-dark uppercase transition-all hover:opacity-90 disabled:opacity-50"
                            >
                                <UserPlus size={14} />
                                {addingMember ? 'Adding...' : 'Add Member'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Members List */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold tracking-widest text-text-muted uppercase">
                        House Members
                    </h4>

                    {membersLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
                        </div>
                    ) : members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-12 text-center">
                            <Users
                                size={32}
                                className="mb-3 text-text-muted/50"
                            />
                            <p className="text-sm text-text-muted">
                                No house members added yet.
                            </p>
                            <p className="text-xs text-text-muted/60">
                                Add someone above to share your family house.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-accent-gold/20"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-text-primary">
                                                    {member.name}
                                                </span>
                                                {member.position && (
                                                    <span className="rounded-full border border-accent-gold/20 bg-accent-gold/5 px-2 py-0.5 text-[9px] font-bold tracking-wider text-accent-gold uppercase">
                                                        {FAMILY_POSITIONS.find(
                                                            (p) =>
                                                                p.value ===
                                                                member.position,
                                                        )?.label ??
                                                            member.position}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-xs text-text-muted">
                                                {member.email}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/5 bg-bg-dark/60 px-3 py-2">
                                                <LinkIcon
                                                    size={12}
                                                    className="shrink-0 text-accent-gold"
                                                />
                                                <span className="truncate text-[11px] text-text-muted">
                                                    {member.access_url}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSharingMember(member)
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-[10px] font-bold tracking-wider text-accent-gold uppercase transition-all hover:border-accent-gold/40 hover:text-accent-gold"
                                                title="Share access link"
                                            >
                                                <Share2 size={12} />
                                                Share
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        member.access_url,
                                                        member.id,
                                                    )
                                                }
                                                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-bold tracking-wider uppercase transition-all ${
                                                    copiedId === member.id
                                                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                                        : 'border-white/10 text-text-muted hover:border-accent-gold/40 hover:text-accent-gold'
                                                }`}
                                                title="Copy access link"
                                            >
                                                <Copy size={12} />
                                                {copiedId === member.id
                                                    ? 'Copied!'
                                                    : 'Copy Link'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRegenerateToken(
                                                        member.id,
                                                    )
                                                }
                                                className="rounded-xl border border-white/10 px-3 py-2 text-[10px] font-bold tracking-wider text-text-muted uppercase transition-all hover:border-yellow-500/30 hover:text-yellow-400"
                                                title="Generate new link (old one stops working)"
                                            >
                                                Renew
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveMember(
                                                        member.id,
                                                    )
                                                }
                                                className="rounded-xl border border-white/10 px-3 py-2 text-[10px] font-bold tracking-wider text-text-muted uppercase transition-all hover:border-red-500/30 hover:text-red-400"
                                                title="Remove access"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {sharingMember && (
                <>
                    {createPortal(
                        <ShareQRCode
                            key={sharingMember.id}
                            roomSlug=""
                            roomName={sharingMember.name}
                            shareUrl={sharingMember.access_url}
                            entityName={sharingMember.name}
                            isOpen={true}
                            onClose={() => setSharingMember(null)}
                        />,
                        document.body,
                    )}
                </>
            )}
        </>
    );
}
