import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Key, Chrome, Apple, Facebook, Mail, Lock } from 'lucide-react';
import { Button } from '../components/UI';
import { signInWithGoogle } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';

export default function Auth() {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showKeyAnimation, setShowKeyAnimation] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleManualLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (email === 'admin@uloak.com' && password === 'admin123') {
            login(email, 'admin');
            startUnlockSequence('admin');
        } else if (email === 'user@uloak.com' && password === 'password123') {
            login(email, 'user');
            startUnlockSequence('user');
        } else {
            setError('Invalid identity credentials. Please try again.');
        }
    };

    const handleGoogleLogin = () => {
        // Mock google login
        login('user@uloak.com', 'user');
        startUnlockSequence('user');
    };

    const startUnlockSequence = (role: 'admin' | 'user') => {
        setIsLoggingIn(true);
        setTimeout(() => setShowKeyAnimation(true), 500);
        setTimeout(() => setIsUnlocked(true), 2500);
        setTimeout(() => {
            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/app');
            }
        }, 4000);
    };

    const socialProviders = [
        { name: 'Google', icon: Chrome, color: 'hover:text-red-400' },
        { name: 'Apple', icon: Apple, color: 'hover:text-text-primary' },
        { name: 'Facebook', icon: Facebook, color: 'hover:text-blue-400' },
    ];

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark p-8">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/5 blur-[120px]" />
            </div>

            <AnimatePresence mode="wait">
                {!isLoggingIn ? (
                    <motion.div
                        key="login-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        className="z-10 w-full max-w-md"
                    >
                        <div className="mb-12 text-center">
                            <img
                                src="/logo.png"
                                alt="ULOAK"
                                className="mx-auto mb-8 h-16"
                            />
                            <h1 className="mb-2 text-3xl font-bold text-text-primary">
                                Welcome Home
                            </h1>
                            <p className="text-text-muted">
                                Enter the house to access your family legacy.
                            </p>
                        </div>

                        <form
                            onSubmit={handleManualLogin}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="group relative">
                                    <Mail
                                        className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                                        size={20}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        required
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="w-full rounded-2xl border border-border-subtle bg-surface py-4 pr-4 pl-12 text-text-primary transition-all placeholder:text-text-muted/50 focus:border-accent-gold/50 focus:outline-none"
                                    />
                                </div>
                                <div className="group relative">
                                    <Lock
                                        className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-gold"
                                        size={20}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        required
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="w-full rounded-2xl border border-border-subtle bg-surface py-4 pr-4 pl-12 text-text-primary transition-all placeholder:text-text-muted/50 focus:border-accent-gold/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-center text-xs font-medium text-red-400">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-4 text-lg shadow-[0_20px_40px_rgba(198,161,91,0.1)]"
                            >
                                Enter the House
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
                                        onClick={
                                            provider.name === 'Google'
                                                ? handleGoogleLogin
                                                : () =>
                                                    startUnlockSequence(
                                                        'user',
                                                    )
                                        }
                                        type="button"
                                        className={`flex items-center justify-center rounded-2xl border border-border-subtle bg-surface p-4 text-text-muted transition-all ${provider.color} hover:border-accent-gold/20`}
                                    >
                                        <provider.icon size={20} />
                                    </button>
                                ))}
                            </div>

                            <div className="rounded-2xl border border-border-subtle bg-surface/50 p-4">
                                <p className="mb-2 text-center text-[10px] tracking-widest text-text-muted uppercase">
                                    Mock Credentials
                                </p>
                                <div className="flex justify-between text-xs">
                                    <span className="text-text-muted">
                                        User: user@uloak.com / password123
                                    </span>
                                </div>
                                <div className="mt-1 flex justify-between text-xs">
                                    <span className="text-text-muted">
                                        Admin: admin@uloak.com / admin123
                                    </span>
                                </div>
                            </div>

                            <p className="mt-8 text-center text-sm text-text-muted">
                                Don't have a house yet?{' '}
                                <button className="text-accent-gold hover:underline">
                                    Request access
                                </button>
                            </p>
                        </form>
                    </motion.div>
                ) : (
                    <div
                        key="unlock-sequence"
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
                            {/* Door Details */}
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
                            {/* Door Details */}
                            <div className="absolute top-1/2 left-0 h-64 w-px -translate-y-1/2 bg-accent-gold/20 blur-[2px]" />
                        </motion.div>

                        {/* Key Animation Container */}
                        <AnimatePresence>
                            {showKeyAnimation && !isUnlocked && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        z: -100,
                                    }}
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
                                        {/* Keyhole Glow */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{
                                                opacity: [0, 1, 0],
                                                scale: [0, 2, 4],
                                            }}
                                            transition={{
                                                delay: 1.5,
                                                duration: 1,
                                            }}
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
        </div>
    );
}
