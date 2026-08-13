import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    FolderX,
    Info,
    Lock,
    Share2,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui-elements';
import GuestLayout from '@/layouts/guest-layout';
import {
    cinematicText,
    cardReveal,
    easeWarm,
    fadeFromLeft,
    fadeFromRight,
    fadeUp,
    heroTextStagger,
    parallaxFloat,
    staggerContainer,
    viewportOnce
} from '@/lib/animations';
import { register } from '@/routes';
import { store } from '@/routes/waiting-list';

// Sibling sub-component: Room Card
function StoryTypeCard({
    title,
    description,
    tag,
    imageUrl,
}: {
    title: string;
    description: string;
    tag: string;
    imageUrl: string;
}) {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            whileHover={{
                y: -8,
                scale: 1.01,
                transition: { duration: 0.3, ease: easeWarm },
            }}
            className="group flex flex-col overflow-hidden rounded-3xl border border-border-subtle bg-surface/50 p-4 transition-all duration-300 hover:border-accent-gold/20 hover:shadow-lg"
        >
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-surface">
                <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 rounded-full bg-[#FAF8F4]/90 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-text-primary uppercase shadow-xs backdrop-blur-xs">
                    {tag}
                </div>
            </div>
            <div className="mt-5 flex-1 px-2 pb-2">
                <h3 className="font-serif text-2xl font-semibold tracking-tight text-text-primary">
                    {title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-text-muted">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}

export default function Welcome({
    canRegister,
    featuredRooms = [],
}: {
    canRegister?: boolean;
    featuredRooms?: any[];
}) {
    const [success, setSuccess] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const heroImages = [
        '/images/hero-1.webp',
        '/images/hero-2.webp',
        '/images/hero-3.webp'
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

    const { data, setData, reset, post, errors, processing } = useForm({
        name: '',
        email: ''
    });

    const handleFormChange = (key: 'name' | 'email', value: string) => {
        setData(key, value);
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);
        post(store.url(), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setSuccess(true);
                reset();
            },
        });
    };

    return (
        <GuestLayout>
            <Head>
                <title>Ulo | Every Story Has a Home</title>
                <meta
                    name="description"
                    content="Ulo is a private digital home for family stories, event memories and tributes. Gather photographs, voices and memories in meaningful Rooms and share them with the people who matter."
                />
            </Head>

            <div className="bg-bg-dark text-text-primary selection:bg-accent-gold/20">
                {/* 1. HERO SECTION WITH IMAGE CAROUSEL */}
                <section className="relative min-h-screen flex items-center overflow-hidden bg-bg-dark">
                    {/* Warm floating background glow */}
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

                    <div className="relative z-10 w-full min-h-screen">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                            className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center h-screen min-h-[560px]"
                        >
                            {/* Cinematic Carousel Background — full-bleed, spanning both columns */}
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                <AnimatePresence initial={false}>
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        transition={{ duration: 1.2, ease: easeWarm }}
                                        className="absolute inset-0"
                                    >
                                        <img
                                            src={heroImages[currentSlide]}
                                            alt={`Heritage memory ${currentSlide + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                        {/* Editorial warm overlay gradient — makes text readable */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/50 via-bg-dark/30 to-bg-dark/60" />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Subtle parallax float overlay for warmth */}
                                <motion.div
                                    className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-accent-gold/5 blur-[120px]"
                                    variants={parallaxFloat}
                                    initial="initial"
                                    animate="animate"
                                />
                            </div>

                            {/* Left: Editorial content — overlaid on the carousel */}
                            <motion.div
                                variants={fadeFromLeft}
                                className="lg:col-span-6 relative z-10 px-4 md:px-12 text-left space-y-8 max-w-2xl text-white"
                            >
                                <motion.h1
                                    className="font-serif text-5xl leading-[1.1] font-bold tracking-tight sm:text-6xl md:text-7.5xl"
                                    variants={heroTextStagger}
                                >
                                    Every story <br />
                                    has a <span className="text-accent-gold italic font-normal">home</span>.
                                </motion.h1>
                                <motion.p
                                    className="text-lg leading-relaxed text-white/80 sm:text-xl font-light"
                                    variants={fadeUp}
                                >
                                    A private digital home for family stories, event memories and tributes. Capture the voices, moments and context your family never wants to lose.
                                </motion.p>
                                <motion.div
                                    className="flex flex-col sm:flex-row gap-4 pt-4"
                                    variants={staggerContainer}
                                >
                                    <Link href={register().url}>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.97 }}
                                            transition={{ duration: 0.2, ease: easeWarm }}
                                        >
                                            <Button size="xl" className="w-full sm:w-auto font-semibold px-8 tracking-wide">
                                                Create a House
                                            </Button>
                                        </motion.div>
                                    </Link>
                                    <a href="#how-it-works">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.97 }}
                                            transition={{ duration: 0.2, ease: easeWarm }}
                                        >
                                            <Button size="xl" variant="outline" className="w-full sm:w-auto font-semibold px-8 border-white/20 text-white hover:bg-white/10">
                                                See how Ulo works
                                            </Button>
                                        </motion.div>
                                    </a>
                                </motion.div>
                            </motion.div>

                            {/* Slide Controls — overlaid on the carousel */}
                            <motion.div
                                className="lg:col-span-6 relative z-10 flex justify-end"
                                variants={fadeFromRight}
                            >
                                <motion.div
                                    className="absolute bottom-8 right-8 flex items-center gap-3 z-20"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.5, ease: easeWarm }}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={prevSlide}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-xs text-white transition hover:bg-white/10"
                                        aria-label="Previous slide"
                                    >
                                        <ChevronLeft size={18} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={nextSlide}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-xs text-white transition hover:bg-white/10"
                                        aria-label="Next slide"
                                    >
                                        <ChevronRight size={18} />
                                    </motion.button>
                                </motion.div>

                                {/* Pagination Indicators */}
                                <div className="absolute bottom-8 left-8 flex gap-2 z-20">
                                    {heroImages.map((_, i) => (
                                        <motion.button
                                            key={i}
                                            onClick={() => setCurrentSlide(i)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-accent-gold' : 'w-2 bg-white/30'}`}
                                            whileHover={{ scale: 1.2 }}
                                            aria-label={`Go to slide ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* 2. A HOME FOR EVERY KIND OF STORY */}
                <section id="rooms" className="py-24 border-t border-border-subtle" >
                    <div className="mx-auto max-w-7xl px-6 md:px-8">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={viewportOnce}
                            className="text-center max-w-3xl mx-auto mb-16"
                        >
                            <motion.span
                                variants={fadeUp}
                                className="text-xs font-bold tracking-[0.2em] text-accent-gold uppercase block mb-3"
                            >
                                Organization
                            </motion.span>
                            <motion.h2
                                variants={cinematicText}
                                className="font-serif text-4xl font-bold tracking-tight text-text-primary sm:text-5xl"
                            >
                                A home for every kind of story
                            </motion.h2>
                            <motion.p
                                variants={fadeUp}
                                className="mt-4 text-lg text-text-muted font-light"
                            >
                                Different stories belong in different Rooms. Create the exact environment your memories deserve.
                            </motion.p>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={viewportOnce}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            <StoryTypeCard
                                title="Family House"
                                description="Bring generations, photographs, voices and family stories together in one place."
                                tag="Generations"
                                imageUrl="https://images.unsplash.com/photo-1528605248644-14dd04cb220b?w=600&q=80"
                            />
                            <StoryTypeCard
                                title="Event Room"
                                description="Keep the stories, photographs and memories from important family occasions together."
                                tag="Celebrations"
                                imageUrl="https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=600&q=80"
                            />
                            <StoryTypeCard
                                title="Tribute Room"
                                description="Create a meaningful, respectful space to gather memories and celebrate someone's life journey."
                                tag="In Memoriam"
                                imageUrl="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80"
                            />
                            <StoryTypeCard
                                title="Life Story Room"
                                description="Build a rich chronological collection around one person's journey, memories and life experiences."
                                tag="Milestones"
                                imageUrl="https://images.unsplash.com/photo-1444840535719-195841cb6e2b?w=600&q=80"
                            />
                            <div className="md:col-span-2 lg:col-span-1">
                                <StoryTypeCard
                                    title="Community Room"
                                    description="Bring shared histories, traditions, oral records and community stories together in a safe space."
                                    tag="Heritage"
                                    imageUrl="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 3. HOW ULO WORKS */}
                <section id="how-it-works" className="py-24 border-t border-border-subtle bg-surface/10" >
                    <div className="mx-auto max-w-7xl px-6 md:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <span className="text-xs font-bold tracking-[0.2em] text-accent-gold uppercase block mb-3">
                                The Flow
                            </span>
                            <h2 className="font-serif text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                                Create a House. Invite your people. Start the story.
                            </h2>
                        </div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-5 gap-8 relative"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={viewportOnce}
                        >
                            {/* Horizontal connection line on desktop */}
                            <motion.div
                                className="hidden md:block absolute top-8 left-10 right-10 h-0.5 bg-border-subtle z-0"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={viewportOnce}
                                transition={{ duration: 1, ease: easeWarm, delay: 0.3 }}
                            />

                            {[
                                { num: "01", step: "Create a House", desc: "Create a private space for the story you want to gather." },
                                { num: "02", step: "Invite your people", desc: "Bring family members, friends and contributors into the Room." },
                                { num: "03", step: "Gather their stories", desc: "Collect photographs, videos, recordings and memories." },
                                { num: "04", step: "Add names & context", desc: "Connect each memory to the people, places, dates and meaning." },
                                { num: "05", step: "Keep & share with care", desc: "Choose who can view, contribute to or share the Room." }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeUp}
                                    className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-4"
                                >
                                    <motion.div
                                        className="h-16 w-16 rounded-2xl border border-border-subtle bg-bg-dark flex items-center justify-center text-accent-gold font-serif text-xl font-bold shadow-xs"
                                        whileHover={{ scale: 1.1, rotate: 2 }}
                                        transition={{ duration: 0.3, ease: easeWarm }}
                                    >
                                        {item.num}
                                    </motion.div>
                                    <h3 className="font-serif text-lg font-bold text-text-primary">
                                        {item.step}
                                    </h3>
                                    <p className="text-xs leading-relaxed text-text-muted">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* 4. WHY NOT A SHARED FOLDER? */}
                <section className="py-24 border-t border-border-subtle" >
                    <div className="mx-auto max-w-7xl px-6 md:px-8">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={viewportOnce}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
                        >
                            <motion.div
                                variants={fadeFromLeft}
                                className="lg:col-span-5 space-y-6"
                            >
                                <motion.span
                                    variants={fadeUp}
                                    className="text-xs font-bold tracking-[0.2em] text-accent-gold uppercase block"
                                >
                                    The Differentiator
                                </motion.span>
                                <motion.h2
                                    variants={cinematicText}
                                    className="font-serif text-4xl leading-tight font-bold text-text-primary sm:text-5xl"
                                >
                                    A photograph tells you what happened. <br />
                                    <span className="text-accent-gold italic font-normal">The story tells you why it mattered.</span>
                                </motion.h2>
                                <motion.p
                                    variants={fadeUp}
                                    className="text-lg text-text-muted font-light leading-relaxed"
                                >
                                    Ulo keeps the memory, the people, and the meaning together in one place. Traditional folders display files; Ulo displays connections.
                                </motion.p>
                            </motion.div>

                            {/* Visual Folder vs Ulo Room Comparison */}
                            <motion.div
                                variants={fadeFromRight}
                                className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8"
                            >
                                {/* Shared Folder (Left side) */}
                                <motion.div
                                    variants={cardReveal}
                                    whileHover={{ scale: 1.02 }}
                                    className="border border-border-subtle bg-surface/30 rounded-3xl p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 border-b border-border-subtle pb-4 mb-4">
                                            <FolderX size={18} className="text-text-muted" />
                                            <span className="text-xs font-semibold text-text-muted">Shared Cloud Folder</span>
                                        </div>
                                        <div className="space-y-2 font-mono text-[11px] text-text-muted">
                                            <div className="p-2 bg-surface/50 rounded-lg flex items-center justify-between">
                                                <span>IMG_2048.jpg</span>
                                                <span className="opacity-50">4.2MB</span>
                                            </div>
                                            <div className="p-2 bg-surface/50 rounded-lg flex items-center justify-between">
                                                <span>wedding-video.mp4</span>
                                                <span className="opacity-50">89.1MB</span>
                                            </div>
                                            <div className="p-2 bg-surface/50 rounded-lg flex items-center justify-between">
                                                <span>voice-note.m4a</span>
                                                <span className="opacity-50">1.8MB</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 text-xs text-text-muted border-t border-border-subtle pt-4 italic">
                                        No names, no audio transcripts, no context of who or why.
                                    </div>
                                </motion.div>

                                {/* Ulo Context Card (Right side) */}
                                <motion.div
                                    variants={cardReveal}
                                    transition={{ delay: 0.15 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="border border-accent-gold/25 bg-bg-dark rounded-3xl p-6 flex flex-col justify-between shadow-xl"
                                >
                                    <div>
                                        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-accent-gold" />
                                                <span className="text-xs font-semibold text-text-primary">Ulo Story</span>
                                            </div>
                                            <span className="text-[10px] text-accent-gold font-bold">Adim Family</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-surface overflow-hidden">
                                                    <img src="https://images.unsplash.com/photo-1528605248644-14dd04cb220b?w=100&q=80" className="object-cover h-full w-full" alt="Thumbnail" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-text-primary">Egusi Soup Lesson</h4>
                                                    <p className="text-[10px] text-text-muted">Auntie Ifeoma · December 1984</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 text-[10px] text-text-primary leading-relaxed bg-surface/60 p-3 rounded-xl border border-border-subtle">
                                                <div className="flex justify-between border-b border-border-subtle/50 pb-1">
                                                    <span className="text-text-muted">Who:</span>
                                                    <span className="font-medium">Grandma Kemi</span>
                                                </div>
                                                <div className="flex justify-between border-b border-border-subtle/50 pb-1">
                                                    <span className="text-text-muted">Where:</span>
                                                    <span className="font-medium">Enugu, Nigeria</span>
                                                </div>
                                                <p className="mt-2 text-text-muted italic leading-relaxed">
                                                    "The lesson Grandma recorded before we departed. This was the recipe that stayed with us through all our relocations."
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-accent-gold font-semibold flex items-center justify-end gap-1">
                                        <span>Meaning Protected</span>
                                        <Lock size={12} />
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div >
                </section >

                {/* 5. PRIVACY & CONTROL */}
                <section className="py-24 border-t border-border-subtle bg-surface/10" >
                    <div className="mx-auto max-w-4xl px-6 md:px-8 text-center space-y-8">
                        <div className="h-14 w-14 rounded-full border border-accent-gold/20 bg-accent-gold/5 flex items-center justify-center mx-auto text-accent-gold">
                            <Lock size={24} />
                        </div>
                        <h2 className="font-serif text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                            Your people. Your stories. Your choice.
                        </h2>
                        <p className="text-lg text-text-muted font-light leading-relaxed max-w-2xl mx-auto">
                            You decide who can contribute, who can view each Room and how its stories are shared. Ulo is private by default, keeping your family heritage away from public search engines and ad networks.
                        </p>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={viewportOnce}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-6 text-left"
                        >
                            <motion.div
                                variants={cardReveal}
                                whileHover={{ y: -4 }}
                                className="bg-surface/50 border border-border-subtle p-5 rounded-2xl space-y-3"
                            >
                                <Users size={18} className="text-accent-gold" />
                                <h3 className="font-serif text-base font-bold text-text-primary">Controlled Invites</h3>
                                <p className="text-xs text-text-muted leading-relaxed">Only family members you explicitly invite can access your House.</p>
                            </motion.div>
                            <motion.div
                                variants={cardReveal}
                                whileHover={{ y: -4 }}
                                className="bg-surface/50 border border-border-subtle p-5 rounded-2xl space-y-3"
                            >
                                <Share2 size={18} className="text-accent-gold" />
                                <h3 className="font-serif text-base font-bold text-text-primary">Granular Permissions</h3>
                                <p className="text-xs text-text-muted leading-relaxed">Set members as contributors, editors or view-only observers.</p>
                            </motion.div>
                            <motion.div
                                variants={cardReveal}
                                whileHover={{ y: -4 }}
                                className="bg-surface/50 border border-border-subtle p-5 rounded-2xl space-y-3"
                            >
                                <Info size={18} className="text-accent-gold" />
                                <h3 className="font-serif text-base font-bold text-text-primary">No Ad Networks</h3>
                                <p className="text-xs text-text-muted leading-relaxed">Your family stories belong entirely to you, free from trackers.</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* 6. ULO STUDIO */}
                <section className="py-20 border-t border-border-subtle bg-surface/30" >
                    <div className="mx-auto max-w-5xl px-6 md:px-8 border border-border-subtle/50 bg-bg-dark rounded-3xl p-8 md:p-12">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={viewportOnce}
                            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                        >
                            <motion.div
                                variants={fadeFromLeft}
                                className="md:col-span-8 space-y-4"
                            >
                                <motion.span
                                    variants={fadeUp}
                                    className="text-[10px] font-bold text-accent-gold uppercase tracking-[0.2em] block"
                                >
                                    Supporting Service
                                </motion.span>
                                <motion.h2
                                    variants={cinematicText}
                                    className="font-serif text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
                                >
                                    Need help bringing the story together?
                                </motion.h2>
                                <motion.p
                                    variants={fadeUp}
                                    className="text-base text-text-muted leading-relaxed max-w-xl font-light"
                                >
                                    Ulo Studio can help with professional interviews, heritage photography, filmmaking, and memory curation—bringing your family's stories together with care.
                                </motion.p>
                            </motion.div>
                            <motion.div
                                variants={fadeFromRight}
                                className="md:col-span-4 flex justify-start md:justify-end"
                            >
                                <Link href="/services">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ duration: 0.2, ease: easeWarm }}
                                    >
                                        <Button variant="outline" size="lg" className="border-text-primary/10 text-text-primary hover:bg-text-primary/5 font-semibold">
                                            Explore Ulo Studio
                                        </Button>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* 7. ABOUT ULO */}
                <section className="py-24 border-t border-border-subtle" >
                    <div className="mx-auto max-w-7xl px-6 md:px-8">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={viewportOnce}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
                        >
                            <motion.div
                                variants={fadeFromLeft}
                                className="lg:col-span-5 relative aspect-4/3 overflow-hidden rounded-3xl bg-surface"
                            >
                                <motion.img
                                    variants={fadeFromLeft}
                                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"
                                    alt="Ulo of Stories background"
                                    className="h-full w-full object-cover grayscale opacity-80"
                                />
                            </motion.div>
                            <motion.div
                                variants={fadeFromRight}
                                className="lg:col-span-7 space-y-6"
                            >
                                <motion.span
                                    variants={fadeUp}
                                    className="text-xs font-bold tracking-[0.2em] text-accent-gold uppercase block"
                                >
                                    Our Roots
                                </motion.span>
                                <motion.h2
                                    variants={cinematicText}
                                    className="font-serif text-4xl leading-tight font-bold text-text-primary sm:text-5xl"
                                >
                                    A house built for stories that matter.
                                </motion.h2>
                                <motion.p
                                    variants={fadeUp}
                                    className="text-lg text-text-muted font-light leading-relaxed"
                                >
                                    Ulo means house in Igbo. We created it because family stories deserve more than a forgotten folder, a disappearing chat or a photograph no one can explain. Ulo gives those stories a private home, together with the voices, names and context that keep them meaningful.
                                </motion.p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* 8. WAITING LIST */}
                <section className="py-24 border-t border-border-subtle bg-surface/20" >
                    <div className="mx-auto max-w-xl px-6">
                        <div className="border border-border-subtle bg-bg-dark rounded-3xl p-8 shadow-xl space-y-6">
                            <div className="text-center space-y-2">
                                <h3 className="font-serif text-2xl font-bold text-text-primary">Join the Journey</h3>
                                <p className="text-sm text-text-muted">
                                    Leave your details and we'll invite you to set up your first Room when space opens.
                                </p>
                            </div>

                            {success && (
                                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center">
                                    <p className="text-sm font-semibold text-green-400">
                                        You're on the list! Check your inbox.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={submitForm} className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="name" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={data.name}
                                        onChange={e => handleFormChange('name', e.target.value)}
                                        className="w-full rounded-xl border border-border-subtle bg-surface/40 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:border-accent-gold focus:outline-hidden"
                                        placeholder="Full Name"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="email" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                                        Your Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={data.email}
                                        onChange={e => handleFormChange('email', e.target.value)}
                                        className="w-full rounded-xl border border-border-subtle bg-surface/40 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:border-accent-gold focus:outline-hidden"
                                        placeholder="you@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <Button type="submit" disabled={processing} className="w-full py-3.5 text-sm font-semibold tracking-wider uppercase mt-4">
                                    {processing ? 'Submitting...' : 'Join the Waiting List'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* 9. FINAL CTA SECTION */}
                <section className="py-24 border-t border-border-subtle bg-bg-dark text-center relative overflow-hidden" >
                    <div className="absolute inset-0 z-0 bg-radial-gradient(circle, rgba(139,110,50,0.05) 0%, transparent 70%)" />
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={viewportOnce}
                        className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 space-y-8"
                    >
                        <motion.h2
                            variants={cinematicText}
                            className="font-serif text-4xl font-bold tracking-tight text-text-primary sm:text-5xl"
                        >
                            The stories that matter deserve a home.
                        </motion.h2>
                        <motion.p
                            variants={fadeUp}
                            className="text-lg text-text-muted font-light leading-relaxed max-w-xl mx-auto"
                        >
                            Create a House, invite your people and keep the meaning together.
                        </motion.p>
                        <motion.div
                            variants={staggerContainer}
                            className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
                        >
                            <Link href={register().url}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ duration: 0.2, ease: easeWarm }}
                                >
                                    <Button size="lg" className="w-full sm:w-auto font-semibold px-8 tracking-wide">
                                        Create a House
                                    </Button>
                                </motion.div>
                            </Link>
                            <a href="#how-it-works">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ duration: 0.2, ease: easeWarm }}
                                >
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold px-8 border-text-primary/10 text-text-primary hover:bg-text-primary/5">
                                        See how Ulo works
                                    </Button>
                                </motion.div>
                            </a>
                        </motion.div>
                    </motion.div>
                </section>
            </div >
        </GuestLayout >
    );
}
