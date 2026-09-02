import { usePage } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

interface StickyCTAProps {
    price: string;
    label: string;
    href: string;
}

export function StickyCTA({ price, label, href }: StickyCTAProps) {
    const [isVisible, setIsVisible] = useState(false);
    const { url } = usePage();

    useEffect(() => {
        const handleScroll = () => {
            // Show sticky CTA after scrolling past hero (roughly 100vh)
            const show = window.scrollY > window.innerHeight * 0.6;
            setIsVisible(show);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Don't show on the checkout page itself
    if (url.startsWith('/billing')) {
        return null;
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed right-0 bottom-0 left-0 z-40 px-4 pb-4 md:hidden"
                >
                    <div className="mx-auto max-w-sm">
                        <motion.a
                            href={href}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="hover:bg-opacity-90 flex w-full items-center justify-center gap-2 rounded-full bg-accent-gold px-6 py-3.5 text-base font-semibold text-bg-dark shadow-lg transition-all"
                        >
                            <span className="flex items-center gap-2">
                                {label}
                                <span className="text-lg">•</span>
                                {price}
                            </span>
                            <ExternalLink className="h-5 w-5" />
                        </motion.a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
