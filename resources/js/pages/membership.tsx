import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui-elements';
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

export default function Membership({ page }: MembershipPageProps) {
    const { hero, plans, faqs } = page.content;
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <GuestLayout>
            <Head title={page.title} />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent_40%)]" />
                
                <div className="mx-auto max-w-7xl px-8">
                    <div className="max-w-3xl">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 text-5xl font-light tracking-tight text-text-primary md:text-7xl"
                        >
                            {hero.title}
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl leading-relaxed text-text-muted"
                        >
                            {hero.subtitle}
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 lg:py-32">
                <div className="mx-auto max-w-7xl px-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:max-w-5xl lg:mx-auto">
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
                                    <h3 className="mb-2 text-2xl font-light text-text-primary">{plan.name}</h3>
                                    <p className="text-sm text-text-muted">{plan.desc}</p>
                                </div>

                                <div className="mb-8 flex items-baseline gap-1">
                                    <span className="text-4xl font-light text-text-primary">{plan.price}</span>
                                    <span className="text-sm text-text-muted">/{plan.interval}</span>
                                </div>

                                <ul className="mb-10 flex flex-col gap-4">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm text-text-muted">
                                            <Check size={16} className="mt-0.5 shrink-0 text-accent-gold" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    <Link href={register().url}>
                                        <Button 
                                            variant={plan.highlight ? 'primary' : 'outline'} 
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

            {/* FAQ Section */}
            <section className="bg-surface/10 py-20 lg:py-32">
                <div className="mx-auto max-w-3xl px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-light text-text-primary md:text-4xl">Common Questions</h2>
                        <p className="text-text-muted">Everything you need to know about Uloak membership.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index}
                                className="overflow-hidden rounded-2xl border border-border-subtle bg-surface/20 transition-all duration-300"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="flex w-full items-center justify-between p-6 text-left"
                                >
                                    <span className="font-medium text-text-primary">{faq.question}</span>
                                    {openFaq === index ? <ChevronUp size={20} className="text-accent-gold" /> : <ChevronDown size={20} className="text-text-muted" />}
                                </button>
                                
                                <motion.div
                                    initial={false}
                                    animate={{ height: openFaq === index ? 'auto' : 0, opacity: openFaq === index ? 1 : 0 }}
                                    className="px-6"
                                >
                                    <div className="pb-6 text-sm leading-relaxed text-text-muted">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 lg:py-48">
                <div className="mx-auto max-w-7xl px-8">
                    <div className="relative overflow-hidden rounded-[3rem] bg-bg-dark border border-border-subtle p-12 lg:p-24">
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08),transparent_70%)]" />
                        
                        <div className="relative z-10 mx-auto max-w-2xl text-center">
                            <h2 className="mb-8 text-4xl font-light tracking-tight text-text-primary md:text-6xl">
                                Ready to build your digital home?
                            </h2>
                            <p className="mb-12 text-lg text-text-muted">
                                Your family's story is the most valuable asset you own. Start preserving it today.
                            </p>
                            <Link href={register().url}>
                                <Button size="lg" className="px-12 py-8 text-lg">
                                    Become a Member
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
