import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, DoorOpen, MessageSquare, FileText, Settings, LogOut, CreditCard } from 'lucide-react';
import React from 'react';
import { router } from '@inertiajs/react';
import { logout, home } from '@/routes';
import admin from '@/routes/admin';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { PageTransition } from '@/components/page-transition';

interface SidebarItem {
    id: string;
    icon: any;
    label: string;
    href: string;
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { url } = usePage();

    const sidebarItems: SidebarItem[] = [
        {
            id: 'dashboard',
            icon: LayoutDashboard,
            label: 'Overview',
            href: admin.dashboard().url,
        },
        { id: 'users', icon: Users, label: 'Users', href: admin.users().url },
        { id: 'rooms', icon: DoorOpen, label: 'Rooms', href: admin.rooms().url },
        { id: 'enquiries', icon: MessageSquare, label: 'Enquiries', href: admin.enquiries().url },
        { id: 'pages', icon: FileText, label: 'Pages', href: admin.pages().url },
        { id: 'memberships', icon: CreditCard, label: 'Memberships', href: admin.memberships().url },
        { id: 'settings', icon: Settings, label: 'Settings', href: admin.settings().url },
    ];

    const handleLogout = () => {
        router.post(logout().url);
    };

    const isActive = (href: string) => {
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
            <nav className="pointer-events-none fixed right-0 bottom-0 left-0 z-60 bg-linear-to-t from-bg-dark via-bg-dark/95 to-transparent px-4 pt-4 pb-8 md:hidden">
                <div className="pointer-events-auto flex items-center justify-around rounded-[28px] border border-white/10 bg-surface/80 p-2 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
                    <Link
                        href={admin.users().url}
                        className={`rounded-2xl p-3 transition-all ${isActive(admin.users().url) ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted'}`}
                    >
                        <Users size={22} />
                    </Link>
                    <Link
                        href={admin.rooms().url}
                        className={`relative rounded-2xl p-3 transition-all ${isActive(admin.rooms().url) ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted'}`}
                    >
                        <DoorOpen size={22} />
                    </Link>

                    <Link
                        href={admin.dashboard().url}
                        className={`-mt-10 flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-bg-dark transition-all ${isActive(admin.dashboard().url) ? 'bg-accent-gold text-bg-dark shadow-[0_10px_30px_rgba(198,161,91,0.4)]' : 'bg-surface text-text-muted'}`}
                    >
                        <LayoutDashboard size={24} />
                    </Link>

                    <Link
                        href={admin.settings().url}
                        className={`rounded-2xl p-3 transition-all ${isActive(admin.settings().url) ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted'}`}
                    >
                        <Settings size={22} />
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="rounded-2xl p-3 text-text-muted transition-colors hover:text-red-400"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="w-full grow overflow-y-auto pb-32 md:pb-8">
                <AnimatePresence mode="wait" initial={false}>
                    <PageTransition key={url}>
                        {children}
                    </PageTransition>
                </AnimatePresence>
            </main>
        </div>
    );
}
