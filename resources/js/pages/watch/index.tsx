import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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
    isVipViewer: boolean;
    featured: WatchStory[];
    stories: WatchStory[];
}

export default function WatchIndex({ title, isVipViewer, featured, stories }: Props) {
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
