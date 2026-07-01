import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    Book,
    Briefcase,
    Camera,
    CheckCircle2,
    Coffee,
    FileText,
    Film,
    Mic,
    Play,
    Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

import { Button } from '@/components/ui-elements';
import GuestLayout from '@/layouts/guest-layout';

interface Props {
    page?: {
        content: any;
    };
}

export default function LegacyFilms({ page }: Props) {
    const iconMap: Record<string, any> = {
        Film,
        Camera,
        Mic,
        Book,
        Briefcase,
        FileText,
        Users,
        Coffee,
    };

    const heroContent = page?.content?.hero || {
        title: 'Every life is a story worth telling.',
        subtitle: 'Premium storytelling services — documentary film, oral history, heritage photography, and more. We come to you, wherever you are.',
        image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&q=80',
    };

    const displayServices = page?.content?.services || [
        {
            title: 'Life Story Documentary Films',
            desc: 'Cinematic documentary portraits that capture a lifetime of experiences, relationships, and wisdom. From 15-minute highlights to full-length features.',
            icon: 'Film',
        },
        {
            title: 'Heritage Photography',
            desc: 'Portrait sessions and archival photography that document people, places, and moments with intention and artistry.',
            icon: 'Camera',
        },
        {
            title: 'Oral History Recording',
            desc: 'Professionally recorded audio interviews, transcribed and archived. Perfect for families, communities, and research projects.',
            icon: 'Mic',
        },
        {
            title: 'Memory Books & Keepsakes',
            desc: 'Beautifully designed printed books combining photography, transcribed stories, and personal reflections.',
            icon: 'Book',
        },
        {
            title: 'Brand Story Films',
            desc: 'Documentary-style films for businesses, charities, and social enterprises that want to tell their story with depth and authenticity.',
            icon: 'Briefcase',
        },
        {
            title: 'Written Life Stories',
            desc: 'Ghostwritten biographical narratives crafted from interview sessions — a lasting literary portrait of a life.',
            icon: 'FileText',
        },
        {
            title: 'Group & Community Projects',
            desc: 'Multi-person documentary and archive projects for care homes, community organisations, and heritage groups.',
            icon: 'Users',
        },
        {
            title: 'Reminiscence Sessions',
            desc: 'Guided storytelling sessions designed for care home residents, using photography, music, and conversation prompts.',
            icon: 'Coffee',
        },
    ];

    const displaySteps = page?.content?.steps || [
        {
            id: '01',
            title: 'Discovery Call',
            desc: 'A free conversation to understand your story, your goals, and the best format for your project.',
        },
        {
            id: '02',
            title: 'Planning & Prep',
            desc: 'We design the session — questions, locations, logistics — so everything runs smoothly on the day.',
        },
        {
            id: '03',
            title: 'The Session',
            desc: 'We come to you. Relaxed, professional, and guided. No scripts. Just real conversation.',
        },
        {
            id: '04',
            title: 'Production',
            desc: 'We craft your story — editing film, designing books, or preparing your archive with care and precision.',
        },
        {
            id: '05',
            title: 'Delivery',
            desc: 'Your finished story, delivered in your chosen format. Ready to share, keep, and pass on.',
        },
    ];

    return (
        <>
            <Head title="Legacy Films & Services - ULOAK" />
            <div className="bg-bg-dark pt-20">
                {/* Hero Section */}
                <section className="relative flex h-[80vh] items-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 z-10 bg-linear-to-r from-bg-dark via-bg-dark/80 to-transparent" />
                        <img
                            src={heroContent.image}
                            className="h-full w-full object-cover opacity-40 mix-blend-luminosity"
                            alt="Cinematic storytelling"
                        />
                    </div>

                    <div className="relative z-20 mx-auto w-full max-w-7xl px-8">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-3xl"
                        >
                            <div className="mb-8 flex items-center gap-4 text-xs font-bold tracking-[0.4em] text-accent-gold uppercase">
                                <div className="h-px w-12 bg-accent-gold/40" />
                                <span>Uloak Studio</span>
                            </div>
                            <h1 className="mb-10 text-6xl leading-[0.9] font-bold tracking-tighter text-text-primary md:text-8xl">
                                {heroContent.title.includes('story') ? (
                                    <>
                                        {heroContent.title.split('story')[0]} <br />
                                        <span className="text-accent-gold italic">story {heroContent.title.split('story')[1]}</span>
                                    </>
                                ) : (
                                    heroContent.title
                                )}
                            </h1>
                            <p className="mb-12 max-w-xl text-xl leading-relaxed font-light text-text-muted md:text-2xl">
                                {heroContent.subtitle}
                            </p>
                            <Button className="rounded-full px-10 py-5 text-lg shadow-2xl shadow-accent-gold/10">
                                Book a Free Discovery Call
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="px-8 py-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
                            <div className="max-w-2xl">
                                <h2 className="mb-6 text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
                                    Our Services
                                </h2>
                                <p className="text-lg text-text-muted">
                                    We offer a range of professional creative
                                    services designed to capture and preserve
                                    the essence of who you are.
                                </p>
                            </div>
                            <div className="mb-6 hidden h-px flex-grow border-b border-border-subtle md:block" />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {displayServices.map((service: any, i: number) => {
                                const IconComponent = iconMap[service.icon] || Film;
                                return (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className="group flex h-full flex-col rounded-3xl border border-border-subtle bg-surface/30 p-8 transition-all hover:border-accent-gold/30 hover:bg-surface/50"
                                    >
                                        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-gold/10 bg-accent-gold/5 transition-all duration-500 group-hover:bg-accent-gold group-hover:text-bg-dark">
                                            <IconComponent
                                                size={24}
                                                className="text-accent-gold group-hover:text-bg-dark"
                                            />
                                        </div>
                                        <h3 className="mb-4 text-xl leading-tight font-bold text-text-primary">
                                            {service.title}
                                        </h3>
                                        <p className="mt-auto text-sm leading-relaxed text-text-muted">
                                            {service.desc}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* How It Works - Architectural View */}
                <section className="relative bg-surface/20 py-32">
                    <div className="mx-auto max-w-7xl px-8">
                        <div className="mx-auto mb-24 max-w-3xl text-center">
                            <h2 className="mb-6 text-4xl font-bold text-text-primary">
                                The Studio Process
                            </h2>
                            <p className="text-text-muted italic">
                                Five steps to a legacy that lives forever.
                            </p>
                        </div>

                        <div className="relative">
                            {/* Connection Line */}
                            <div className="absolute top-1/2 left-0 hidden h-px w-full bg-linear-to-r from-transparent via-border-subtle to-transparent lg:block" />

                            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
                                {displaySteps.map((step: any, i: number) => (
                                    <div
                                        key={i}
                                        className="group relative text-center lg:text-left"
                                    >
                                        <div className="relative mb-8 inline-block">
                                            <span className="pointer-events-none absolute -top-8 -left-4 z-0 text-5xl font-bold text-text-muted/5 transition-colors duration-500 select-none group-hover:text-accent-gold/5 lg:text-7xl">
                                                {step.id}
                                            </span>
                                            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-dark transition-colors duration-500 group-hover:border-accent-gold">
                                                <CheckCircle2
                                                    size={24}
                                                    className="text-text-muted transition-colors group-hover:text-accent-gold"
                                                />
                                            </div>
                                        </div>
                                        <h4 className="mb-4 font-bold tracking-tight text-text-primary transition-colors group-hover:text-accent-gold">
                                            {step.title}
                                        </h4>
                                        <p className="mx-auto max-w-xs text-xs leading-relaxed text-text-muted lg:mx-0">
                                            {step.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Booking Form / CTA */}
                <section className="bg-bg-dark py-32">
                    <div className="mx-auto max-w-7xl px-8">
                        <div className="flex flex-col overflow-hidden rounded-[3rem] border border-border-subtle bg-surface lg:flex-row">
                            <div className="flex flex-col justify-center bg-linear-to-br from-accent-gold/5 to-transparent p-12 lg:w-1/2 lg:p-20">
                                <h2 className="mb-8 text-4xl font-bold tracking-tighter text-text-primary md:text-5xl">
                                    Book a Session
                                </h2>
                                <p className="mb-12 text-lg text-text-muted">
                                    Fill in the form and we'll be in touch
                                    within 48 hours to discuss your project.
                                    We're looking forward to hearing your story.
                                </p>

                                <div className="space-y-6">
                                    <div className="group flex cursor-pointer items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface transition-all group-hover:bg-accent-gold group-hover:text-bg-dark">
                                            <Play size={18} />
                                        </div>
                                        <span className="text-sm font-bold tracking-widest text-text-primary uppercase">
                                            Free discovery call included
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-bg-dark/50 p-12 lg:w-1/2 lg:p-20">
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm transition-all outline-none focus:border-accent-gold"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm transition-all outline-none focus:border-accent-gold"
                                                placeholder="hello@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Service Interested In
                                        </label>
                                        <select className="w-full appearance-none rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm transition-all outline-none focus:border-accent-gold">
                                            <option>
                                                Life Story Documentary
                                            </option>
                                            <option>
                                                Heritage Photography
                                            </option>
                                            <option>
                                                Oral History Recording
                                            </option>
                                            <option>Memory Book</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Tell us a bit about your story
                                        </label>
                                        <textarea
                                            rows={4}
                                            className="w-full resize-none rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm transition-all outline-none focus:border-accent-gold"
                                            placeholder="I'd like to capture my grandfather's journey..."
                                        />
                                    </div>
                                    <Button className="flex w-full items-center justify-center gap-2 rounded-xl py-4">
                                        Send Request <ArrowRight size={18} />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
