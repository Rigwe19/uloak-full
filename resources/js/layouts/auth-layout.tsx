import { motion } from 'motion/react';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark p-8">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/5 blur-[120px]" />
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
                            alt="ULOAK"
                            className="mx-auto mb-8 h-16"
                        />
                    </Link>
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
