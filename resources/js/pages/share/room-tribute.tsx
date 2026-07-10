import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Camera,
    Check,
    Feather,
    Heart,
    Mic,
    MicOff,
    Play,
    RotateCcw,
    Send,
    Square,
    User,
    Video,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { lightCandle } from '@/actions/App/Http/Controllers/TributeController';
import CandleSVG from '@/components/candleSVG';
import type { Candle, CandleType } from '@/components/candleThemes';
import Hero from '@/components/hero';
import AudioWaveformPlayer from '@/components/media/AudioWaveformPlayer';
import TributesGrid from '@/components/tribute-grid';
import { store as storeTribute } from '@/routes/share/rooms/tributes';

interface RoomTributeProps {
    room: {
        id: number;
        slug: string;
        name: string;
        description: string;
        thumbnail: string;
        tribute_song: string | null;
        media_items: { url: string; type: string }[] | null;
        enable_tributes: boolean;
        enable_condolence_attendance: boolean;
        enable_candle_lighting: boolean;
        tribute_name: string | null;
        room_type: string;
    };
    tributes: {
        id: number;
        name: string;
        relationship: string | null;
        message: string;
        quote: string | null;
        images: string[] | null;
        video: string | null;
        audio: string | null;
        audio_transcript: string | null;
        audio_transcript_status: string | null;
        created_at: string;
    }[];
    candles: Candle[];
}

/* ─── animations ─────────────────────────────────────────── */
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 15 } },
};

/* ─── Confetti (birthday only) ───────────────────────────── */
function Confetti() {
    const [height, setHeight] = useState(1000);

    useEffect(() => {
        const update = () => setHeight(window.innerHeight);
        update();
        window.addEventListener('resize', update);

        return () => window.removeEventListener('resize', update);
    }, []);

    const particles = useMemo(() => {
        const colors = ['#FFD700', '#FF6B6B', '#48DBFB', '#FF9FF3', '#54A0FF', '#5F27CD', '#FF8A3D'];

        return Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 3,
            duration: 2 + Math.random() * 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 6 + Math.random() * 8,
        }));
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-sm"
                    style={{ left: `${p.x}%`, top: -10, width: p.size, height: p.size * 0.6, backgroundColor: p.color }}
                    animate={{ y: [0, height + 20], rotate: [0, 720], opacity: [1, 0.6, 0] }}
                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeIn' }}
                />
            ))}
        </div>
    );
}

/* ─── Live waveform bars while recording ────────────────── */
function RecordingWaveform({ stream }: { stream: MediaStream | null }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const analyserRef = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        if (!stream) {
return;
}

        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        src.connect(analyser);
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);
        const canvas = canvasRef.current;

        const draw = () => {
            rafRef.current = requestAnimationFrame(draw);

            if (!canvas) {
return;
}

            const c = canvas.getContext('2d');

            if (!c) {
return;
}

            analyser.getByteFrequencyData(data);
            c.clearRect(0, 0, canvas.width, canvas.height);
            const barW = canvas.width / data.length;
            data.forEach((v, i) => {
                const h = (v / 255) * canvas.height;
                c.fillStyle = `rgba(251,191,36,${0.4 + (v / 255) * 0.6})`;
                c.fillRect(i * barW, canvas.height - h, barW - 1, h);
            });
        };
        draw();

        return () => {
            cancelAnimationFrame(rafRef.current);
            ctx.close();
        };
    }, [stream]);

    return (
        <canvas
            ref={canvasRef}
            width={200}
            height={40}
            className="w-full rounded-lg"
        />
    );
}

/* ─── Audio Recorder component ───────────────────────────── */
interface AudioRecorderProps {
    onAudioReady: (base64: string, blobUrl: string) => void;
    onCancel: () => void;
}

