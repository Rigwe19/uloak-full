import { router, Head, useForm, Link } from '@inertiajs/react';
import {
    Chrome,
    Apple,
    Facebook,
    Mail,
    Lock,
    AlertCircle,
    Fingerprint,
    Eye,
    EyeClosed,
    Loader,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useCallback, useEffect, useState } from 'react';

import { DoorOpeningOverlay } from '@/components/door-opening-overlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
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
    const [isPasskeySupported, setIsPasskeySupported] = useState(false);
    const [isPasskeyLoggingIn, setIsPasskeyLoggingIn] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        setIsPasskeySupported(
            typeof window !== 'undefined' &&
            window.PublicKeyCredential !== undefined,
        );
    }, []);

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

    const handlePasskeyLogin = async () => {
        if (!isPasskeySupported) {
return;
}

        setIsPasskeyLoggingIn(true);

        try {
            const response = await fetch('/passkeys/login/options', {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Failed to get login options');
            }

            const responseData = await response.json();
            const rawOptions = responseData.options ?? responseData;

            // WebAuthn challenge and credential IDs come as base64url strings from JSON;
            // they must be converted to ArrayBuffer for the browser API.
            if (rawOptions.challenge && typeof rawOptions.challenge === 'string') {
                rawOptions.challenge = Uint8Array.from(atob(rawOptions.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)).buffer;
            }

            if (rawOptions.allowCredentials) {
                rawOptions.allowCredentials = rawOptions.allowCredentials.map((cred: any) => ({
                    ...cred,
                    id: typeof cred.id === 'string'
                        ? Uint8Array.from(atob(cred.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)).buffer
                        : cred.id,
                }));
            }

            const credential = await navigator.credentials.get({
                publicKey: rawOptions,
            });

            if (!credential) {
                throw new Error('Passkey assertion cancelled');
            }

            const loginResponse = await fetch('/passkeys/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    id: (credential as PublicKeyCredential).id,
                    type: (credential as PublicKeyCredential).type,
                    rawId: Array.from(
                        new Uint8Array(
                            (credential as PublicKeyCredential).rawId,
                        ),
                    ),
                    response: {
                        authenticatorData: Array.from(
                            new Uint8Array(
                                (
                                    (credential as PublicKeyCredential)
                                        .response as AuthenticatorAssertionResponse
                                ).authenticatorData,
                            ),
                        ),
                        clientDataJSON: Array.from(
                            new Uint8Array(
                                (
                                    (credential as PublicKeyCredential)
                                        .response as AuthenticatorAssertionResponse
                                ).clientDataJSON,
                            ),
                        ),
                        signature: Array.from(
                            new Uint8Array(
                                (
                                    (credential as PublicKeyCredential)
                                        .response as AuthenticatorAssertionResponse
                                ).signature,
                            ),
                        ),
                        userHandle: ((
                            (credential as PublicKeyCredential)
                                .response as AuthenticatorAssertionResponse
                        ).userHandle
                            ? Array.from(
                                new Uint8Array(
                                    (
                                        (
                                            (credential as PublicKeyCredential)
                                                .response as AuthenticatorAssertionResponse
                                        ).userHandle as ArrayBuffer
                                    ),
                                ),
                            )
                            : null
                        ),
                    },
                }),
            });

            if (loginResponse.ok) {
                window.location.href = '/dashboard';
            } else {
                const errorData = await loginResponse.json();

                throw new Error(errorData.message || 'Passkey login failed');
            }
        } catch (error) {
            console.error('Passkey login error:', error);
            setIsPasskeyLoggingIn(false);
        }
    };

    const socialProviders = [
        {
            name: 'Google',
            icon: Chrome,
            color: 'hover:text-red-400',
            href: '/auth/google/redirect',
        },
        {
            name: 'Apple',
            icon: Apple,
            color: 'hover:text-white',
            href: '/auth/apple/redirect',
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'hover:text-blue-400',
            href: '/auth/facebook/redirect',
        },
    ];
    const [eyeOpen, setEyeOpen] = useState(false);
    

    return (
        <div className="relative flex max-h-screen items-center justify-center overflow-hidden bg-bg-dark md:p-8">
            <Head title="Welcome Home" />

            {/* Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 h-200 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/5 blur-[120px]" />
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
                                    <div className="relative w-full">
                                        <Input
                                            type={!eyeOpen ? "password" : 'text'}
                                            placeholder="Password"
                                            required
                                            value={data.password}
                                            onChange={(e) =>
                                                setData('password', e.target.value)
                                            }
                                            className="w-full rounded-2xl border-border-subtle bg-surface py-7 pr-4 pl-12 text-base text-text-primary transition-all placeholder:text-text-muted/50 focus:border-accent-gold/50"
                                        />
                                        <div className="absolute right-0 top-0 bottom-0 w-16 flex justify-center items-center text-accent-gold">
                                            {eyeOpen && <Eye onClick={() => setEyeOpen(false)} className='' />}
                                            {!eyeOpen && <EyeClosed onClick={() => setEyeOpen(true)} className='' />}
                                        </div>
                                    </div>

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
                                {processing && <Loader className='animate-spin' />}
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

                            <div className="grid grid-cols-4 gap-4">
                                {socialProviders.map((provider) => (
                                    <a
                                        key={provider.name}
                                        href={provider.href}
                                        className={`flex items-center justify-center rounded-2xl border border-border-subtle bg-surface p-4 text-text-muted transition-all ${provider.color} hover:border-accent-gold/20`}
                                    >
                                        <provider.icon size={20} />
                                    </a>
                                ))}
                                {isPasskeySupported && (
                                    <button
                                        type="button"
                                        onClick={handlePasskeyLogin}
                                        disabled={isPasskeyLoggingIn}
                                        className="flex items-center justify-center rounded-2xl border border-border-subtle bg-surface p-4 text-text-muted transition-all hover:border-accent-gold/20 hover:text-green-400"
                                        title="Sign in with Passkey"
                                    >
                                        <Fingerprint
                                            size={20}
                                            className={
                                                isPasskeyLoggingIn
                                                    ? 'animate-pulse'
                                                    : ''
                                            }
                                        />
                                    </button>
                                )}
                            </div>

                            {/* <div className="rounded-2xl border border-border-subtle bg-surface/50 p-4">
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
                            </div> */}

                            {canRegister && (
                                <p className="mt-8 text-center text-sm text-text-muted">
                                    Don't have a house yet?{' '}
                                    <Link
                                        href={register().url}
                                        className="text-accent-gold hover:underline"
                                    >
                                        Sign up
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