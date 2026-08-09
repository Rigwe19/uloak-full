import { SiFacebook, SiInstagram, SiTiktok, SiX, SiYoutube } from '@icons-pack/react-simple-icons';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader,
    Lock,
    Play,
    Shield,
    Users
} from 'lucide-react';
import { Linkedin } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui-elements';
import { login } from '@/routes';
import { store } from '@/routes/waiting-list';

const slides = [
    {
        id: 'porch',
        title: 'Every Family Is a Home.',
        subtitle:
            'Ulo of Stories is the digital architecture for your heritage. Built for the diaspora to preserve what distance usually takes.',
        image: '/images/hero-1.webp',
        badge: 'Step Inside',
    },
    {
        id: 'library',
        title: 'Architecture for Memories.',
        subtitle:
            'Move beyond folders. Organize your legacy in rooms designed for reflection, growth, and generational continuity.',
        image: '/images/hero-2.webp',
        badge: 'The Library',
    },
    {
        id: 'heartland',
        title: 'Reclaim Your Lineage.',
        subtitle:
            'For those navigating between worlds, Ulo of Stories provides a grounded space where your identity remains central.',
        image: '/images/hero-3.webp',
        badge: 'The Heartland',
    },
];

const SplitText = ({
    text,
    className = '',
}: {
    text: string;
    className?: string;
}) => {
    const words = text.split(' ');

    return (
        <div className={`flex flex-wrap gap-x-[0.25em] ${className}`}>
            {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden">
                    <motion.h1
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        transition={{
                            duration: 1,
                            delay: i * 0.05,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="inline-block"
                    >
                        {word}
                    </motion.h1>
                </span>
            ))}
        </div>
    );
};

const Room = ({
    children,
    className = '',
    id = '',
}: {
    children: React.ReactNode;
    className?: string;
    id?: string;
}) => (
    <section
        id={id}
        className={`relative flex min-h-screen items-center justify-center overflow-hidden py-20 ${className}`}
    >
        <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full w-full flex-col items-center"
        >
            {children}
        </motion.div>
    </section>
);

