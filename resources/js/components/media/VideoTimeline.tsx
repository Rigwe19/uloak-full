import { motion } from 'framer-motion';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { usePlayerStore } from '@/stores/video-player-store';
import type { SpriteData } from '@/types/video-player';

interface VttCue {
    start: number;
    end: number;
    x: number;
    y: number;
    w: number;
    h: number;
}

interface VideoTimelineProps {
    duration: number;
    currentTime: number;
    buffered: number;
    onSeek: (time: number) => void;
    showScrub?: boolean;
    sprite?: SpriteData | null;
}

const THUMB_WIDTH = 160;
const THUMB_HEIGHT = 90;

export function VideoTimeline({ duration, currentTime, buffered, onSeek, showScrub = false, sprite }: VideoTimelineProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverX, setHoverX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [cues, setCues] = useState<VttCue[]>([]);

    const spriteImage = sprite?.image || sprite?.image_url;

    useEffect(() => {
        if (!sprite?.vtt) {
            setCues([]);

            return;
        }

        let cancelled = false;
        fetch(sprite.vtt)
            .then((r) => r.text())
            .then((text) => {
                if (cancelled) {
return;
}

                const parsed: VttCue[] = [];
                const lines = text.split('\n');
                let currentTiming: { start: number; end: number } | null = null;

                for (const line of lines) {
                    const trimmed = line.trim();
                    const timing = trimmed.match(
                        /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s-->\s(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/,
                    );

                    if (timing) {
                        const toMs = (h: number, m: number, s: number, ms: number) =>
                            h * 3600 + m * 60 + s + ms / 1000;

                        currentTiming = {
                            start: toMs(
                                Number(timing[1]),
                                Number(timing[2]),
                                Number(timing[3]),
                                Number(timing[4]),
                            ),
                            end: toMs(
                                Number(timing[5]),
                                Number(timing[6]),
                                Number(timing[7]),
                                Number(timing[8]),
                            ),
                        };
                    } else if (currentTiming && trimmed.includes('#xywh=')) {
                        const xywh = trimmed.match(
                            /#xywh=(\d+),(\d+),(\d+),(\d+)/,
                        );

                        if (xywh) {
                            parsed.push({
                                start: currentTiming.start,
                                end: currentTiming.end,
                                x: Number(xywh[1]),
                                y: Number(xywh[2]),
                                w: Number(xywh[3]),
                                h: Number(xywh[4]),
                            });
                        }

                        currentTiming = null;
                    } else if (currentTiming && !timing) {
                        currentTiming = null;
                    }
                }

                setCues(parsed);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [sprite?.vtt]);

    const getTimeFromPosition = useCallback(
        (clientX: number) => {
            const rect = trackRef.current?.getBoundingClientRect();

            if (!rect || !duration) {
return 0;
}

            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));

            return (x / rect.width) * duration;
        },
        [duration],
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const rect = trackRef.current?.getBoundingClientRect();

            if (!rect) {
return;
}

            setHoverX(e.clientX - rect.left);
            setHoverTime(getTimeFromPosition(e.clientX));
        },
        [getTimeFromPosition],
    );

    const handleMouseLeave = useCallback(() => {
        if (!isDragging) {
            setHoverTime(null);
        }
    }, [isDragging]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            setIsDragging(true);
            const time = getTimeFromPosition(e.clientX);
            onSeek(time);

            const handleMouseMoveDrag = (ev: MouseEvent) => {
                const t = getTimeFromPosition(ev.clientX);
                onSeek(t);
            };

            const handleMouseUp = () => {
                setIsDragging(false);
                setHoverTime(null);
                document.removeEventListener('mousemove', handleMouseMoveDrag);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMoveDrag);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [getTimeFromPosition, onSeek],
    );

    const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

    const formatTime = (t: number) => {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);

        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const activeCue = hoverTime !== null
        ? cues.find((c) => hoverTime >= c.start && hoverTime <= c.end)
        : null;

    const leftPx = Math.min(
        Math.max(hoverX - THUMB_WIDTH / 2, 4),
        (trackRef.current?.getBoundingClientRect()?.width ?? THUMB_WIDTH) - THUMB_WIDTH - 4,
    );

    return (
        <div className="relative flex items-center w-full pt-6">
            {/* Sprite thumbnail preview */}
            {showScrub && hoverTime !== null && !isDragging && spriteImage && (
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-2 pointer-events-none z-30"
                    style={{ left: leftPx }}
                >
                    <div
                        className="overflow-hidden rounded-lg border border-white/20 bg-black shadow-2xl"
                        style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
                    >
                        {activeCue ? (
                            <div
                                className="h-full w-full"
                                style={{
                                    backgroundImage: `url(${spriteImage})`,
                                    backgroundPosition: `-${activeCue.x}px -${activeCue.y}px`,
                                    backgroundSize: 'auto',
                                    width: activeCue.w,
                                    height: activeCue.h,
                                }}
                            />
                        ) : (
                            <div
                                className="h-full w-full"
                                style={{
                                    backgroundImage: `url(${spriteImage})`,
                                    backgroundPosition: '0 0',
                                    backgroundSize: 'cover',
                                }}
                            />
                        )}
                    </div>
                    <div className="mt-1 rounded bg-black/80 px-2 py-0.5 text-center">
                        <span className="text-[10px] font-mono text-white/90">
                            {formatTime(hoverTime)}
                        </span>
                    </div>
                </motion.div>
            )}

            <div
                ref={trackRef}
                className="relative h-1 w-full cursor-pointer rounded-full bg-white/20 group/track"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
            >
                {/* Buffered */}
                <div
                    className="absolute left-0 top-0 h-full rounded-full bg-white/30 transition-all"
                    style={{ width: `${bufferedPercent}%` }}
                />

                {/* Played */}
                <div
                    className="absolute left-0 top-0 h-full rounded-full bg-accent-gold"
                    style={{ width: `${playedPercent}%` }}
                />

                {/* Hover indicator */}
                {hoverTime !== null && !isDragging && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/80 -translate-x-1/2 pointer-events-none z-10"
                        style={{ left: `${(hoverTime / duration) * 100}%` }}
                    />
                )}

                {/* Thumb */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-accent-gold -translate-x-1/2 shadow-lg shadow-accent-gold/30 transition-opacity ${isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover/track:opacity-100'}`}
                    style={{ left: `${Math.min(playedPercent, 100)}%` }}
                />
            </div>
        </div>
    );
}
