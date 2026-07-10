import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Camera, User, Palette, ShieldCheck, Copy, LogOut, Bell, Globe, Lock, HeartHandshake } from 'lucide-react';
import React, { useRef, useState } from 'react';
import AppearanceTabs from '@/components/appearance-tabs';
import { useConfirm } from '@/hooks/use-confirm';

interface HouseMember {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    position: string | null;
    preferences: {
        default_privacy?: string;
        email_notifications?: boolean;
    };
    created_at: string;
    access_url: string;
    owner_name: string;
}

interface SettingsProps {
    member: HouseMember;
}

export default function HouseSettings({ member }: SettingsProps) {
    const { props } = usePage();
    const houseMember = (props as any).house_member as HouseMember | null;
    const displayName = houseMember?.name ?? member.name;
    const displayAvatar = houseMember?.avatar ?? member.avatar;

    const confirm = useConfirm();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(displayAvatar);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [copied, setCopied] = useState(false);

    const profileForm = useForm({
        name: displayName,
        bio: member.bio ?? '',
        avatar: null as File | null,
    });

    const preferencesForm = useForm({
        default_privacy: member.preferences?.default_privacy ?? 'public',
        email_notifications: member.preferences?.email_notifications ?? true,
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setAvatarFile(file);
            profileForm.setData('avatar', file);
            const url = URL.createObjectURL(file);
            setAvatarPreview(url);
        }
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post('/house/settings', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setAvatarFile(null);
            },
        });
    };

    const handlePreferencesSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        preferencesForm.post('/house/settings/preferences', {
            preserveScroll: true,
        });
    };

    const handleLeave = async () => {
        const ok = await confirm('Are you sure you want to leave this house? You will lose access to all rooms and your account will be deleted. This cannot be undone.');

        if (ok) {
            router.post('/house/settings/leave');
        }
    };

    const copyAccessLink = () => {
        navigator.clipboard.writeText(member.access_url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        /* FIXED: Combined 'w-full' with min-w-0 safety checks, added a clean, fluid structural padding 
          to block downstream text clipping caused by the layout parent's perspective-2000 style context.
        */
        <div className="mx-auto w-full max-w-4xl px-4 pt-4 pb-32 sm:px-6 md:p-8 lg:p-16">
            <Head title="House Settings" />

            <div className="mb-8 md:mb-12">
                <span className="text-[10px] font-semibold tracking-widest text-accent-gold uppercase md:text-xs">
                    Settings
                </span>
                <h1 className="mt-2 text-2xl leading-tight font-bold tracking-tight text-text-primary sm:text-3xl md:text-5xl">
                    Your Profile
                </h1>
            </div>

            <div className="space-y-8 md:space-y-10">
                {/* Profile Section */}
                <section>
                    <div className="mb-4 flex items-center gap-3 md:mb-6">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-gold/10 text-accent-gold md:h-10 md:w-10">
                            <User size={16} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">Profile</h2>
                            <p className="text-xs text-text-muted leading-relaxed">Update your name, avatar, and personal details.</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-5 rounded-2xl border border-border-subtle bg-surface/30 p-5 md:space-y-6 md:p-8">
                        {/* Avatar */}
                        <div className="flex items-center gap-5">
                            <div className="group relative shrink-0">
                                <img
                                    src={avatarPreview || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'}
                                    className="h-20 w-20 rounded-[28px] object-cover ring-4 ring-border-subtle"
                                    alt=""
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-[28px] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
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
                            <div>
                                <p className="text-sm font-semibold text-text-primary">{profileForm.data.name}</p>
                                <p className="text-xs text-text-muted">{member.email}</p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-1 text-[10px] font-bold tracking-widest text-accent-gold uppercase hover:underline"
                                >
                                    Change Avatar
                                </button>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                Name
                            </label>
                            <input
                                type="text"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                placeholder="Your name"
                                required
                                className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                            />
                            {profileForm.errors.name && (
                                <p className="mt-1 text-xs text-red-400">{profileForm.errors.name}</p>
                            )}
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                Bio
                            </label>
                            <textarea
                                value={profileForm.data.bio}
                                onChange={(e) => profileForm.setData('bio', e.target.value)}
                                placeholder="A short bio about yourself..."
                                rows={3}
                                maxLength={1000}
                                className="w-full resize-none rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                            />
                            <div className="flex items-center justify-between">
                                {profileForm.errors.bio && (
                                    <p className="text-xs text-red-400">{profileForm.errors.bio}</p>
                                )}
                                <span className="ml-auto text-[10px] text-text-muted/50">
                                    {profileForm.data.bio.length}/1000
                                </span>
                            </div>
                        </div>

                        {/* Email (read-only) */}
                        <div className="space-y-2">
                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                Email
                            </label>
                            <input
                                type="email"
                                value={member.email}
                                disabled
                                className="w-full cursor-not-allowed rounded-xl border border-border-subtle bg-bg-dark/50 px-4 py-3 text-sm text-text-muted/60 focus:outline-none"
                            />
                            <p className="ml-1 text-[10px] text-text-muted/50">
                                Managed by the house owner ({member.owner_name}).
                            </p>
                        </div>

                        {/* FIXED: Removed inline-flex on the outer button container block to allow clean right-edge spacing alignment */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={profileForm.processing || !profileForm.data.name.trim()}
                                className="w-full rounded-xl bg-accent-gold px-6 py-3 text-xs font-bold tracking-widest text-bg-dark uppercase transition-all hover:opacity-90 disabled:opacity-50 sm:w-auto sm:inline-flex sm:items-center sm:justify-center sm:gap-2"
                            >
                                <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                                    <User size={14} className="shrink-0" />
                                    {profileForm.processing ? 'Saving...' : 'Save Profile'}
                                </span>
                            </button>
                        </div>
                    </form>
                </section>

                {/* Appearance Section */}
                <section>
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-gold/10 text-accent-gold md:h-10 md:w-10">
                            <Palette size={16} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">Appearance</h2>
                            <p className="text-xs text-text-muted">Choose between light, dark, or system theme.</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border-subtle bg-surface/30 p-5 overflow-x-auto md:p-8">
                        <AppearanceTabs />
                    </div>
                </section>

                {/* Room Preferences Section */}
                <section>
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-gold/10 text-accent-gold md:h-10 md:w-10">
                            <ShieldCheck size={16} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">Room Preferences</h2>
                            <p className="text-xs text-text-muted leading-relaxed">Default settings for rooms you create.</p>
                        </div>
                    </div>

                    <form onSubmit={handlePreferencesSubmit} className="space-y-5 rounded-2xl border border-border-subtle bg-surface/30 p-5 md:space-y-6 md:p-8">
                        <div className="space-y-3">
                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                Default Privacy
                            </label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => preferencesForm.setData('default_privacy', 'public')}
                                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all sm:flex-1 ${preferencesForm.data.default_privacy === 'public'
                                        ? 'border-accent-gold/50 bg-accent-gold/5 text-accent-gold'
                                        : 'border-border-subtle bg-bg-dark text-text-muted hover:border-accent-gold/30'
                                    }`}
                                >
                                    <Globe size={16} className="shrink-0" />
                                    <div className="flex flex-col items-start min-w-0">
                                        <span className="text-xs font-semibold">Public</span>
                                        <span className="text-[9px] text-text-muted">Anyone with the link</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => preferencesForm.setData('default_privacy', 'private')}
                                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all sm:flex-1 ${preferencesForm.data.default_privacy === 'private'
                                        ? 'border-accent-gold/50 bg-accent-gold/5 text-accent-gold'
                                        : 'border-border-subtle bg-bg-dark text-text-muted hover:border-accent-gold/30'
                                    }`}
                                >
                                    <Lock size={16} className="shrink-0" />
                                    <div className="flex flex-col items-start min-w-0">
                                        <span className="text-xs font-semibold">Private</span>
                                        <span className="text-[9px] text-text-muted">Only house members</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                <div className="flex items-center gap-2">
                                    <Bell size={12} />
                                    Email Notifications
                                </div>
                            </label>
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-dark px-4 py-3">
                                <div className="min-w-0 flex-1">
                                    <span className="text-xs font-semibold text-text-primary">Activity alerts</span>
                                    <p className="text-[9px] text-text-muted leading-relaxed line-clamp-1">
                                        Get notified when someone adds stories or tributes
                                    </p>
                                </div>
                                <label className="relative shrink-0 inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={preferencesForm.data.email_notifications}
                                        onChange={(e) => preferencesForm.setData('email_notifications', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full border border-border-subtle bg-bg-dark/50 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-text-muted after:transition-all peer-checked:bg-accent-gold/20 peer-checked:after:translate-x-full peer-checked:after:bg-accent-gold" />
                                </label>
                            </div>
                        </div>

                        {/* FIXED: Applied layout patches for text visibility safety */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={preferencesForm.processing}
                                className="w-full rounded-xl bg-accent-gold px-6 py-3 text-xs font-bold tracking-widest text-bg-dark uppercase transition-all hover:opacity-90 disabled:opacity-50 sm:w-auto sm:inline-flex sm:items-center sm:justify-center sm:gap-2"
                            >
                                <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                                    <ShieldCheck size={14} className="shrink-0" />
                                    {preferencesForm.processing ? 'Saving...' : 'Save Preferences'}
                                </span>
                            </button>
                        </div>
                    </form>
                </section>

                {/* Access & Membership Section */}
                <section>
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-gold/10 text-accent-gold md:h-10 md:w-10">
                            <HeartHandshake size={16} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">Access &amp; Membership</h2>
                            <p className="text-xs text-text-muted">Your house membership details and access link.</p>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface/30 p-5 md:p-8">
                        <div className="flex items-center gap-2 rounded-xl bg-bg-dark/50 px-4 py-3">
                            <span className="text-xs text-text-muted">House Owner</span>
                            <span className="ml-auto text-sm font-semibold text-text-primary">{member.owner_name}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-bg-dark/50 px-4 py-3">
                            <span className="text-xs text-text-muted">Member ID</span>
                            <span className="ml-auto text-sm font-mono font-semibold text-text-primary">#{member.id}</span>
                        </div>
                        {member.position && (
                            <div className="flex items-center gap-2 rounded-xl bg-bg-dark/50 px-4 py-3">
                                <span className="text-xs text-text-muted">Relationship</span>
                                <span className="ml-auto text-sm font-semibold capitalize text-text-primary">{member.position.replace('_', ' / ')}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 rounded-xl bg-bg-dark/50 px-4 py-3">
                            <span className="text-xs text-text-muted">Member since</span>
                            <span className="ml-auto text-sm font-semibold text-text-primary">{member.created_at}</span>
                        </div>

                        {/* Access Link */}
                        <div className="rounded-xl border border-border-subtle bg-bg-dark/30 p-4">
                            <label className="mb-2 ml-1 block text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                Your Access Link
                            </label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                                <div className="min-w-0 flex-1 truncate rounded-lg border border-border-subtle bg-bg-dark/60 px-3 py-2.5">
                                    <span className="text-xs text-text-muted font-mono">{member.access_url}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={copyAccessLink}
                                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[10px] font-bold tracking-wider uppercase transition-all sm:shrink-0 ${copied
                                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                        : 'border-border-subtle text-text-muted hover:border-accent-gold/40 hover:text-accent-gold'
                                    }`}
                                >
                                    <Copy size={12} />
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <p className="mt-2 ml-1 text-[9px] text-text-muted/50">
                                Share this link with trusted family to let them access this house.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section>
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                            <LogOut size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
                            <p className="text-xs text-text-muted">Irreversible actions for your membership.</p>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 md:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-text-primary">Leave this house</p>
                                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                                    Your membership will be deleted and you will lose access to all rooms. This cannot be undone.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleLeave}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 px-5 py-3 text-xs font-bold tracking-widest text-red-400 uppercase transition-all hover:bg-red-500/10 sm:w-auto sm:shrink-0 sm:py-2.5"
                            >
                                <LogOut size={14} />
                                Leave House
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}