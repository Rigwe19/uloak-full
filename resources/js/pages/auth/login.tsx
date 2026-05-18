import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { router, Head, useForm, Link } from '@inertiajs/react';
import {
    Chrome,
    Apple,
    Facebook,
    Mail,
    Lock,
    AlertCircle,
} from 'lucide-react';

import { DoorOpeningOverlay } from '@/components/door-opening-overlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login, register } from '@/routes';
import password from '@/routes/password';

interface Props {
    status?: string;
    canResetPassword?: boolean;
    canRegister?: boolean;
    doorTransition?: boolean;
    doorRedirect?: string;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
    doorTransition,
    doorRedirect,
}: Props) {
    const [isTransitioning, setIsTransitioning] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
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

        post(login().url, {
            onFinish: () => reset('password'),
        });
    };

    const socialProviders = [
        { name: 'Google', icon: Chrome, color: 'hover:text-red-400' },
        { name: 'Apple', icon: Apple, color: 'hover:text-white' },
        { name: 'Facebook', icon: Facebook, color: 'hover:text-blue-400' },
    ];

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark p-8">
            <Head title="Welcome Home" />

            {/* Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/5 blur-[120px]" />
            </div>

            <AnimatePresence mode="wait">
                {!isTransitioning ? (
                    <motion.div
                        key="login-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        className="z-10 w-full max-w-md"
                    >
                        <div className="mb-12 text-center">
                            <h1 className="mb-2 text-3xl font-bold text-text-primary">
                                Welcome Home
                            </h1>
                            <p className="text-text-muted">
                                Enter the house to access your family legacy.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 text-center text-sm font-medium text-green-400">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-4">
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
                            </div>

                            <div className="flex items-center justify-between px-2">
                                <label className="group flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                'remember',
                                                e.target.checked,
                                            )
                                        }
                                        className="rounded border-border-subtle bg-surface text-accent-gold focus:ring-accent-gold/20"
                                    />
                                    <span className="text-xs text-text-muted transition-colors group-hover:text-text-primary">
                                        Remember my identity
                                    </span>
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={password.request().url}
                                        className="text-xs text-accent-gold hover:underline"
                                    >
                                        Lost your key?
                                    </Link>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-2xl bg-accent-gold py-7 text-lg font-bold text-bg-dark shadow-[0_20px_40px_rgba(198,161,91,0.1)] transition-all hover:bg-accent-gold/90 disabled:opacity-50"
                            >
                                {processing
                                    ? 'Verifying...'
                                    : 'Enter the House'}
                            </Button>

                            <div className="relative flex items-center justify-center py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border-subtle"></div>
                                </div>
                                <span className="relative bg-bg-dark px-4 text-xs tracking-widest text-text-muted uppercase">
                                    or continue with
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {socialProviders.map((provider) => (
                                    <button
                                        key={provider.name}
                                        type="button"
                                        className={`flex items-center justify-center rounded-2xl border border-border-subtle bg-surface p-4 text-text-muted transition-all ${provider.color} hover:border-accent-gold/20`}
                                    >
                                        <provider.icon size={20} />
                                    </button>
                                ))}
                            </div>

                            <div className="rounded-2xl border border-border-subtle bg-surface/50 p-4">
                                <p className="mb-2 text-center text-[10px] tracking-widest text-text-muted uppercase">
                                    Seeded Credentials
                                </p>
                                <div className="flex justify-between text-xs">
                                    <span className="font-mono text-text-muted">
                                        user@uloak.com / password
                                    </span>
                                </div>
                                <div className="mt-1 flex justify-between text-xs">
                                    <span className="font-mono text-text-muted">
                                        admin@uloak.com / password
                                    </span>
                                </div>
                            </div>

                            {canRegister && (
                                <p className="mt-8 text-center text-sm text-text-muted">
                                    Don't have a house yet?{' '}
                                    <Link
                                        href={register().url}
                                        className="text-accent-gold hover:underline"
                                    >
                                        Request access
                                    </Link>
                                </p>
                            )}
                        </form>
                    </motion.div>
                ) : (
                    <DoorOpeningOverlay isActive onComplete={handleComplete} />
                )}
            </AnimatePresence>
        </div>
    );
}
