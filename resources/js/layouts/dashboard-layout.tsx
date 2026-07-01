import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Search, Bell, BellRing, Settings, LogOut } from 'lucide-react';
import React from 'react';
import { router } from '@inertiajs/react';
import { logout, home, dashboard as dashboardRoute } from '@/routes';
import dashboard from '@/routes/dashboard';
import { edit } from '@/routes/profile';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { PageTransition } from '@/components/page-transition';
import { PushSubscriptionManager } from '@/components/push-subscription-manager';

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
    const { url } = usePage();

    const sidebarItems: SidebarItem[] = [
        {
            id: 'dashboard',
            icon: LayoutGrid,
            label: 'Dashboard',
            href: dashboardRoute().url,
        },
        { id: 'search', icon: Search, label: 'Search', href: dashboard.search().url },
        { id: 'notifications', icon: Bell, label: 'Notifications', href: dashboard.notifications().url },
        { id: 'settings', icon: Settings, label: 'Settings', href: edit().url },
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
            <nav className="pointer-events-none fixed right-0 bottom-0 left-0 z-60 bg-linear-to-t from-bg-dark via-bg-dark/95 to-transparent px-3 pt-4 pb-2 md:hidden">
                <div className="pointer-events-auto flex items-center justify-around rounded-[28px] border border-white/10 bg-surface/80 px-1 py-1 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
                    <Link
                        href={dashboard.search().url}
                        className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all ${isActive(dashboard.search().url) ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted'}`}
                    >
                        <Search size={20} />
                        <span className="text-[9px] font-medium tracking-wider uppercase">Search</span>
                    </Link>
                    <Link
                        href={dashboard.notifications().url}
                        className={`relative flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all ${isActive(dashboard.notifications().url) ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted'}`}
                    >
                        <Bell size={20} />
                        <div className="absolute top-1 right-3 h-1.5 w-1.5 rounded-full border border-surface bg-accent-gold" />
                        <span className="text-[9px] font-medium tracking-wider uppercase">Alerts</span>
                    </Link>

                    <Link
                        href={dashboardRoute().url}
                        className={`-mt-8 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-bg-dark transition-all ${isActive(dashboardRoute().url) ? 'bg-accent-gold text-bg-dark shadow-[0_10px_30px_rgba(198,161,91,0.4)]' : 'bg-surface text-text-muted'}`}
                    >
                        <LayoutGrid size={22} />
                    </Link>

                    <Link
                        href={edit().url}
                        className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all ${isActive(edit().url) ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted'}`}
                    >
                        <Settings size={20} />
                        <span className="text-[9px] font-medium tracking-wider uppercase">Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-text-muted transition-colors hover:text-red-400"
                    >
                        <LogOut size={20} />
                        <span className="text-[9px] font-medium tracking-wider uppercase">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="perspective-2000 min-w-0 w-full grow overflow-x-hidden pb-32 md:pb-8">
                <AnimatePresence mode="wait" initial={false}>
                    <PageTransition key={url} type="door">
                        {children}
                    </PageTransition>
                </AnimatePresence>
                <PushSubscriptionManager />
            </main>
        </div>
    );
}
