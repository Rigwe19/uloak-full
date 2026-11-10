import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { fadeUp, staggerContainer } from '@/lib/animations';

interface ErrorProps {
    status?: number;
    message?: string;
}

const TITLES: Record<number, string> = {
    403: 'Access denied',
    404: 'Not found',
    410: 'Link expired',
    429: 'Too many requests',
    500: 'Something went wrong',
};

export default function ErrorPage({ status = 500, message }: ErrorProps) {
    const title = TITLES[status] ?? 'Something went wrong';
    const detail =
        message ??
        'This link may be expired or the content may no longer be available. If you were expecting a download, request a fresh one from the room or event page.';

    return (
        <GuestLayout>
            <Head title={`${title} - Ulo of Stories`} />

            <section className="relative overflow-hidden px-6 pt-32 pb-24 md:px-12 lg:px-24">
                <motion.div
                    className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-gold/5 blur-[120px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2 }}
                />
                <div className="relative z-10 mx-auto max-w-2xl text-center">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="space-y-6"
                    >
                        <motion.span
                            variants={fadeUp}
                            className="block text-[10px] font-bold tracking-[0.4em] text-accent-gold uppercase"
                        >
                            Error {status}
                        </motion.span>
                        <motion.h1
                            variants={fadeUp}
                            className="text-5xl leading-[1.1] font-bold tracking-tight text-text-primary md:text-7xl"
                        >
                            {title}
                        </motion.h1>
                        <motion.p
                            variants={fadeUp}
                            className="mx-auto max-w-xl text-lg leading-relaxed text-text-muted"
                        >
                            {detail}
                        </motion.p>
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-wrap items-center justify-center gap-3 pt-2"
                        >
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 rounded-full bg-accent-gold px-6 py-3 text-sm font-semibold text-bg-dark transition hover:bg-accent-gold/90"
                            >
                                <Home size={16} /> Go to dashboard
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-accent-gold/30"
                            >
                                <ArrowLeft size={16} /> Back home
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </GuestLayout>
    );
}
