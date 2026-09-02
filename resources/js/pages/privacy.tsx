import { Head } from '@inertiajs/react';
import {
    Shield,
    Lock,
    Eye,
    FileText,
    Globe,
    Users,
    BookOpen,
    Heart,
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
    Coffee,
} from 'lucide-react';
import { motion } from 'motion/react';
import GuestLayout from '@/layouts/guest-layout';
import {
    cinematicText,
    fadeUp,
    parallaxFloat,
    staggerContainer,
} from '@/lib/animations';

interface Props {
    page?: {
        title: string;
        meta_description?: string;
        content: any;
    };
}

export default function Privacy({ page }: Props) {
    const iconMap: Record<string, any> = {
        Shield,
        Lock,
        Eye,
        FileText,
        Globe,
        Users,
        BookOpen,
        Heart,
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
        Coffee,
    };

    const content = page?.content || {};
    const hero = content.hero || {
        title: 'Privacy Policy',
        subtitle:
            'Your trust is our most valuable asset. We are committed to protecting the privacy and security of your family stories.',
    };

    const sections = content.sections || [
        {
            title: 'Data Collection',
            icon: 'Eye',
            content:
                'We collect information that you provide directly to us, such as when you create an account, preserve a story, or communicate with us. This may include your name, email address, and any media or text you upload to our platform.',
        },
        {
            title: 'How We Use Data',
            icon: 'FileText',
            content:
                'Your data is used primarily to provide and improve our services, including preserving your family legacy and personalizing your experience. We do not sell your personal information to third parties.',
        },
        {
            title: 'Data Security',
            icon: 'Lock',
            content:
                'We implement industry-standard security measures to protect your data. Your stories are stored in a private, secure environment accessible only by you and those you choose to share them with.',
        },
        {
            title: 'Your Rights',
            icon: 'Shield',
            content:
                'You have the right to access, correct, or delete your personal data at any time. You maintain full ownership of all stories and media you upload to the ULO OF STORIES platform.',
        },
    ];

    return (
        <>
            <Head>
                <title>
                    {page?.title || 'Privacy Policy'} | Ulo of Stories
                </title>
                <meta
                    name="description"
                    content={
                        page?.meta_description ||
                        'Our commitment to protecting your privacy and family stories.'
                    }
                />
            </Head>

            <div className="bg-bg-dark text-text-primary selection:bg-accent-gold/30">
                <section className="relative min-h-[50vh] overflow-hidden px-6 pt-32 pb-20 md:px-12 lg:px-24">
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

                    <div className="relative z-10 mx-auto max-w-4xl text-center">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                        >
                            <motion.span
                                variants={fadeUp}
                                className="mb-6 inline-block text-[10px] font-bold tracking-[0.4em] text-accent-gold uppercase"
                            >
                                Privacy & Trust
                            </motion.span>
                            <motion.h1
                                variants={cinematicText}
                                className="text-5xl leading-[1.1] font-bold tracking-tight text-text-primary md:text-7xl"
                            >
                                {hero.title}
                            </motion.h1>
                            <motion.p
                                variants={fadeUp}
                                className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-text-muted"
                            >
                                {hero.subtitle}
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                <section className="px-6 py-24 md:px-12 lg:px-24">
                    <div className="mx-auto max-w-4xl">
                        <div className="grid gap-8">
                            {sections.map((section: any, i: number) => {
                                const IconComponent =
                                    iconMap[
                                        section.icon as keyof typeof iconMap
                                    ] || Shield;

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="rounded-3xl border border-white/5 bg-surface/20 p-8 md:p-12"
                                    >
                                        <div className="mb-8 inline-flex rounded-2xl bg-accent-gold/10 p-4">
                                            <IconComponent
                                                className="text-accent-gold"
                                                size={24}
                                            />
                                        </div>
                                        <h2 className="mb-4 text-2xl font-bold text-text-primary">
                                            {section.title}
                                        </h2>
                                        <p className="text-lg leading-relaxed text-text-muted">
                                            {section.content}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-20 border-t border-white/5 pt-12 text-center"
                        >
                            <p className="text-sm text-text-muted italic">
                                Last updated:{' '}
                                {new Date().toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                            <p className="mt-4 text-sm text-text-muted">
                                Questions? Reach us at{' '}
                                <a
                                    href="mailto:privacy@ulo of stories.co.uk"
                                    className="text-accent-gold hover:underline"
                                >
                                    privacy@ulo of stories.co.uk
                                </a>
                            </p>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
}
