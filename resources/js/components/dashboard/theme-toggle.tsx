import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Moon, Sun } from 'lucide-react';
import React from 'react';
import { useAppearance } from '@/hooks/use-appearance';

export function ThemeToggle({ className = '' }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();

    const nextTheme = {
        light: 'dark',
        dark: 'system',
        system: 'light',
    } as const;

    const toggleTheme = () => {
        updateAppearance(nextTheme[appearance]);
    };

    return (
        <button
            onClick={toggleTheme}
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-surface/50 text-text-muted transition-all hover:border-accent-gold/40 hover:text-text-primary ${className}`}
            title={`Switch to ${nextTheme[appearance]} mode`}
        >
            <AnimatePresence mode="wait">
                {appearance === 'light' && (
                    <motion.div
                        key="light"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                    >
                        <Sun size={20} />
                    </motion.div>
                )}
                {appearance === 'dark' && (
                    <motion.div
                        key="dark"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                    >
                        <Moon size={20} />
                    </motion.div>
                )}
                {appearance === 'system' && (
                    <motion.div
                        key="system"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                    >
                        <Monitor size={20} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center">
                <div className="h-full w-full animate-pulse rounded-full bg-accent-gold opacity-20" />
            </div>
        </button>
    );
}