export default function Welcome({
    page,
    featuredRooms = [],
}: {
    page?: any;
    featuredRooms?: any[];
}) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Merge static slides with dynamic content if available
    const displaySlides = page?.content?.hero_slides || slides;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
        }, 10000);

        return () => clearInterval(timer);
    }, [displaySlides.length]);

    const nextSlide = () =>
        setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    const prevSlide = () =>
        setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);

    const [success, setSuccess] = useState(false);

    const { data, setData, reset, post, errors, processing } = useForm({
        name: '',
        email: ''
    });

    const handleFormChange = (key: 'name' | 'email', value: string) => {
        setData(key, value);
    }

    const submitForm = () => {
        setSuccess(false);
        post(store.url(), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setSuccess(true);
                reset();
            },
            // onFinish: () => resetAndClearErrors(),
        })
    }

    return (
        <>
            <Head title="ULO OF STORIES - House of Stories" />

            <div className="bg-bg-dark text-text-primary selection:bg-accent-gold/30">
                {/* 1. CINEMATIC HERO CAROUSEL */}
                <section className="relative h-screen overflow-hidden bg-bg-dark">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: 'easeInOut' }}
                            className="absolute inset-0 z-0"
                        >
                            <div className="absolute inset-0 z-10 bg-linear-to-b from-bg-dark/70 via-bg-dark/30 to-bg-dark" />
                            <motion.img
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 10, ease: 'linear' }}
                                src={displaySlides[currentSlide].image}
                                className="h-full w-full object-cover object-center"
                                alt={displaySlides[currentSlide].title}
                            />
                        </motion.div>
                    </AnimatePresence>

                    <div className="relative z-20 mx-auto flex h-full w-full max-w-7xl items-center px-8">
                        <div className="w-full text-center md:text-left">
                            <div className="max-w-5xl">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide + 'content'}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.8 }}
                                    >

                                        <SplitText
                                            text={displaySlides[currentSlide].title}
                                            className="mb-10 text-5xl leading-[0.9] font-bold tracking-tighter md:text-9xl"
                                        />

                                        <motion.p
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.6,
                                            }}
                                            className="mx-auto mb-14 max-w-2xl text-lg leading-relaxed font-light md:text-text-muted md:mx-0 md:text-2xl"
                                        >
                                            {displaySlides[currentSlide].subtitle}
                                        </motion.p>

                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.8,
                                            }}
                                            className="flex flex-wrap justify-center gap-6 md:justify-start"
                                        >
                                            <Link href={login()}>
                                                <Button className="rounded-full md:px-12 md:py-6 md:text-xl shadow-[0_20px_60px_rgba(198,161,91,0.2)]">
                                                    Enter Your Home
                                                </Button>
                                            </Link>
                                            <Link href="/how-it-works">
                                                <Button
                                                    variant="outline"
                                                    className="rounded-full border-white/10 md:px-12 md:py-6 md:text-xl hover:border-accent-gold/50"
                                                    icon={Play}
                                                >
                                                    See the Architecture
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Carousel Controls */}
                    <div className="absolute right-8 bottom-12 z-30 flex items-center gap-4 md:right-24">
                        <button
                            onClick={prevSlide}
                            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex gap-2">
                            {displaySlides.map((_: any, i: number) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-accent-gold' : 'w-2 bg-white/20'}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={nextSlide}
                            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className="absolute bottom-12 left-1/2 z-30 hidden -translate-x-1/2 opacity-40 md:block">
                        <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white/20 p-1">
                            <motion.div
                                animate={{ y: [0, 12, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-2 w-1 rounded-full bg-accent-gold"
                            />
                        </div>
                    </div>
                </section>

                {/* 2. THE FOYER (THE STORY) */}
                <Room className="bg-surface">
                    <div className="max-w-4xl px-4 md:px-8 text-center">
                        <div className="group relative mb-12 inline-flex rounded-[3.5rem] border border-accent-gold/10 bg-accent-gold/5 p-10 backdrop-blur-md">
                            <div className="absolute inset-0 scale-110 rounded-[3.5rem] bg-accent-gold/5 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                            <Lock
                                className="relative z-10 text-accent-gold"
                                size={64}
                            />
                        </div>
                        <h2 className="mb-10 text-5xl leading-none font-bold tracking-tighter md:text-8xl">
                            {page?.content?.foyer?.title_line_1 || "Every door"} <br className='hidden md:block' />
                            <span className="text-accent-gold italic">
                                {page?.content?.foyer?.title_line_2 || "has a story."}
                            </span>
                        </h2>
                        <div className="md:mx-auto md:max-w-3xl space-y-8 text-xl leading-relaxed font-light text-text-muted md:text-2xl">
                            <p>
                                {page?.content?.foyer?.paragraph_1 || "Traditional archives are cold. Digital storage is fragmented. Ulo of Stories is built as a home — a place where memories are curated, not just stored."}
                            </p>
                            <p>
                                {page?.content?.foyer?.paragraph_2 || "For the global diaspora, heritage is often the one thing distance can quietly steal. We built the architecture to reclaim it."}
                            </p>
                        </div>
                    </div>
                </Room>

                {/* 3. THE ARCHIVE (HOW IT WORKS) */}
                <Room className="bg-bg-dark py-40">
                    <div className="mx-auto w-full max-w-7xl px-8">
                        <div className="grid grid-cols-1 items-center gap-32 lg:grid-cols-2">
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    className="relative aspect-4/5 overflow-hidden rounded-4xl shadow-2xl"
                                >
                                    <img
                                        src={page?.content?.archive?.image || "/images/about.webp"}
                                        className="h-full w-full object-cover"
                                        alt="Memory"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-12">
                                        <p className="font-serif text-2xl leading-relaxed text-white italic">
                                            {page?.content?.archive?.quote || "\"The house we carry within us is the only one that never crumbles.\""}
                                        </p>
                                    </div>
                                </motion.div>
                                <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-accent-gold/10 blur-[100px]" />
                            </div>

                            <div>
                                <span className="mb-6 block text-xs font-bold tracking-widest text-accent-gold uppercase">
                                    {page?.content?.archive?.badge || "The Architecture"}
                                </span>
                                <h2 className="mb-12 text-5xl font-bold tracking-tight md:text-6xl">
                                    {page?.content?.archive?.title_1 || "Built to last"} <br />
                                    <span className="text-accent-gold italic">
                                        {page?.content?.archive?.title_2 || "generations."}
                                    </span>
                                </h2>

                                <div className="grid gap-12">
                                    {(page?.content?.archive?.features || [
                                        {
                                            title: 'Intentional Capture',
                                            desc: 'Use guided prompts to record the nuance of voice and movement, ensuring stories stay whole.',
                                            icon: 'Play',
                                        },
                                        {
                                            title: 'Spatial Organization',
                                            desc: 'Store legacies in "Rooms" like The Library or The Kitchen, making the archive feel human.',
                                            icon: 'BookOpen',
                                        },
                                        {
                                            title: 'Generational Security',
                                            desc: 'Encrypted, decentralized, and permanent. Your home is safe from time and technology shifts.',
                                            icon: 'Shield',
                                        },
                                    ]).map((item: any, i: number) => {
                                        const IconComponent = item.icon === 'Play' ? Play : (item.icon === 'BookOpen' ? BookOpen : Shield);

                                        return (
                                            <motion.div
                                                key={item.title}
                                                initial={{ opacity: 0, x: 20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="group flex gap-8"
                                            >
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface transition-all group-hover:border-accent-gold/20">
                                                    <IconComponent
                                                        className="text-accent-gold"
                                                        size={28}
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="mb-3 text-2xl font-bold">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-lg leading-relaxed text-text-muted">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </Room>

                {/* 4. THE GREAT HALL (VISION) */}
                <Room className="relative overflow-hidden bg-surface text-center">
                    <div className="absolute inset-0 z-0">
                        <img
                            src={page?.content?.vision?.background || "https://images.unsplash.com/photo-1528605248644-14dd04cb220b?w=1600&q=80"}
                            className="h-full w-full object-cover opacity-10 grayscale"
                            alt="Community"
                        />
                    </div>
                    <div className="relative z-10 mx-auto max-w-6xl px-8">
                        <Users
                            className="mx-auto mb-12 text-accent-gold/60"
                            size={48}
                        />
                        <h2 className="mb-12 text-4xl leading-[1.1] font-bold tracking-tight md:text-7xl">
                            {page?.content?.vision?.quote_1 || "\"Connecting generations across"} <br />
                            <span className="font-serif text-accent-gold italic">
                                {page?.content?.vision?.quote_italic || "places, time, and distance."}
                            </span>
                            {page?.content?.vision?.quote_2 || "\""}
                        </h2>
                        <div className="mx-auto mb-12 h-px w-24 bg-accent-gold/40" />
                        <p className="mx-auto max-w-3xl text-2xl leading-relaxed font-light text-text-muted">
                            {page?.content?.vision?.body || "Legacy is not a file format. It is the feeling of belonging. Ulo of Stories is the bridge between the home you remember and the home you are building."}
                        </p>
                    </div>
                </Room>

                {/* 4.5 FEATURED ROOMS */}
                <Room className="bg-bg-dark">
                    <div className="mx-auto w-full max-w-7xl px-8">
                        <div className="mb-16 text-center">
                            <span className="mb-6 block text-xs font-bold tracking-widest text-accent-gold uppercase">
                                Featured Rooms
                            </span>
                            <h2 className="text-5xl font-bold tracking-tight md:text-6xl">
                                Explore Our <span className="text-accent-gold italic">Heritage</span>
                            </h2>
                            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-muted">
                                Discover curated spaces showcasing the richness of our shared legacy.
                            </p>
                        </div>

                        {featuredRooms && featuredRooms.length > 0 ? (
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {featuredRooms.map((room: any, i: number) => (
                                    <motion.div
                                        key={room.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group overflow-hidden rounded-4xl border border-white/5 bg-surface/40 transition-all duration-500 hover:border-accent-gold/20"
                                    >
                                        <div className="relative aspect-4/3 overflow-hidden">
                                            <img
                                                src={room.thumbnail}
                                                alt={room.name}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-bg-dark/80 via-transparent to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                                <h3 className="text-xl font-bold text-white">{room.name}</h3>
                                                <p className="mt-1 text-sm text-white/60 line-clamp-2">{room.description}</p>
                                            </div>
                                            <div className="absolute top-4 right-4 rounded-full bg-accent-gold/90 px-3 py-1 text-[10px] font-bold text-bg-dark uppercase tracking-wider">
                                                {room.stories_count} Memories
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users size={14} className="text-accent-gold" />
                                                    <span className="text-xs text-text-muted">{room.members?.length || 0} members</span>
                                                </div>
                                                <Link
                                                    href={`/share/rooms/${room.slug}`}
                                                    className="text-xs font-bold tracking-wider text-accent-gold hover:underline"
                                                >
                                                    View Room
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-text-muted">No featured rooms yet. Check back soon.</p>
                            </div>
                        )}
                    </div>
                </Room>

                {/* 5. THE GARDEN (FINAL CTA) */}
                <Room className="bg-bg-dark" id="start">
                    <div className="max-w-4xl px-8 text-center">
                        <div className="mb-12">
                            <Clock
                                className="mx-auto mb-6 text-accent-gold/40"
                                size={32}
                            />
                            <span className="text-xs font-bold tracking-[0.5em] text-accent-gold uppercase">
                                {page?.content?.cta?.badge || "The Best Time was Yesterday"}
                            </span>
                        </div>
                        <h2 className="mb-12 text-5xl leading-tight font-bold md:text-7xl">
                            {page?.content?.cta?.title || "Begin building your digital house today"}
                        </h2>
                        <p className="mx-auto mb-16 max-w-2xl text-xl leading-relaxed font-light text-text-muted">
                            {page?.content?.cta?.subtitle || "Join thousands of families preserving their heritage. Your stories deserve a place where they can live forever."}
                        </p>
                        <div className="flex flex-wrap justify-center gap-8">
                            <Link href={login()}>
                                <Button className="rounded-full px-14 py-6 text-xl">
                                    {page?.content?.cta?.primary_btn || "Enter Your Home"}
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button
                                    variant="outline"
                                    className="rounded-full px-14 py-6 text-xl"
                                >
                                    {page?.content?.cta?.secondary_btn || "Book a Legacy Film"}
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Decorative architectural background element */}
                    <div className="pointer-events-none absolute bottom-0 left-0 h-[50vh] w-full bg-linear-to-t from-accent-gold/5 to-transparent" />
                </Room>

                {/* 6. WAITING LIST & SOCIAL CONNECTION */}
                <Room className="bg-surface py-24">
                    <div className="mx-auto max-w-4xl px-8">
                        <div className="mb-16 text-center">
                            <span className="mb-6 block text-xs font-bold tracking-widest text-accent-gold uppercase">
                                Join the Journey
                            </span>
                            <h2 className="mb-6 text-5xl leading-tight font-bold tracking-tight md:text-7xl">
                                Be the first to know
                            </h2>
                            <p className="mx-auto max-w-2xl text-xl leading-relaxed font-light text-text-muted">
                                Ulo of Stories is opening its doors soon. Leave your details and we'll invite you in when it's time.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                            {/* Waiting List Form */}
                            <div className="rounded-4xl border border-border-subtle bg-bg-dark p-10">
                                <h3 className="mb-6 text-3xl font-bold">Join the Waiting List</h3>
                                <p className="mb-8 text-text-muted">
                                    Early access is coming soon. Add your name below and we'll reach out the moment Ulo of Stories is ready for you.
                                </p>

                                {success && (
                                    <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center">
                                        <p className="text-lg font-medium text-green-400">You're on the list! Check your email for confirmation.</p>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="mb-2 block text-sm font-bold uppercase tracking-wider">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={data.name}
                                            onChange={e => handleFormChange('name', e.target.value)}
                                            className="w-full rounded-xl border border-border-subtle bg-bg-dark px-5 py-4 text-lg focus:border-accent-gold focus:outline-none"
                                            placeholder="Your name"
                                        />
                                        {errors.name && <p className='text-red-600 text-sm'>{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-bold uppercase tracking-wider">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={data.email}
                                            onChange={e => handleFormChange('email', e.target.value)}
                                            className="w-full rounded-xl border border-border-subtle bg-bg-dark px-5 py-4 text-lg focus:border-accent-gold focus:outline-none"
                                            placeholder="you@example.com"
                                        />
                                        {errors.email && <p className='text-red-600 text-sm'>{errors.email}</p>}
                                    </div>
                                    <Button onClick={submitForm} type="submit" className="w-full rounded-full py-5 text-lg">
                                        {processing ? 'Joining the List' : 'Join Waiting List'}
                                        {processing  && <Loader className='animate-spin' />}
                                    </Button>
                                </div>
                            </div>

                            {/* Social Media & Community */}
                            <div className="flex flex-col justify-center rounded-4xl border border-border-subtle bg-bg-dark p-10">
                                <h3 className="mb-6 text-3xl font-bold">Stay Connected</h3>
                                <p className="mb-8 text-text-muted">
                                    Follow us for behind-the-scenes updates, launch announcements, and stories from our community.
                                </p>
                                <div className="space-y-4">
                                    <a
                                        href="https://linkedin.com/company/ulo of stories"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-dark px-6 py-4 transition-colors hover:border-accent-gold/50"
                                    >
                                        <Linkedin className="text-accent-gold" size={24} />
                                        <span className="text-lg font-medium">Follow on LinkedIn</span>
                                    </a>
                                    <a
                                        href="https://instagram.com/ulo of stories"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-dark px-6 py-4 transition-colors hover:border-accent-gold/50"
                                    >
                                        <SiInstagram className="text-accent-gold" size={24} />
                                        <span className="text-lg font-medium">Follow on Instagram</span>
                                    </a>
                                    <a
                                        href="https://www.facebook.com/profile.php?id=61582751621270"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-dark px-6 py-4 transition-colors hover:border-accent-gold/50"
                                    >
                                        <SiFacebook className="text-accent-gold" size={24} />
                                        <span className="text-lg font-medium">Follow on Facebook</span>
                                    </a>
                                    <a
                                        href="http://www.youtube.com/@ULO OF STORIES"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-dark px-6 py-4 transition-colors hover:border-accent-gold/50"
                                    >
                                        <SiYoutube className="text-accent-gold" size={24} />
                                        <span className="text-lg font-medium">Follow on Youtube</span>
                                    </a>
                                    <a
                                        href="https://x.com/ulo of storiesHQ"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-dark px-6 py-4 transition-colors hover:border-accent-gold/50"
                                    >
                                        <SiX className="text-accent-gold" size={24} />
                                        <span className="text-lg font-medium">Follow on X</span>
                                    </a>
                                    <a
                                        href="https://facebook.com/ulo of stories"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-dark px-6 py-4 transition-colors hover:border-accent-gold/50"
                                    >
                                        <SiTiktok className="text-accent-gold" size={24} />
                                        <span className="text-lg font-medium">Follow on Ticktok</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </Room>
            </div>
        </>
    );
}
