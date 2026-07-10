import { Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, LayoutGrid, Search, Bell, BellRing, Settings, LogOut, User } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { PageTransition } from '@/components/page-transition';
import { PushSubscriptionManager } from '@/components/push-subscription-manager';
import { getPatternBackground } from '@/lib/house-patterns';
import { logout, home, dashboard as dashboardRoute } from '@/routes';
import dashboard from '@/routes/dashboard';


interface SidebarItem {
    id: string;
    icon: any;
    label: string;
    href: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { url, props } = usePage();
    const authUser = (props as any).auth?.user as {
        house_thumbnail_url?: string | null;
        house_pattern?: string | null;
        house_pattern_upload_url?: string | null;
    } | null;
    const authPerson = (props as any).auth?.person as { id: number; uuid: string; name: string } | null;
    const mainRef = useRef<HTMLDivElement>(null);

    const patternStyle = useMemo(() => {
        if (authUser?.house_pattern_upload_url) {
            return {
                backgroundImage: `url(${authUser.house_pattern_upload_url})`,
                backgroundRepeat: 'repeat',
                backgroundSize: 'auto',
            };
        }

        const cssBg = getPatternBackground(authUser?.house_pattern);

        return cssBg ? { backgroundImage: cssBg } : undefined;
    }, [authUser?.house_pattern, authUser?.house_pattern_upload_url]);

    useEffect(() => {
        const element = mainRef.current;

        if (!element) {
            return;
        }

        if (patternStyle?.backgroundImage) {
            element.style.backgroundImage = patternStyle.backgroundImage;
            element.style.backgroundRepeat = patternStyle.backgroundRepeat ?? '';
            element.style.backgroundSize = patternStyle.backgroundSize ?? '';
        } else {
            element.style.backgroundImage = '';
            element.style.backgroundRepeat = '';
            element.style.backgroundSize = '';
        }

        return () => {
            element.style.backgroundImage = '';
            element.style.backgroundRepeat = '';
            element.style.backgroundSize = '';
        };
    }, [patternStyle]);

    const sidebarItems: SidebarItem[] = [
        {
            id: 'dashboard',
            icon: LayoutGrid,
            label: 'Dashboard',
            href: dashboardRoute().url,
        },
        { id: 'search', icon: Search, label: 'Search', href: dashboard.search().url },
        { id: 'notifications', icon: Bell, label: 'Notifications', href: dashboard.notifications().url },
        { id: 'analytics', icon: BarChart3, label: 'Analytics', href: dashboard.analytics().url },
        ...(authPerson ? [{ id: 'profile', icon: User, label: 'Profile', href: '/settings/about' }] : []),
        { id: 'settings', icon: Settings, label: 'Settings', href: '/settings/house' },
    ];

    const handleLogout = () => {
        router.post(logout().url);
    };

    const isActive = (href: string) => {
        if (href.startsWith('/settings')) {
            return url.startsWith('/settings');
        }

        return url === href || url.startsWith(href + '/');
    };

    return (
        <div className="flex h-dvh min-h-screen flex-col bg-bg-dark md:h-screen md:flex-row">
            {/* Side Rail - Desktop Only */}
            <aside className="sticky top-0 z-50 hidden h-screen w-20 shrink-0 flex-col items-center border-r border-border-subtle bg-bg-dark py-10 md:flex lg:w-24">
                <Link href={home().url} className="mb-12 shrink-0 px-4">
                    <img
                        src="/logo.png"
                        alt="ULOAK"
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
                                    layoutId="activeSide"
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
            <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4 md:hidden">
                <div className="pointer-events-auto relative grid h-20 grid-cols-5 items-center rounded-[30px] border border-white/10 bg-surface/85 px-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/5 backdrop-blur-2xl">

                    {/* Search */}
                    <Link
                        href={dashboard.search().url}
                        className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all ${isActive(dashboard.search().url)
                                ? 'bg-accent-gold/10 text-accent-gold'
                                : 'text-text-muted hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Search size={20} />
                        <span className="text-[10px] font-medium">Search</span>
                    </Link>

                    {/* Notifications */}
                    <Link
                        href={dashboard.notifications().url}
                        className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all ${isActive(dashboard.notifications().url)
                                ? 'bg-accent-gold/10 text-accent-gold'
                                : 'text-text-muted hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Bell size={20} />

                        <span className="absolute top-2 right-[34%] h-2 w-2 rounded-full bg-accent-gold ring-2 ring-surface" />

                        <span className="text-[10px] font-medium">Alerts</span>
                    </Link>

                    {/* Home */}
                    <div className="flex justify-center">
                        <Link
                            href={dashboardRoute().url}
                            className={`-mt-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-bg-dark transition-all duration-300 ${isActive(dashboardRoute().url)
                                    ? 'bg-accent-gold text-bg-dark shadow-[0_18px_40px_rgba(198,161,91,.45)]'
                                    : 'bg-surface text-text-muted shadow-lg'
                                }`}
                        >
                            <LayoutGrid size={24} />
                        </Link>
                    </div>

                    {/* Settings */}
                    <Link
                        href="/settings/house"
                        className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all ${isActive('/settings/house')
                                ? 'bg-accent-gold/10 text-accent-gold'
                                : 'text-text-muted hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Settings size={20} />
                        <span className="text-[10px] font-medium">Settings</span>
                    </Link>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-text-muted transition-all hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut size={20} />
                        <span className="text-[10px] font-medium">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main ref={mainRef} className="flex min-w-0 w-full grow flex-col overflow-x-hidden pb-32 md:pb-8">
                {/* House Thumbnail Banner */}
                {/* {authUser?.house_thumbnail_url && (
                    <div className="h-32 shrink-0 overflow-hidden md:h-48">
                        <img
                            src={authUser.house_thumbnail_url}
                            alt="House cover"
                            className="h-full w-full object-cover"
                        />
                    </div>
                )} */}

                {/* Page Content */}
                <div className="perspective-2000 min-h-0 w-full grow">
                    <AnimatePresence mode="wait" initial={false}>
                        <PageTransition key={url} type="door">
                            {children}
                        </PageTransition>
                    </AnimatePresence>
                </div>
                <PushSubscriptionManager />
            </main>
        </div>
    );
}
