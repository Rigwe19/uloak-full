import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, FileIcon, FileText, Music, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { VideoPlayer } from '@/components/media/VideoPlayer';

interface MediaViewerModalProps {
    stories: any[];
    initialIndex: number;
    onClose: () => void;
}

export function MediaViewerModal({ stories, initialIndex, onClose }: MediaViewerModalProps) {
    const [currentIdx, setCurrentIdx] = useState(initialIndex);

    const story = stories[currentIdx];
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx < stories.length - 1;

    const mediaUrl = story?.file_url || story?.assets?.[0]?.url || null;
    const isDocument = story?.type === 'document' || story?.type === 'collection';

    // Preload adjacent images for instant navigation
    useEffect(() => {
        const urls: string[] = [];

        for (const offset of [-2, -1, 1, 2]) {
            const idx = currentIdx + offset;

            if (idx >= 0 && idx < stories.length) {
                const s = stories[idx];
                const url = s?.file_url || s?.assets?.[0]?.url || null;

                if (url && (s?.type === 'photo' || (!s?.type?.startsWith('video') && !s?.type?.startsWith('audio')))) {
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
                    className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
                >
                    <X size={24} />
                </button>

                <div className="absolute top-6 left-6 z-10 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-mono tracking-wider text-white/80">
                    {currentIdx + 1} / {stories.length}
                </div>

                {hasPrev && (
                    <button
                        onClick={() => setCurrentIdx((p) => p - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                    >
                        <ChevronLeft size={28} />
                    </button>
                )}

                {hasNext && (
                    <button
                        onClick={() => setCurrentIdx((p) => p + 1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                    >
                        <ChevronRight size={28} />
                    </button>
                )}

                <div className="w-full max-w-5xl mx-auto px-4 md:px-16 flex flex-col items-center">
                    <div className="text-center mb-6 w-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white">{story.title}</h3>
                        <p className="text-sm text-white/50 mt-1">{story.author} · {story.date}</p>
                    </div>

                    <div className="w-full flex items-center justify-center">
                        {(story.type === 'video' && mediaUrl) ? (
                            <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl">
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
                                    className="w-full max-h-[60vh]"
                                    videoClassName="w-full max-h-[60vh] object-contain"
                                />
                            </div>
                        ) : (story.type === 'audio' && mediaUrl) ? (
                            <div className="w-full max-w-lg">
                                <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-24 h-24 rounded-full bg-accent-gold/20 border-2 border-accent-gold/40 flex items-center justify-center">
                                        <Music size={40} className="text-accent-gold" />
                                    </div>
                                    <audio src={mediaUrl} controls autoPlay className="w-full" />
                                    {story.description && <p className="text-sm text-white/60 italic text-center">"{story.description}"</p>}
                                </div>
                            </div>
                        ) : (story.type === 'photo' && mediaUrl) ? (
                            <div className="relative max-w-full max-h-[65vh]">
                                <img src={mediaUrl} alt={story.title} className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-2xl" />
                                {/* Download button overlay */}
                                <a
                                    href={mediaUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-black/60 transition-all backdrop-blur-sm"
                                    title="Download"
                                >
                                    <Download size={18} />
                                </a>
                            </div>
                        ) : isDocument ? (
                            <div className="w-full max-w-lg text-center">
                                <div className="flex flex-col items-center gap-6 p-12 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-24 h-24 rounded-2xl bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                                        <FileIcon size={40} className="text-accent-gold" />
                                    </div>
                                    <h3 className="text-lg text-white font-bold">{story.title}</h3>
                                    {story.description && <p className="text-sm text-white/60 italic">"{story.description}"</p>}
                                    {mediaUrl && (
                                        <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all inline-flex items-center gap-2">
                                            <Download size={14} /> View Document
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-lg text-center">
                                <div className="flex flex-col items-center gap-4 p-12 rounded-2xl bg-white/5 border border-white/10">
                                    <FileText size={48} className="text-white/30" />
                                    <p className="text-white/50">No media available for this story.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {story.description && story.type !== 'audio' && (
                        <p className="mt-6 text-sm text-white/50 italic text-center max-w-2xl">"{story.description}"</p>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}