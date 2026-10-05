import { Head } from '@inertiajs/react';
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

export default function WatchFeatured({ stories }: { stories: WatchStory[] }) {
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
