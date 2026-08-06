import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'motion/react';
import { PageTransition } from '@/components/page-transition';
import { home } from '@/routes';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { url } = usePage();

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark md:p-8 p-4">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 h-200 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/5 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-md"
            >
                <div className="mb-12 text-center">
                    <Link href={home().url}>
                        <img
                            src="/logo.png"
                            alt="ULO OF STORIES"
                            className="mx-auto mb-8 h-16"
                        />
                    </Link>
                    <AnimatePresence mode="wait" initial={false}>
                        <PageTransition key={url} type="subtle">
                            {children}
                        </PageTransition>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
