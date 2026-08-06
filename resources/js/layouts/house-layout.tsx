import { Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard, Settings, Home } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { PageTransition } from '@/components/page-transition';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';
import { getPatternBackground } from '@/lib/house-patterns';
import { home as homeRoute, dashboard as appDashboardRoute } from '@/routes';
import { dashboard, settings as settingsRoute, logout } from '@/routes/house';

interface SidebarItem {
    id: string;
    icon: any;
    label: string;
    href: string;
}

interface HouseOwner {
    house_thumbnail?: string | null;
    house_pattern?: string | null;
    house_pattern_upload?: string | null;
}

export default function HouseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { url, props } = usePage();
    const houseOwner = (props as any).house_owner as HouseOwner | null;
    const mainRef = useRef<HTMLDivElement>(null);

    const patternStyle = useMemo(() => {
        if (houseOwner?.house_pattern_upload) {
            return {
                backgroundImage: `url(${houseOwner.house_pattern_upload})`,
                backgroundRepeat: 'repeat',
                backgroundSize: 'auto',
            };
        }

        const cssBg = getPatternBackground(houseOwner?.house_pattern);

        return cssBg ? { backgroundImage: cssBg } : undefined;
    }, [houseOwner?.house_pattern, houseOwner?.house_pattern_upload]);
    useEffect(() => {
        if (patternStyle?.backgroundImage && mainRef.current) {
            mainRef.current.style.backgroundImage = patternStyle.backgroundImage;

            if (patternStyle.backgroundRepeat) {
mainRef.current.style.backgroundRepeat = patternStyle.backgroundRepeat;
}

            if (patternStyle.backgroundSize) {
mainRef.current.style.backgroundSize = patternStyle.backgroundSize;
}
        } else {
            mainRef.current!.style.backgroundImage = '';
            mainRef.current!.style.backgroundRepeat = '';
            mainRef.current!.style.backgroundSize = '';
        }

        return () => {
            mainRef.current!.style.backgroundImage = '';
            mainRef.current!.style.backgroundRepeat = '';
            mainRef.current!.style.backgroundSize = '';
        };
    }, [patternStyle]);

    const sidebarItems: SidebarItem[] = [
        {
            id: 'dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
            href: dashboard().url,
        },
        {
            id: 'settings',
            icon: Settings,
            label: 'Settings',
            href: settingsRoute().url,
        },
    ];

    const handleLogout = () => {
        router.post(logout().url);
    };

    const isActive = (href: string) => {
        if (href.startsWith('/house/settings')) {
            return url.startsWith('/house/settings');
        }

        return url === href || url.startsWith(href + '/');
    };

    return (
        <div className="flex h-dvh min-h-screen flex-col bg-bg-dark md:h-screen md:flex-row">
            {/* Side Rail - Desktop Only */}
            <aside className="sticky top-0 z-50 hidden h-screen w-20 shrink-0 flex-col items-center border-r border-border-subtle bg-bg-dark py-10 md:flex lg:w-24">
                <Link href={homeRoute().url} className="mb-12 shrink-0 px-4">
                    <img
                        src="/logo.png"
                        alt="ULO OF STORIES"
                        className="h-auto w-full object-contain"
                    />
                </Link>

                <div className="flex grow flex-col gap-8">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`group relative rounded-2xl p-4 transition-all ${isActive(item.href) ? 'bg-accent-gold/10 text-accent-gold shadow-lg shadow-accent-gold/5' : 'text-text-muted hover:bg-surface/50 hover:text-text-primary'}`}
                            title={item.label}
                        >
                            <item.icon size={22} />
                            {isActive(item.href) && (
                                <motion.div
                                    layoutId="activeHouseSide"
                                    className="absolute top-1/4 bottom-1/4 left-0 w-1 rounded-r-full bg-accent-gold"
                                />
                            )}
                        </Link>
                    ))}
                    <div className="mt-4 flex justify-center">
                        <ThemeToggle />
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="mt-auto shrink-0 p-4 text-text-muted transition-colors hover:text-red-400"
                >
                    <LogOut size={22} />
                </button>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="pointer-events-none fixed right-0 bottom-0 left-0 z-60 bg-linear-to-t from-bg-dark via-bg-dark/95 to-transparent px-3 pt-4 pb-2 md:hidden">
                <div className="pointer-events-auto flex items-center justify-around rounded-[28px] border border-white/10 bg-surface/80 px-1 py-1 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
                    <Link
                        href={dashboard().url}
                        className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all ${isActive(dashboard().url) ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="text-[9px] font-medium tracking-wider uppercase">Home</span>
                    </Link>
                    <Link
                        href={settingsRoute().url}
                        className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all ${isActive(settingsRoute().url) ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted'}`}
                    >
                        <Settings size={20} />
                        <span className="text-[9px] font-medium tracking-wider uppercase">Settings</span>
                    </Link>

                    <Link
                        href={homeRoute().url}
                        className="-mt-8 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-bg-dark bg-surface text-text-muted transition-all hover:text-accent-gold"
                    >
                        <Home size={22} />
                    </Link>

                    <ThemeToggle />

                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-text-muted transition-colors hover:text-red-400"
                    >
                        <LogOut size={20} />
                        <span className="text-[9px] font-medium tracking-wider uppercase">Leave</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main ref={mainRef} className="flex min-w-0 w-full grow flex-col overflow-x-hidden pb-32 md:pb-8">
                <PwaInstallPrompt />

                {/* Page Content with Pattern */}
                <div
                    className="perspective-2000 min-h-0 w-full grow"
                    style={patternStyle}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <PageTransition key={url} type="subtle">
                            {children}
                        </PageTransition>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
