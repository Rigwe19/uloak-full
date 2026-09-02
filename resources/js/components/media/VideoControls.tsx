import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    PictureInPicture2,
    Gauge,
} from 'lucide-react';
import React, { useState } from 'react';
import { useVideoFullscreen } from '@/hooks/use-video-fullscreen';
import { useVideoPip } from '@/hooks/use-video-pip';
import { usePlayerStore } from '@/stores/video-player-store';
import type { PlaybackSpeed, SpriteData } from '@/types/video-player';
import { PLAYBACK_SPEEDS, SPEED_LABELS } from '@/types/video-player';
import { VideoTimeline } from './VideoTimeline';

interface VideoControlsProps {
    showTimeline?: boolean;
    showSpeedControl?: boolean;
    showPip?: boolean;
    showVolumeSlider?: boolean;
    sprite?: SpriteData | null;
}

export function VideoControls({
    showTimeline = true,
    showSpeedControl = true,
    showPip = true,
    showVolumeSlider = true,
    sprite,
}: VideoControlsProps) {
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const isMuted = usePlayerStore((s) => s.isMuted);
    const speed = usePlayerStore((s) => s.speed);
    const currentTime = usePlayerStore((s) => s.currentTime);
    const duration = usePlayerStore((s) => s.duration);
    const buffered = usePlayerStore((s) => s.buffered);
    const togglePlay = usePlayerStore((s) => s.togglePlay);
    const toggleMute = usePlayerStore((s) => s.toggleMute);
    const setSpeed = usePlayerStore((s) => s.setSpeed);
    const seek = usePlayerStore((s) => s.seek);
    const { handleToggle: toggleFullscreen, isFullscreen } =
        useVideoFullscreen();
    const { isPip, handleTogglePip } = useVideoPip();
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    const formatTime = (t: number) => {
        if (!t || isNaN(t)) {
            return '0:00';
        }

        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);

        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const remaining = Math.max(0, (duration || 0) - currentTime);

    return (
        <div className="flex w-full flex-col gap-2">
            {showTimeline && (
                <VideoTimeline
                    duration={duration}
                    currentTime={currentTime}
                    buffered={buffered}
                    onSeek={seek}
                    showScrub
                    sprite={sprite}
                />
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlay}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/10 hover:text-white"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <Pause size={16} fill="currentColor" />
                        ) : (
                            <Play
                                size={16}
                                fill="currentColor"
                                className="ml-0.5"
                            />
                        )}
                    </button>

                    <button
                        onClick={toggleMute}
                        className="flex h-8 w-8 items-center justify-center text-white/60 transition-all hover:text-white"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? (
                            <VolumeX size={14} />
                        ) : (
                            <Volume2 size={14} />
                        )}
                    </button>

                    <span className="font-mono text-[10px] whitespace-nowrap text-white/50 tabular-nums">
                        {formatTime(currentTime)}
                        <span className="mx-1">/</span>
                        <span className="text-white/30">
                            {formatTime(remaining)}
                        </span>
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {showSpeedControl && (
                        <div className="relative">
                            <button
                                onClick={() => setShowSpeedMenu((p) => !p)}
                                className="flex h-7 items-center justify-center rounded px-2 text-[9px] font-bold text-white/50 transition-all hover:text-accent-gold"
                                aria-label="Playback speed"
                            >
                                <Gauge size={12} className="mr-1" />
                                {speed}x
                            </button>
                            <AnimatePresence>
                                {showSpeedMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute right-0 bottom-full mb-2 min-w-[100px] rounded-xl border border-white/10 bg-black/95 p-1.5 shadow-xl backdrop-blur-xl"
                                        onMouseLeave={() =>
                                            setShowSpeedMenu(false)
                                        }
                                    >
                                        {PLAYBACK_SPEEDS.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => {
                                                    setSpeed(s);
                                                    setShowSpeedMenu(false);
                                                }}
                                                className={`block w-full rounded-lg px-3 py-1.5 text-left text-[11px] transition-all ${
                                                    speed === s
                                                        ? 'bg-accent-gold/10 text-accent-gold'
                                                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                {SPEED_LABELS[s]}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {showPip && (
                        <button
                            onClick={handleTogglePip}
                            className={`flex h-7 w-7 items-center justify-center rounded transition-all ${
                                isPip
                                    ? 'text-accent-gold'
                                    : 'text-white/50 hover:text-white'
                            }`}
                            aria-label="Picture in Picture"
                        >
                            <PictureInPicture2 size={13} />
                        </button>
                    )}

                    <button
                        onClick={toggleFullscreen}
                        className="flex h-7 w-7 items-center justify-center rounded text-white/50 transition-all hover:text-white"
                        aria-label={
                            isFullscreen ? 'Exit fullscreen' : 'Fullscreen'
                        }
                    >
                        {isFullscreen ? (
                            <Minimize size={14} />
                        ) : (
                            <Maximize size={14} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
