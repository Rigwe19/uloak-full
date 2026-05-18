import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { router, Head, useForm, Link } from '@inertiajs/react';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

import { DoorOpeningOverlay } from '@/components/door-opening-overlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login, register } from '@/routes';

interface Props {
    passwordRules?: string;
    doorTransition?: boolean;
    doorRedirect?: string;
}

export default function Register({ doorTransition, doorRedirect }: Props) {
    const [isTransitioning, setIsTransitioning] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleComplete = useCallback(() => {
        router.visit(doorRedirect ?? '/dashboard');
    }, [doorRedirect]);

    useEffect(() => {
        if (doorTransition) {
            setIsTransitioning(true);
        }
    }, [doorTransition]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(register().url, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AnimatePresence mode="wait">
            {!isTransitioning ? (
                <motion.div
                    key="register-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                >
                    <Head title="Establish Your Legacy" />
                    <h1 className="mb-2 text-3xl font-bold text-text-primary">
                        Build Your House
                    </h1>
                    <p className="mb-8 text-text-muted">
                        Begin documenting your family's eternal narrative.
                    </p>

                    <form onSubmit={submit} className="space-y-6 text-left">
                        <div className="space-y-4">
                            <div className="group relative">
                                <User
                                    className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                                    size={20}
                                />
                                <Input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-2xl border-border-subtle bg-surface py-7 pr-4 pl-12 text-base text-text-primary transition-all placeholder:text-text-muted/50 focus:border-accent-gold/50"
                                />
                                {errors.name && (
                                    <p className="mt-1 ml-4 flex items-center gap-1 text-xs text-red-400">
                                        <AlertCircle size={12} />{' '}
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="group relative">
                                <Mail
                                    className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                                    size={20}
                                />
                                <Input
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-2xl border-border-subtle bg-surface py-7 pr-4 pl-12 text-base text-text-primary transition-all placeholder:text-text-muted/50 focus:border-accent-gold/50"
                                />
                                {errors.email && (
                                    <p className="mt-1 ml-4 flex items-center gap-1 text-xs text-red-400">
                                        <AlertCircle size={12} />{' '}
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="group relative">
                                <Lock
                                    className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                                    size={20}
                                />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    required
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="w-full rounded-2xl border-border-subtle bg-surface py-7 pr-4 pl-12 text-base text-text-primary transition-all placeholder:text-text-muted/50 focus:border-accent-gold/50"
                                />
                                {errors.password && (
                                    <p className="mt-1 ml-4 flex items-center gap-1 text-xs text-red-400">
                                        <AlertCircle size={12} />{' '}
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="group relative">
                                <Lock
                                    className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                                    size={20}
                                />
                                <Input
                                    type="password"
                                    placeholder="Confirm Password"
                                    required
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-2xl border-border-subtle bg-surface py-7 pr-4 pl-12 text-base text-text-primary transition-all placeholder:text-text-muted/50 focus:border-accent-gold/50"
                                />
                                {errors.password_confirmation && (
                                    <p className="mt-1 ml-4 flex items-center gap-1 text-xs text-red-400">
                                        <AlertCircle size={12} />{' '}
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="group/btn w-full rounded-2xl bg-accent-gold py-7 text-lg font-bold text-bg-dark shadow-[0_20px_40px_rgba(198,161,91,0.1)] transition-all hover:bg-accent-gold/90 disabled:opacity-50"
                        >
                            {processing ? (
                                'Constructing...'
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Request Access{' '}
                                    <ArrowRight
                                        className="transition-transform group-hover/btn:translate-x-1"
                                        size={20}
                                    />
                                </span>
                            )}
                        </Button>

                        <p className="mt-8 text-center text-sm text-text-muted">
                            Already have a legacy?{' '}
                            <Link
                                href={login().url}
                                className="text-accent-gold hover:underline"
                            >
                                Enter the house
                            </Link>
                        </p>
                    </form>
                </motion.div>
            ) : (
                <DoorOpeningOverlay isActive onComplete={handleComplete} />
            )}
        </AnimatePresence>
    );
}
