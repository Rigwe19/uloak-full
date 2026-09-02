import { motion } from 'framer-motion';
import React from 'react';

interface PageTransitionProps {
    children: React.ReactNode;
    type?: 'subtle' | 'high-impact' | 'door';
}

export function PageTransition({
    children,
    type = 'subtle',
}: PageTransitionProps) {
    const variants = {
        subtle: {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 },
        },
        'high-impact': {
            initial: { opacity: 0, scale: 0.98, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 1.02, y: -20 },
        },
        door: {
            initial: {
                opacity: 0,
                rotateY: 90,
                scale: 0.9,
                transformOrigin: 'left center',
                z: -500,
            },
            animate: {
                opacity: 1,
                rotateY: 0,
                scale: 1,
                transformOrigin: 'left center',
                z: 0,
            },
            exit: {
                opacity: 0,
                rotateY: -90,
                scale: 0.9,
                transformOrigin: 'right center',
                z: -500,
            },
        },
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants[type]}
            transition={{
                duration: type === 'subtle' ? 0.4 : 0.8,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="flex h-full w-full flex-col"
        >
            {children}
        </motion.div>
    );
}
