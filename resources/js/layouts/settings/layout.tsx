import { Link } from '@inertiajs/react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { motion } from 'framer-motion';
import {
    User,
    Shield,
    Palette,
    Home,
    Lock,
    ChevronDown,
    AlertTriangle,
    Users,
    Clock,
    BookOpen,
    Image,
    Globe,
    Heart,
    FileText,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editSecurity } from '@/routes/security';

interface SidebarChild {
    title: string;
    href: string;
    icon: React.ReactNode;
}

interface SidebarGroup {
    title: string;
    icon: React.ReactNode;
    children: SidebarChild[];
}

interface SidebarLink {
    title: string;
    href: string;
    icon: React.ReactNode;
}

type SidebarItem = SidebarGroup | SidebarLink;

const personChildren: SidebarChild[] = [
    { title: 'About', href: '/settings/about', icon: <User size={14} /> },
    {
        title: 'Family Tree',
        href: '/settings/family-tree',
        icon: <Users size={14} />,
    },
    {
        title: 'Life Timeline',
        href: '/settings/timeline',
        icon: <Clock size={14} />,
    },
    {
        title: 'Stories',
        href: '/settings/stories',
        icon: <BookOpen size={14} />,
    },
    {
        title: 'Photos & Documents',
        href: '/settings/media',
        icon: <Image size={14} />,
    },
    {
        title: 'Heritage',
        href: '/settings/heritage',
        icon: <Globe size={14} />,
    },
    {
        title: 'Memories From Others',
        href: '/settings/memories',
        icon: <Heart size={14} />,
    },
    {
        title: 'Permissions & Consent',
        href: '/settings/permissions',
        icon: <Shield size={14} />,
    },
    {
        title: 'Admin Notes',
        href: '/settings/activity',
        icon: <FileText size={14} />,
    },
];

const sidebarItems: SidebarItem[] = [
    {
        title: 'Person',
        icon: <User size={16} />,
        children: personChildren,
    },
    { title: 'House', href: '/settings/house', icon: <Home size={16} /> },
    { title: 'Privacy', href: '/settings/privacy', icon: <Lock size={16} /> },
    { title: 'Security', href: editSecurity().url, icon: <Shield size={16} /> },
    {
        title: 'Appearance',
        href: editAppearance().url,
        icon: <Palette size={16} />,
    },
    {
        title: 'Danger Zone',
        href: '/settings/danger-zone',
        icon: <AlertTriangle size={16} />,
    },
];

function isGroup(item: SidebarItem): item is SidebarGroup {
    return 'children' in item;
}

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl, currentUrl } = useCurrentUrl();
    const isOnPersonPage =
        currentUrl.startsWith('/settings/about') ||
        currentUrl.startsWith('/settings/family-tree') ||
        currentUrl.startsWith('/settings/timeline') ||
        currentUrl.startsWith('/settings/stories') ||
        currentUrl.startsWith('/settings/media') ||
        currentUrl.startsWith('/settings/heritage') ||
        currentUrl.startsWith('/settings/memories') ||
        currentUrl.startsWith('/settings/permissions') ||
        currentUrl.startsWith('/settings/activity');
    const [personOpen, setPersonOpen] = useState(isOnPersonPage);

    useEffect(() => {
        if (isOnPersonPage) {
            setPersonOpen(true);
        }
    }, [isOnPersonPage]);

    return (
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-32 md:p-8 md:pb-8 lg:p-16">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6 md:gap-12 lg:flex-row"
            >
                {/* Settings Navigation */}
                <div className="w-full shrink-0 lg:w-64">
                    <h2 className="mb-4 text-xl leading-tight font-bold text-text-primary md:mb-8 md:text-3xl">
                        Settings
                    </h2>
                    <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-border-subtle bg-surface/50 p-1.5 lg:flex-col">
                        {sidebarItems.map((item) => {
                            if (isGroup(item)) {
                                const groupActive = isOnPersonPage;

                                return (
                                    <Collapsible.Root
                                        key={item.title}
                                        open={personOpen}
                                        onOpenChange={setPersonOpen}
                                        className="w-full"
                                    >
                                        <Collapsible.Trigger
                                            className={cn(
                                                'flex w-full shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-bold transition-all md:gap-3 md:p-4 md:text-sm',
                                                groupActive
                                                    ? 'bg-accent-gold text-bg-dark shadow-lg shadow-accent-gold/20'
                                                    : 'text-text-muted hover:bg-white/5 hover:text-text-primary',
                                            )}
                                        >
                                            {item.icon}
                                            <span className="grow text-left">
                                                {item.title}
                                            </span>
                                            <ChevronDown
                                                size={14}
                                                className={cn(
                                                    'transition-transform',
                                                    personOpen && 'rotate-180',
                                                )}
                                            />
                                        </Collapsible.Trigger>
                                        <Collapsible.Content className="data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down mt-1 space-y-0.5 overflow-hidden pl-6">
                                            {item.children.map((child) => {
                                                const childActive =
                                                    isCurrentOrParentUrl(
                                                        child.href,
                                                    );

                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={cn(
                                                            'flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-medium transition-all md:text-xs',
                                                            childActive
                                                                ? 'bg-accent-gold/10 text-accent-gold'
                                                                : 'text-text-muted hover:bg-white/5 hover:text-text-primary',
                                                        )}
                                                    >
                                                        {child.icon}
                                                        <span>
                                                            {child.title}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </Collapsible.Content>
                                    </Collapsible.Root>
                                );
                            }

                            const active = isCurrentOrParentUrl(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-bold transition-all md:gap-3 md:p-4 md:text-sm',
                                        active
                                            ? 'bg-accent-gold text-bg-dark shadow-lg shadow-accent-gold/20'
                                            : 'text-text-muted hover:bg-white/5 hover:text-text-primary',
                                    )}
                                >
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Settings Content */}
                <div className="min-w-0 grow">
                    <div className="rounded-3xl border border-border-subtle bg-surface p-5 shadow-xl md:p-8 lg:p-12">
                        {children}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
