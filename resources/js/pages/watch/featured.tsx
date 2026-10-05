import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Crown, Lock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { login } from '@/routes';
import { Button } from '@/components/ui-elements';

interface WatchStory {
    id: number;
    uuid: string;
    title: string;
    visibility: string;
    is_featured: boolean;
    creator: string | null;
    created_at: string | null;
}

interface Props {
    locked: boolean;
    isGuest: boolean;
    stories: WatchStory[];
    teasers: WatchStory[];
    stats: { normal: number; vip: number };
}

function LockedVipView({ isGuest, teasers, stats }: Pick<Props, 'isGuest' | 'teasers' | 'stats'>) {
    return (
        <GuestLayout>
            <Head title="Featured VIP Stories" />
            <div className="bg-bg-dark text-text-primary">
                <section className="mx-auto max-w-5xl px-6 pt-32 pb-12 text-center md:px-8">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.div
                            variants={fadeUp}
                            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent-gold/20 bg-accent-gold/5 text-accent-gold"
                        >
                            <Crown size={24} />
                        </motion.div>
                        <motion.h1
                            variants={fadeUp}
                            className="mt-6 font-serif text-4xl font-bold tracking-tight sm:text-5xl"
                        >
                            VIP stories live here
                        </motion.h1>
                        <motion.p
                            variants={fadeUp}
                            className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed font-light text-text-muted"
                        >
                            {stats.vip > 0
                                ? `${stats.vip} VIP ${stats.vip === 1 ? 'story' : 'stories'} ${stats.vip === 1 ? 'is' : 'are'} waiting behind this door. A Viewer VIP plan unlocks every one.`
                                : 'VIP creators are preparing their first featured stories. Grab a Viewer VIP plan and be first in when they drop.'}
                        </motion.p>
                        <motion.div
                            variants={fadeUp}
                            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
                        >
                            <Link href="/pricing">
                                <Button size="lg" className="font-semibold">
                                    Get Viewer VIP
                                </Button>
                            </Link>
                            {isGuest && (
                                <Link href={login().url}>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="border-text-primary/10 font-semibold text-text-primary hover:bg-text-primary/5"
                                    >
                                        Sign in
                                    </Button>
                                </Link>
                            )}
                        </motion.div>
                    </motion.div>
                </section>

                {teasers.length > 0 && (
                    <section className="mx-auto max-w-5xl px-6 pb-24 md:px-8">
                        <h2 className="mb-5 text-center text-xs font-bold tracking-[0.3em] text-text-muted uppercase">
                            Behind the velvet rope
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {teasers.slice(0, 6).map((s) => (
                                <Link
                                    key={s.id}
                                    href="/pricing"
                                    className="group relative overflow-hidden rounded-2xl border border-accent-gold/25 bg-surface/50 p-5 transition-all hover:border-accent-gold/40"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-accent-gold uppercase">
                                            <Crown size={12} /> VIP
                                        </span>
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-colors group-hover:border-accent-gold/40 group-hover:text-accent-gold">
                                            <Lock size={14} />
                                        </span>
                                    </div>
                                    <h3 className="mt-3 font-serif text-lg leading-snug font-semibold text-text-primary">
                                        {s.title}
                                    </h3>
                                    <p className="mt-1 text-xs text-text-muted">
                                        {s.creator ?? 'Ulo creator'}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </GuestLayout>
    );
}

export default function WatchFeatured({ locked, isGuest, stories, teasers, stats }: Props) {
    if (locked) {
        return <LockedVipView isGuest={isGuest} teasers={teasers} stats={stats} />;
    }

    return (
        <AppLayout>
            <Head title="Featured VIP Stories" />
            <div className="space-y-6 p-6 md:p-10">
                <h1 className="text-3xl font-bold tracking-tight">Featured VIP stories</h1>
                {stories.length === 0 ? (
                    <p className="text-sm opacity-60">No VIP stories yet.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {stories.map((s) => (
                            <article key={s.id} className="rounded-xl border p-4">
                                <span className="text-xs font-bold uppercase">VIP · Featured</span>
                                <h3 className="mt-1 font-semibold">{s.title}</h3>
                                <p className="text-xs opacity-60">{s.creator ?? 'Unknown creator'}</p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
