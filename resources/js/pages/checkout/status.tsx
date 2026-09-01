import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Check, Loader2, XCircle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import GuestLayout from '@/layouts/guest-layout';

interface CheckoutStatusProps {
    payment: { id: number; status: string; provider: string; amount: number; currency: string };
    room?: { id: number; slug: string; name: string } | null;
}

export default function Status({ payment, room }: CheckoutStatusProps) {
    const [status, setStatus] = useState(payment.status);
    const isPending = status === 'pending';
    const isSuccess = status === 'successful';
    const isFailed = status === 'failed';

    useEffect(() => {
        if (!isPending) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/billing/payments/${payment.id}/status`, {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.status && data.status !== status) {
                    setStatus(data.status);
                    if (data.status !== 'pending') clearInterval(interval);
                }
            } catch {}
        }, 3000);
        return () => clearInterval(interval);
    }, [isPending, payment.id, status]);

    return (
        <>
            <Head title={isSuccess ? 'Payment confirmed — Ulo' : isFailed ? 'Payment failed — Ulo' : 'Confirming payment — Ulo'} />
            <section className="flex min-h-[70vh] items-center justify-center px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md rounded-3xl border border-border-subtle bg-surface/30 p-8 text-center"
                >
                    {isSuccess && (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                                <Check className="h-8 w-8 text-emerald-500" />
                            </div>
                            <h1 className="mt-6 text-2xl font-semibold text-text-primary">Payment confirmed</h1>
                            <p className="mt-2 text-sm leading-relaxed text-text-muted">Your Wedding Room is now active. You can generate your share link and QR code from your dashboard.</p>
                            {room && (
                                <Link href={`/dashboard/rooms/${room.slug}`} className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent-gold px-8 py-3 text-sm font-semibold text-bg-dark">
                                    Go to your Wedding Room <ArrowRight size={16} />
                                </Link>
                            )}
                            {!room && (
                                <Link href="/dashboard" className="mt-6 inline-flex items-center justify-center rounded-full bg-accent-gold px-8 py-3 text-sm font-semibold text-bg-dark">
                                    Go to dashboard <ArrowRight size={16} />
                                </Link>
                            )}
                        </>
                    )}
                    {isPending && (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold/15">
                                <Loader2 className="h-8 w-8 animate-spin text-accent-gold" />
                            </div>
                            <h1 className="mt-6 text-2xl font-semibold text-text-primary">Confirming your payment…</h1>
                            <p className="mt-2 text-sm leading-relaxed text-text-muted">Please don&apos;t close this page. We&apos;re verifying your payment with the provider. This usually takes a few seconds.</p>
                            <p className="mt-4 text-xs text-text-muted">You can safely refresh this page.</p>
                        </>
                    )}
                    {isFailed && (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <h1 className="mt-6 text-2xl font-semibold text-text-primary">Payment could not be verified</h1>
                            <p className="mt-2 text-sm leading-relaxed text-text-muted">Your payment was not confirmed. You have not been charged for a duplicate room. Please try again or contact support if you were debited.</p>
                            <div className="mt-6 flex flex-col gap-3">
                                <Link href="/pricing" className="inline-flex items-center justify-center rounded-full bg-accent-gold px-8 py-3 text-sm font-semibold text-bg-dark">
                                    Try again
                                </Link>
                                <Link href="/contact" className="text-sm text-text-muted hover:text-text-primary">
                                    Contact support
                                </Link>
                            </div>
                        </>
                    )}
                </motion.div>
            </section>
        </>
    );
}
