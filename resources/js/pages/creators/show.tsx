import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';

interface CreatorStory {
    id: number;
    uuid: string;
    title: string;
}

interface Props {
    title: string;
    creator: {
        name: string | null;
        ref_code: string;
        creator_type: string;
        is_vip: boolean;
    };
    stories: CreatorStory[];
}

export default function CreatorShow({ title, creator, stories }: Props) {
    return (
        <GuestLayout>
            <Head title={title} />
            <div className="mx-auto max-w-3xl space-y-8 px-6 py-24">
                <div>
                    <p className="text-xs font-bold uppercase opacity-60">
                        {creator.is_vip ? 'VIP Creator' : 'Creator'}
                    </p>
                    <h1 className="mt-1 text-3xl font-bold">{creator.name ?? 'Creator'}</h1>
                    <Link
                        href={`/pricing?ref=${creator.ref_code}`}
                        className="mt-4 inline-block rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white"
                    >
                        Subscribe via my link
                    </Link>
                </div>
                <section>
                    <h2 className="mb-3 text-xl font-semibold">Latest stories</h2>
                    {stories.length === 0 ? (
                        <p className="text-sm opacity-60">No public stories yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {stories.map((s) => (
                                <li key={s.id} className="rounded-xl border p-4">
                                    {s.title}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </GuestLayout>
    );
}
