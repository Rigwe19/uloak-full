import { motion } from 'motion/react';
import {
    Heart,
    Globe,
    Microscope,
    Users,
    ArrowRight,
    Mail,
    Landmark,
    Activity,
} from 'lucide-react';
import { Button } from '../components/UI';

export default function CommunityProjects() {
    const impactAreas = [
        {
            title: 'Dementia & Reminiscence Care',
            desc: 'Life story work is clinically proven to improve wellbeing for people living with dementia. We partner with care homes and NHS trusts to deliver reminiscence sessions and create personalised story resources.',
            icon: Activity,
        },
        {
            title: 'Social Isolation',
            desc: 'Storytelling builds connection. Our community projects bring people together — across generations, cultures, and backgrounds — to share and listen.',
            icon: Heart,
        },
        {
            title: 'Academic Research',
            desc: 'We collaborate with universities to study the measurable impact of narrative-based interventions on mental health, identity, and community cohesion.',
            icon: Microscope,
        },
        {
            title: 'Cultural Heritage',
            desc: 'We work with heritage organisations and local councils to document and preserve the oral histories, traditions, and lived experiences of communities at risk of being lost.',
            icon: Landmark,
        },
    ];

    const stats = [
        { value: '35+', label: 'Stories Preserved' },
        { value: '4', label: 'Impact Areas' },
        { value: '3', label: 'Sector Partnerships' },
        { value: '1', label: 'Mission' },
    ];

    return (
        <div className="bg-bg-dark pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-border-subtle py-24 md:py-32">
                <div className="relative z-10 mx-auto max-w-7xl px-8">
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
                                    Uloak Impact
                                </span>
                            </div>
                            <h1 className="mb-8 text-5xl leading-[0.9] font-bold tracking-tighter text-text-primary md:text-7xl">
                                Storytelling as a <br />
                                <span className="text-accent-gold italic">
                                    force for social good.
                                </span>
                            </h1>
                            <p className="mb-10 max-w-xl text-xl leading-relaxed font-light text-text-muted md:text-2xl">
                                We partner with universities, NHS trusts,
                                charities, and community organisations to make
                                storytelling a measurable force for wellbeing,
                                inclusion, and cultural preservation.
                            </p>
                            <Button className="rounded-full px-10 py-5">
                                Partner With Us
                            </Button>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4 lg:w-1/2">
                            {stats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center justify-center rounded-[2rem] border border-border-subtle bg-surface/50 p-8 text-center"
                                >
                                    <span className="mb-2 text-4xl font-bold text-accent-gold md:text-5xl">
                                        {stat.value}
                                    </span>
                                    <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Decorative Grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
            </section>

            {/* Impact Areas */}
            <section className="px-8 py-32">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-24 max-w-xl">
                        <h2 className="mb-8 text-xs font-bold tracking-[0.4em] text-accent-gold uppercase italic">
                            Our Impact Areas
                        </h2>
                        <p className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
                            Measuring the power of resonance and belonging.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-24">
                        {impactAreas.map((area, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <div className="mb-8 inline-flex rounded-2xl border border-border-subtle bg-surface p-4 transition-all duration-500 group-hover:border-accent-gold">
                                    <area.icon
                                        className="text-accent-gold"
                                        size={32}
                                    />
                                </div>
                                <h3 className="mb-6 text-2xl font-bold text-text-primary transition-colors group-hover:text-accent-gold">
                                    {area.title}
                                </h3>
                                <p className="leading-relaxed font-light text-text-muted">
                                    {area.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners / Institutional Section */}
            <section className="bg-surface/20 py-32">
                <div className="mx-auto mb-16 max-w-7xl px-8 text-center text-text-muted italic">
                    <p className="mb-12 text-sm tracking-widest uppercase">
                        Partnerships In Focus
                    </p>
                    <div className="group flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale md:gap-24">
                        {/* Placeholders for partner logos */}
                        <div className="text-2xl font-bold tracking-tighter">
                            NHS
                        </div>
                        <div className="text-2xl font-bold tracking-tighter">
                            UNIVERSITY PARTNERS
                        </div>
                        <div className="text-2xl font-bold tracking-tighter">
                            COUNCIL HERITAGE
                        </div>
                        <div className="text-2xl font-bold tracking-tighter">
                            COMMUNITY TRUSTS
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="border-t border-border-subtle py-32">
                <div className="mx-auto max-w-5xl px-8">
                    <div className="relative overflow-hidden rounded-[3.5rem] border border-accent-gold/20 bg-gradient-to-br from-accent-gold/10 to-transparent p-12 text-center md:p-24">
                        <div className="relative z-10">
                            <h2 className="mb-8 text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
                                Interested in collaborating?
                            </h2>
                            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed font-light text-text-muted">
                                If you're a researcher, care provider, funder,
                                or community organisation interested in the
                                power of storytelling — we'd love to hear from
                                you.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button className="w-full rounded-full px-10 py-5 sm:w-auto">
                                    Get in Touch
                                </Button>
                                <div className="group flex cursor-pointer items-center gap-3 rounded-full border border-border-subtle bg-surface px-6 py-4 transition-all hover:border-accent-gold">
                                    <Mail
                                        size={18}
                                        className="text-accent-gold"
                                    />
                                    <span className="text-sm font-bold text-text-primary">
                                        hello@uloak.co.uk
                                    </span>
                                    <ArrowRight
                                        size={14}
                                        className="text-text-muted transition-transform group-hover:translate-x-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Decorative Background Icon */}
                        <Users className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rotate-12 text-text-muted/5" />
                    </div>
                </div>
            </section>
        </div>
    );
}
