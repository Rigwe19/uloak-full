import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Users as UsersIcon, 
    DoorOpen, 
    MessageSquare, 
    Eye, 
    Bell,
    TrendingUp,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/dashboard/ui';
import AdminLayout from '@/layouts/admin-layout';

interface Props {
    stats: {
        totalUsers: number;
        totalRooms: number;
        totalStories: number;
        newEnquiries: number;
    };
    recentEnquiries: any[];
}

export default function AdminDashboard({ stats, recentEnquiries }: Props) {
    const statCards = [
        {
            label: 'Total Custodians',
            value: stats.totalUsers,
            icon: UsersIcon,
            color: 'text-blue-400',
            trend: '+12%',
        },
        {
            label: 'Active Rooms',
            value: stats.totalRooms,
            icon: DoorOpen,
            color: 'text-purple-400',
            trend: '+5%',
        },
        {
            label: 'Legacy Stories',
            value: stats.totalStories,
            icon: Eye,
            color: 'text-green-400',
            trend: '+18%',
        },
        {
            label: 'New Enquiries',
            value: stats.newEnquiries,
            icon: MessageSquare,
            color: 'text-accent-gold',
            trend: '+2',
            urgent: stats.newEnquiries > 0,
        },
    ];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />
            
            <div className="space-y-10 p-6 md:p-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                            Welcome back, Admin.
                        </h1>
                        <p className="mt-2 text-text-muted">
                            Here is what's happening at Ulo of Stories right now.
                        </p>
                    </div>
                    <Button variant="outline" size="sm">
                        Download Report
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group rounded-2xl border border-border-subtle bg-surface/30 p-6 transition-all hover:border-accent-gold/20"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className={`rounded-xl border border-white/5 bg-bg-dark p-2.5 ${stat.color} shadow-inner`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className={`text-[10px] font-bold ${stat.urgent ? 'text-accent-gold' : 'text-green-400'} flex items-center gap-1`}>
                                    <TrendingUp size={10} />
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-bold text-text-primary">
                                    {stat.value}
                                </p>
                                <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    {stat.label}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                    {/* Recent Enquiries */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-text-primary">
                                Recent Enquiries
                            </h3>
                            <button className="flex items-center gap-1 text-xs font-bold text-accent-gold transition-all hover:underline">
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        
                        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface/20 backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-border-subtle bg-surface/50">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-text-muted uppercase">Sender</th>
                                            <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-text-muted uppercase text-center">Status</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-bold tracking-widest text-text-muted uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-subtle/50">
                                        {recentEnquiries.length > 0 ? (
                                            recentEnquiries.map((enquiry) => (
                                                <tr key={enquiry.id} className="group transition-colors hover:bg-white/5">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-text-primary">{enquiry.name}</span>
                                                            <span className="text-xs text-text-muted">{enquiry.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase ${
                                                            enquiry.status === 'new' 
                                                                ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30' 
                                                                : 'bg-green-400/20 text-green-400 border border-green-400/30'
                                                        }`}>
                                                            {enquiry.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="rounded-lg p-2 text-text-muted transition-all hover:bg-surface hover:text-accent-gold">
                                                            <ArrowUpRight size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 text-text-muted">
                                                        <MessageSquare size={40} className="opacity-20" />
                                                        <p className="text-sm">No recent enquiries found.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* System Overview */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-text-primary">
                            System Health
                        </h3>
                        <div className="space-y-6 rounded-3xl border border-accent-gold/10 bg-accent-gold/5 p-8 shadow-xl shadow-accent-gold/5">
                            {[
                                { label: 'Database Service', value: 'Operational', status: 'healthy' },
                                { label: 'Storage Cluster', value: 'Operational', status: 'healthy' },
                                { label: 'Asset Processor', value: 'Busy', status: 'warning' },
                                { label: 'Email Relay', value: 'Operational', status: 'healthy' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <span className="text-xs font-bold tracking-widest text-text-primary uppercase">
                                        {item.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${
                                            item.status === 'healthy' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                                        }`} />
                                        <span className="text-[10px] text-text-muted">
                                            {item.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="rounded-3xl border border-border-subtle bg-surface/20 p-8">
                            <h4 className="mb-4 text-xs font-bold tracking-widest text-text-muted uppercase">
                                Resource Usage
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="mb-2 flex justify-between text-[10px] font-bold">
                                        <span className="text-text-muted uppercase">Storage Used</span>
                                        <span className="text-text-primary">78%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-dark">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '78%' }}
                                            className="h-full bg-accent-gold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