function AudioRecorder({ onAudioReady, onCancel }: AudioRecorderProps) {
    const [state, setState] = useState<'idle' | 'recording' | 'preview'>('idle');
    const [seconds, setSeconds] = useState(0);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(s);
            const mr = new MediaRecorder(s, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
            chunksRef.current = [];
            mr.ondataavailable = (e) => {
 if (e.data.size > 0) {
chunksRef.current.push(e.data);
} 
};
            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mr.mimeType });
                const url = URL.createObjectURL(blob);
                setBlobUrl(url);
                setState('preview');
                // Convert to base64
                const reader = new FileReader();
                reader.onloadend = () => onAudioReady(reader.result as string, url);
                reader.readAsDataURL(blob);
                s.getTracks().forEach((t) => t.stop());
                setStream(null);
            };
            mr.start();
            mediaRecorderRef.current = mr;
            setSeconds(0);
            setState('recording');
            timerRef.current = setInterval(() => setSeconds((p) => p + 1), 1000);
        } catch {
            toast.error('Could not access microphone. Please allow microphone access and try again.');
        }
    }, [onAudioReady]);

    const stopRecording = useCallback(() => {
        if (timerRef.current) {
clearInterval(timerRef.current);
}

        mediaRecorderRef.current?.stop();
    }, []);

    const reRecord = useCallback(() => {
        if (blobUrl) {
URL.revokeObjectURL(blobUrl);
}

        setBlobUrl(null);
        setSeconds(0);
        setState('idle');
    }, [blobUrl]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
clearInterval(timerRef.current);
}

            stream?.getTracks().forEach((t) => t.stop());
        };
    }, [stream]);

    const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="space-y-4">
            {state === 'idle' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-6"
                >
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-accent-gold/10 border-2 border-dashed border-accent-gold/40 flex items-center justify-center">
                            <Mic className="w-8 h-8 text-accent-gold" />
                        </div>
                    </div>
                    <p className="text-sm text-text-muted text-center max-w-xs">
                        Record yourself singing Happy Birthday or share your warm wishes. Your voice will be treasured!
                    </p>
                    <button
                        type="button"
                        onClick={startRecording}
                        className="bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Mic size={14} /> Start Recording
                    </button>
                </motion.div>
            )}

            {state === 'recording' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4 py-4"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center"
                        >
                            <Mic className="w-8 h-8 text-red-400" />
                        </motion.div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    <span className="font-mono text-xl text-text-primary tracking-widest">{fmt(seconds)}</span>
                    <div className="w-full px-4">
                        <RecordingWaveform stream={stream} />
                    </div>
                    <p className="text-[11px] text-text-muted font-mono uppercase tracking-wider">Recording in progress…</p>
                    <button
                        type="button"
                        onClick={stopRecording}
                        className="bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Square size={14} fill="white" /> Stop Recording
                    </button>
                </motion.div>
            )}

            {state === 'preview' && blobUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                >
                    <div className="flex items-center gap-2 text-accent-gold">
                        <Check size={14} />
                        <span className="text-xs font-mono uppercase tracking-wider">Recording ready — {fmt(seconds)}</span>
                    </div>
                    <audio src={blobUrl} controls className="w-full rounded-lg" />
                    <button
                        type="button"
                        onClick={reRecord}
                        className="text-xs text-text-muted hover:text-text-primary font-mono tracking-wider uppercase flex items-center gap-1.5 transition-colors"
                    >
                        <RotateCcw size={12} /> Re-record
                    </button>
                </motion.div>
            )}
        </div>
    );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function RoomTribute({ room, tributes: initialTributes, candles }: RoomTributeProps) {
    const [tributes, setTributes] = useState(initialTributes);

    // Form mode — 'text' | 'audio'
    const [tributeMode, setTributeMode] = useState<'text' | 'audio'>('text');

    // Text form state
    const [formName, setFormName] = useState('');
    const [formRelation, setFormRelation] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [formQuote, setFormQuote] = useState('');
    const [formImageUrls, setFormImageUrls] = useState<string[]>([]);
    const [formImageFiles, setFormImageFiles] = useState<File[]>([]);
    const [formVideoUrl, setFormVideoUrl] = useState<string | null>(null);
    const [formVideoFile, setFormVideoFile] = useState<File | null>(null);
    const [formVideoName, setFormVideoName] = useState<string | null>(null);
    const makeBlobUrl = useCallback((file: File) => URL.createObjectURL(file), []);

    // Audio form state
    const [audioBase64, setAudioBase64] = useState<string | null>(null);
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
    const [audioName, setAudioName] = useState('');
    const [audioRelation, setAudioRelation] = useState('');

    // Shared state
    const [showForm, setShowForm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedName, setSubmittedName] = useState('');

    // Candle state
    const [candleName, setCandleName] = useState('');
    const [candleMessage, setCandleMessage] = useState('');
    const [candleType, setCandleType] = useState<CandleType>('amber');
    const [showCandleSuccess, setShowCandleSuccess] = useState(false);

    // Audio player
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const relationOptions = ['Friend', 'Family', 'Colleague', 'Mentor', 'Mentee', 'Neighbor', 'Community'];
    const tributeName = room.tribute_name || room.name;
    const isBirthday = room.room_type === 'birthday';

    const toggleSong = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(room.tribute_song || '');
            audioRef.current.loop = true;
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => { });
        }

        setIsPlaying(!isPlaying);
    }, [isPlaying, room.tribute_song]);

    /* ── text tribute submit ── */
    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (!formName.trim() || !formMessage.trim()) {
return;
}

            setIsSubmitting(true);
            setSubmittedName(formName);

            const formData = new FormData();
            formData.append('name', formName);
            formData.append('relationship', formRelation);
            formData.append('message', formMessage);
            formData.append('quote', formQuote);
            formData.append('is_audio_mode', '0');
            formImageFiles.forEach((file) => formData.append('images[]', file));

            if (formVideoFile) {
formData.append('video', formVideoFile);
}

            router.post(
                storeTribute(room).url,
                formData,
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setShowForm(false);
                        setShowSuccess(true);
                        setFormName('');
                        setFormRelation('');
                        setFormMessage('');
                        setFormQuote('');
                        setFormImageUrls([]);
                        setFormVideoUrl(null);
                        setFormVideoName(null);
                        setIsSubmitting(false);
                    },
                    onError: () => {
                        setShowForm(false);
                        setShowSuccess(true);
                        setIsSubmitting(false);
                    },
                },
            );
        },
        [formName, formRelation, formMessage, formQuote, formImageUrls, formVideoUrl, room],
    );

    /* ── audio tribute submit ── */
    const handleAudioSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (!audioName.trim() || !audioBase64) {
return;
}

            setIsSubmitting(true);
            setSubmittedName(audioName);

            router.post(
                storeTribute(room).url,
                {
                    name: audioName,
                    relationship: audioRelation,
                    message: '',
                    audio: audioBase64,
                    is_audio_mode: true,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setShowForm(false);
                        setShowSuccess(true);
                        setAudioName('');
                        setAudioRelation('');
                        setAudioBase64(null);
                        setAudioBlobUrl(null);
                        setIsSubmitting(false);
                    },
                    onError: () => {
                        setShowForm(false);
                        setShowSuccess(true);
                        setIsSubmitting(false);
                    },
                },
            );
        },
        [audioName, audioRelation, audioBase64, room],
    );

    const handleFormImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files) {
return;
}

        const newFiles = Array.from(files);
        setFormImageFiles((prev) => [...prev, ...newFiles]);
        setFormImageUrls((prev) => [...prev, ...newFiles.map(makeBlobUrl)]);
        e.target.value = '';
    }, [makeBlobUrl]);

    const removeFormImage = useCallback((index: number) => {
        setFormImageFiles((prev) => prev.filter((_, i) => i !== index));
        setFormImageUrls((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleFormVideoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        setFormVideoFile(file);
        setFormVideoName(file.name);
        setFormVideoUrl(makeBlobUrl(file));
        e.target.value = '';
    }, [makeBlobUrl]);

    const removeFormVideo = useCallback(() => {
        setFormVideoFile(null);
        setFormVideoUrl(null);
        setFormVideoName(null);
    }, []);

    const candleColorPicker: { type: CandleType; bg: string }[] = [
        { type: 'amber', bg: 'bg-amber-500 ring-amber-500/35' },
        { type: 'golden', bg: 'bg-[#FFB01F] ring-[#FFB01F]/35' },
        { type: 'rose', bg: 'bg-[#F43F5E] ring-[#F43F5E]/35' },
        { type: 'classic', bg: 'bg-[#FF8A3D] ring-[#FF8A3D]/35' },
        { type: 'violet', bg: 'bg-[#B060FF] ring-[#B060FF]/35' },
        { type: 'teal', bg: 'bg-[#40E8B0] ring-[#40E8B0]/35' },
        { type: 'midnight', bg: 'bg-[#6080FF] ring-[#6080FF]/35' },
    ];

    const resetForm = () => {
        setShowForm(false);
        setAudioBase64(null);
        setAudioBlobUrl(null);
    };
    const isBurial = ["burial", "memorial"].includes(room.room_type);
    const name = room.tribute_name;

    const copy = isBurial
        ? {
            headline: `Thank you for celebrating the life and legacy of ${name}.`,
            subtext:
                "Your memories, tributes, prayers, and acts of remembrance help keep their spirit alive in our hearts.",
        }
        : {
            headline: `Thank you for celebrating ${name}.`,
            subtext:
                "Your wishes, messages, and shared moments make this celebration even more special.",
        };

    return (
        <div className="relative min-h-screen bg-bg-dark">
            <Head title={room.name} />

            {/* Background */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="atmosphere absolute inset-0 opacity-30" />
                {room.thumbnail && (
                    <motion.img
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.08 }}
                        transition={{ duration: 3 }}
                        src={room.thumbnail}
                        className="h-full w-full object-cover blur-[100px]"
                        alt=""
                    />
                )}
            </div>

            {isBirthday && <Confetti />}
            <Hero />

            {/* Tribute Song Player */}
            {room.tribute_song && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={toggleSong}
                        className={`flex items-center gap-2 rounded-full px-4 py-3 text-xs font-mono tracking-wider uppercase transition-all shadow-lg ${isPlaying ? 'bg-accent-gold text-bg-dark' : 'bg-surface border border-white/10 text-text-muted hover:text-text-primary'}`}
                    >
                        <Play size={14} className={isPlaying ? 'animate-pulse' : ''} fill="currentColor" />
                        {isPlaying ? 'Playing Tribute Song' : 'Play Tribute Song'}
                    </button>
                </div>
            )}

            <main className="relative z-10 mx-auto max-w-7xl p-2 pb-32">

                {/* Tribute Form Section */}
                <section className="mb-16 mx-auto">
                    <div className="text-center space-y-3 mb-10">
                        <span className="text-[11px] font-mono tracking-[0.25em] text-accent-gold uppercase block">
                            {isBirthday ? '🎂 Birthday Wishes' : 'Share Your Tribute'}
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl text-text-primary font-light">Tributes</h2>
                        <div className="h-px w-20 bg-accent-gold/30 mx-auto mt-4" />
                    </div>

                    <AnimatePresence mode="wait">
                        {!showSuccess ? (
                            <motion.div key="form-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {!showForm ? (
                                    <div className="flex flex-col items-center gap-3">
                                        {isBirthday ? (
                                            /* Birthday: two CTA buttons */
                                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                                <button
                                                    onClick={() => {
 setTributeMode('text'); setShowForm(true); 
}}
                                                    className="bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all inline-flex items-center gap-2"
                                                >
                                                    <Feather size={14} /> Write a Wish
                                                </button>
                                                <button
                                                    onClick={() => {
 setTributeMode('audio'); setShowForm(true); 
}}
                                                    className="bg-surface border border-accent-gold/40 hover:border-accent-gold text-accent-gold font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all inline-flex items-center gap-2"
                                                >
                                                    <Mic size={14} /> Record Audio Wish
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
 setTributeMode('text'); setShowForm(true); 
}}
                                                className="bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all inline-flex items-center gap-2"
                                            >
                                                <Feather size={14} /> Write a Tribute
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <AnimatePresence mode="wait">

                                        {/* ── TEXT FORM ── */}
                                        {tributeMode === 'text' && (
                                            <motion.form
                                                key="text-form"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                onSubmit={handleSubmit}
                                                className="bg-surface/40 border border-white/10 p-6 md:p-10 rounded-2xl space-y-6"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                                        <Feather size={16} className="text-accent-gold" />
                                                        {isBirthday ? 'Write Your Wish' : 'Write Your Tribute'}
                                                    </h3>
                                                    {isBirthday && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setTributeMode('audio')}
                                                            className="text-[10px] font-mono uppercase tracking-wider text-accent-gold hover:text-text-primary flex items-center gap-1 transition-colors"
                                                        >
                                                            <Mic size={11} /> Switch to Audio
                                                        </button>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1.5">
                                                        Your Name <span className="text-accent-gold">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formName}
                                                        onChange={(e) => setFormName(e.target.value)}
                                                        placeholder="Enter your full name"
                                                        className="w-full bg-bg-dark border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1.5">
                                                        Relationship <span className="text-text-muted font-normal">(Optional)</span>
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {relationOptions.map((rel) => (
                                                            <button
                                                                key={rel}
                                                                type="button"
                                                                onClick={() => setFormRelation(rel)}
                                                                className={`px-3 py-1.5 border rounded-full text-[11px] font-medium transition-all ${formRelation === rel ? 'bg-accent-gold text-bg-dark border-accent-gold' : 'bg-bg-dark text-text-muted border-border-subtle hover:border-accent-gold/50'}`}
                                                            >
                                                                {rel}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1.5">
                                                        {isBirthday ? 'Your Birthday Wish' : 'Your Tribute'} <span className="text-accent-gold">*</span>
                                                    </label>
                                                    <textarea
                                                        required
                                                        rows={6}
                                                        value={formMessage}
                                                        onChange={(e) => setFormMessage(e.target.value)}
                                                        placeholder={isBirthday ? 'Write your birthday wishes...' : 'Write your tribute, memory, message of love, or reflection...'}
                                                        maxLength={5000}
                                                        className="w-full bg-bg-dark border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-colors resize-none"
                                                    />
                                                    <div className="text-right text-[10px] font-mono text-text-muted mt-1">
                                                        {formMessage.length} / 5000 characters
                                                    </div>
                                                </div>

                                                {!isBirthday && (
                                                    <div>
                                                        <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1.5">
                                                            {tributeName} Once Said
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formQuote}
                                                            onChange={(e) => setFormQuote(e.target.value)}
                                                            placeholder="Share a memorable quote, advice, phrase or lesson"
                                                            className="w-full bg-bg-dark border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold"
                                                        />
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle">
                                                    <div>
                                                        <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1">
                                                            Photos <span className="text-text-muted font-normal">(Optional)</span>
                                                        </label>
                                                        <div className="relative border border-dashed border-accent-gold/20 rounded-xl bg-bg-dark p-4 transition-all hover:border-accent-gold text-center cursor-pointer">
                                                            <input
                                                                type="file"
                                                                multiple
                                                                accept=".jpg,.jpeg,.png,.webp"
                                                                onChange={handleFormImagesChange}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            />
                                                            <Camera className="w-6 h-6 text-accent-gold mx-auto mb-1" />
                                                            <span className="text-[11px] text-text-muted">Upload</span>
                                                        </div>
                                                        {formImageUrls.length > 0 && (
                                                            <div className="grid grid-cols-4 gap-2 mt-2">
                                                                {formImageUrls.map((url, idx) => (
                                                                    <div key={idx} className="relative aspect-square border border-border-subtle bg-surface/40 rounded-lg overflow-hidden">
                                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeFormImage(idx)}
                                                                            className="absolute top-1 right-1 bg-bg-dark/80 hover:bg-red-500 text-white p-0.5 rounded-full"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1">
                                                            Video <span className="text-text-muted font-normal">(Optional)</span>
                                                        </label>
                                                        {!formVideoUrl ? (
                                                            <div className="relative border border-dashed border-accent-gold/20 rounded-xl bg-bg-dark p-4 transition-all hover:border-accent-gold text-center cursor-pointer">
                                                                <input
                                                                    type="file"
                                                                    accept=".mp4,.mov,.webm"
                                                                    onChange={handleFormVideoChange}
                                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                />
                                                                <Video className="w-6 h-6 text-accent-gold mx-auto mb-1" />
                                                                <span className="text-[11px] text-text-muted">Upload</span>
                                                            </div>
                                                        ) : (
                                                            <div className="relative border border-border-subtle bg-bg-dark p-2 rounded-xl">
                                                                <video src={formVideoUrl} controls className="w-full h-24 bg-surface rounded-lg" />
                                                                <button
                                                                    type="button"
                                                                    onClick={removeFormVideo}
                                                                    className="absolute top-3 right-3 bg-bg-dark hover:bg-red-500 text-white p-1 rounded-full"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                                {formVideoName && <p className="text-[10px] text-text-muted mt-1 truncate">{formVideoName}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-surface/30 p-3.5 border border-white/5 text-[10px] text-text-muted leading-relaxed rounded-xl">
                                                    <p><strong className="text-text-primary">Note:</strong> {isBirthday ? 'Your wish will appear on the dashboard immediately.' : 'Your tribute will be published after review.'}</p>
                                                </div>

                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowForm(false)}
                                                        className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-2.5 px-6 rounded-xl uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {isSubmitting ? 'Submitting…' : <><Feather size={14} /> Submit</>}
                                                    </button>
                                                </div>
                                            </motion.form>
                                        )}

                                        {/* ── AUDIO FORM ── */}
                                        {tributeMode === 'audio' && (
                                            <motion.form
                                                key="audio-form"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                onSubmit={handleAudioSubmit}
                                                className="bg-surface/40 border border-white/10 p-6 md:p-10 rounded-2xl space-y-6"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                                        <Mic size={16} className="text-accent-gold" />
                                                        Record Your Birthday Wish
                                                    </h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => setTributeMode('text')}
                                                        className="text-[10px] font-mono uppercase tracking-wider text-accent-gold hover:text-text-primary flex items-center gap-1 transition-colors"
                                                    >
                                                        <Feather size={11} /> Switch to Text
                                                    </button>
                                                </div>

                                                {/* Name */}
                                                <div>
                                                    <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1.5">
                                                        Your Name <span className="text-accent-gold">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={audioName}
                                                        onChange={(e) => setAudioName(e.target.value)}
                                                        placeholder="Enter your full name"
                                                        className="w-full bg-bg-dark border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold"
                                                    />
                                                </div>

                                                {/* Relation */}
                                                <div>
                                                    <label className="block text-xs uppercase tracking-wider font-semibold text-text-primary mb-1.5">
                                                        Relationship <span className="text-text-muted font-normal">(Optional)</span>
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {relationOptions.map((rel) => (
                                                            <button
                                                                key={rel}
                                                                type="button"
                                                                onClick={() => setAudioRelation(rel)}
                                                                className={`px-3 py-1.5 border rounded-full text-[11px] font-medium transition-all ${audioRelation === rel ? 'bg-accent-gold text-bg-dark border-accent-gold' : 'bg-bg-dark text-text-muted border-border-subtle hover:border-accent-gold/50'}`}
                                                            >
                                                                {rel}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Recorder */}
                                                <div className="bg-bg-dark border border-white/5 rounded-2xl p-5">
                                                    <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-text-muted block mb-4">
                                                        🎙 Audio Recording
                                                    </span>
                                                    <AudioRecorder
                                                        onAudioReady={(b64, url) => {
                                                            setAudioBase64(b64);
                                                            setAudioBlobUrl(url);
                                                        }}
                                                        onCancel={resetForm}
                                                    />
                                                </div>

                                                {/* Transcription note */}
                                                <div className="bg-accent-gold/5 border border-accent-gold/20 p-3.5 text-[10px] text-text-muted leading-relaxed rounded-xl flex items-start gap-2">
                                                    <span className="text-accent-gold shrink-0 mt-0.5">✨</span>
                                                    <p>
                                                        <strong className="text-accent-gold">Auto-transcribed:</strong> Your audio will be automatically transcribed by AI so your words appear as text alongside the recording.
                                                    </p>
                                                </div>

                                                <div className="bg-surface/30 p-3.5 border border-white/5 text-[10px] text-text-muted leading-relaxed rounded-xl">
                                                    <p><strong className="text-text-primary">Note:</strong> Your wish will be published after review.</p>
                                                </div>

                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowForm(false)}
                                                        className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting || !audioBase64 || !audioName.trim()}
                                                        className="bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-2.5 px-6 rounded-xl uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        {isSubmitting ? 'Sending…' : <><Send size={14} /> Send Wish</>}
                                                    </button>
                                                </div>
                                            </motion.form>
                                        )}
                                    </AnimatePresence>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-surface border border-white/10 p-8 md:p-12 rounded-2xl text-center space-y-6"
                            >
                                <div className="w-16 h-16 rounded-full bg-accent-gold/10 border border-accent-gold flex items-center justify-center text-accent-gold mx-auto">
                                    <Check className="w-8 h-8" />
                                </div>
                                <h3 className="font-serif text-2xl text-accent-gold">Thank you, {submittedName}.</h3>
                                <p className="text-sm text-text-muted">
                                    {tributeMode === 'audio'
                                        ? 'Your audio wish has been submitted. It will appear here after approval.'
                                        : 'Your tribute has been submitted. It will appear here after approval.'}
                                </p>
                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="bg-bg-dark text-text-primary hover:bg-surface border border-white/10 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all rounded-xl cursor-pointer"
                                >
                                    Submit Another
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tributes Display */}
                    {!isBirthday && tributes.length > 0 && (
                        <TributesGrid tributes={tributes} isBirthday={isBirthday} />
                    )}
                </section>

                {/* Candle Lighting */}
                {room.enable_candle_lighting && (
                    <section className="mb-16 max-w-4xl mx-auto">
                        <div className="bg-surface border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 blur-[100px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-gold/5 blur-[100px] rounded-full pointer-events-none" />

                            <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-8">
                                <div className="lg:w-[350px] shrink-0 flex flex-col justify-between space-y-6">
                                    <div className="space-y-3">
                                        <div className="inline-flex items-center gap-2 bg-accent-gold/10 border border-accent-gold/30 px-3 py-1 rounded-full text-accent-gold">
                                            <Heart className="w-4 h-4 fill-accent-gold" />
                                            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">Tribute Vigil</span>
                                        </div>
                                        <h3 className="font-serif text-2xl text-text-primary font-light leading-snug">
                                            Light a <span className="text-accent-gold italic font-medium">Virtual Candle</span>
                                        </h3>
                                        <p className="text-xs text-text-muted leading-relaxed font-light">Join us in lighting a perpetual candle of remembrance.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 bg-surface/30 border border-white/5 rounded-2xl p-4">
                                            <div className="w-10 h-10 rounded-full bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold shrink-0">
                                                <Heart className="w-5 h-5 fill-accent-gold" />
                                            </div>
                                            <div>
                                                <div className="text-xl font-serif font-bold text-text-primary">{candles.length}</div>
                                                <span className="text-[9px] font-mono tracking-wider uppercase text-text-muted">Active Flames</span>
                                            </div>
                                        </div>

                                        {!showCandleSuccess ? (
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();

                                                    if (!candleName.trim()) {
return;
}

                                                    router.post(
                                                        lightCandle(room).url,
                                                        { name: candleName, message: candleMessage, candle_type: candleType },
                                                        {
                                                            preserveScroll: true,
                                                            preserveState: true,
                                                            onSuccess: () => {
                                                                setCandleName('');
                                                                setCandleMessage('');
                                                                setCandleType('amber');
                                                                setShowCandleSuccess(true);
                                                            },
                                                        },
                                                    );
                                                }}
                                                className="space-y-3"
                                            >
                                                <input
                                                    type="text"
                                                    value={candleName}
                                                    onChange={(e) => setCandleName(e.target.value)}
                                                    placeholder="Your Name"
                                                    className="w-full text-xs py-2.5 px-3.5 bg-bg-dark border border-white/10 focus:border-accent-gold text-text-primary rounded-lg outline-none"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    value={candleMessage}
                                                    onChange={(e) => setCandleMessage(e.target.value)}
                                                    placeholder="Short message"
                                                    maxLength={48}
                                                    className="w-full text-xs py-2.5 px-3.5 bg-bg-dark border border-white/10 focus:border-accent-gold text-text-primary rounded-lg outline-none"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-mono uppercase tracking-wider text-text-muted">Flame:</span>
                                                    <div className="flex items-center gap-1.5">
                                                        {candleColorPicker.map((c) => (
                                                            <button
                                                                key={c.type}
                                                                type="button"
                                                                onClick={() => setCandleType(c.type)}
                                                                className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-all ${c.bg} ${candleType === c.type ? 'ring-4 scale-110' : 'opacity-60 hover:opacity-100'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="w-full cursor-pointer bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-[10px] font-bold py-2.5 px-4 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <Heart className="w-3.5 h-3.5 fill-bg-dark" /> Light a Candle
                                                </button>
                                            </form>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-accent-gold/10 border border-accent-gold/30 p-5 rounded-2xl text-center space-y-3"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-accent-gold/25 flex items-center justify-center text-accent-gold mx-auto">
                                                    <Heart className="w-6 h-6 fill-accent-gold" />
                                                </div>
                                                <h4 className="font-serif text-sm text-accent-gold font-semibold">Your Candle is Lit</h4>
                                                <p className="text-[11px] text-text-muted">Thank you. Your flame of honor will start glowing when admin approves.</p>
                                                <button
                                                    onClick={() => setShowCandleSuccess(false)}
                                                    className="text-[9px] font-mono tracking-widest uppercase text-accent-gold hover:text-text-primary font-bold pt-1 block mx-auto cursor-pointer"
                                                >
                                                    Light Another
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-5 md:p-6">
                                    <span className="text-[9px] font-mono tracking-[0.2em] text-text-muted uppercase font-semibold block mb-4 border-b border-white/5 pb-2">
                                        Vigil Board
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-1">
                                        {candles.length === 0 ? (
                                            <div className="col-span-full flex flex-col items-center justify-center py-10 text-text-muted">
                                                <Heart size={40} className="text-accent-gold/30 mb-3" />
                                                <p className="text-sm italic">No candles lit yet.</p>
                                            </div>
                                        ) : (
                                            candles.map((candle, idx) => (
                                                <motion.div
                                                    key={candle.id}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center group"
                                                >
                                                    <CandleSVG candle={candle} delay={idx * 0.3} />
                                                    <span className="text-[11px] font-medium text-text-primary block truncate w-full">{candle.name}</span>
                                                    <span className="text-[8.5px] italic text-text-muted block truncate w-full">{candle.message || 'A silent prayer'}</span>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* End of Tribute Page */}
                <section className="mt-20 max-w-4xl mx-auto text-center">
                    <div className="mb-10">
                        <img
                            src={room.thumbnail}
                            alt="In Loving Memory"
                            className="mx-auto rounded-2xl shadow-lg max-h-[500px] object-cover"
                        />
                    </div>
                    <div className="mb-10">
                        <p className="font-serif text-xl md:text-2xl text-text-primary italic">
                            {copy.headline}
                        </p>

                        <p className="mt-3 text-sm text-text-muted">
                            {copy.subtext}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-px bg-accent-gold/40 w-full" />
                        <div className="h-px bg-accent-gold/20 w-full" />
                    </div>
                </section>
            </main>
        </div>
    );
}