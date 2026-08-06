import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Image, User as UserIcon } from 'lucide-react';
import { dashboard } from '@/routes/client';

interface Story {
    id: number;
    uuid?: string;
    title: string;
    type: string;
    description: string;
    author: string;
    thumbnail: string | null;
    file_url: string | null;
    date: string;
}

interface Props {
    room: {
        id: number;
        slug: string;
        name: string;
        description: string | null;
        thumbnail: string | null;
        stories_count: number;
        room_type: string | null;
    };
    stories: Story[];
}

export default function ClientRoomShow({ room, stories }: Props) {
    return (
        <div className="min-h-screen bg-bg-dark">
            <Head title={`${room.name} - Ulo of Stories`} />

            <div className="mx-auto max-w-7xl p-5 pb-32 md:p-8 lg:p-16">
                <header className="mb-12">
                    <Link href={dashboard().url} className="group mb-8 inline-flex items-center gap-2 text-text-muted transition-colors hover:text-text-primary">
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-bold tracking-widest uppercase">Client Dashboard</span>
                    </Link>

                    <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase">Project</span>
                            <h1 className="text-4xl font-bold text-text-primary md:text-6xl">{room.name}</h1>
                            {room.description && (
                                <p className="max-w-2xl text-lg text-text-muted">{room.description}</p>
                            )}
                            <span className="block text-xs font-bold tracking-widest text-accent-gold uppercase">
                                {room.stories_count} Memories
                            </span>
                        </div>
                    </div>
                </header>

                {stories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-white/10 py-24">
                        <Image size={40} className="mb-4 text-text-muted/50" />
                        <p className="text-sm text-text-muted">No memories in this project yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {stories.map((story) => (
                            <div key={story.id} className="group surface-glow flex flex-col overflow-hidden rounded-[32px] border border-white/5 bg-surface/40 transition-all duration-500 hover:border-accent-gold/20">
                                <div className="relative aspect-4/3 overflow-hidden">
                                    <img src={story.thumbnail ?? '/logo-stacked.png'} alt={story.title} onError={(e) => {
 e.currentTarget.src = '/logo-stacked.png'; 
}} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                    <div className="absolute top-4 left-4 rounded-full border border-white/10 bg-bg-dark/60 px-3 py-1 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">{story.type}</div>
                                </div>
                                <div className="flex grow flex-col justify-between gap-4 p-6">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-text-primary">{story.title}</h3>
                                        {story.description && <p className="line-clamp-2 text-sm italic text-text-muted">"{story.description}"</p>}
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/5 pt-4 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        <span className="flex items-center gap-1"><UserIcon size={12} className="text-accent-gold" /> {story.author}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} className="text-accent-gold" /> {story.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}