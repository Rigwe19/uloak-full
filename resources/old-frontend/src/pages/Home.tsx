import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import {
    Play,
    BookOpen,
    Shield,
    Lock,
    Users,
    Clock,
    ArrowRight,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';
import { Button } from '../components/UI';
import { Link } from 'react-router-dom';
import { ShareQRCode } from '../components/ShareQRCode';

const slides = [
    {
        id: 'porch',
        title: 'Every Family Is a Home.',
        subtitle:
            'Uloak is the digital architecture for your heritage. Built for the diaspora to preserve what distance usually takes.',
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
            'For those navigating between worlds, Uloak provides a grounded space where your identity remains central.',
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
                    <motion.span
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
                    </motion.span>
                </span>
            ))}
        </div>
    );
};

const Room = ({
    children,
    className = '',
    id = '',
    title = '',
}: {
    children: React.ReactNode;
    className?: string;
    id?: string;
    title?: string;
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
            <div className="absolute top-10 right-10 z-30">
                <ShareQRCode roomId={id} roomName={title || id} />
            </div>
            {children}
        </motion.div>
    </section>
);

export default function Home() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () =>
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () =>
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
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
                        <div className="absolute inset-0 z-10 bg-gradient-to-b from-bg-dark/70 via-bg-dark/30 to-bg-dark" />
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 10, ease: 'linear' }}
                            src={slides[currentSlide].image}
                            className="h-full w-full object-cover opacity-50"
                            alt={slides[currentSlide].title}
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
                                    <div className="mb-8 flex items-center gap-4">
                                        <motion.span
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="inline-block rounded-full border border-accent-gold/10 bg-accent-gold/5 px-4 py-2 text-xs font-bold tracking-[0.5em] text-accent-gold uppercase backdrop-blur-sm"
                                        >
                                            {slides[currentSlide].badge}
                                        </motion.span>
                                        <ShareQRCode
                                            roomId={slides[currentSlide].id}
                                            roomName={
                                                slides[currentSlide].badge
                                            }
                                        />
                                    </div>

                                    <SplitText
                                        text={slides[currentSlide].title}
                                        className="mb-10 text-6xl leading-[0.9] font-bold tracking-tighter md:text-9xl"
                                    />

                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 1, delay: 0.6 }}
                                        className="mx-auto mb-14 max-w-2xl text-xl leading-relaxed font-light text-text-muted md:mx-0 md:text-2xl"
                                    >
                                        {slides[currentSlide].subtitle}
                                    </motion.p>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 1, delay: 0.8 }}
                                        className="flex flex-wrap justify-center gap-6 md:justify-start"
                                    >
                                        <Link to="/login">
                                            <Button className="rounded-full px-12 py-6 text-xl shadow-[0_20px_60px_rgba(198,161,91,0.2)]">
                                                Enter Your Home
                                            </Button>
                                        </Link>
                                        <Link to="/how-it-works">
                                            <Button
                                                variant="outline"
                                                className="rounded-full border-white/10 px-12 py-6 text-xl hover:border-accent-gold/50"
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
                        {slides.map((_, i) => (
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
                <div className="max-w-4xl px-8 text-center">
                    <div className="group relative mb-12 inline-flex rounded-[3.5rem] border border-accent-gold/10 bg-accent-gold/5 p-10 backdrop-blur-md">
                        <div className="absolute inset-0 scale-110 rounded-[3.5rem] bg-accent-gold/5 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                        <Lock
                            className="relative z-10 text-accent-gold"
                            size={64}
                        />
                    </div>
                    <h2 className="mb-10 text-6xl leading-none font-bold tracking-tighter md:text-8xl">
                        Every door <br />
                        <span className="text-accent-gold italic">
                            has a story.
                        </span>
                    </h2>
                    <div className="mx-auto max-w-3xl space-y-8 text-xl leading-relaxed font-light text-text-muted md:text-2xl">
                        <p>
                            Traditional archives are cold. Digital storage is
                            fragmented. Uloak is built as a home — a place where
                            memories are curated, not just stored.
                        </p>
                        <p>
                            For the global diaspora, heritage is often the one
                            thing distance can quietly steal. We built the
                            architecture to reclaim it.
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
                                className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl"
                            >
                                <img
                                    src="/images/about.webp"
                                    className="h-full w-full object-cover"
                                    alt="Memory"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-12">
                                    <p className="font-serif text-2xl leading-relaxed text-white italic">
                                        "The house we carry within us is the
                                        only one that never crumbles."
                                    </p>
                                </div>
                            </motion.div>
                            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-accent-gold/10 blur-[100px]" />
                        </div>

                        <div>
                            <span className="mb-6 block text-xs font-bold tracking-widest text-accent-gold uppercase">
                                The Architecture
                            </span>
                            <h2 className="mb-12 text-5xl font-bold tracking-tight md:text-6xl">
                                Built to last <br />
                                <span className="text-accent-gold italic">
                                    generations.
                                </span>
                            </h2>

                            <div className="grid gap-12">
                                {[
                                    {
                                        title: 'Intentional Capture',
                                        desc: 'Use guided prompts to record the nuance of voice and movement, ensuring stories stay whole.',
                                        icon: Play,
                                    },
                                    {
                                        title: 'Spatial Organization',
                                        desc: 'Store legacies in "Rooms" like The Library or The Kitchen, making the archive feel human.',
                                        icon: BookOpen,
                                    },
                                    {
                                        title: 'Generational Security',
                                        desc: 'Encrypted, decentralized, and permanent. Your home is safe from time and technology shifts.',
                                        icon: Shield,
                                    },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group flex gap-8"
                                    >
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface transition-all group-hover:border-accent-gold/20">
                                            <item.icon
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
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Room>

            {/* 4. THE GREAT HALL (VISION) */}
            <Room className="relative overflow-hidden bg-surface text-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1528605248644-14dd04cb220b?w=1600&q=80"
                        className="h-full w-full object-cover opacity-10 grayscale"
                        alt="Community"
                    />
                </div>
                <div className="relative z-10 max-w-6xl px-8">
                    <Users
                        className="mx-auto mb-12 text-accent-gold/60"
                        size={48}
                    />
                    <h2 className="mb-12 text-4xl leading-[1.1] font-bold tracking-tight md:text-7xl">
                        "Connecting generations across <br />
                        <span className="font-serif text-accent-gold italic">
                            places, time, and distance.
                        </span>
                        "
                    </h2>
                    <div className="mx-auto mb-12 h-px w-24 bg-accent-gold/40" />
                    <p className="mx-auto max-w-3xl text-2xl leading-relaxed font-light text-text-muted">
                        Legacy is not a file format. It is the feeling of
                        belonging. Uloak is the bridge between the home you
                        remember and the home you are building.
                    </p>
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
                            The Best Time was Yesterday
                        </span>
                    </div>
                    <h2 className="mb-12 text-5xl leading-tight font-bold md:text-7xl">
                        Begin building your <br />
                        digital house today
                    </h2>
                    <p className="mx-auto mb-16 max-w-2xl text-xl leading-relaxed font-light text-text-muted">
                        Join thousands of families preserving their heritage.
                        Your stories deserve a place where they can live
                        forever.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8">
                        <Link to="/login">
                            <Button className="rounded-full px-14 py-6 text-xl">
                                Enter Your Home
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button
                                variant="outline"
                                className="rounded-full px-14 py-6 text-xl"
                            >
                                Book a Legacy Film
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Decorative architectural background element */}
                <div className="pointer-events-none absolute bottom-0 left-0 h-[50vh] w-full bg-gradient-to-t from-accent-gold/5 to-transparent" />
            </Room>

            {/* FOOTER MINI */}
            <footer className="border-t border-border-subtle bg-bg-dark px-8 py-20 text-center">
                <div className="mb-8 flex items-center justify-center gap-3">
                    <img src="/logo.png" alt="uloak" className="h-12 w-auto" />
                </div>
                <p className="mb-8 text-sm font-light tracking-widest text-text-muted uppercase">
                    Built for Generations
                </p>
                <div className="flex justify-center gap-12 text-sm text-text-muted/60">
                    <Link to="/terms" className="hover:text-accent-gold">
                        Terms
                    </Link>
                    <Link to="/privacy" className="hover:text-accent-gold">
                        Privacy
                    </Link>
                    <Link to="/contact" className="hover:text-accent-gold">
                        Contact
                    </Link>
                </div>
            </footer>
        </div>
    );
}
