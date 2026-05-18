import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    BarChart3,
    MessageSquare,
    FileText,
    Settings,
    User,
    ChevronRight,
    Search,
    Bell,
    LogOut,
    LayoutDashboard,
    Eye,
    CheckCircle,
    MoreVertical,
    Users as UsersIcon,
    CreditCard,
    DoorOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthProvider';
import { Button } from '../../components/UI';
import Enquiries from './Enquiries';
import PageEditor from './PageEditor';
import GlobalSettings from './GlobalSettings';
import Users from './Users';
import Memberships from './Memberships';
import Rooms from './Rooms';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [messages, setMessages] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalMessages: 0,
        newMessages: 0,
        totalPages: 5,
        activeStories: 12,
    });

    useEffect(() => {
        // Mocking real-time message fetch since Firebase is removed
        setMessages([
            {
                id: '1',
                name: 'Kwame Mensah',
                email: 'kwame@ghana.com',
                subject: 'Digitalizing Archive',
                status: 'new',
                createdAt: { seconds: Date.now() / 1000 - 3600 },
            },
            {
                id: '2',
                name: 'Zainab Bello',
                email: 'zainab@nigeria.ng',
                subject: 'Family Tree Help',
                status: 'replied',
                createdAt: { seconds: Date.now() / 1000 - 72000 },
            },
        ]);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const SidebarItem = ({ icon: Icon, label, id }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex w-full items-center gap-4 px-6 py-4 transition-all ${
                activeTab === id
                    ? 'border-r-2 border-accent-gold bg-accent-gold/10 text-accent-gold'
                    : 'text-text-muted hover:bg-white/5'
            }`}
        >
            <Icon size={20} />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-bg-dark">
            {/* Sidebar */}
            <aside className="flex w-64 flex-col border-r border-border-subtle">
                <div className="border-b border-border-subtle p-8">
                    <img
                        src="/logo.png"
                        alt="ULOAK"
                        className="h-6 grayscale"
                    />
                    <p className="mt-4 text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase">
                        Admin Engine
                    </p>
                </div>

                <nav className="scrollbar-hide flex-1 overflow-y-auto py-6">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Overview"
                        id="overview"
                    />
                    <SidebarItem
                        icon={MessageSquare}
                        label="Enquiries"
                        id="messages"
                    />
                    <SidebarItem
                        icon={FileText}
                        label="Pages Content"
                        id="pages"
                    />
                    <SidebarItem icon={UsersIcon} label="Users" id="users" />
                    <SidebarItem icon={DoorOpen} label="Rooms" id="rooms" />
                    <SidebarItem
                        icon={CreditCard}
                        label="Memberships"
                        id="memberships"
                    />
                    <SidebarItem
                        icon={Settings}
                        label="Global Settings"
                        id="settings"
                    />
                </nav>

                <div className="border-t border-border-subtle p-6">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold font-bold text-bg-dark">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-text-primary">
                                {user?.email}
                            </p>
                            <p className="text-[10px] text-text-muted">
                                Super Admin
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-xs font-bold text-text-muted transition-colors hover:text-red-400"
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-border-subtle bg-surface/30 px-10 backdrop-blur-md">
                    <div className="flex flex-1 items-center gap-4">
                        <Search className="text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search everything..."
                            className="w-full max-w-md border-none bg-transparent text-sm text-text-primary outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative text-text-muted transition-colors hover:text-text-primary">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-gold text-[8px] font-bold text-bg-dark">
                                3
                            </span>
                        </button>
                        <div className="h-8 w-px bg-border-subtle" />
                        <p className="text-xs font-bold text-text-primary">
                            {new Date().toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                            })}
                        </p>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-10">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-10"
                            >
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                                            Welcome back, Admin.
                                        </h1>
                                        <p className="mt-2 text-text-muted">
                                            Here is what's happening at Uloak
                                            right now.
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Download Report
                                    </Button>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                    {[
                                        {
                                            label: 'Total Enquiries',
                                            value: stats.totalMessages,
                                            icon: MessageSquare,
                                            color: 'text-blue-400',
                                        },
                                        {
                                            label: 'New Enquiries',
                                            value: stats.newMessages,
                                            icon: Bell,
                                            color: 'text-accent-gold',
                                        },
                                        {
                                            label: 'Active Pages',
                                            value: stats.totalPages,
                                            icon: FileText,
                                            color: 'text-purple-400',
                                        },
                                        {
                                            label: 'Legacy Stories',
                                            value: stats.activeStories,
                                            icon: Eye,
                                            color: 'text-green-400',
                                        },
                                    ].map((stat, i) => (
                                        <div
                                            key={i}
                                            className="rounded-2xl border border-border-subtle bg-surface/50 p-6"
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <div
                                                    className={`rounded-lg border border-white/5 bg-surface p-2 ${stat.color}`}
                                                >
                                                    <stat.icon size={18} />
                                                </div>
                                                <span className="text-[10px] font-bold text-green-400">
                                                    +12%
                                                </span>
                                            </div>
                                            <p className="text-2xl font-bold text-text-primary">
                                                {stat.value}
                                            </p>
                                            <p className="mt-1 text-xs tracking-widest text-text-muted uppercase">
                                                {stat.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Activity */}
                                <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                                    <div className="space-y-6 lg:col-span-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-text-primary">
                                                Recent Enquiries
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    setActiveTab('messages')
                                                }
                                                className="text-xs font-bold text-accent-gold hover:underline"
                                            >
                                                View All
                                            </button>
                                        </div>
                                        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface/30">
                                            {messages.length > 0 ? (
                                                <table className="w-full text-left">
                                                    <thead className="border-b border-border-subtle bg-surface/50">
                                                        <tr>
                                                            <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                                Sender
                                                            </th>
                                                            <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                                Subject
                                                            </th>
                                                            <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                                Date
                                                            </th>
                                                            <th className="px-6 py-4 text-right text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {messages.map(
                                                            (msg, i) => (
                                                                <tr
                                                                    key={msg.id}
                                                                    className="group cursor-pointer border-b border-border-subtle transition-colors hover:bg-white/5"
                                                                >
                                                                    <td className="px-6 py-4">
                                                                        <p className="text-sm font-bold text-text-primary">
                                                                            {
                                                                                msg.name
                                                                            }
                                                                        </p>
                                                                        <p className="text-[10px] text-text-muted">
                                                                            {
                                                                                msg.email
                                                                            }
                                                                        </p>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <p className="text-sm text-text-muted transition-colors group-hover:text-text-primary">
                                                                            {
                                                                                msg.subject
                                                                            }
                                                                        </p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-xs text-text-muted">
                                                                        {new Date(
                                                                            msg
                                                                                .createdAt
                                                                                ?.seconds *
                                                                                1000,
                                                                        ).toLocaleDateString()}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <span
                                                                            className={`rounded-full px-2 py-1 text-[9px] font-bold tracking-widest uppercase ${
                                                                                msg.status ===
                                                                                'new'
                                                                                    ? 'bg-accent-gold/20 text-accent-gold'
                                                                                    : 'bg-green-400/20 text-green-400'
                                                                            }`}
                                                                        >
                                                                            {msg.status ||
                                                                                'new'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="py-20 text-center">
                                                    <MessageSquare
                                                        className="mx-auto mb-4 text-border-subtle"
                                                        size={32}
                                                    />
                                                    <p className="text-sm text-text-muted">
                                                        No enquiries found.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-text-primary">
                                            System Health
                                        </h3>
                                        <div className="space-y-8 rounded-3xl border border-accent-gold/10 bg-accent-gold/5 p-8">
                                            {[
                                                {
                                                    label: 'Firestore',
                                                    value: 'Operational',
                                                    color: 'bg-green-400',
                                                },
                                                {
                                                    label: 'Auth Engine',
                                                    value: 'Operational',
                                                    color: 'bg-green-400',
                                                },
                                                {
                                                    label: 'CDN Assets',
                                                    value: 'Operational',
                                                    color: 'bg-green-400',
                                                },
                                                {
                                                    label: 'Mail Server',
                                                    value: 'Minor Delay',
                                                    color: 'bg-yellow-400',
                                                },
                                            ].map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="flex items-center justify-between"
                                                >
                                                    <span className="text-xs font-bold tracking-widest text-text-primary uppercase">
                                                        {item.label}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`h-2 w-2 rounded-full ${item.color}`}
                                                        />
                                                        <span className="text-[10px] text-text-muted">
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'messages' && (
                            <motion.div
                                key="messages"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Enquiries />
                            </motion.div>
                        )}

                        {activeTab === 'pages' && (
                            <motion.div
                                key="pages"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <PageEditor />
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <GlobalSettings />
                            </motion.div>
                        )}

                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Users />
                            </motion.div>
                        )}

                        {activeTab === 'rooms' && (
                            <motion.div
                                key="rooms"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Rooms />
                            </motion.div>
                        )}

                        {activeTab === 'memberships' && (
                            <motion.div
                                key="memberships"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Memberships />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
