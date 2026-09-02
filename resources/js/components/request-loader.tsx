import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export function RequestLoader() {
    const [active, setActive] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return router.on('start', (event) => {
            const method = event.detail.visit.method;

            if (method === 'get') {
                return;
            }

            timerRef.current = setTimeout(() => setActive(true), 300);
        });
    }, []);

    useEffect(() => {
        return router.on('finish', () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }

            setActive(false);
        });
    }, []);

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    key="request-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-bg-dark/70 backdrop-blur-sm"
                >
                    <img
                        src="/logo-dark.png"
                        alt="ULO OF STORIES"
                        className="h-12 w-auto opacity-80 dark:hidden"
                    />
                    <img
                        src="/logo.png"
                        alt="ULO OF STORIES"
                        className="hidden h-12 w-auto opacity-80 dark:block"
                    />

                    <div className="relative flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.2,
                                ease: 'linear',
                            }}
                            className="absolute h-10 w-10 rounded-full border-2 border-accent-gold/20 border-t-accent-gold"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{
                                repeat: Infinity,
                                duration: 2,
                                ease: 'linear',
                            }}
                            className="h-16 w-16 rounded-full border border-accent-gold/10 border-b-accent-gold/40"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
