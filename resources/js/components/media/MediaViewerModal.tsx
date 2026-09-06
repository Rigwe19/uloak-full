import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Download,
    FileIcon,
    FileText,
    Music,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { VideoPlayer } from '@/components/media/VideoPlayer';

const SWIPE_THRESHOLD = 60;

function ExpandableText({
    text,
    clampLines = 2,
    className = '',
    quote = false,
}: {
    text: string;
    clampLines?: number;
    className?: string;
    quote?: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        setExpanded(false);
    }, [text]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const check = () => setIsOverflowing(el.scrollHeight > el.clientHeight + 4);
        check();
        const ro = new ResizeObserver(check);
        ro.observe(el);
        return () => ro.disconnect();
    }, [text, clampLines, expanded]);

    return (
        <div className={className}>
            <p
                ref={ref}
                className={`text-sm leading-relaxed text-white/70 ${quote ? 'italic' : ''} ${!expanded ? `line-clamp-${clampLines}` : ''}`}
                style={!expanded ? { display: '-webkit-box', WebkitLineClamp: clampLines, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any : undefined}
            >
                {quote ? `"${text}"` : text}
            </p>
            {isOverflowing && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-1.5 cursor-pointer text-xs font-bold tracking-wide text-white/90 underline decoration-white/30 underline-offset-4 hover:text-white"
                >
                    {expanded ? 'Show less' : 'Read more'}
                </button>
            )}
        </div>
    );
}

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
    const touchStartY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const story = stories[currentIdx];
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx < stories.length - 1;

    const mediaUrl = story?.file_url || story?.assets?.[0]?.url || null;
    const isDocument =
        story?.type === 'document' || story?.type === 'collection';

    const goNext = useCallback(() => {
        if (hasNext) setCurrentIdx((p) => p + 1);
    }, [hasNext]);
    const goPrev = useCallback(() => {
        if (hasPrev) setCurrentIdx((p) => p - 1);
    }, [hasPrev]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    }, []);
    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-caption]')) return;
            const dy = e.changedTouches[0].clientY - touchStartY.current;
            if (Math.abs(dy) > SWIPE_THRESHOLD) {
                if (dy < 0) goNext();
                else goPrev();
            }
        },
        [goNext, goPrev],
    );

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
            if (e.key === 'ArrowLeft' && hasPrev) setCurrentIdx((p) => p - 1);
            if (e.key === 'ArrowRight' && hasNext) setCurrentIdx((p) => p + 1);
            if (e.key === 'ArrowUp' && hasPrev) setCurrentIdx((p) => p - 1);
            if (e.key === 'ArrowDown' && hasNext) setCurrentIdx((p) => p + 1);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, hasPrev, hasNext]);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if ((e.target as HTMLElement).closest('[data-caption]')) return;
            e.preventDefault();
            if (e.deltaY > 0) goNext();
            else if (e.deltaY < 0) goPrev();
        };
        const el = containerRef.current;
        if (el) el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el?.removeEventListener('wheel', handleWheel);
    }, [goNext, goPrev]);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    if (!story) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                ref={containerRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[120] flex flex-col bg-black/95 backdrop-blur-xl"
                style={{ overscrollBehavior: 'none' } as any}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Top bar */}
                <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 md:p-6">
                    <div className="rounded-full bg-white/10 px-4 py-2 font-mono text-xs tracking-wider text-white/80 backdrop-blur-md">
                        {currentIdx + 1} / {stories.length}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav arrows - desktop */}
                {hasPrev && (
                    <button
                        onClick={goPrev}
                        className="absolute top-1/2 left-4 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white/60 transition-all hover:bg-white/20 hover:text-white md:flex"
                    >
                        <ChevronLeft size={28} />
                    </button>
                )}
                {hasNext && (
                    <button
                        onClick={goNext}
                        className="absolute top-1/2 right-4 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white/60 transition-all hover:bg-white/20 hover:text-white md:flex"
                    >
                        <ChevronRight size={28} />
                    </button>
                )}

                {/* Swipe hints like feed */}
                {!hasPrev ? null : (
                    <div className="pointer-events-none absolute top-16 left-1/2 z-10 hidden -translate-x-1/2 md:block">
                        <ChevronUp size={18} className="text-white/30" />
                    </div>
                )}
                {!hasNext ? (
                    <div className="pointer-events-none absolute bottom-20 left-1/2 z-10 -translate-x-1/2">
                        <p className="text-xs whitespace-nowrap text-white/30">End of memories</p>
                    </div>
                ) : (
                    <div className="pointer-events-none absolute bottom-20 left-1/2 z-10 hidden -translate-x-1/2 md:block">
                        <ChevronDown size={18} className="animate-bounce text-white/30" />
                    </div>
                )}

                {/* Scrollable content — like feed: flex-1 + overflow-y-auto */}
                <div className="flex flex-1 flex-col items-center overflow-y-auto overscroll-contain px-4 pt-20 pb-6 md:px-16 md:pt-16">
                    {/* Fixed-height header — truncated like Facebook */}
                    <div className="mb-4 w-full max-w-3xl shrink-0 text-center" data-caption>
                        <ExpandableText
                            text={story.title}
                            clampLines={2}
                            className="text-lg font-bold text-white md:text-xl"
                        />
                        {(story.author || story.date) && (
                            <p className="mt-1.5 text-xs text-white/40">
                                {[story.author, story.date].filter(Boolean).join(' · ')}
                            </p>
                        )}
                    </div>

                    {/* Media — fixed height so caption never pushes it offscreen */}
                    <div className="flex w-full max-w-4xl shrink-0 items-center justify-center">
                        {story.type === 'video' && mediaUrl ? (
                            <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
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
                                    className="max-h-[56vh] w-full md:max-h-[60vh]"
                                    videoClassName="w-full max-h-[56vh] md:max-h-[60vh] object-contain"
                                />
                            </div>
                        ) : story.type === 'audio' && mediaUrl ? (
                            <div className="w-full max-w-lg">
                                <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-8">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent-gold/40 bg-accent-gold/20">
                                        <Music size={40} className="text-accent-gold" />
                                    </div>
                                    <audio src={mediaUrl} controls autoPlay className="w-full" />
                                </div>
                            </div>
                        ) : story.type === 'photo' && mediaUrl ? (
                            <div className="relative max-h-[56vh] max-w-full md:max-h-[60vh]">
                                <img
                                    src={mediaUrl}
                                    alt={story.title}
                                    className="max-h-[56vh] max-w-full rounded-2xl object-contain shadow-2xl md:max-h-[60vh]"
                                />
                                <a
                                    href={mediaUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60"
                                    title="Download"
                                >
                                    <Download size={16} />
                                </a>
                            </div>
                        ) : isDocument ? (
                            <div className="w-full max-w-lg text-center">
                                <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-12">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-accent-gold/30 bg-accent-gold/10">
                                        <FileIcon size={40} className="text-accent-gold" />
                                    </div>
                                    <ExpandableText text={story.title} clampLines={2} className="text-lg font-bold text-white" />
                                    {mediaUrl && (
                                        <a
                                            href={mediaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-xl bg-accent-gold px-6 py-3 font-mono text-xs font-bold tracking-widest text-bg-dark uppercase hover:bg-accent-gold/80"
                                        >
                                            <Download size={14} /> View Document
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-lg text-center">
                                <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-12">
                                    <FileText size={48} className="text-white/30" />
                                    <p className="text-white/50">No media available for this story.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fixed-height caption — Facebook style: 2 lines + Read more, never covers image */}
                    {story.description && (
                        <div
                            data-caption
                            className="mt-4 w-full max-w-2xl shrink-0 rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3 backdrop-blur-sm"
                        >
                            <ExpandableText text={story.description} clampLines={2} quote className="text-center" />
                        </div>
                    )}

                    {/* Scroll hint spacer like feed */}
                    <div className="h-6 shrink-0 md:hidden" />
                </div>

                {/* Mobile swipe areas */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-20 md:hidden" />
            </motion.div>
        </AnimatePresence>
    );
}
