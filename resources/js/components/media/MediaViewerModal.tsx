import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    FileIcon,
    FileText,
    Music,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { VideoPlayer } from '@/components/media/VideoPlayer';

interface MediaViewerModalProps {
    stories: any[];
    initialIndex: number;
    onClose: () => void;
}

export function MediaViewerModal({
    stories,
    initialIndex,
    onClose,
}: MediaViewerModalProps) {
    const [currentIdx, setCurrentIdx] = useState(initialIndex);

    const story = stories[currentIdx];
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx < stories.length - 1;

    const mediaUrl = story?.file_url || story?.assets?.[0]?.url || null;
    const isDocument =
        story?.type === 'document' || story?.type === 'collection';

    // Preload adjacent images for instant navigation
    useEffect(() => {
        const urls: string[] = [];

        for (const offset of [-2, -1, 1, 2]) {
            const idx = currentIdx + offset;

            if (idx >= 0 && idx < stories.length) {
                const s = stories[idx];
                const url = s?.file_url || s?.assets?.[0]?.url || null;

                if (
                    url &&
                    (s?.type === 'photo' ||
                        (!s?.type?.startsWith('video') &&
                            !s?.type?.startsWith('audio')))
                ) {
                    urls.push(url);
                }
            }
        }

        urls.forEach((url) => {
            const img = new Image();
            img.src = url;
        });
    }, [currentIdx, stories]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }

            if (e.key === 'ArrowLeft' && hasPrev) {
                setCurrentIdx((p) => p - 1);
            }

            if (e.key === 'ArrowRight' && hasNext) {
                setCurrentIdx((p) => p + 1);
            }
        };
        window.addEventListener('keydown', handleKey);

        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, hasPrev, hasNext]);

    if (!story) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-xl"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white"
                >
                    <X size={24} />
                </button>

                <div className="absolute top-6 left-6 z-10 rounded-full bg-white/10 px-4 py-2 font-mono text-xs tracking-wider text-white/80 backdrop-blur-md">
                    {currentIdx + 1} / {stories.length}
                </div>

                {hasPrev && (
                    <button
                        onClick={() => setCurrentIdx((p) => p - 1)}
                        className="absolute top-1/2 left-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white"
                    >
                        <ChevronLeft size={28} />
                    </button>
                )}

                {hasNext && (
                    <button
                        onClick={() => setCurrentIdx((p) => p + 1)}
                        className="absolute top-1/2 right-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white"
                    >
                        <ChevronRight size={28} />
                    </button>
                )}

                <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 md:px-16">
                    <div className="mb-6 w-full text-center">
                        <h3 className="text-xl font-bold text-white md:text-2xl">
                            {story.title}
                        </h3>
                        <p className="mt-1 text-sm text-white/50">
                            {story.author} · {story.date}
                        </p>
                    </div>

                    <div className="flex w-full items-center justify-center">
                        {story.type === 'video' && mediaUrl ? (
                            <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
                                <VideoPlayer
                                    video={{
                                        id: story.id,
                                        storyId: story.id,
                                        title: story.title,
                                        url: mediaUrl,
                                        thumbnail: story.thumbnail || null,
                                        preview: null,
                                        sprite: null,
                                    }}
                                    autoPlay
                                    showControls
                                    showSpeedControl
                                    showPip
                                    showVolumeSlider
                                    className="max-h-[60vh] w-full"
                                    videoClassName="w-full max-h-[60vh] object-contain"
                                />
                            </div>
                        ) : story.type === 'audio' && mediaUrl ? (
                            <div className="w-full max-w-lg">
                                <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-8">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent-gold/40 bg-accent-gold/20">
                                        <Music
                                            size={40}
                                            className="text-accent-gold"
                                        />
                                    </div>
                                    <audio
                                        src={mediaUrl}
                                        controls
                                        autoPlay
                                        className="w-full"
                                    />
                                    {story.description && (
                                        <p className="text-center text-sm text-white/60 italic">
                                            "{story.description}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : story.type === 'photo' && mediaUrl ? (
                            <div className="relative max-h-[65vh] max-w-full">
                                <img
                                    src={mediaUrl}
                                    alt={story.title}
                                    className="max-h-[65vh] max-w-full rounded-2xl object-contain shadow-2xl"
                                />
                                {/* Download button overlay */}
                                <a
                                    href={mediaUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60"
                                    title="Download"
                                >
                                    <Download size={18} />
                                </a>
                            </div>
                        ) : isDocument ? (
                            <div className="w-full max-w-lg text-center">
                                <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-12">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-accent-gold/30 bg-accent-gold/10">
                                        <FileIcon
                                            size={40}
                                            className="text-accent-gold"
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">
                                        {story.title}
                                    </h3>
                                    {story.description && (
                                        <p className="text-sm text-white/60 italic">
                                            "{story.description}"
                                        </p>
                                    )}
                                    {mediaUrl && (
                                        <a
                                            href={mediaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-xl bg-accent-gold px-6 py-3 font-mono text-xs font-bold tracking-widest text-bg-dark uppercase transition-all hover:bg-accent-gold/80"
                                        >
                                            <Download size={14} /> View Document
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-lg text-center">
                                <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-12">
                                    <FileText
                                        size={48}
                                        className="text-white/30"
                                    />
                                    <p className="text-white/50">
                                        No media available for this story.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {story.description && story.type !== 'audio' && (
                        <p className="mt-6 max-w-2xl text-center text-sm text-white/50 italic">
                            "{story.description}"
                        </p>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
