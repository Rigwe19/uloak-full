import { Head, Link } from '@inertiajs/react';
import { LogOut } from 'lucide-react';

interface Room {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    thumbnail: string | null;
    stories_count: number;
    room_type: string | null;
}

interface Props {
    rooms: Room[];
    memberName: string;
    memberEmail: string;
}

export default function FamilyDashboard({ rooms, memberName, memberEmail }: Props) {
    return (
        <>
            <Head title="My Rooms" />

            <div className="min-h-screen bg-bg-dark">
                {/* Simple header */}
                <header className="border-b border-white/5">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-xl font-bold tracking-tight text-text-primary">
                                Ulo of Stories
                            </Link>
                            <span className="rounded-full border border-accent-gold/20 bg-accent-gold/5 px-3 py-1 text-[10px] font-bold tracking-widest text-accent-gold uppercase">
                                Family
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-text-muted">{memberName}</span>
                            <a
                                href="/family/logout"
                                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold tracking-widest text-text-muted uppercase transition-all hover:border-red-500/30 hover:text-red-400"
                            >
                                <LogOut size={14} />
                                Leave
                            </a>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-16">
                    <div className="mb-12">
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-5xl">
                            Welcome, {memberName}
                        </h1>
                        <p className="mt-3 text-text-muted">
                            Here are the rooms you have access to.
                        </p>
                    </div>

                    {rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-surface/20 px-6 py-20 text-center">
                            <p className="text-lg text-text-muted">No rooms shared with you yet.</p>
                            <p className="mt-2 text-sm text-text-muted">
                                When a family member adds you to their room, it will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {rooms.map((room) => (
                                <Link
                                    key={room.id}
                                    href={`/family/rooms/${room.slug}`}
                                    className="group relative overflow-hidden rounded-3xl border border-white/5 bg-surface/40 transition-all duration-500 hover:border-accent-gold/20"
                                >
                                    {room.thumbnail ? (
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={room.thumbnail}
                                                alt={room.name}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video flex items-center justify-center bg-surface/60">
                                            <span className="text-4xl font-bold text-accent-gold/30">
                                                {room.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold text-text-primary transition-colors group-hover:text-accent-gold">
                                            {room.name}
                                        </h2>
                                        {room.description && (
                                            <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                                                {room.description}
                                            </p>
                                        )}
                                        <div className="mt-4 flex items-center gap-3 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            <span>{room.stories_count} memories</span>
                                            {room.room_type && (
                                                <>
                                                    <span className="h-1 w-1 rounded-full bg-white/10" />
                                                    <span>{room.room_type}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}