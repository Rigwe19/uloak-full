import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    Loader,
    Plus,
    Trash2,
    Upload,
    User as UserIcon,
    X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function resolveMediaUrl(url: string | null): string | null {
    if (!url) {
        return null;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    if (url.startsWith('/storage/') || url.startsWith('storage/')) {
        return url.startsWith('/') ? url : `/${url}`;
    }
    if (url.startsWith('media/')) {
        return `/storage/${url}`;
    }
    return url;
}

interface Story {
    id: number;
    title: string;
    type: string;
    description: string;
    author: string;
    thumbnail: string | null;
    file_url: string | null;
    assets: any[];
    room_member_id: number | null;
    comments: any[];
    comments_count: number;
    follow_ups: any[];
    date: string;
    tags: string[];
}

interface Props {
    room: {
        id: number;
        slug: string;
        name: string;
        description: string | null;
        thumbnail: string | null;
        room_type: string | null;
    };
    stories: Story[];
    member: {
        id: number;
        name: string;
        email: string;
        relationship: string | null;
    };
}

export default function FamilyRoomShow({ room, stories, member }: Props) {
    const [isAnnexModalOpen, setIsAnnexModalOpen] = useState(false);
    const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
    const [deleting, setDeleting] = useState(false);
    const confirmDeleteStory = useCallback(() => {
        if (!storyToDelete) {
            return;
        }

        setDeleting(true);
        router.delete(
            `/family/rooms/${room.slug}/stories/${storyToDelete.id}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setStoryToDelete(null);
                    router.visit(window.location.pathname, {
                        only: ['stories'],
                        preserveScroll: true,
                        preserveState: true,
                    });
                },
                onFinish: () => setDeleting(false),
            },
        );
    }, [storyToDelete, room.slug]);

    return (
        <>
            <Head title={room.name} />

            <div className="min-h-screen bg-bg-dark">
                {/* Atmosphere background */}
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                    {room.thumbnail && (
                        <motion.img
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.1 }}
                            transition={{ duration: 2 }}
                            src={room.thumbnail}
                            className="h-full w-full object-cover blur-[100px]"
                        />
                    )}
                </div>

                <main className="relative z-10 mx-auto max-w-7xl p-5 pb-32 md:p-8 lg:p-16">
                    {/* Header */}
                    <header className="mb-12">
                        <div className="mb-8 flex items-center justify-between">
                            <Link
                                href="/family/dashboard"
                                className="group inline-flex items-center gap-2 text-text-muted transition-colors hover:text-text-primary"
                            >
                                <ArrowLeft
                                    size={18}
                                    className="transition-transform group-hover:-translate-x-1"
                                />
                                <span className="text-sm font-bold tracking-widest uppercase">
                                    Rooms
                                </span>
                            </Link>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="rounded-full border border-accent-gold/20 bg-accent-gold/5 px-3 py-1 text-[10px] font-bold tracking-widest text-accent-gold uppercase">
                                    {member.relationship ?? 'Family Member'}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-6xl">
                                {room.name}
                            </h1>
                            {room.description && (
                                <p className="max-w-2xl text-lg text-text-muted">
                                    {room.description}
                                </p>
                            )}
                        </div>
                    </header>

                    {/* Stories Section */}
                    <section>
                        <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
                            <h2 className="text-sm font-bold tracking-widest text-text-muted uppercase">
                                Memories ({stories.length})
                            </h2>
                            <button
                                onClick={() => setIsAnnexModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-accent-gold/10 px-4 py-2.5 text-xs font-bold tracking-widest text-accent-gold uppercase transition-all hover:bg-accent-gold/20"
                            >
                                <Plus size={14} />
                                Add Memory
                            </button>
                        </div>

                        {stories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-surface/20 px-6 py-20 text-center">
                                <Upload
                                    size={40}
                                    className="mb-4 text-text-muted/50"
                                />
                                <p className="text-lg text-text-muted">
                                    No memories yet.
                                </p>
                                <p className="mt-2 text-sm text-text-muted">
                                    Be the first to share a memory in this room.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {stories.map((story, i) => (
                                    <motion.div
                                        key={story.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group relative overflow-hidden rounded-3xl border border-white/5 bg-surface/40 transition-all duration-500 hover:border-accent-gold/20"
                                    >
                                        {story.thumbnail && (
                                            <div className="aspect-4/3 overflow-hidden">
                                                <img
                                                    src={resolveMediaUrl(story.thumbnail) ?? '/logo-stacked.png'}
                                                    alt={story.title}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/logo-stacked.png';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                                                    {story.type}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-text-primary transition-colors group-hover:text-accent-gold">
                                                {story.title}
                                            </h3>
                                            {story.description && (
                                                <p className="mt-2 line-clamp-2 text-sm text-text-muted italic">
                                                    "{story.description}"
                                                </p>
                                            )}
                                            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon
                                                        size={12}
                                                        className="text-accent-gold"
                                                    />
                                                    {story.author}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <Clock
                                                            size={12}
                                                            className="text-accent-gold"
                                                        />
                                                        {story.date}
                                                    </span>
                                                    {story.room_member_id ===
                                                        member.id && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setStoryToDelete(
                                                                    story,
                                                                );
                                                            }}
                                                            className="text-text-muted transition-colors hover:text-red-400"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>

                {/* Add Memory Modal */}
                <AnimatePresence>
                    {isAnnexModalOpen && (
                        <AddMemoryModal
                            room={room}
                            member={member}
                            onClose={() => setIsAnnexModalOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                {createPortal(
                    <AnimatePresence>
                        {storyToDelete && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-150 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                                onClick={() => setStoryToDelete(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="space-y-4 text-center">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                                            <Trash2
                                                size={24}
                                                className="text-red-400"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary">
                                                Delete Memory?
                                            </h3>
                                            <p className="mt-1 text-sm text-text-muted">
                                                This action cannot be undone.
                                            </p>
                                        </div>
                                        {storyToDelete && (
                                            <p className="rounded-xl border border-white/5 bg-bg-dark/40 px-3 py-2 text-xs text-text-muted italic">
                                                "{storyToDelete.title}"
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-6 flex gap-3">
                                        <button
                                            onClick={() =>
                                                setStoryToDelete(null)
                                            }
                                            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold tracking-widest text-text-muted uppercase transition-all hover:text-text-primary"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDeleteStory}
                                            disabled={deleting}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-red-600"
                                        >
                                            {deleting && (
                                                <Loader
                                                    size={14}
                                                    className="animate-spin"
                                                />
                                            )}
                                            {deleting ? 'Deleting' : 'Delete'}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
            </div>
        </>
    );
}

function AddMemoryModal({
    room,
    member,
    onClose,
}: {
    room: Props['room'];
    member: Props['member'];
    onClose: () => void;
}) {
    const [type, setType] = useState<'photo' | 'video' | 'audio'>('photo');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        type: 'photo' as string,
        files: [] as File[],
    });

    const handleTypeChange = (newType: string) => {
        setType(newType as 'photo' | 'video' | 'audio');
        setData('type', newType);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setData('files', files);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/family/rooms/${room.slug}/stories`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-lg rounded-3xl border border-white/10 bg-surface p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-text-primary">
                        Share a Memory
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted transition-colors hover:text-text-primary"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type selector */}
                    <div>
                        <label className="mb-2 block text-xs font-bold tracking-widest text-text-muted uppercase">
                            Memory Type
                        </label>
                        <div className="flex gap-2">
                            {['photo', 'video', 'audio'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => handleTypeChange(t)}
                                    className={`flex-1 rounded-xl border px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all ${
                                        type === t
                                            ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                                            : 'border-white/10 text-text-muted hover:border-accent-gold/40'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="mb-2 block text-xs font-bold tracking-widest text-text-muted uppercase">
                            Title
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Give this memory a title..."
                            className="w-full rounded-xl border border-white/10 bg-bg-dark px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-gold/40 focus:outline-none"
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-400">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-2 block text-xs font-bold tracking-widest text-text-muted uppercase">
                            Description
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Tell the story behind this memory..."
                            rows={3}
                            className="w-full resize-none rounded-xl border border-white/10 bg-bg-dark px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-gold/40 focus:outline-none"
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-red-400">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* File upload */}
                    <div>
                        <label className="mb-2 block text-xs font-bold tracking-widest text-text-muted uppercase">
                            Upload{' '}
                            {type === 'photo'
                                ? 'Photos'
                                : type === 'video'
                                  ? 'Videos'
                                  : 'Audio'}
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-bg-dark px-6 py-8 transition-all hover:border-accent-gold/40"
                        >
                            <Upload
                                size={24}
                                className="mb-2 text-text-muted"
                            />
                            <span className="text-xs text-text-muted">
                                Click to select files
                            </span>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={
                                type === 'photo'
                                    ? 'image/*'
                                    : type === 'video'
                                      ? 'video/*'
                                      : 'audio/*'
                            }
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {data.files.length > 0 && (
                            <p className="mt-2 text-xs text-text-muted">
                                {data.files.length} file(s) selected
                            </p>
                        )}
                        {errors.files && (
                            <p className="mt-1 text-xs text-red-400">
                                {errors.files}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-accent-gold px-6 py-3 text-xs font-bold tracking-widest text-bg-dark uppercase transition-all hover:bg-accent-gold/90 disabled:opacity-50"
                    >
                        {processing ? 'Sharing...' : 'Share Memory'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}
