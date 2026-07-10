import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, PictureInPicture2, Gauge } from 'lucide-react';
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
    const { handleToggle: toggleFullscreen, isFullscreen } = useVideoFullscreen();
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
        <div className="flex flex-col gap-2 w-full">
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
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                    </button>

                    <button
                        onClick={toggleMute}
                        className="flex h-8 w-8 items-center justify-center text-white/60 hover:text-white transition-all"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>

                    <span className="text-[10px] font-mono text-white/50 tabular-nums whitespace-nowrap">
                        {formatTime(currentTime)}
                        <span className="mx-1">/</span>
                        <span className="text-white/30">{formatTime(remaining)}</span>
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {showSpeedControl && (
                        <div className="relative">
                            <button
                                onClick={() => setShowSpeedMenu((p) => !p)}
                                className="flex h-7 px-2 items-center justify-center text-[9px] font-bold text-white/50 hover:text-accent-gold transition-all rounded"
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
                                        className="absolute bottom-full right-0 mb-2 bg-black/95 border border-white/10 rounded-xl p-1.5 shadow-xl backdrop-blur-xl min-w-[100px]"
                                        onMouseLeave={() => setShowSpeedMenu(false)}
                                    >
                                        {PLAYBACK_SPEEDS.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => {
                                                    setSpeed(s);
                                                    setShowSpeedMenu(false);
                                                }}
                                                className={`block w-full text-left px-3 py-1.5 text-[11px] rounded-lg transition-all ${
                                                    speed === s
                                                        ? 'text-accent-gold bg-accent-gold/10'
                                                        : 'text-white/60 hover:text-white hover:bg-white/5'
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
                            className={`flex h-7 w-7 items-center justify-center transition-all rounded ${
                                isPip ? 'text-accent-gold' : 'text-white/50 hover:text-white'
                            }`}
                            aria-label="Picture in Picture"
                        >
                            <PictureInPicture2 size={13} />
                        </button>
                    )}

                    <button
                        onClick={toggleFullscreen}
                        className="flex h-7 w-7 items-center justify-center text-white/50 hover:text-white transition-all rounded"
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
