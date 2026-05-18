import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    Square,
    Play,
    Pause,
    RotateCcw,
    Check,
    X,
    Loader2,
    Volume2,
} from 'lucide-react';
import { Button } from './ui';

interface VoiceRecorderProps {
    onClose: () => void;
    onSave: (blob: Blob, duration: string) => void;
}

type RecorderState = 'idle' | 'recording' | 'reviewing' | 'saving';

export function VoiceRecorder({ onClose, onSave }: VoiceRecorderProps) {
    const [state, setState] = useState<RecorderState>('idle');
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTime] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Visualization logic
    useEffect(() => {
        if (state === 'recording' && canvasRef.current && streamRef.current) {
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(
                streamRef.current,
            );
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d')!;

            const draw = () => {
                animationFrameRef.current = requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const spacing = 3;
                const barWidth = canvas.width / (bufferLength / 2) - spacing;
                let x = 0;

                // Draw symmetric bars from the center
                for (let i = 0; i < bufferLength / 2; i++) {
                    const barHeight = Math.max(
                        4,
                        (dataArray[i] / 255) * canvas.height * 0.8,
                    );
                    const y = (canvas.height - barHeight) / 2;

                    ctx.fillStyle = i % 2 === 0 ? '#C6A15B' : '#E5C48B';
                    ctx.globalAlpha = 0.3 + (dataArray[i] / 255) * 0.7;

                    ctx.beginPath();
                    // @ts-ignore - roundRect is relatively new
                    if (ctx.roundRect) {
                        // @ts-ignore
                        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
                    } else {
                        ctx.rect(x, y, barWidth, barHeight);
                    }
                    ctx.fill();

                    x += barWidth + spacing;
                }
            };

            draw();

            return () => {
                if (animationFrameRef.current)
                    cancelAnimationFrame(animationFrameRef.current);
                audioContext.close();
            };
        }
    }, [state]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: 'audio/webm',
                });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                setState('reviewing');

                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setState('recording');
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && state === 'recording') {
            mediaRecorderRef.current.stop();
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleSave = () => {
        if (audioUrl && audioChunksRef.current.length > 0) {
            setState('saving');
            const audioBlob = new Blob(audioChunksRef.current, {
                type: 'audio/webm',
            });

            setTimeout(() => {
                onSave(audioBlob, formatTime(recordingTime));
            }, 2000);
        }
    };

    const resetRecorder = () => {
        setAudioUrl(null);
        setRecordingTime(0);
        setState('idle');
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePlayback = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-120 flex items-end justify-center bg-black/80 p-4 backdrop-blur-xl md:items-center md:p-8"
        >
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative mb-24 w-full max-w-lg overflow-hidden rounded-[40px] border border-white/10 bg-surface p-8 shadow-2xl ring-1 ring-white/5 md:mb-0 md:p-12"
            >
                <div className="absolute top-4 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-white/10 md:hidden" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary md:top-8 md:right-8"
                >
                    <X size={24} />
                </button>

                <div className="mb-8 text-center md:mb-12">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold/10 md:mb-6 md:h-16 md:w-16">
                        <Volume2
                            className="text-accent-gold md:size-8"
                            size={24}
                        />
                    </div>
                    <h2 className="mb-1 text-2xl font-bold text-balance text-text-primary md:mb-2 md:text-3xl">
                        Record a Voice Note
                    </h2>
                    <p className="text-xs text-text-muted md:text-sm">
                        Capture a memory or a message for the house.
                    </p>
                </div>

                <div className="mb-8 flex min-h-[180px] flex-col items-center justify-center md:mb-12 md:min-h-[200px]">
                    {state === 'idle' && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={startRecording}
                            className="group relative mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-accent-gold/30 bg-accent-gold/20 text-accent-gold md:h-24 md:w-24"
                        >
                            <Mic size={32} className="md:size-10" />
                            <div className="absolute inset-0 animate-ping rounded-full border border-accent-gold opacity-20" />
                        </motion.button>
                    )}

                    {state === 'recording' && (
                        <div className="flex w-full flex-col items-center gap-6 md:gap-8">
                            <canvas
                                ref={canvasRef}
                                className="h-20 w-full rounded-2xl bg-bg-dark/50 md:h-24"
                                width={400}
                                height={100}
                            />
                            <div className="flex flex-col items-center gap-2">
                                <span className="font-mono text-3xl font-bold text-accent-gold md:text-4xl">
                                    {formatTime(recordingTime)}
                                </span>
                                <span className="animate-pulse text-[10px] tracking-widest text-text-muted uppercase md:text-xs">
                                    Recording...
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                onClick={stopRecording}
                                className="flex h-16 w-16 items-center justify-center rounded-full border-red-500/50 text-red-500 hover:bg-red-500/10 md:h-20 md:w-20"
                            >
                                <Square
                                    size={20}
                                    fill="currentColor"
                                    className="md:size-6"
                                />
                            </Button>
                        </div>
                    )}

                    {state === 'reviewing' && audioUrl && (
                        <div className="flex w-full flex-col items-center gap-6 md:gap-8">
                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border-subtle md:h-2">
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-accent-gold"
                                    style={{
                                        width: `${(playbackTime / recordingTime) * 100}%`,
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-4 md:gap-6">
                                <button
                                    onClick={resetRecorder}
                                    className="rounded-full bg-white/5 p-3 text-text-muted hover:text-white md:p-4"
                                >
                                    <RotateCcw
                                        size={18}
                                        className="md:size-5"
                                    />
                                </button>
                                <button
                                    onClick={togglePlayback}
                                    className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold text-bg-dark md:h-20 md:w-20"
                                >
                                    {isPlaying ? (
                                        <Pause
                                            size={28}
                                            fill="black"
                                            className="md:size-8"
                                        />
                                    ) : (
                                        <Play
                                            size={28}
                                            fill="black"
                                            className="ml-1 md:size-8"
                                        />
                                    )}
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="rounded-full bg-white/5 p-3 text-accent-gold hover:bg-accent-gold/10 md:p-4"
                                >
                                    <Check size={18} className="md:size-5" />
                                </button>
                            </div>

                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                onTimeUpdate={() =>
                                    setPlaybackTime(
                                        audioRef.current?.currentTime || 0,
                                    )
                                }
                                onEnded={() => setIsPlaying(false)}
                            />

                            <span className="font-mono text-base text-text-primary md:text-xl">
                                {formatTime(Math.floor(playbackTime))} /{' '}
                                {formatTime(recordingTime)}
                            </span>
                        </div>
                    )}

                    {state === 'saving' && (
                        <div className="flex flex-col items-center gap-6">
                            <Loader2
                                className="animate-spin text-accent-gold md:size-12"
                                size={32}
                            />
                            <span className="text-[10px] tracking-widest text-text-muted uppercase md:text-sm">
                                Storing in Legacy Vault...
                            </span>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {state === 'idle' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pb-8 text-center md:pb-0"
                        >
                            <span className="text-[10px] font-bold tracking-widest text-accent-gold uppercase md:text-sm">
                                Press to begin
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
