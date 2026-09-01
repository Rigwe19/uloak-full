import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    Camera,
    Film,
    Share2,
    Shield,
    Users,
    Key,
    LayoutGrid,
    Mic,
    Book,
    Briefcase,
    FileText,
    Coffee,
    Lock,
    Globe,
    Zap,
    Microscope,
    Heart,
    Database
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

import { Button } from '@/components/ui-elements';
import GuestLayout from '@/layouts/guest-layout';
import {
    cinematicText,
    fadeUp,
    parallaxFloat,
    staggerContainer,
} from '@/lib/animations';
import { login } from '@/routes';

interface Props {
    page?: {
        title: string;
        meta_description?: string;
        content: any;
    };
}

export default function HowItWorks({ page }: Props) {
    const iconMap: Record<string, any> = {
        Shield,
        Users,
        BookOpen,
        Heart,
        Globe,
        Film,
        Zap,
        Database,
        Microscope,
        Key,
        LayoutGrid,
        Camera,
        Mic,
        Book,
        Briefcase,
        FileText,
        Coffee,
        Lock,
        Share2
    };

    const content = page?.content || {};
    const hero = content.hero || {
        title: 'The Architecture of Storytelling.',
        subtitle: 'From initial capture to generational preservation — a seamless journey for your legacy.',
    };

    const steps = content.steps || [
        {
            id: '01',
            title: 'The Threshold',
            desc: 'Begin with a simple conversation. Whether you start with a single photo or a lifetime of memory, we provide the guided path to move inward.',
            icon: 'Key',
        },
        {
            id: '02',
            title: 'The Living Archive',
            desc: 'Organize your heritage into digital rooms. The Library, The Gallery, The Kitchen — architecture that mirrors the way we actually remember.',
            icon: 'LayoutGrid',
        },
        {
            id: '03',
            title: 'The Intentional Capture',
            desc: 'Use our studio services or platform tools to record stories with cinematic quality, preserving voice, movement, and nuance.',
            icon: 'Camera',
        },
        {
            id: '04',
            title: 'The Multi-Generational Home',
            desc: 'Invite your lineage. Ulo of Stories is a shared space where children and grandchildren can interact with stories that would otherwise be lost.',
            icon: 'Users',
        },
    ];

    return (
        <>
            {/* <Head>
                <title>{page?.title || 'How It Works'} | Ulo of Stories</title>
                <meta name="description" content={page?.meta_description || 'Learn how Ulo of Stories helps you preserve your family heritage and stories.'} />
            </Head> */}

            <div className="bg-bg-dark text-text-primary selection:bg-accent-gold/30">
                {/* Hero Section */}
                                <section className="relative min-h-[70vh] overflow-hidden px-6 pt-32 pb-20 md:px-12 lg:px-24">
                    <motion.div
                        className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-gold/5 blur-[120px]"
                        variants={parallaxFloat}
                        initial="initial"
                        animate="animate"
                    />
                    <motion.div
                        className="absolute bottom-48 -left-24 h-[500px] w-[500px] rounded-full bg-accent-gold/5 blur-[120px]"
                        variants={parallaxFloat}
                        initial="initial"
                        animate="animate"
                        style={{ animationDelay: '2s' }}
                    />
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-bg-dark/95 to-bg-dark/90" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl text-center">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                        >
                            <motion.span
                                variants={fadeUp}
                                className="mb-6 inline-block text-[10px] font-bold text-accent-gold uppercase tracking-[0.4em]"
                            >
                                Our Process
                            </motion.span>
                            <motion.h1
                                variants={cinematicText}
                                className="text-5xl leading-[1.1] font-bold tracking-tight text-text-primary md:text-7xl lg:text-8xl"
                            >
                                {hero.title}
                            </motion.h1>
                            <motion.p
                                variants={fadeUp}
                                className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl"
                            >
                                {hero.subtitle}
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* Steps Section */}
                <section className="px-6 py-32 md:px-12 lg:px-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative">
                            {/* Vertical line for desktop */}
                            <div className="absolute top-0 bottom-0 left-1/2 hidden w-[1px] border-l border-white/5 lg:block" />

                            <div className="grid gap-24 lg:gap-40">
                                {steps.map((step: any, i: number) => {
                                    const IconComponent = iconMap[step.icon as keyof typeof iconMap] || Share2;

                                    return (
                                        <motion.div
                                            key={step.title}
                                            initial={{ opacity: 0, y: 40 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8 }}
                                            className={`flex flex-col items-center gap-12 lg:flex-row lg:gap-24 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
                                        >
                                            <div className="w-full flex-1">
                                                <div
                                                    className={`flex flex-col ${i % 2 !== 0 ? 'lg:items-start' : 'lg:items-end'}`}
                                                >
                                                    <div className="mb-4 flex items-center gap-4 text-accent-gold">
                                                        <span className="font-outfit text-3xl font-bold opacity-30">
                                                            {step.id || `0${i + 1}`}
                                                        </span>
                                                        <div className="h-px w-12 bg-accent-gold/30" />
                                                    </div>
                                                    <h2
                                                        className={`mb-6 text-3xl font-bold text-text-primary md:text-4xl ${i % 2 !== 0 ? 'lg:text-left' : 'text-left lg:text-right'}`}
                                                    >
                                                        {step.title}
                                                    </h2>
                                                    <p
                                                        className={`max-w-md text-lg leading-relaxed text-text-muted ${i % 2 !== 0 ? 'lg:text-left' : 'text-left lg:text-right'}`}
                                                    >
                                                        {step.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border border-white/5 bg-bg-dark lg:h-32 lg:w-32">
                                                    <IconComponent
                                                        size={32}
                                                        className="text-accent-gold lg:h-10 lg:w-10"
                                                    />
                                                </div>
                                                {/* Glowing halo */}
                                                <div className="absolute inset-0 scale-150 rounded-full bg-accent-gold/10 blur-[40px]" />
                                            </div>

                                            <div className="hidden flex-1 lg:block" />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="px-6 py-32 md:px-12 lg:px-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mx-auto max-w-5xl rounded-[60px] border border-white/5 bg-surface/20 p-16 text-center md:p-24"
                    >
                        <h2 className="text-4xl font-bold tracking-tight text-text-primary md:text-6xl">Ready to begin?</h2>
                        <p className="mx-auto mt-8 max-w-xl text-xl text-text-muted">
                            Start building your digital house of stories today.
                        </p>
                        <div className="mt-12 flex justify-center">
                            <Link href={login()}>
                                <Button className="h-16 rounded-full px-12 text-lg font-bold transition-transform hover:scale-105">
                                    Start Your Legacy
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </section>
            </div>
        </>
    );
}
