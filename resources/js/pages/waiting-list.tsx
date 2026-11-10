import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { fadeUp, staggerContainer } from '@/lib/animations';

interface WaitingListProps {
    flash?: { success?: string };
}

export default function WaitingList({ flash }: WaitingListProps) {
    const page = usePage<WaitingListProps & Record<string, unknown>>();
    const flashSuccess =
        flash?.success ?? (page.props.flash as { success?: string } | undefined)?.success;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/waiting-list', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <GuestLayout>
            <Head title="Join the waiting list - Ulo of Stories" />

            <section className="relative overflow-hidden px-6 pt-32 pb-24 md:px-12 lg:px-24">
                <motion.div
                    className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-gold/5 blur-[120px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2 }}
                />
                <div className="relative z-10 mx-auto max-w-xl">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="space-y-8"
                    >
                        <motion.div variants={fadeUp} className="text-center">
                            <span className="block text-[10px] font-bold tracking-[0.4em] text-accent-gold uppercase">
                                Early access
                            </span>
                            <h1 className="mt-3 text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
                                Join the waiting list
                            </h1>
                            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-muted">
                                We&apos;re inviting families in small batches.
                                Leave your details and we&apos;ll email you as
                                soon as your invitation is ready.
                            </p>
                        </motion.div>

                        {flashSuccess && (
                            <motion.div
                                variants={fadeUp}
                                className="flex items-center gap-3 rounded-2xl border border-accent-gold/30 bg-accent-gold/10 px-5 py-4 text-sm text-text-primary"
                            >
                                <CheckCircle2 size={18} className="shrink-0 text-accent-gold" />
                                <span>{flashSuccess}</span>
                            </motion.div>
                        )}

                        <motion.form
                            variants={fadeUp}
                            onSubmit={submit}
                            className="space-y-5 rounded-3xl border border-white/5 bg-surface/30 p-6 md:p-8"
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-1.5 block text-xs font-bold tracking-widest text-text-muted uppercase"
                                >
                                    Full name
                                </label>
                                <input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Amaka Okafor"
                                    required
                                    className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:outline-none"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-xs font-bold tracking-widest text-text-muted uppercase"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:outline-none"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-gold px-8 py-4 text-sm font-semibold text-bg-dark transition hover:bg-accent-gold/90 disabled:opacity-50"
                            >
                                <Mail size={16} />
                                {processing ? 'Joining…' : 'Request invitation'}
                            </button>
                            <p className="text-center text-xs text-text-muted">
                                One email when your invite is ready. No spam,
                                no sharing your address.
                            </p>
                        </motion.form>
                    </motion.div>
                </div>
            </section>
        </GuestLayout>
    );
}
