import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Database,
    Film,
    Globe,
    Heart,
    Mail,
    MapPin,
    Microscope,
    Phone,
    Shield,
    Users,
    Zap,
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

export default function About({ page }: Props) {
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
        Lock
    };

    const content = page?.content || {};

    const hero = content?.hero || {
        title: 'A house built for stories that matter.',
        subtitle: 'Uloak is a storytelling movement based in the UK. We exist to preserve the stories that make us human — through film, technology, community, and research.'
    };

    const origin = content?.origin || {
        quote: '"The stories we fail to capture today become the silences our grandchildren inherit tomorrow."',
        paragraphs: [
            'Uloak began from a simple, persistent question: what happens to the stories we fail to tell? Every family has an elder whose wisdom will one day be irretrievable. Every community has a history that mainstream archives overlook. Every culture carries stories that need more than a photograph and a caption to survive.',
            'Uloak was built to answer that question — not as a product, but as a movement. We believe that storytelling is not a luxury. It is the infrastructure of identity, and it belongs to everyone.',
            'Today, Uloak operates as a creative studio and technology company based in the UK. We produce documentary films, oral history archives, and heritage photography.'
        ]
    };

    const missionVision = content.mission_vision || {
        mission: 'To preserve the stories that make us human — through film, archive, and technology — so that no voice is ever lost to time.',
        vision: "To become the world's most trusted home for intergenerational stories — a living archive of human experience."
    };

    const founder = content.founder || {
        name: 'Nnanna Adim',
        role: 'Founder & Creative Director',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        title: 'Archiving the Unseen.',
        quote: '"I built Uloak because I believe every person contains a world. Our job is to help that world survive."',
        paragraphs: [
            'Nnanna Adim is a documentary filmmaker, storyteller, and social entrepreneur based in the UK. He has spent his career at the intersection of creativity and community — believing that the most important stories are often the ones we assume no one wants to hear.',
            'Uloak was born from his own experience of intergenerational disconnection and the grief of stories lost — the grandmother whose life was never documented, the family history that existed only in fading memories.'
        ]
    };

    const values = content.values || [
        { title: 'Legacy & Memory', desc: 'Stories outlive their tellers. We preserve what matters most.', icon: 'Shield' },
        { title: 'Intergenerational Connection', desc: 'Grandparents, parents, children — one unbroken thread of human experience.', icon: 'Users' },
        { title: 'Authentic Storytelling', desc: 'Every voice deserves to be heard truthfully and with dignity.', icon: 'BookOpen' },
        { title: 'Community & Belonging', desc: 'Stories are never told alone. They bind us to one another.', icon: 'Heart' },
        { title: 'Cultural Dignity', desc: 'We honour heritage, language, and identity in every story we help tell.', icon: 'Globe' }
    ];

    const expressions = content.expressions || [
        { title: 'Studio', desc: 'The commercial arm. We produce films, photography, oral history archives, and brand storytelling.', icon: 'Film' },
        { title: 'Platform', desc: 'The technology product. A digital archive platform that allows families to preserve stories at scale.', icon: 'Zap' },
        { title: 'Archive', desc: 'The institutional expression. A curated collection of preserved life stories for research.', icon: 'Database' },
        { title: 'Research', desc: 'The academic expression. Partnerships with UK universities to study the impact of storytelling.', icon: 'Microscope' },
        { title: 'Impact Events', desc: 'The community expression. Workshops, screenings, and public programmes.', icon: 'Users' }
    ];

    return (
        <>
            {/* <Head>
                <title>{page?.title || 'About Us'} | Uloak</title>
                <meta name="description" content={page?.meta_description || 'Learn about Uloak, our mission to preserve human stories, and the people behind the movement.'} />
            </Head> */}

            <div className="bg-bg-dark text-text-primary selection:bg-accent-gold/30">
                {/* Hero Section */}
                <section className="relative min-h-[90vh] overflow-hidden px-6 pt-32 pb-20 md:px-12 lg:px-24">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-bg-dark/95 to-bg-dark/90" />
                        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-gold/5 blur-[120px]" />
                        <div className="absolute bottom-48 -left-24 h-[500px] w-[500px] rounded-full bg-accent-gold/5 blur-[150px]" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-4xl"
                        >
                            <span className="mb-6 inline-block text-[10px] font-bold text-accent-gold uppercase tracking-[0.4em]">
                                Our Story
                            </span>
                            <h1 className="text-5xl leading-[1.1] font-bold tracking-tight text-text-primary md:text-7xl lg:text-8xl">
                                {hero.title}
                            </h1>
                            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl">
                                {hero.subtitle}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Origin Story */}
                <section className="bg-bg-dark px-6 py-24 md:px-12 lg:px-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-3xl font-bold italic leading-tight text-text-primary md:text-4xl lg:text-5xl">
                                    {origin.quote}
                                </h2>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="space-y-8"
                            >
                                {origin.paragraphs.map((p: string, i: number) => (
                                    <p key={i} className="text-lg leading-relaxed text-text-muted">
                                        {p}
                                    </p>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="bg-surface/30 px-6 py-32 md:px-12 lg:px-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="rounded-[40px] border border-white/5 bg-bg-dark/50 p-12 lg:p-16"
                            >
                                <span className="mb-6 block text-[10px] font-bold text-accent-gold uppercase tracking-widest">Our Mission</span>
                                <p className="text-2xl leading-relaxed font-medium text-text-primary md:text-3xl">
                                    {missionVision.mission}
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="rounded-[40px] border border-white/5 bg-bg-dark/50 p-12 lg:p-16"
                            >
                                <span className="mb-6 block text-[10px] font-bold text-accent-gold uppercase tracking-widest">Our Vision</span>
                                <p className="text-2xl leading-relaxed font-medium text-text-primary md:text-3xl">
                                    {missionVision.vision}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Values Grid */}
                <section className="px-6 py-32 md:px-12 lg:px-24">
                    <div className="mx-auto max-w-7xl text-center">
                        <h2 className="mb-20 text-4xl font-bold tracking-tight text-text-primary md:text-5xl">The values that guide us.</h2>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {values.map((value: any, i: number) => {
                                const IconComponent = iconMap[value.icon as keyof typeof iconMap] || Shield;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group rounded-3xl border border-white/5 bg-surface/20 p-10 text-left transition-all hover:border-accent-gold/20 hover:bg-surface/40"
                                    >
                                        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-gold/10 text-accent-gold transition-transform group-hover:scale-110">
                                            <IconComponent size={24} />
                                        </div>
                                        <h3 className="mb-4 text-xl font-bold text-text-primary">{value.title}</h3>
                                        <p className="text-text-muted">{value.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Founder Section */}
                <section className="bg-surface/10 px-6 py-32 md:px-12 lg:px-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 gap-20 items-center lg:grid-cols-2">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative aspect-[4/5] overflow-hidden rounded-[40px]"
                            >
                                <img
                                    src={founder.image}
                                    alt={founder.name}
                                    className="h-full w-full object-cover grayscale transition-all hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-10">
                                    <p className="text-2xl font-bold text-text-primary">{founder.name}</p>
                                    <p className="text-accent-gold font-medium">{founder.role}</p>
                                </div>
                            </motion.div>
                            <div className="space-y-12">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="mb-8 text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
                                        {founder.title}
                                    </h2>
                                    <p className="text-2xl italic leading-relaxed text-text-muted">
                                        {founder.quote}
                                    </p>
                                </motion.div>
                                <div className="space-y-6">
                                    {founder.paragraphs.map((p: string, i: number) => (
                                        <p key={i} className="text-lg leading-relaxed text-text-muted">
                                            {p}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Company Expressions */}
                <section className="px-6 py-32 md:px-12 lg:px-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-20 text-center">
                            <h2 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">The Expressions of Uloak.</h2>
                            <p className="mt-6 text-xl text-text-muted">One mission, many forms.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {expressions.map((expression: any, i: number) => {
                                const IconComponent = iconMap[expression.icon as keyof typeof iconMap] || Shield;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="rounded-4xl border border-white/5 bg-surface/20 p-12 transition-all hover:border-white/10 hover:bg-surface/30"
                                    >
                                        <IconComponent className="mb-8 text-accent-gold" size={32} />
                                        <h3 className="mb-4 text-2xl font-bold text-text-primary">{expression.title}</h3>
                                        <p className="text-lg leading-relaxed text-text-muted">{expression.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 py-32 md:px-12 lg:px-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mx-auto max-w-5xl rounded-[60px] bg-accent-gold p-16 text-center text-black md:p-24"
                    >
                        <h2 className="text-4xl font-bold tracking-tight md:text-6xl">Ready to begin your story?</h2>
                        <p className="mx-auto mt-8 max-w-xl text-xl font-medium opacity-80">
                            Whether for your family, your community, or your heritage — we are here to help you preserve what matters.
                        </p>
                        <div className="mt-12 flex flex-wrap justify-center gap-6">
                            <Button className="h-16 rounded-full bg-black px-12 text-lg font-bold text-white transition-transform hover:scale-105">
                                Start Your Legacy
                            </Button>
                            <Button variant="outline" className="h-16 rounded-full border-black/20 bg-transparent px-12 text-lg font-bold text-black hover:bg-black/5">
                                Browse Projects
                            </Button>
                        </div>
                    </motion.div>
                </section>
            </div>
        </>
    );
}
