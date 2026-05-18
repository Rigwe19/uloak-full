import React from 'react';
import { CreditCard, CheckCircle, Plus, Zap, Star, Shield } from 'lucide-react';
import { Button } from '../../components/UI';

export default function Memberships() {
    const plans = [
        {
            id: 'basic',
            name: 'Free House',
            price: '$0',
            billing: 'Forever',
            features: [
                'Up to 3 Rooms',
                'Core Heritage Tools',
                'Standard Support',
                '5GB Storage',
            ],
            icon: Shield,
            active: true,
            popular: false,
        },
        {
            id: 'premium',
            name: 'Ancestral Heir',
            price: '$12',
            billing: 'monthly',
            features: [
                'Unlimited Rooms',
                'AI Archival Assistant',
                '24/7 Concierge',
                '500GB Storage',
                'Legacy Films Access',
            ],
            icon: Star,
            active: true,
            popular: true,
        },
        {
            id: 'enterprise',
            name: 'Patriarch/Matriarch',
            price: '$49',
            billing: 'monthly',
            features: [
                'Full Heritage Suite',
                'Physical Archival Kit',
                'Private Server Instance',
                'Unlimited Storage',
                'White-glove digitizing',
            ],
            icon: Zap,
            active: false,
            popular: false,
        },
    ];

    return (
        <div className="animate-in space-y-10 duration-700 fade-in">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                        Membership Plans
                    </h1>
                    <p className="mt-2 text-text-muted">
                        Design and manage the different levels of access for
                        your community.
                    </p>
                </div>
                <Button className="flex items-center gap-2">
                    <Plus size={18} />
                    Create New Plan
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative rounded-[2.5rem] border p-10 transition-all ${
                            plan.popular
                                ? 'border-accent-gold bg-accent-gold/10 shadow-2xl shadow-accent-gold/5'
                                : 'border-border-subtle bg-surface'
                        }`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-10 -translate-y-1/2 rounded-full border-4 border-bg-dark bg-accent-gold px-4 py-2 text-[10px] font-bold tracking-widest text-bg-dark uppercase">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8 flex items-center justify-between">
                            <div
                                className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
                                    plan.popular
                                        ? 'border-transparent bg-accent-gold text-bg-dark'
                                        : 'bg-surface-light border-border-subtle text-accent-gold'
                                }`}
                            >
                                <plan.icon size={28} />
                            </div>
                            <div
                                className={`rounded-full px-3 py-1 text-[9px] font-bold tracking-widest uppercase ${
                                    plan.active
                                        ? 'bg-green-400/10 text-green-400'
                                        : 'bg-red-400/10 text-red-100'
                                }`}
                            >
                                {plan.active ? 'Active' : 'Draft'}
                            </div>
                        </div>

                        <h3 className="mb-2 text-2xl font-bold tracking-tight text-text-primary">
                            {plan.name}
                        </h3>
                        <div className="mb-10 flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-text-primary italic">
                                {plan.price}
                            </span>
                            <span className="text-sm font-medium text-text-muted">
                                / {plan.billing}
                            </span>
                        </div>

                        <div className="mb-12 space-y-4">
                            {plan.features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle
                                        size={16}
                                        className={
                                            plan.popular
                                                ? 'text-accent-gold'
                                                : 'text-text-muted'
                                        }
                                    />
                                    <span className="text-sm text-text-muted">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 py-3 text-xs"
                            >
                                Edit Plan
                            </Button>
                            <Button
                                variant={plan.popular ? 'primary' : 'secondary'}
                                className="flex-1 py-3 text-xs"
                            >
                                View Insights
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col items-center gap-10 rounded-3xl border border-border-subtle bg-surface p-8 md:flex-row">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-accent-gold/20 bg-accent-gold/10">
                    <CreditCard className="text-accent-gold" size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="mb-2 text-lg font-bold text-text-primary">
                        Revenue Overview
                    </h4>
                    <p className="max-w-xl text-sm text-text-muted">
                        Membership growth is up by 24% this month. The
                        "Ancestral Heir" plan continues to lead in adoption as
                        diaspora families prioritize storage and archival
                        assistance.
                    </p>
                </div>
                <Button variant="outline" className="px-10">
                    Manage Payments
                </Button>
            </div>
        </div>
    );
}
