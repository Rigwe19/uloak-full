import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Film, Image, MapPin, LogOut } from 'lucide-react';
import { logout as logoutRoute } from '@/routes/client';
import { show as showEvent } from '@/routes/client/events';
import { show as showRoom } from '@/routes/client/rooms';

interface ClientRoom {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    thumbnail: string | null;
    stories_count: number;
    room_type: string | null;
}

interface ClientEvent {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    thumbnail: string | null;
    stories_count: number;
    event_date: string | null;
}

interface Props {
    client_name: string;
    rooms: ClientRoom[];
    events: ClientEvent[];
}

export default function ClientDashboard({ client_name, rooms, events }: Props) {
    return (
        <div className="min-h-screen bg-bg-dark">
            <Head title="Client Dashboard" />

            <div className="mx-auto max-w-7xl p-5 pb-32 md:p-8 lg:p-16">
                {/* Header */}
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-semibold tracking-widest text-accent-gold uppercase">
                            Client Portal
                        </span>
                        <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-5xl">
                            Welcome, {client_name}
                        </h1>
                        <p className="mt-2 text-text-muted">
                            Browse your projects and events.
                        </p>
                    </div>
                    <form action={logoutRoute().url} method="POST" className="hidden md:block">
                        <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''} />
                        <button type="submit" className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold tracking-widest text-text-muted uppercase transition-all hover:border-red-500/30 hover:text-red-400">
                            <LogOut size={14} /> Logout
                        </button>
                    </form>
                </header>

                {/* My Projects */}
                <section className="mb-16">
                    <div className="mb-8 flex items-center gap-3">
                        <h2 className="text-xl font-bold text-text-primary md:text-2xl">My Projects</h2>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-gold/20 text-[10px] text-accent-gold">{rooms.length}</span>
                    </div>

                    {rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-white/10 py-16">
                            <MapPin size={40} className="mb-4 text-text-muted/50" />
                            <p className="text-sm text-text-muted">No projects assigned yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {rooms.map((room) => (
                                <Link
                                    key={room.id}
                                    href={showRoom.url(room.slug)}
                                    className="group surface-glow flex flex-col overflow-hidden rounded-[32px] border border-white/5 bg-surface/40 transition-all duration-500 hover:border-accent-gold/20"
                                >
                                    <div className="relative aspect-video overflow-hidden">
                                        {room.thumbnail ? (
                                            <img src={room.thumbnail} alt={room.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-bg-dark">
                                                <Image size={32} className="text-text-muted/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex grow flex-col justify-between gap-4 p-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary transition-colors group-hover:text-accent-gold">{room.name}</h3>
                                            {room.description && (
                                                <p className="mt-1 line-clamp-2 text-sm text-text-muted">{room.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            <span>{room.stories_count} Memories</span>
                                            <span className="text-accent-gold">View Project</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* My Events */}
                <section>
                    <div className="mb-8 flex items-center gap-3">
                        <h2 className="text-xl font-bold text-text-primary md:text-2xl">My Events</h2>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-gold/20 text-[10px] text-accent-gold">{events.length}</span>
                    </div>

                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-white/10 py-16">
                            <Calendar size={40} className="mb-4 text-text-muted/50" />
                            <p className="text-sm text-text-muted">No events assigned yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => (
                                <Link
                                    key={event.id}
                                    href={showEvent.url(event.slug)}
                                    className="group surface-glow flex flex-col overflow-hidden rounded-[32px] border border-white/5 bg-surface/40 transition-all duration-500 hover:border-accent-gold/20"
                                >
                                    <div className="relative aspect-video overflow-hidden">
                                        {event.thumbnail ? (
                                            <img src={event.thumbnail} alt={event.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-bg-dark">
                                                <Calendar size={32} className="text-text-muted/30" />
                                            </div>
                                        )}
                                        {event.event_date && (
                                            <div className="absolute top-4 left-4 rounded-full border border-white/10 bg-bg-dark/60 px-3 py-1 text-[10px] font-bold tracking-widest text-accent-gold uppercase backdrop-blur-md">
                                                {new Date(event.event_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex grow flex-col justify-between gap-4 p-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary transition-colors group-hover:text-accent-gold">{event.name}</h3>
                                            {event.description && (
                                                <p className="mt-1 line-clamp-2 text-sm text-text-muted">{event.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            <span>{event.stories_count} Memories</span>
                                            <span className="text-accent-gold">View Event</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Mobile Logout */}
                <div className="mt-12 block md:hidden">
                    <form action={logoutRoute().url} method="POST">
                        <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''} />
                        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-4 text-xs font-bold tracking-widest text-text-muted uppercase transition-all hover:border-red-500/30 hover:text-red-400">
                            <LogOut size={14} /> Logout
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}