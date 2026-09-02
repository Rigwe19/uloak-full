import { Play, Pause, Volume2, Gauge, RotateCw, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioWaveformPlayerProps {
    src: string;
    title?: string;
    transcript?: TranscriptCue[];
}
interface TranscriptCue {
    start: number;
    end: number;
    text: string;
    speaker?: string;
}

export default function AudioWaveformPlayer({
    src,
    title,
    transcript,
}: AudioWaveformPlayerProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');
    const [playbackRate, setPlaybackRate] = useState(1);
    const [currentSeconds, setCurrentSeconds] = useState(0);
    const getSpeakerColor = (speaker?: string) => {
        if (!speaker) {
            return 'text-accent-gold';
        }

        const colors = [
            'text-accent-gold',
            'text-blue-300',
            'text-purple-300',
            'text-emerald-300',
            'text-pink-300',
            'text-orange-300',
        ];

        let hash = 0;

        for (let i = 0; i < speaker.length; i++) {
            hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
        }

        const index = Math.abs(hash) % colors.length;

        return colors[index];
    };

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let progressGradient: string | CanvasGradient = '#D4A017';
        let waveGradient: string | CanvasGradient = 'rgba(255,255,255,0.12)';

        if (ctx) {
            progressGradient = ctx.createLinearGradient(0, 0, 600, 0);

            progressGradient.addColorStop(0, '#D4A017');
            progressGradient.addColorStop(0.4, '#F4D03F');
            progressGradient.addColorStop(0.7, '#FFF6CC');
            progressGradient.addColorStop(1, '#FFFFFF');

            waveGradient = ctx.createLinearGradient(0, 0, 600, 0);

            waveGradient.addColorStop(0, 'rgba(255,255,255,0.05)');

            waveGradient.addColorStop(1, 'rgba(255,255,255,0.18)');
        }

        const wavesurfer = WaveSurfer.create({
            container: containerRef.current,
            height: 90,

            waveColor: waveGradient,
            progressColor: progressGradient,
            cursorColor: '#F4D03F',

            barWidth: 3,
            barGap: 2,
            barRadius: 999,
            cursorWidth: 2,

            normalize: true,
            dragToSeek: true,

            url: src,
        });

        wavesurferRef.current = wavesurfer;

        wavesurfer.on('ready', () => {
            setDuration(formatTime(wavesurfer.getDuration()));
        });

        wavesurfer.on('audioprocess', () => {
            const time = wavesurfer.getCurrentTime();

            setCurrentSeconds(time);
            setCurrentTime(formatTime(time));
        });

        wavesurfer.on('seeking', () => {
            const time = wavesurfer.getCurrentTime();

            setCurrentSeconds(time);
            setCurrentTime(formatTime(time));
        });

        wavesurfer.on('play', () => setIsPlaying(true));
        wavesurfer.on('pause', () => setIsPlaying(false));

        return () => {
            wavesurfer.destroy();
        };
    }, [src]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!wavesurferRef.current) {
                return;
            }

            const activeElement = document.activeElement as HTMLElement | null;

            const isTyping =
                activeElement?.tagName === 'INPUT' ||
                activeElement?.tagName === 'TEXTAREA' ||
                activeElement?.isContentEditable;

            if (isTyping) {
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlayback();
                    break;

                case 'ArrowLeft':
                    e.preventDefault();
                    seekRelative(-15);
                    break;

                case 'ArrowRight':
                    e.preventDefault();
                    seekRelative(15);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying, playbackRate]);

    const togglePlayback = () => {
        wavesurferRef.current?.playPause();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const changePlaybackRate = () => {
        if (!wavesurferRef.current) {
            return;
        }

        const rates = [1, 1.25, 1.5, 2];

        const currentIndex = rates.indexOf(playbackRate);

        const nextRate = rates[(currentIndex + 1) % rates.length];

        wavesurferRef.current.setPlaybackRate(nextRate);

        setPlaybackRate(nextRate);
    };

    const seekRelative = (seconds: number) => {
        if (!wavesurferRef.current) {
            return;
        }

        const duration = wavesurferRef.current.getDuration();

        const current = wavesurferRef.current.getCurrentTime();

        const nextTime = Math.min(Math.max(current + seconds, 0), duration);

        wavesurferRef.current.setTime(nextTime);
    };
    const activeCueIndex = (() => {
        console.log(transcript?.length, transcript?.at(0));

        if (transcript?.length === 0) {
            return -1;
        }

        if (!transcript) {
            return -1;
        }

        return transcript.findIndex(
            (cue) => currentSeconds >= cue.start && currentSeconds <= cue.end,
        );
    })();

    const activeCue = activeCueIndex >= 0 ? transcript?.[activeCueIndex] : null;

    return (
        <div
            className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl transition-all duration-700 md:p-8 ${isPlaying ? 'shadow-[0_0_100px_rgba(212,160,23,0.12)]' : ''}`}
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className={`absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/10 blur-3xl transition-all duration-1000 ${isPlaying ? 'scale-110 opacity-100' : 'scale-90 opacity-40'}`}
                />
                <div
                    className={`absolute right-[-60px] bottom-[-120px] h-[260px] w-[260px] rounded-full bg-white/5 blur-3xl transition-all duration-1000 ${isPlaying ? 'translate-y-[-10px] opacity-80' : 'opacity-30'}`}
                />
            </div>
            <div className="relative z-10 mb-6 flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => seekRelative(-15)}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-accent-gold/30 hover:bg-white/10"
                    >
                        <RotateCcw size={18} />
                    </button>

                    <button
                        onClick={togglePlayback}
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-gold text-black transition-all duration-500 hover:scale-105 ${isPlaying ? 'scale-105 shadow-[0_0_40px_rgba(212,160,23,0.45)]' : ''}`}
                    >
                        {isPlaying ? (
                            <Pause size={28} fill="currentColor" />
                        ) : (
                            <Play size={28} fill="currentColor" />
                        )}
                    </button>

                    <button
                        onClick={() => seekRelative(15)}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-accent-gold/30 hover:bg-white/10"
                    >
                        <RotateCw size={18} />
                    </button>
                </div>

                <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs font-bold tracking-[0.3em] text-accent-gold uppercase">
                        Audio Archive
                    </p>

                    <h2 className="truncate text-xl font-bold text-white md:text-2xl">
                        {title || 'Voice Memory'}
                    </h2>
                </div>

                <div className="ml-auto">
                    <button
                        onClick={changePlaybackRate}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:border-accent-gold/30 hover:bg-white/10"
                    >
                        <Gauge size={14} />
                        {playbackRate}x
                    </button>
                </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-black/40 to-transparent" />

            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-black/40 to-transparent" />
            <div className="relative z-10 overflow-hidden rounded-2xl border border-white/5 bg-black/30 px-4 py-6 transition-all duration-500 hover:border-white/10 hover:bg-black/40">
                <div ref={containerRef} />
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between text-xs font-medium tracking-wider text-text-muted uppercase">
                <div className="flex items-center gap-2">
                    <Volume2 size={14} />
                    <span>{currentTime}</span>
                </div>

                <span>{duration}</span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] tracking-[0.2em] text-text-muted uppercase">
                <span>Space = Play</span>
                <span>← Rewind</span>
                <span>→ Forward</span>
            </div>
            {transcript && transcript.length > 0 && (
                <div className="relative z-10 mt-6 max-h-[220px] overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                    <div className="mb-3 text-[10px] tracking-[0.3em] text-accent-gold uppercase">
                        Transcript
                    </div>

                    <div className="space-y-3">
                        {transcript.map((cue, idx) => {
                            const isActive = idx === activeCueIndex;
                            const prevSpeaker = transcript?.[idx - 1]?.speaker;
                            const isSameSpeaker = prevSpeaker === cue.speaker;

                            return (
                                <button
                                    key={idx}
                                    onClick={() =>
                                        wavesurferRef.current?.setTime(
                                            cue.start,
                                        )
                                    }
                                    className={`w-full rounded-lg px-2 py-2 text-left transition-all ${
                                        isActive
                                            ? 'bg-white/5'
                                            : 'hover:bg-white/5'
                                    }`}
                                >
                                    <div
                                        className={`flex items-start gap-3 ${
                                            isSameSpeaker ? 'mt-1' : 'mt-4'
                                        }`}
                                    >
                                        {cue.speaker && (
                                            <span
                                                className={`min-w-[80px] rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase backdrop-blur ${getSpeakerColor(
                                                    cue.speaker,
                                                )}`}
                                            >
                                                {cue.speaker}
                                            </span>
                                        )}

                                        <span
                                            className={`text-sm leading-relaxed ${
                                                isActive
                                                    ? 'text-white'
                                                    : 'text-text-muted'
                                            }`}
                                        >
                                            {cue.text}
                                        </span>
                                    </div>

                                    <div className="mt-1 text-[10px] text-text-muted">
                                        {formatTime(cue.start)}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
