import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Calendar, Activity, ShieldCheck } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/dashboard/ui';

interface Plan {
    name: string;
    price: string;
    interval: string;
    desc: string;
}

interface PlanPerformanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: Plan | null;
}

export default function PlanPerformanceModal({ isOpen, onClose, plan }: PlanPerformanceModalProps) {
    if (!plan) {
return null;
}

    // Mock data for the charts
    const revenueData = [320, 450, 410, 580, 620, 780, 860];
    const subscriberData = [12, 18, 15, 24, 28, 35, 42];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

    const metrics = [
        { label: 'Active Subscribers', value: '1,248', trend: '+12.5%', isUp: true, icon: Users },
        { label: 'Monthly Revenue', value: '£12,480', trend: '+8.2%', isUp: true, icon: DollarSign },
        { label: 'Conversion Rate', value: '3.2%', trend: '+0.4%', isUp: true, icon: Activity },
        { label: 'Churn Rate', value: '1.8%', trend: '-0.2%', isUp: false, icon: ArrowDownRight },
    ];

    // Helper to calculate SVG path for line chart
    const getLinePath = (data: number[], width: number, height: number) => {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min;
        const step = width / (data.length - 1);
        
        return data.map((d, i) => {
            const x = i * step;
            const y = height - ((d - min) / range) * height;

            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        className="relative h-full max-h-[900px] w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-surface shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 p-8">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gold/10 text-accent-gold">
                                    <TrendingUp size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-text-primary">{plan.name} Performance</h2>
                                    <p className="text-sm text-text-muted">{plan.desc}</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-text-muted transition-all hover:bg-white/10 hover:text-text-primary"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="h-[calc(100%-100px)] overflow-y-auto p-8 custom-scrollbar">
                            {/* Metrics Grid */}
                            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {metrics.map((metric, i) => (
                                    <motion.div
                                        key={metric.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="rounded-3xl border border-white/5 bg-white/2 pb-6 pt-6 pl-6 pr-6"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="rounded-xl bg-white/5 p-2.5 text-text-muted">
                                                <metric.icon size={20} />
                                            </div>
                                            <div className={`flex items-center gap-1 text-xs font-bold ${metric.isUp ? 'text-green-400' : 'text-red-400'}`}>
                                                {metric.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                {metric.trend}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-text-muted uppercase tracking-widest">{metric.label}</p>
                                            <h3 className="text-2xl font-bold text-text-primary">{metric.value}</h3>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                {/* Revenue Chart */}
                                <div className="rounded-4xl border border-white/5 bg-white/2 p-8">
                                    <div className="mb-8 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary">Revenue Trend</h3>
                                            <p className="text-xs text-text-muted">Monthly revenue for the last 7 months</p>
                                        </div>
                                        <div className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-medium text-text-muted flex items-center gap-2">
                                            <Calendar size={14} /> Last 7 Months
                                        </div>
                                    </div>
                                    
                                    <div className="relative h-64 w-full">
                                        <svg className="h-full w-full" viewBox="0 0 500 200">
                                            <defs>
                                                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            {/* Grid Lines */}
                                            {[0, 1, 2, 3, 4].map((i) => (
                                                <line 
                                                    key={i}
                                                    x1="0" y1={i * 50} x2="500" y2={i * 50}
                                                    stroke="white" strokeOpacity="0.05" strokeDasharray="4 4"
                                                />
                                            ))}
                                            {/* Area */}
                                            <path 
                                                d={`${getLinePath(revenueData, 500, 200)} L 500 200 L 0 200 Z`}
                                                fill="url(#lineGradient)"
                                            />
                                            {/* Line */}
                                            <motion.path 
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                d={getLinePath(revenueData, 500, 200)}
                                                fill="none"
                                                stroke="#D4AF37"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
                                            {/* Data Points */}
                                            {revenueData.map((d, i) => {
                                                const step = 500 / (revenueData.length - 1);
                                                const x = i * step;
                                                const max = Math.max(...revenueData);
                                                const min = Math.min(...revenueData);
                                                const y = 200 - ((d - min) / (max - min)) * 200;

                                                return (
                                                    <circle key={i} cx={x} cy={y} r="4" fill="#D4AF37" />
                                                );
                                            })}
                                        </svg>
                                        <div className="mt-4 flex justify-between px-1">
                                            {months.map(m => <span key={m} className="text-[10px] text-text-muted font-medium uppercase tracking-wider">{m}</span>)}
                                        </div>
                                    </div>
                                </div>

                                {/* Subscriber Growth Chart */}
                                <div className="rounded-4xl border border-white/5 bg-white/2 p-8">
                                    <div className="mb-8 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary">Subscriber Growth</h3>
                                            <p className="text-xs text-text-muted">Net new subscribers per month</p>
                                        </div>
                                        <div className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-medium text-text-muted flex items-center gap-2">
                                            <Users size={14} /> +42 New
                                        </div>
                                    </div>
                                    
                                    <div className="relative h-64 w-full flex items-end justify-between gap-2 px-2">
                                        {subscriberData.map((d, i) => (
                                            <div key={i} className="group relative flex flex-1 flex-col items-center">
                                                <motion.div 
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${(d / Math.max(...subscriberData)) * 100}%` }}
                                                    transition={{ delay: i * 0.1, duration: 0.8 }}
                                                    className="w-full max-w-[40px] rounded-t-lg bg-accent-gold/20 group-hover:bg-accent-gold/40 transition-colors"
                                                />
                                                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-white/10 px-2 py-1 rounded text-[10px] font-bold text-text-primary">
                                                    {d}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex justify-between px-1">
                                        {months.map(m => <span key={m} className="text-[10px] text-text-muted font-medium uppercase tracking-wider">{m}</span>)}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Subscribers List */}
                            <div className="mt-10">
                                <h3 className="mb-6 text-xl font-bold text-text-primary">Recent Subscribers</h3>
                                <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/2">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/5">
                                                <th className="px-6 py-4 font-bold text-text-primary">Member</th>
                                                <th className="px-6 py-4 font-bold text-text-primary">Status</th>
                                                <th className="px-6 py-4 font-bold text-text-primary">Joined</th>
                                                <th className="px-6 py-4 font-bold text-text-primary">Amount</th>
                                                <th className="px-6 py-4 font-bold text-text-primary">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <tr key={i} className="hover:bg-white/2 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold text-xs font-bold">
                                                                {['JS', 'MD', 'LW', 'TH', 'EM'][i-1]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-text-primary">
                                                                    {['John Smith', 'Maria Garcia', 'Liam Wilson', 'Thomas Hunt', 'Emma Miller'][i-1]}
                                                                </p>
                                                                <p className="text-xs text-text-muted">member_{i}@example.com</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-400/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                                                            <ShieldCheck size={12} /> Active
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-text-muted">Oct {10+i}, 2023</td>
                                                    <td className="px-6 py-4 font-bold text-text-primary">£{plan.price}</td>
                                                    <td className="px-6 py-4">
                                                        <Button variant="ghost" className="h-8 px-3 text-[10px]">View Profile</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
