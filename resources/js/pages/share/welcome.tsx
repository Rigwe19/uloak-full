import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    User as UserIcon,
    Mail as MailIcon,
    ArrowRight,
    Lock,
    Check,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/dashboard/ui';
import { sendLink } from '@/routes/share';

interface ShareWelcomeProps {
    type: 'room' | 'event';
    space: {
        name: string;
        slug: string;
        description: string;
        thumbnail: string;
    };
    flash?: {
        success?: string;
    };
}

export default function ShareWelcome({ type, space, flash }: ShareWelcomeProps) {
    const [submitted, setSubmitted] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        type: type,
        slug: space.slug,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(sendLink().url, {
            onSuccess: () => {
                setSubmitted(true);
            },
        });
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark px-4 py-16 font-sans antialiased md:px-8">
            <Head title={`Gateway to ${space.name}`} />

            {/* Atmosphere ambient background */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="atmosphere absolute inset-0 opacity-40" />
                {space.thumbnail && (
                    <motion.img
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.15 }}
                        transition={{ duration: 3 }}
                        src={space.thumbnail}
                        className="h-full w-full object-cover blur-[80px]"
                        alt=""
                    />
                )}
                {/* Golden ambient blobs */}
                <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-accent-gold/5 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-gold/5 blur-[120px]" />
            </div>

            <main className="relative z-10 w-full max-w-lg">
                {/* Logo & Header */}
                <div className="mb-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center"
                    >
                        <span className="text-3xl font-extrabold tracking-[0.25em] text-text-primary uppercase md:text-4xl text-glow">
                            Uloak
                        </span>
                        <div className="mt-2 h-0.5 w-16 bg-accent-gold/30" />
                        <span className="mt-2 text-[10px] font-bold tracking-[0.4em] text-accent-gold uppercase">
                            Heritage Homestead
                        </span>
                    </motion.div>
                </div>

                {/* Main Welcome Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative overflow-hidden rounded-[32px] border border-white/10 bg-surface/60 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-12"
                >
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.div
                                key="entry-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-gold/20 bg-accent-gold/10 text-accent-gold shadow-lg shadow-accent-gold/5">
                                        <Sparkles size={24} />
                                    </div>
                                    <div className="space-y-2">
                                        <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                                            Step Into the Homestead
                                        </h1>
                                        <p className="text-sm font-light text-text-muted">
                                            You are invited to contribute to and explore the{' '}
                                            <span className="font-semibold text-accent-gold">
                                                {space.name}
                                            </span>{' '}
                                            {type}.
                                        </p>
                                    </div>
                                    {space.description && (
                                        <div className="rounded-2xl bg-black/20 p-4 border border-white/5">
                                            <p className="text-xs italic leading-relaxed text-text-muted">
                                                "{space.description}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        {/* Name Input */}
                                        <div className="space-y-2">
                                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                Your Full Name
                                            </label>
                                            <div className="group relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted group-focus-within:text-accent-gold transition-colors">
                                                    <UserIcon size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter your name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="w-full rounded-2xl border border-border-subtle bg-bg-dark/85 py-4 pl-12 pr-6 text-sm text-text-primary placeholder:text-text-muted/65 transition-all focus:border-accent-gold/50 focus:outline-none focus:ring-1 focus:ring-accent-gold/30"
                                                />
                                            </div>
                                            {errors.name && (
                                                <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Email Input */}
                                        <div className="space-y-2">
                                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                Your Email Address
                                            </label>
                                            <div className="group relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted group-focus-within:text-accent-gold transition-colors">
                                                    <MailIcon size={18} />
                                                </div>
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="name@example.com"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className="w-full rounded-2xl border border-border-subtle bg-bg-dark/85 py-4 pl-12 pr-6 text-sm text-text-primary placeholder:text-text-muted/65 transition-all focus:border-accent-gold/50 focus:outline-none focus:ring-1 focus:ring-accent-gold/30"
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            className="w-full justify-center py-6 text-sm font-bold tracking-wider uppercase shadow-[0_20px_40px_rgba(198,161,91,0.15)] transition-transform active:scale-[0.98]"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <div className="flex items-center gap-2">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                        className="h-4 w-4 rounded-full border-2 border-bg-dark border-t-transparent"
                                                    />
                                                    Verifying...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span>Open Homestead</span>
                                                    <ArrowRight size={16} />
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </form>

                                <div className="flex items-center justify-center gap-2 border-t border-white/5 pt-6 text-[10px] font-semibold tracking-wider text-text-muted/60 uppercase">
                                    <Lock size={12} className="text-accent-gold/50" />
                                    <span>Secure Magic Link Authentication</span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success-screen"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="text-center space-y-8"
                            >
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/5 shadow-2xl">
                                    <Check size={40} className="stroke-[3]" />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                                        Gateway Opened
                                    </h2>
                                    <p className="mx-auto max-w-sm text-sm font-light leading-relaxed text-text-muted">
                                        A secure magic link has been sent to{' '}
                                        <span className="font-semibold text-accent-gold">{data.email}</span>.
                                        Check your inbox and click the link to enter the homestead.
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-accent-gold/5 p-5 border border-accent-gold/10 text-xs leading-relaxed text-text-muted">
                                    <span className="font-medium text-accent-gold">Note:</span> The magic link is valid for 30 minutes. If you do not receive the email within a few minutes, please check your spam folder.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
