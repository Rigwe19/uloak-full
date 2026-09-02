import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Users,
    TrendingUp,
    DollarSign,
    Settings,
    ArrowRight,
    Check,
    Plus,
} from 'lucide-react';
import React, { useState } from 'react';
import PlanPerformanceModal from '@/components/admin/plan-performance-modal';
import { Button } from '@/components/dashboard/ui';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface Plan {
    name: string;
    price: string;
    interval: string;
    desc: string;
    features: string[];
    highlight: boolean;
}

interface MembershipProps {
    page: {
        id: number;
        content: {
            plans: Plan[];
        };
    } | null;
}

export default function Memberships({ page }: MembershipProps) {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const plans = page?.content.plans || [];

    const stats = [
        {
            label: 'Total Members',
            value: '124',
            icon: Users,
            color: 'text-blue-400',
        },
        {
            label: 'Active Subscriptions',
            value: '86',
            icon: Check,
            color: 'text-green-400',
        },
        {
            label: 'Monthly Revenue',
            value: '£860',
            icon: DollarSign,
            color: 'text-accent-gold',
        },
        {
            label: 'Growth',
            value: '+12%',
            icon: TrendingUp,
            color: 'text-purple-400',
        },
    ];

    return (
        <AdminLayout>
            <Head title="Memberships Admin" />

            <div className="p-6 md:p-10">
                <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                            Memberships
                        </h1>
                        <p className="text-text-muted">
                            Manage your plans and track subscription
                            performance.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        {page && (
                            <Link
                                href={
                                    admin.pages.edit(page.id).url +
                                    '?section=plans'
                                }
                            >
                                <Button
                                    variant="outline"
                                    className="gap-2 rounded-2xl border-white/10"
                                >
                                    <Settings size={18} /> Edit Plans
                                </Button>
                            </Link>
                        )}
                        {page && (
                            <Link
                                href={
                                    admin.pages.edit(page.id).url +
                                    '?section=plans'
                                }
                            >
                                <Button className="gap-2 rounded-2xl">
                                    <Plus size={18} /> New Plan
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-3xl border border-white/5 bg-surface/30 p-6 backdrop-blur-sm"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div
                                    className={`rounded-2xl bg-white/5 p-3 ${stat.color}`}
                                >
                                    <stat.icon size={24} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium tracking-widest text-text-muted uppercase">
                                    {stat.label}
                                </p>
                                <h3 className="text-3xl font-bold text-text-primary">
                                    {stat.value}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                    {/* Active Plans */}
                    <div className="lg:col-span-2">
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-text-primary">
                            <CreditCard
                                size={20}
                                className="text-accent-gold"
                            />
                            Active Plans
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            {plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`relative flex flex-col rounded-4xl border p-8 transition-all hover:bg-surface/40 ${
                                        plan.highlight
                                            ? 'border-accent-gold/30 bg-accent-gold/5'
                                            : 'border-white/5 bg-surface/20'
                                    }`}
                                >
                                    <div className="mb-6 flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-text-primary">
                                                {plan.name}
                                            </h3>
                                            <p className="text-xs text-text-muted">
                                                {plan.desc}
                                            </p>
                                        </div>
                                        {plan.highlight && (
                                            <span className="rounded-full bg-accent-gold/20 px-3 py-1 text-[10px] font-bold text-accent-gold">
                                                FEATURED
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-8 flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-text-primary">
                                            {plan.price}
                                        </span>
                                        <span className="text-sm text-text-muted">
                                            /{plan.interval}
                                        </span>
                                    </div>

                                    <ul className="mb-8 flex flex-col gap-3">
                                        {plan.features.slice(0, 3).map((f) => (
                                            <li
                                                key={f}
                                                className="flex items-center gap-2 text-sm text-text-muted"
                                            >
                                                <div className="h-1.5 w-1.5 rounded-full bg-accent-gold" />
                                                {f}
                                            </li>
                                        ))}
                                        {plan.features.length > 3 && (
                                            <li className="text-xs text-text-muted italic">
                                                +{plan.features.length - 3} more
                                                features
                                            </li>
                                        )}
                                    </ul>

                                    <div className="mt-auto">
                                        <Button
                                            variant="ghost"
                                            className="w-full gap-2 text-xs"
                                            onClick={() =>
                                                setSelectedPlan(plan)
                                            }
                                        >
                                            View Performance{' '}
                                            <ArrowRight size={14} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-text-primary">
                            <TrendingUp
                                size={20}
                                className="text-accent-gold"
                            />
                            Recent Activity
                        </h2>
                        <div className="rounded-4xl border border-white/5 bg-surface/20 p-8">
                            <div className="space-y-6">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
                                            <Users size={18} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate text-sm font-medium text-text-primary">
                                                New Founding Member
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                2 hours ago
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-green-400">
                                                +£10
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                className="mt-8 w-full rounded-2xl border-white/10 text-xs"
                                onClick={() => setSelectedPlan(plans[0])}
                            >
                                View All Transactions
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <PlanPerformanceModal
                isOpen={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
                plan={selectedPlan}
            />
        </AdminLayout>
    );
}
