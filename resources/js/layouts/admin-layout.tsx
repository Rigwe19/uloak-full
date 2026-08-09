import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, BarChart3, CreditCard, DoorOpen, FileText, LayoutDashboard, LogOut, MessageSquare, MoreHorizontal, Settings, Users } from 'lucide-react';
import React from 'react';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { PageTransition } from '@/components/page-transition';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { home, logout } from '@/routes';
import admin from '@/routes/admin';

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
        { id: 'analytics', icon: BarChart3, label: 'Analytics', href: admin.analytics().url },
        { id: 'pages', icon: FileText, label: 'Pages', href: admin.pages().url },
        { id: 'memberships', icon: CreditCard, label: 'Memberships', href: admin.memberships().url },
        { id: 'activity-logs', icon: Activity, label: 'Activity Logs', href: admin.activityLogs().url },
        { id: 'settings', icon: Settings, label: 'Settings', href: admin.settings().url },
    ];

    const handleLogout = () => {
        router.post(logout().url);
    };

    const isActive = (href: string) => {
        return url === href || url.endsWith(href + '/');
    };

    return (
        <div className="flex h-dvh min-h-screen flex-col bg-bg-dark md:h-screen md:flex-row">
            {/* Side Rail - Desktop Only */}
            <aside className="sticky top-0 z-50 hidden h-screen w-20 shrink-0 flex-col items-center border-r border-border-subtle bg-bg-dark py-10 md:flex lg:w-24">
                <Link href={home().url} className="mb-12 shrink-0 px-4">
                    <img
                        src="/logo-stacked-dark.png"
                        alt="ULO OF STORIES"
                        className="h-auto dark:hidden w-full object-contain"
                    />
                    <img
                        src="/logo-stacked.png"
                        alt="ULO OF STORIES"
                        className="h-auto dark:block hidden w-full object-contain"
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
            <nav className="fixed right-0 bottom-0 left-0 z-60 bg-linear-to-t from-bg-dark via-bg-dark/95 to-transparent px-3 pt-4 pb-2 md:hidden">
                <div className="flex items-center justify-around rounded-[28px] border border-white/10 bg-surface/80 px-1 py-1 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">

                    <Link
                        href={admin.dashboard().url}
                        className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all ${isActive(admin.dashboard().url)
                                ? 'bg-accent-gold/10 text-accent-gold'
                                : 'text-text-muted'
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="text-[9px] font-medium tracking-wider uppercase">
                            Overview
                        </span>
                    </Link>

                    <Link
                        href={admin.users().url}
                        className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all ${isActive(admin.users().url)
                                ? 'bg-accent-gold/10 text-accent-gold'
                                : 'text-text-muted'
                            }`}
                    >
                        <Users size={20} />
                        <span className="text-[9px] font-medium tracking-wider uppercase">
                            Users
                        </span>
                    </Link>

                    <Link
                        href={admin.rooms().url}
                        className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all ${isActive(admin.rooms().url)
                                ? 'bg-accent-gold/10 text-accent-gold'
                                : 'text-text-muted'
                            }`}
                    >
                        <DoorOpen size={20} />
                        <span className="text-[9px] font-medium tracking-wider uppercase">
                            Rooms
                        </span>
                    </Link>

                    <Link
                        href={admin.enquiries().url}
                        className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all ${isActive(admin.enquiries().url)
                                ? 'bg-accent-gold/10 text-accent-gold'
                                : 'text-text-muted'
                            }`}
                    >
                        <MessageSquare size={20} />
                        <span className="text-[9px] font-medium tracking-wider uppercase">
                            Enquiries
                        </span>
                    </Link>

                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-text-muted">
                                <MoreHorizontal size={20} />
                                <span className="text-[9px] font-medium tracking-wider uppercase">
                                    More
                                </span>
                            </button>
                        </SheetTrigger>

                        <SheetContent
                            side="right"
                            className="rounded-t-3xl border-border-subtle bg-bg-dark"
                        >
                            <SheetHeader>
                                <SheetTitle>More Options</SheetTitle>
                            </SheetHeader>

                            <div className="space-y-2">

                                <Link
                                    href={admin.analytics().url}
                                    className="flex items-center gap-3 rounded-xl p-4 hover:bg-surface"
                                >
                                    <BarChart3 size={18} />
                                    <span>Analytics</span>
                                </Link>

                                <Link
                                    href={admin.pages().url}
                                    className="flex items-center gap-3 rounded-xl p-4 hover:bg-surface"
                                >
                                    <FileText size={18} />
                                    <span>Pages</span>
                                </Link>

                                <Link
                                    href={admin.memberships().url}
                                    className="flex items-center gap-3 rounded-xl p-4 hover:bg-surface"
                                >
                                    <CreditCard size={18} />
                                    <span>Memberships</span>
                                </Link>

                                <Link
                                    href={admin.activityLogs().url}
                                    className="flex items-center gap-3 rounded-xl p-4 hover:bg-surface"
                                >
                                    <Activity size={18} />
                                    <span>Activity Logs</span>
                                </Link>

                                <Link
                                    href={admin.settings().url}
                                    className="flex items-center gap-3 rounded-xl p-4 hover:bg-surface"
                                >
                                    <Settings size={18} />
                                    <span>Settings</span>
                                </Link>

                                <div className="px-4 py-2">
                                    <ThemeToggle />
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-xl p-4 text-red-400 hover:bg-surface"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>

            {/* Main Content */}
            <main className="min-w-0 w-full grow overflow-x-hidden overflow-y-auto mb-18 md:pb-8">
                <AnimatePresence mode="wait" initial={false}>
                    <PageTransition key={url}>
                        {children}
                    </PageTransition>
                </AnimatePresence>
            </main>
        </div>
    );
}
