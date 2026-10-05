import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clapperboard, Crown, Lock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/animations';
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
    title: string;
    locked: boolean;
    isGuest: boolean;
    isVipViewer: boolean;
    featured: WatchStory[];
    stories: WatchStory[];
    teasers: WatchStory[];
    stats: { normal: number; vip: number };
}

function LockedTeaserCard({ story }: { story: WatchStory }) {
    const vip = story.visibility === 'vip';

    return (
        <Link
            href="/pricing"
            className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface/50 p-5 transition-all hover:border-accent-gold/30"
        >
            <div className="flex items-start justify-between gap-3">
                <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase ${
                        vip ? 'text-accent-gold' : 'text-text-muted'
                    }`}
                >
                    {vip ? <Crown size={12} /> : <Clapperboard size={12} />}
                    {vip ? 'VIP' : 'Story'}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-colors group-hover:border-accent-gold/40 group-hover:text-accent-gold">
                    <Lock size={14} />
                </span>
            </div>
            <h3 className="mt-3 font-serif text-lg leading-snug font-semibold text-text-primary">
                {story.title}
            </h3>
            <p className="mt-1 text-xs text-text-muted">
                {story.creator ?? 'Ulo creator'}
            </p>
            <p className="mt-3 text-xs font-semibold tracking-wide text-accent-gold uppercase opacity-0 transition-opacity group-hover:opacity-100">
                Unlock to watch
            </p>
        </Link>
    );
}

function LockedView({
    title,
    isGuest,
    teasers,
    stats,
}: Pick<Props, 'title' | 'isGuest' | 'teasers' | 'stats'>) {
    return (
        <GuestLayout>
            <Head title={title} />
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
                            <Clapperboard size={24} />
                        </motion.div>
                        <motion.h1
                            variants={fadeUp}
                            className="mt-6 font-serif text-4xl font-bold tracking-tight sm:text-5xl"
                        >
                            Stories worth watching
                        </motion.h1>
                        <motion.p
                            variants={fadeUp}
                            className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed font-light text-text-muted"
                        >
                            {stats.normal + stats.vip > 0
                                ? `Creators have shared ${stats.normal} ${stats.normal === 1 ? 'story' : 'stories'}${stats.vip > 0 ? `, including ${stats.vip} VIP ${stats.vip === 1 ? 'story' : 'stories'}` : ''}. Subscribe once to unlock them all.`
                                : 'Creators are preparing their first stories. Be ready when they drop — pick a viewer plan today.'}
                        </motion.p>
                        <motion.div
                            variants={fadeUp}
                            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
                        >
                            <Link href="/pricing">
                                <Button size="lg" className="font-semibold">
                                    See viewer plans
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
                            Coming up
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {teasers.slice(0, 6).map((story) => (
                                <LockedTeaserCard
                                    key={story.id}
                                    story={story}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </GuestLayout>
    );
}

export default function WatchIndex({
    title,
    locked,
    isGuest,
    isVipViewer,
    featured,
    stories,
    teasers,
    stats,
}: Props) {
    if (locked) {
        return (
            <LockedView
                title={title}
                isGuest={isGuest}
                teasers={teasers}
                stats={stats}
            />
        );
    }

    return (
        <AppLayout>
            <Head title={title} />
            <div className="space-y-10 p-6 md:p-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Watch</h1>
                    <p className="mt-2 text-sm opacity-70">
                        {isVipViewer
                            ? 'VIP access — VIP stories are pushed to you first.'
                            : 'Standard viewer access — upgrade to VIP to unlock VIP stories.'}
                    </p>
                    {!isVipViewer && (
                        <Link href="/pricing" className="mt-4 inline-block underline">
                            Upgrade to Viewer VIP
                        </Link>
                    )}
                </div>

                {featured.length > 0 && (
                    <section>
                        <h2 className="mb-4 text-xl font-semibold">Featured VIP stories</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {featured.map((s) => (
                                <article key={s.id} className="rounded-xl border p-4">
                                    <span className="text-xs font-bold uppercase">VIP · Featured</span>
                                    <h3 className="mt-1 font-semibold">{s.title}</h3>
                                    <p className="text-xs opacity-60">{s.creator ?? 'Unknown creator'}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="mb-4 text-xl font-semibold">Latest stories</h2>
                    {stories.length === 0 ? (
                        <p className="text-sm opacity-60">No stories yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {stories.map((s) => (
                                <article key={s.id} className="rounded-xl border p-4">
                                    <h3 className="font-semibold">{s.title}</h3>
                                    <p className="text-xs opacity-60">{s.creator ?? 'Unknown creator'}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
