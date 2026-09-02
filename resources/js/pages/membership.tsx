import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui-elements';
import GuestLayout from '@/layouts/guest-layout';
import {
    cinematicText,
    fadeUp,
    parallaxFloat,
    staggerContainer,
} from '@/lib/animations';
import { register } from '@/routes';

interface Plan {
    name: string;
    price: string;
    interval: string;
    desc: string;
    features: string[];
    highlight: boolean;
    button: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface MembershipPageProps {
    page: {
        title: string;
        content: {
            hero: {
                title: string;
                subtitle: string;
            };
            plans: Plan[];
            faqs: FAQ[];
        };
    };
}

export default function Membership({
    page,
    subscriptions_enabled,
}: MembershipPageProps & { subscriptions_enabled: boolean }) {
    const { hero, plans, faqs } = page?.content ?? {
        hero: { title: '', subtitle: '' },
        faqs: [],
        plans: [],
    };
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <>
            <Head title={page?.title} />

            {/* HERO */}
            <section className="relative min-h-[60vh] overflow-hidden px-6 pt-32 pb-20 md:px-12 lg:px-24">
                <motion.div
                    className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-gold/5 blur-[120px]"
                    variants={parallaxFloat}
                    initial="initial"
                    animate="animate"
                />
                <motion.div
                    className="absolute bottom-48 -left-24 h-125 w-125 rounded-full bg-accent-gold/5 blur-[120px]"
                    variants={parallaxFloat}
                    initial="initial"
                    animate="animate"
                    style={{ animationDelay: '2s' }}
                />
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-linear-to-b from-bg-dark via-bg-dark/95 to-bg-dark/90" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.span
                            variants={fadeUp}
                            className="mb-6 inline-block text-[10px] font-bold tracking-[0.4em] text-accent-gold uppercase"
                        >
                            Live product — subscriptions coming soon
                        </motion.span>
                        <motion.h1
                            variants={cinematicText}
                            className="text-5xl leading-[1.1] font-bold tracking-tight text-text-primary md:text-7xl"
                        >
                            {subscriptions_enabled
                                ? hero.title
                                : 'Membership is not active yet'}
                        </motion.h1>
                        <motion.div
                            variants={fadeUp}
                            className="mt-8 max-w-2xl text-xl leading-relaxed text-text-muted"
                        >
                            {subscriptions_enabled ? (
                                hero.subtitle
                            ) : (
                                <>
                                    <p>
                                        Ulo of Stories is already fully
                                        functional today — you can create
                                        memorials, share stories, and use the
                                        platform without any payment.
                                    </p>

                                    <p>
                                        We are currently building the
                                        subscription system that will unlock
                                        optional premium features in the future.
                                    </p>

                                    <p>
                                        When it launches, nothing you currently
                                        use will be taken away. It will simply
                                        add new capabilities on top of what
                                        already exists.
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>
            {/* <section className={`relative overflow-hidden pt-32 pb-20 ${subscriptions_enabled ? 'lg:pt-48 lg:pb-32' : ''}`}>
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent_40%)]" />
                <div className="mx-auto max-w-7xl px-8">
                    <div className="max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 text-5xl font-light tracking-tight text-text-primary md:text-7xl"
                        >

                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            transition={{ delay: 0.1 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xl leading-relaxed text-text-muted"
                        >
                            {hero.subtitle ?? ''}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`mt-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm
                                ${subscriptions_enabled
                                    ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                    : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                                }
                            `}
                        >
                            <span
                                className={`h-2 w-2 rounded-full animate-pulse ${subscriptions_enabled ? 'bg-green-400' : 'bg-yellow-400'
                                    }`}
                            />

                            {subscriptions_enabled
                                ? 'Subscriptions active'
                                : 'Live product — subscriptions coming soon'}
                        </motion.div>
                    </div>
                </div>
            </section> */}

            {/* ========================= */}
            {/* CONDITIONAL RENDERING */}
            {/* ========================= */}

            {subscriptions_enabled && (
                <>
                    {/* ORIGINAL PRICING UI (UNCHANGED) */}
                    <section className="py-20 lg:py-32">
                        <div className="mx-auto max-w-7xl px-8">
                            <div className="grid gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-5xl">
                                {plans.map((plan, index) => (
                                    <motion.div
                                        key={plan.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-500 hover:translate-y-[-4px] ${
                                            plan.highlight
                                                ? 'border-accent-gold bg-surface/50 shadow-[0_0_40px_rgba(212,175,55,0.1)]'
                                                : 'border-border-subtle bg-surface/30'
                                        }`}
                                    >
                                        {plan.highlight && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent-gold px-4 py-1 text-[10px] font-bold tracking-widest text-bg-dark uppercase">
                                                Most Popular
                                            </div>
                                        )}

                                        <div className="mb-8">
                                            <h3 className="mb-2 text-2xl font-light text-text-primary">
                                                {plan.name}
                                            </h3>
                                            <p className="text-sm text-text-muted">
                                                {plan.desc}
                                            </p>
                                        </div>

                                        <div className="mb-8 flex items-baseline gap-1">
                                            <span className="text-4xl font-light text-text-primary">
                                                {plan.price}
                                            </span>
                                            <span className="text-sm text-text-muted">
                                                /{plan.interval}
                                            </span>
                                        </div>

                                        <ul className="mb-10 flex flex-col gap-4">
                                            {plan.features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex items-start gap-3 text-sm text-text-muted"
                                                >
                                                    <Check
                                                        size={16}
                                                        className="mt-0.5 shrink-0 text-accent-gold"
                                                    />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-auto">
                                            <Link href={register().url}>
                                                <Button
                                                    variant={
                                                        plan.highlight
                                                            ? 'primary'
                                                            : 'outline'
                                                    }
                                                    className="w-full py-6 text-base"
                                                >
                                                    {plan.button}
                                                </Button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* FAQ stays ALWAYS (important trust anchor) */}
            {subscriptions_enabled && (
                <section className="bg-surface/10 py-20 lg:py-32">
                    <div className="mx-auto max-w-3xl px-8">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-light text-text-primary md:text-4xl">
                                Common Questions
                            </h2>
                            <p className="text-text-muted">
                                Everything you need to know about Ulo of Stories
                                membership.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-2xl border border-border-subtle bg-surface/20"
                                >
                                    <button
                                        onClick={() =>
                                            setOpenFaq(
                                                openFaq === index
                                                    ? null
                                                    : index,
                                            )
                                        }
                                        className="flex w-full items-center justify-between p-6 text-left"
                                    >
                                        <span className="font-medium text-text-primary">
                                            {faq.question}
                                        </span>
                                    </button>

                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height:
                                                openFaq === index ? 'auto' : 0,
                                            opacity: openFaq === index ? 1 : 0,
                                        }}
                                        className="px-6"
                                    >
                                        <div className="pb-6 text-sm text-text-muted">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
