import { Head, useForm, Link } from '@inertiajs/react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import password from '@/routes/password';

interface Props {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(password.update().url, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Forge a New Key" />
            <h1 className="mb-2 text-3xl font-bold text-text-primary">
                Forge a New Key
            </h1>
            <p className="mb-8 text-text-muted">
                Restore access to your house by establishing a new identity
                credential.
            </p>

            <form onSubmit={submit} className="space-y-6 text-left">
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
                            onChange={(e) => setData('email', e.target.value)}
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
                        <Input
                            type="password"
                            placeholder="New Password"
                            required
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="w-full rounded-2xl border-border-subtle bg-surface py-7 pr-4 pl-12 text-base text-text-primary transition-all placeholder:text-text-muted/50 focus:border-accent-gold/50"
                        />
                        {errors.password && (
                            <p className="mt-1 ml-4 flex items-center gap-1 text-xs text-red-400">
                                <AlertCircle size={12} /> {errors.password}
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
                            placeholder="Confirm New Password"
                            required
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
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
                    className="w-full rounded-2xl bg-accent-gold py-7 text-lg font-bold text-bg-dark shadow-[0_20px_40px_rgba(198,161,91,0.1)] transition-all hover:bg-accent-gold/90 disabled:opacity-50"
                >
                    {processing ? 'Forging...' : 'Update Identity Key'}
                </Button>
            </form>
        </>
    );
}
