import { router, Head, useForm, Link } from '@inertiajs/react';
import {
    Briefcase,
    User,
    Mail,
    Lock,
    AlertCircle,
    ArrowRight,
    Eye,
    EyeClosed,
    Check,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useCallback, useEffect, useState } from 'react';

import { DoorOpeningOverlay } from '@/components/door-opening-overlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login, register } from '@/routes';

interface Props {
    passwordRules?: string;
    doorTransition?: boolean;
    doorRedirect?: string;
}

// Password strength meter component
function PasswordStrengthMeter({ password }: { password: string }) {
    const requirements = [
        {
            id: 'length',
            label: 'At least 8 characters',
            test: password.length >= 8,
        },
        {
            id: 'uppercase',
            label: 'One uppercase letter',
            test: /[A-Z]/.test(password),
        },
        { id: 'number', label: 'One number', test: /\d/.test(password) },
    ];

    const satisfiedCount = requirements.filter((r) => r.test).length;

    if (!password) {
        return null;
    }

    return (
        <div className="mt-2 space-y-2">
            <div className="space-y-1">
                <div className="h-1 w-full overflow-hidden rounded-full bg-border-subtle">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${
                            satisfiedCount === 0
                                ? 'bg-red-500'
                                : satisfiedCount === 1
                                  ? 'bg-red-500'
                                  : satisfiedCount === 2
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                        }`}
                        style={{ width: `${(satisfiedCount / 3) * 100}%` }}
                    />
                </div>
                <p className="text-[10px] text-text-muted">
                    Password requirements:{' '}
                    <span className="font-medium">
                        {satisfiedCount === 3
                            ? 'All satisfied'
                            : `${satisfiedCount} of 3 satisfied`}
                    </span>
                </p>
            </div>
            <ul className="space-y-1">
                {requirements.map((req) => (
                    <li
                        key={req.id}
                        className="flex items-center gap-1.5 text-[10px]"
                    >
                        {req.test ? (
                            <Check size={12} className="text-green-500" />
                        ) : (
                            <X size={12} className="text-red-500" />
                        )}
                        <span
                            className={
                                req.test ? 'text-green-400' : 'text-text-muted'
                            }
                        >
                            {req.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Register({ doorTransition, doorRedirect }: Props) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
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
                        {/* Account Type Toggle */}
                        <div className="space-y-2">
                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                Account Type
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setData('role', 'user')}
                                    className={`flex flex-1 items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm transition-all ${
                                        data.role === 'user'
                                            ? 'border-accent-gold/50 bg-accent-gold/5 text-accent-gold'
                                            : 'border-border-subtle bg-surface text-text-muted hover:border-accent-gold/30'
                                    }`}
                                >
                                    <User size={18} />
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs font-semibold">
                                            Personal
                                        </span>
                                        <span className="text-[10px] text-text-muted">
                                            Family legacy & stories
                                        </span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setData('role', 'business_admin')
                                    }
                                    className={`flex flex-1 items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm transition-all ${
                                        data.role === 'business_admin'
                                            ? 'border-accent-gold/50 bg-accent-gold/5 text-accent-gold'
                                            : 'border-border-subtle bg-surface text-text-muted hover:border-accent-gold/30'
                                    }`}
                                >
                                    <Briefcase size={18} />
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs font-semibold">
                                            Business
                                        </span>
                                        <span className="text-[10px] text-text-muted">
                                            Manage client projects
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>

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
                                        <AlertCircle size={12} /> {errors.name}
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
                                        <AlertCircle size={12} /> {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="group relative">
                                <Lock
                                    className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                                    size={20}
                                />
                                <div className="relative w-full">
                                    <Input
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        placeholder="Password"
                                        required
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        className="w-full rounded-2xl border-border-subtle bg-surface py-7 pr-12 pl-12 text-base text-text-primary transition-all placeholder:text-text-muted/50 focus:border-accent-gold/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute top-0 right-0 bottom-0 flex w-12 items-center justify-center text-accent-gold hover:text-accent-gold/70"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <Eye size={20} />
                                        ) : (
                                            <EyeClosed size={20} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 ml-4 flex items-center gap-1 text-xs text-red-400">
                                        <AlertCircle size={12} />{' '}
                                        {errors.password}
                                    </p>
                                )}
                                <PasswordStrengthMeter
                                    password={data.password}
                                />
                            </div>

                            <div className="group relative">
                                <Lock
                                    className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                                    size={20}
                                />
                                <div className="relative w-full">
                                    <Input
                                        type={
                                            showPasswordConfirmation
                                                ? 'text'
                                                : 'password'
                                        }
                                        placeholder="Confirm Password"
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-2xl border-border-subtle bg-surface py-7 pr-12 pl-12 text-base text-text-primary transition-all placeholder:text-text-muted/50 focus:border-accent-gold/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswordConfirmation(
                                                !showPasswordConfirmation,
                                            )
                                        }
                                        className="absolute top-0 right-0 bottom-0 flex w-12 items-center justify-center text-accent-gold hover:text-accent-gold/70"
                                        tabIndex={-1}
                                    >
                                        {showPasswordConfirmation ? (
                                            <Eye size={20} />
                                        ) : (
                                            <EyeClosed size={20} />
                                        )}
                                    </button>
                                </div>
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
