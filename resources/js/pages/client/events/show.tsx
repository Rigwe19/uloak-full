import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Image, User as UserIcon, DownloadCloud, Loader } from 'lucide-react';
import { useState } from 'react';
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
    event: {
        id: number;
        slug: string;
        name: string;
        description: string | null;
        thumbnail: string | null;
        stories_count: number;
        event_date: string | null;
    };
    stories: Story[];
}

export default function ClientEventShow({ event, stories }: Props) {
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleDownloadRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/downloads/request', {
            email,
            type: 'event',
            slug: event.slug,
        }, {
            onSuccess: () => setShowDownloadModal(false),
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="min-h-screen bg-bg-dark">
            <Head title={`${event.name} - Uloak`} />

            <div className="mx-auto max-w-7xl p-5 pb-32 md:p-8 lg:p-16">
                <header className="mb-12">
                    <Link href={dashboard().url} className="group mb-8 inline-flex items-center gap-2 text-text-muted transition-colors hover:text-text-primary">
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-bold tracking-widest uppercase">Client Dashboard</span>
                    </Link>

                    <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase">Event</span>
                            <h1 className="text-4xl font-bold text-text-primary md:text-6xl">{event.name}</h1>
                            {event.description && <p className="max-w-2xl text-lg text-text-muted">{event.description}</p>}
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold tracking-widest text-accent-gold uppercase">{event.stories_count} Memories</span>
                                {event.event_date && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-accent-gold uppercase">
                                        <Calendar size={12} /> {new Date(event.event_date).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowDownloadModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl border border-accent-gold/20 hover:border-accent-gold/40 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-accent-gold transition-all"
                        >
                            <DownloadCloud size={14} />
                            Download All
                        </button>
                    </div>
                </header>

                {stories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-white/10 py-24">
                        <Image size={40} className="mb-4 text-text-muted/50" />
                        <p className="text-sm text-text-muted">No memories in this event yet.</p>
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

            {/* Email download modal */}
            {showDownloadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface p-6">
                        <h3 className="text-lg font-bold text-text-primary">Download All Media</h3>
                        <p className="mt-1 text-sm text-text-muted">Enter your email and we'll send you a download link.</p>
                        <form onSubmit={handleDownloadRequest} className="mt-4 space-y-3">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-white/10 bg-bg-dark px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted"
                            />
                            <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent-gold px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-bg-dark">
                                {submitting && <Loader size={14} className="animate-spin" />}
                                {submitting ? 'Sending...' : 'Send Link'}
                            </button>
                        </form>
                        <button onClick={() => setShowDownloadModal(false)} className="mt-3 w-full text-center text-xs text-text-muted">Cancel</button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
