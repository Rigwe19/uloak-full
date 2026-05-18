import { motion } from 'motion/react';
import {
    Shield,
    Heart,
    Globe,
    Users,
    BookOpen,
    Film,
    Database,
    Microscope,
    Zap,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
} from 'lucide-react';
import { Button } from '../components/UI';
import { Link } from 'react-router-dom';

export default function About() {
    const values = [
        {
            title: 'Legacy & Memory',
            desc: 'Stories outlive their tellers. We preserve what matters most.',
            icon: Shield,
        },
        {
            title: 'Intergenerational Connection',
            desc: 'Grandparents, parents, children — one unbroken thread of human experience.',
            icon: Users,
        },
        {
            title: 'Authentic Storytelling',
            desc: 'Every voice deserves to be heard truthfully and with dignity.',
            icon: BookOpen,
        },
        {
            title: 'Community & Belonging',
            desc: 'Stories are never told alone. They bind us to one another.',
            icon: Heart,
        },
        {
            title: 'Cultural Dignity',
            desc: 'We honour heritage, language, and identity in every story we help tell.',
            icon: Globe,
        },
    ];

    const expressions = [
        {
            title: 'Studio',
            desc: 'The commercial arm. We produce films, photography, oral history archives, and brand storytelling.',
            icon: Film,
        },
        {
            title: 'Platform',
            desc: 'The technology product. A digital archive platform that allows families to preserve stories at scale.',
            icon: Zap,
        },
        {
            title: 'Archive',
            desc: 'The institutional expression. A curated collection of preserved life stories for research.',
            icon: Database,
        },
        {
            title: 'Research',
            desc: 'The academic expression. Partnerships with UK universities to study the impact of storytelling.',
            icon: Microscope,
        },
        {
            title: 'Impact Events',
            desc: 'The community expression. Workshops, screenings, and public programmes.',
            icon: Users,
        },
    ];

    return (
        <div className="bg-bg-dark pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 md:py-32">
                <div className="relative z-10 mx-auto max-w-7xl px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        <h1 className="mb-8 text-5xl font-bold tracking-tighter text-text-primary md:text-7xl">
                            A house built for <br />
                            <span className="text-accent-gold italic">
                                stories that matter.
                            </span>
                        </h1>
                        <div className="mb-12 flex items-center gap-4 text-xs font-bold tracking-[0.3em] text-accent-gold uppercase">
                            <div className="h-px w-12 bg-accent-gold/30" />
                            <span>Who We Are</span>
                        </div>
                        <p className="mb-6 text-xl leading-relaxed font-light text-text-muted md:text-2xl">
                            Uloak is a storytelling movement based in the UK. We
                            exist to preserve the stories that make us human —
                            through film, technology, community, and research.
                        </p>
                    </motion.div>
                </div>

                {/* Architectural Design Elements */}
                <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 border-l border-border-subtle" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
            </section>

            {/* The Origin Story */}
            <section className="border-y border-border-subtle bg-surface/30 py-24">
                <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-16 px-8 lg:grid-cols-2">
                    <div className="space-y-8 leading-relaxed text-text-muted">
                        <p>
                            Uloak began from a simple, persistent question:{' '}
                            <span className="font-medium text-text-primary">
                                what happens to the stories we fail to tell?
                            </span>{' '}
                            Every family has an elder whose wisdom will one day
                            be irretrievable. Every community has a history that
                            mainstream archives overlook. Every culture carries
                            stories that need more than a photograph and a
                            caption to survive.
                        </p>
                        <p>
                            Uloak was built to answer that question — not as a
                            product, but as a movement. We believe that
                            storytelling is not a luxury. It is the
                            infrastructure of identity, and it belongs to
                            everyone.
                        </p>
                        <p>
                            Today, Uloak operates as a creative studio and
                            technology company based in the UK. We produce
                            documentary films, oral history archives, and
                            heritage photography.
                        </p>
                    </div>
                    <div className="relative rounded-3xl border border-accent-gold/20 bg-accent-gold/5 p-12">
                        <div className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent-gold/20 bg-bg-dark">
                            <BookOpen className="text-accent-gold" size={24} />
                        </div>
                        <p className="mb-6 text-xl leading-tight text-text-primary italic md:text-2xl">
                            "The stories we fail to capture today become the
                            silences our grandchildren inherit tomorrow."
                        </p>
                        <div className="h-1 w-12 rounded-full bg-accent-gold/30" />
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-32">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 md:grid-cols-2">
                    <div className="space-y-6 rounded-3xl border border-border-subtle bg-surface/50 p-8 transition-colors hover:border-accent-gold/30">
                        <h3 className="text-xs font-bold tracking-[0.2em] text-accent-gold uppercase">
                            Our Mission
                        </h3>
                        <p className="text-2xl leading-snug font-bold text-text-primary">
                            To preserve the stories that make us human — through
                            film, archive, and technology — so that no voice is
                            ever lost to time.
                        </p>
                    </div>
                    <div className="space-y-6 rounded-3xl border border-border-subtle bg-surface/50 p-8 transition-colors hover:border-accent-gold/30">
                        <h3 className="text-xs font-bold tracking-[0.2em] text-accent-gold uppercase">
                            Our Vision
                        </h3>
                        <p className="text-2xl leading-snug font-bold text-text-primary">
                            To become the world's most trusted home for
                            intergenerational stories — a living archive of
                            human experience.
                        </p>
                    </div>
                </div>
            </section>

            {/* Founder Section */}
            <section className="bg-surface/20 py-24">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-8 lg:flex-row">
                    <div className="relative w-full lg:w-1/2">
                        <div className="aspect-[4/5] overflow-hidden rounded-3xl grayscale transition-all duration-700 hover:grayscale-0">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                                alt="Nnanna Adim"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="absolute -right-6 -bottom-6 max-w-xs rounded-2xl bg-accent-gold p-8 text-bg-dark shadow-2xl">
                            <p className="mb-1 text-lg leading-tight font-bold">
                                Nnanna Adim
                            </p>
                            <p className="text-xs font-bold tracking-widest uppercase opacity-80">
                                Founder & Creative Director
                            </p>
                        </div>
                    </div>

                    <div className="w-full space-y-8 lg:w-1/2">
                        <h2 className="text-3xl font-bold tracking-tight text-text-primary md:text-5xl">
                            Archiving the{' '}
                            <span className="text-accent-gold">Unseen.</span>
                        </h2>
                        <div className="space-y-6 leading-relaxed text-text-muted">
                            <p>
                                Nnanna Adim is a documentary filmmaker,
                                storyteller, and social entrepreneur based in
                                the UK. He has spent his career at the
                                intersection of creativity and community —
                                believing that the most important stories are
                                often the ones we assume no one wants to hear.
                            </p>
                            <p>
                                Uloak was born from his own experience of
                                intergenerational disconnection and the grief of
                                stories lost — the grandmother whose life was
                                never documented, the family history that
                                existed only in fading memories.
                            </p>
                            <blockquote className="border-l-4 border-accent-gold py-4 pl-8 text-lg font-medium text-text-primary italic">
                                "I built Uloak because I believe every person
                                contains a world. Our job is to help that world
                                survive."
                            </blockquote>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-32">
                <div className="mx-auto max-w-7xl px-8">
                    <h2 className="mb-16 text-center text-3xl font-bold tracking-[0.2em] text-text-primary uppercase">
                        Our Values
                    </h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {values.map((value, i) => (
                            <div
                                key={i}
                                className="group rounded-3xl border border-border-subtle bg-surface p-10 transition-all hover:border-accent-gold/40"
                            >
                                <div className="mb-6 inline-flex rounded-xl border border-accent-gold/10 bg-accent-gold/5 p-3 transition-transform group-hover:scale-110">
                                    <value.icon
                                        className="text-accent-gold"
                                        size={24}
                                    />
                                </div>
                                <h4 className="mb-3 text-xl font-bold text-text-primary">
                                    {value.title}
                                </h4>
                                <p className="text-sm leading-relaxed text-text-muted">
                                    {value.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Expressions */}
            <section className="relative overflow-hidden border-t border-border-subtle bg-bg-dark py-32">
                <div className="relative z-10 mx-auto max-w-7xl px-8">
                    <div className="mb-20 max-w-2xl">
                        <h2 className="mb-6 text-3xl font-bold tracking-tight text-text-primary md:text-5xl">
                            One brand. <br />
                            <span className="text-accent-gold">
                                Many expressions.
                            </span>
                        </h2>
                        <p className="text-lg text-text-muted">
                            Uloak is a single brand with multiple operating
                            expressions. There are no sub-brands — only
                            different ways the mission comes to life.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {expressions.map((exp, i) => (
                            <div
                                key={i}
                                className="flex flex-col gap-6 rounded-2xl border border-border-subtle bg-surface/30 p-6 transition-all hover:bg-surface/50"
                            >
                                <exp.icon
                                    className="text-accent-gold"
                                    size={20}
                                />
                                <div>
                                    <h4 className="mb-2 text-sm font-bold tracking-widest text-text-primary uppercase">
                                        {exp.title}
                                    </h4>
                                    <p className="text-[11px] leading-relaxed text-text-muted">
                                        {exp.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pointer-events-none absolute top-1/2 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent" />
            </section>

            {/* Company Info & CTA */}
            <section className="bg-surface py-32">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-24 px-8 lg:grid-cols-2">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h3 className="text-4xl font-bold tracking-tight text-text-primary">
                                Join the movement.
                            </h3>
                            <p className="max-w-md text-lg leading-relaxed text-text-muted">
                                Whether you want to commission a film, partner
                                on a research programme, or invest in the future
                                of storytelling — we want to hear from you.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Button className="rounded-full px-8 py-4">
                                Work with us
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-full px-8 py-4"
                            >
                                Fund the mission
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-8 border-t border-border-subtle pt-12 sm:grid-cols-2">
                            <div className="flex items-center gap-4">
                                <Mail
                                    size={18}
                                    className="shrink-0 text-accent-gold"
                                />
                                <div className="text-sm">
                                    <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Email
                                    </p>
                                    <p className="text-text-primary">
                                        hello@uloak.co.uk
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone
                                    size={18}
                                    className="shrink-0 text-accent-gold"
                                />
                                <div className="text-sm">
                                    <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Phone
                                    </p>
                                    <p className="text-text-primary">
                                        +44 7830 129816
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="group relative space-y-12 overflow-hidden rounded-[40px] border border-border-subtle bg-bg-dark p-12">
                        <div className="absolute top-0 right-0 p-8">
                            <img
                                src="/logo.png"
                                alt="ULOAK"
                                className="h-8 opacity-20 grayscale invert"
                            />
                        </div>

                        <div>
                            <h4 className="mb-8 text-xs font-bold tracking-[0.3em] text-accent-gold uppercase italic">
                                Company Information
                            </h4>
                            <div className="space-y-6 text-sm">
                                {[
                                    { label: 'Name', value: 'Uloak Limited' },
                                    { label: 'Number', value: '16756288' },
                                    {
                                        label: 'Registered',
                                        value: 'United Kingdom',
                                    },
                                    {
                                        label: 'Website',
                                        value: 'www.uloak.co.uk',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex justify-between border-b border-border-subtle pb-2"
                                    >
                                        <span className="text-text-muted">
                                            {item.label}
                                        </span>
                                        <span className="font-medium text-text-primary">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                                <p className="pt-4 text-[10px] leading-relaxed text-text-muted italic">
                                    Registered in England and Wales. Uloak is a
                                    trademark of Uloak Limited.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center rounded-2xl border border-border-subtle bg-surface/50 p-6 lg:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold text-bg-dark">
                                    <MapPin size={20} />
                                </div>
                                <span className="text-xs font-bold tracking-widest text-text-primary uppercase">
                                    Find us in the UK
                                </span>
                            </div>
                            <ArrowRight className="text-text-muted transition-colors group-hover:text-accent-gold" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
