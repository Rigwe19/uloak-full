import { Key } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface DoorOpeningOverlayProps {
    isActive: boolean;
    onComplete?: () => void;
}

export function DoorOpeningOverlay({
    isActive,
    onComplete,
}: DoorOpeningOverlayProps) {
    const [showKeyAnimation, setShowKeyAnimation] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        if (!isActive) {
            setShowKeyAnimation(false);
            setIsUnlocked(false);

            return;
        }

        const keyTimer = setTimeout(() => setShowKeyAnimation(true), 500);
        const unlockTimer = setTimeout(() => setIsUnlocked(true), 2500);
        const completeTimer = setTimeout(() => onComplete?.(), 4000);

        return () => {
            clearTimeout(keyTimer);
            clearTimeout(unlockTimer);
            clearTimeout(completeTimer);
        };
    }, [isActive, onComplete]);

    return (
        <AnimatePresence>
            {isActive && (
                <div
                    key="door-overlay"
                    className="perspective-1000 fixed inset-0 z-50 flex items-center justify-center"
                >
                    {/* Left Door */}
                    <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: isUnlocked ? '-100%' : 0 }}
                        transition={{
                            duration: 1.5,
                            ease: [0.65, 0, 0.35, 1],
                        }}
                        className="absolute inset-y-0 left-0 z-10 w-1/2 origin-left border-r border-border-subtle bg-bg-dark"
                    >
                        <div className="absolute top-1/2 right-0 h-64 w-px -translate-y-1/2 bg-accent-gold/20 blur-[2px]" />
                    </motion.div>

                    {/* Right Door */}
                    <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: isUnlocked ? '100%' : 0 }}
                        transition={{
                            duration: 1.5,
                            ease: [0.65, 0, 0.35, 1],
                        }}
                        className="absolute inset-y-0 right-0 z-10 w-1/2 origin-right border-l border-border-subtle bg-bg-dark"
                    >
                        <div className="absolute top-1/2 left-0 h-64 w-px -translate-y-1/2 bg-accent-gold/20 blur-[2px]" />
                    </motion.div>

                    {/* Key Animation */}
                    <AnimatePresence>
                        {showKeyAnimation && !isUnlocked && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, z: -100 }}
                                animate={{ opacity: 1, scale: 1, z: 0 }}
                                exit={{ opacity: 0, scale: 1.5, z: 200 }}
                                className="z-20 flex flex-col items-center gap-12 text-accent-gold"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: [0, 0, 90] }}
                                        transition={{
                                            duration: 2,
                                            times: [0, 0.6, 1],
                                        }}
                                        className="relative z-10"
                                    >
                                        <Key
                                            size={120}
                                            className="drop-shadow-[0_0_30px_rgba(198,161,91,0.5)]"
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0, 2, 4],
                                        }}
                                        transition={{ delay: 1.5, duration: 1 }}
                                        className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold blur-[40px]"
                                    />
                                </div>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="animate-pulse text-sm font-bold tracking-[0.5em] text-accent-gold uppercase"
                                >
                                    Unlocking Legacy
                                </motion.span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Content Revealed Behind Doors */}
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-dark">
                        <div className="text-center">
                            <motion.h2
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: isUnlocked ? 1 : 0,
                                    scale: isUnlocked ? 1 : 0.9,
                                }}
                                className="mb-4 text-4xl font-bold tracking-tight text-text-primary"
                            >
                                Welcome Home
                            </motion.h2>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                }}
                                className="mx-auto h-24 w-1 bg-accent-gold/20"
                            />
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
