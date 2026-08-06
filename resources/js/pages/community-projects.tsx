import { Head } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Globe,
    Heart,
    Landmark,
    Mail,
    Microscope,
    Users,
    Shield,
    Film,
    Zap,
    Database,
    Key,
    LayoutGrid,
    Camera,
    Mic,
    Book,
    Briefcase,
    FileText,
    Coffee,
    Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

import { Button } from '@/components/ui-elements';
import GuestLayout from '@/layouts/guest-layout';

interface Props {
    page?: {
        title: string;
        meta_description?: string;
        content: any;
    };
}

export default function CommunityProjects({ page }: Props) {
    const iconMap: Record<string, any> = {
        Activity,
        Globe,
        Heart,
        Landmark,
        Microscope,
        Users,
        Shield,
        Film,
        Zap,
        Database,
        Key,
        LayoutGrid,
        Camera,
        Mic,
        Book,
        Briefcase,
        FileText,
        Coffee,
        Lock
    };

    const content = page?.content || {};
    const hero = content.hero || {
        title: 'Impact through storytelling.',
        subtitle: 'Ulo of Stories partners with community organizations, charities, and institutions to preserve collective memory and foster intergenerational connection.',
    };

    const impactAreas = content.focus_areas || [
        {
            title: 'Cultural Heritage',
            desc: 'Preserving the unique histories and traditions of diverse communities across the UK.',
            icon: 'Globe',
        },
        {
            title: 'Intergenerational Connection',
            desc: 'Bridging the gap between elders and youth through shared narratives and workshops.',
            icon: 'Users',
        },
        {
            title: 'Health & Wellbeing',
            desc: 'Using storytelling as a tool for cognitive stimulation and social connection in care settings.',
            icon: 'Heart',
        },
    ];

    const stats = content.stats || [
        { value: '1,200+', label: 'Stories Preserved' },
        { value: '45+', label: 'Communities Served' },
        { value: '88%', label: 'Intergenerational Impact' },
    ];

    return (
        <>
            {/* <Head>
                <title>{page?.title || 'Community & Impact'} | Ulo of Stories</title>
                <meta name="description" content={page?.meta_description || 'Discover the social impact and community projects led by Ulo of Stories.'} />
            </Head> */}

            <div className="bg-bg-dark text-text-primary selection:bg-accent-gold/30">
                {/* Hero Section */}
                <section className="relative min-h-[80vh] overflow-hidden px-6 pt-32 pb-20 md:px-12 lg:px-24">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-bg-dark/95 to-bg-dark/90" />
                        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-gold/5 blur-[120px]" />
                        <div className="absolute bottom-48 -left-24 h-[500px] w-[500px] rounded-full bg-accent-gold/5 blur-[150px]" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl">
                        <div className="flex flex-col items-center gap-16 lg:flex-row">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="lg:w-1/2"
                            >
                                <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-accent-gold/20 bg-accent-gold/10 px-4 py-2">
                                    <Globe className="text-accent-gold" size={16} />
                                    <span className="text-[10px] font-bold tracking-widest text-accent-gold uppercase">
                                        Community & Impact
                                    </span>
                                </div>
                                <h1 className="mb-8 text-5xl leading-[1.1] font-bold tracking-tight text-text-primary md:text-7xl">
                                    {hero.title}
                                </h1>
                                <p className="mb-10 max-w-xl text-xl leading-relaxed text-text-muted md:text-2xl">
                                    {hero.subtitle}
                                </p>
                                <Button className="h-14 rounded-full px-10 text-lg font-bold">
                                    Partner With Us
                                </Button>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-6 lg:w-1/2">
                                {stats.map((stat: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex flex-col items-center justify-center rounded-[40px] border border-white/5 bg-surface/30 p-10 text-center transition-all hover:bg-surface/50"
                                    >
                                        <span className="mb-2 text-4xl font-bold text-accent-gold md:text-5xl">
                                            {stat.value}
                                        </span>
                                        <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            {stat.label}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Focus Areas */}
                <section className="px-6 py-32 md:px-12 lg:px-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-24 max-w-2xl">
                            <h2 className="mb-8 text-xs font-bold tracking-[0.4em] text-accent-gold uppercase">Our Focus Areas</h2>
                            <p className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl leading-[1.1]">
                                Measuring the power of resonance and belonging.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {impactAreas.map((area: any, i: number) => {
                                const IconComponent = iconMap[area.icon as keyof typeof iconMap] || Heart;

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group rounded-3xl border border-white/5 bg-surface/20 p-12 transition-all hover:border-accent-gold/20 hover:bg-surface/40"
                                    >
                                        <div className="mb-8 inline-flex rounded-2xl bg-accent-gold/10 p-4 transition-transform group-hover:scale-110">
                                            <IconComponent className="text-accent-gold" size={32} />
                                        </div>
                                        <h3 className="mb-6 text-2xl font-bold text-text-primary">
                                            {area.title}
                                        </h3>
                                        <p className="text-lg leading-relaxed text-text-muted">
                                            {area.desc}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Partners Section */}
                <section className="bg-surface/10 py-32 px-6">
                    <div className="mx-auto max-w-7xl text-center">
                        <p className="mb-16 text-xs font-bold tracking-[0.3em] text-text-muted uppercase">Institutional Partners</p>
                        <div className="flex flex-wrap items-center justify-center gap-12 opacity-30 grayscale md:gap-24">
                            <span className="text-3xl font-bold">NHS TRUSTS</span>
                            <span className="text-3xl font-bold">OXFORD UNIVERSITY</span>
                            <span className="text-3xl font-bold">HERITAGE FUND</span>
                            <span className="text-3xl font-bold">UK COUNCILS</span>
                        </div>
                    </div>
                </section>

                {/* Collaboration CTA */}
                <section className="px-6 py-32 md:px-12 lg:px-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mx-auto max-w-5xl rounded-[60px] bg-accent-gold p-16 text-center text-black md:p-24"
                    >
                        <h2 className="text-4xl font-bold tracking-tight md:text-6xl">Interested in collaborating?</h2>
                        <p className="mx-auto mt-8 max-w-2xl text-xl font-medium opacity-80 leading-relaxed">
                            If you're a researcher, care provider, funder, or community organisation interested in the power of storytelling — we'd love to hear from you.
                        </p>
                        <div className="mt-12 flex flex-wrap justify-center gap-6">
                            <Button className="h-16 rounded-full bg-black px-12 text-lg font-bold text-white transition-transform hover:scale-105">
                                Start a Conversation
                            </Button>
                            <div className="flex h-16 items-center gap-3 rounded-full border border-black/20 px-8 text-lg font-bold">
                                <Mail size={20} />
                                hello@ulo of stories.co.uk
                            </div>
                        </div>
                    </motion.div>
                </section>
            </div>
        </>
    );
}
