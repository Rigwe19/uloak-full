import { Head, useForm, Link } from '@inertiajs/react';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '@/routes';
import password from '@/routes/password';

interface Props {
    status?: string;
}

export default function ForgotPassword({ status }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(password.email().url);
    };

    return (
        <>
            <Head title="Lost Your Key?" />
            <h1 className="mb-2 text-3xl font-bold text-text-primary">
                Lost Your Key?
            </h1>
            <p className="mb-8 text-text-muted">
                Enter your email to receive a temporary recovery link to the
                house.
            </p>

            {status && (
                <div className="mb-8 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-center text-sm text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-left">
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

                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-2xl bg-accent-gold py-7 text-lg font-bold text-bg-dark shadow-[0_20px_40px_rgba(198,161,91,0.1)] transition-all hover:bg-accent-gold/90 disabled:opacity-50"
                >
                    {processing ? 'Sending...' : 'Request Recovery Link'}
                </Button>

                <p className="mt-8 text-center">
                    <Link
                        href={login().url}
                        className="flex items-center justify-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-gold"
                    >
                        <ArrowLeft size={16} /> Back to Entry
                    </Link>
                </p>
            </form>
        </>
    );
}
