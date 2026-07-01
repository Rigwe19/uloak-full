import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { User, Shield, Palette, Home, Lock, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

const sidebarNavItems = [
    {
        title: 'Profile',
        href: edit().url,
        icon: User,
    },
    {
        title: 'House',
        href: '/settings/house',
        icon: Home,
    },
    {
        title: 'Privacy',
        href: '/settings/privacy',
        icon: Lock,
    },
    {
        title: 'Security',
        href: editSecurity().url,
        icon: Shield,
    },
    {
        title: 'Appearance',
        href: editAppearance().url,
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-4 md:p-8 md:pb-8 lg:p-16">
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
                        {sidebarNavItems.map((item) => {
                            const active = isCurrentOrParentUrl(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-bold transition-all md:gap-3 md:p-4 md:text-sm',
                                        active
                                            ? 'bg-accent-gold text-bg-dark shadow-lg shadow-accent-gold/20'
                                            : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                                    )}
                                >
                                    <item.icon size={14} className="md:size-[18px]" />
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
