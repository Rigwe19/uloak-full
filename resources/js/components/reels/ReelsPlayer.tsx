import { ChevronUp, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { FeedVideoData } from '@/types/feed';
import { ReelVideo } from './ReelVideo';
import { ReelsOverlay } from './ReelsOverlay';

const SWIPE_THRESHOLD = 60;

interface ReelsPlayerProps {
    videos: FeedVideoData[];
    currentIndex: number;
    hasMore: boolean;
    isFetching: boolean;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
}

export function ReelsPlayer({
    videos,
    currentIndex,
    hasMore,
    isFetching,
    onNext,
    onPrev,
    onClose,
}: ReelsPlayerProps) {
    const touchStartY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentVideo = videos[currentIndex];
    const nextVideo = videos[currentIndex + 1];

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (containerRef.current) {
            containerRef.current.style.overscrollBehavior = 'none';
        }
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        const dy = e.changedTouches[0].clientY - touchStartY.current;

        if (Math.abs(dy) > SWIPE_THRESHOLD) {
            if (dy < 0) {
                onNext();
            } else {
                onPrev();
            }
        }
    }, [onNext, onPrev]);

    useEffect(() => {
        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                onNext();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                onPrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNext, onPrev]);

    useEffect(() => {
        const handleWheel = (e: globalThis.WheelEvent) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                onNext();
            } else {
                onPrev();
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [onNext, onPrev]);

    useLayoutEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, []);

    if (!currentVideo) {
        return (
            <div className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-6 bg-bg-dark p-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <svg className="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-bold text-text-primary">No video memories yet</h2>
                    <p className="max-w-xs text-sm leading-relaxed text-text-muted">
                        Video stories shared in this room will appear here as a fullscreen feed.
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to room
                </button>
            </div>
        );
    }

    const isFirst = currentIndex === 0;
    const isLast = currentIndex >= videos.length - 1 && !hasMore;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-100 flex flex-col bg-black"
            style={{ overscrollBehavior: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <ReelVideo key={currentVideo.id} video={currentVideo} isActive />

            {nextVideo && (
                <div className="pointer-events-none fixed -top-full left-0 h-screen w-screen opacity-0">
                    <ReelVideo key={nextVideo.id} video={nextVideo} preload="auto" />
                </div>
            )}

            <ReelsOverlay
                title={currentVideo.title}
                author={currentVideo.author}
                date={currentVideo.date}
                description={currentVideo.description}
                onClose={onClose}
            />

            {!isFirst && (
                <div className="pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2">
                    <ChevronUp size={20} className="text-white/50" />
                </div>
            )}

            {!isLast && (
                <div className="pointer-events-none absolute bottom-24 left-1/2 z-10 -translate-x-1/2">
                    <ChevronDown size={20} className="text-white/50 animate-bounce" />
                </div>
            )}

            {isLast && (
                <div className="pointer-events-none absolute bottom-24 left-1/2 z-10 -translate-x-1/2">
                    <p className="text-xs text-white/40 whitespace-nowrap">End of memories</p>
                </div>
            )}

            {isFetching && (
                <div className="absolute top-4 right-4 z-30">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-gold" />
                </div>
            )}
        </div>
    );
}
