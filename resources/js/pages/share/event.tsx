import eventsRoutes from '@/routes/share/events';
import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Upload,
    Filter,
    Grid,
    List as ListIcon,
    Clock,
    User as UserIcon,
    Play,
    Plus,
    Calendar,
    Camera,
    Video,
    Mic,
    X,
    Check,
    Square,
    RotateCcw,
    Files,
    Image as ImageIcon,
    Music,
    FileText,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Pause,
    Volume2,
    VolumeX,
    Download,
    File as FileIcon,
} from 'lucide-react';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Button, Badge } from '@/components/dashboard/ui';
import { VideoPlaylistPlayer } from '@/components/dashboard/video-playlist-player';
import StoryCard from '@/components/feed/StoryCard';
import StoryFeed from '@/components/feed/StoryFeed';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { ResponsiveModal } from '@/components/responsive-modal';
import { UploadDropzone } from '@/components/upload/UploadDropzone';
import type { FeedStory } from '@/types/feed';
import type { PlayerVideo } from '@/types/video-player';

/* ─── animations ─────────────────────────────────────────── */
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 15 } },
};

/* ─── Props ───────────────────────────────────────────────── */
interface ShareEventProps {
    event: {
        id: string | number;
        slug: string;
        name: string;
        description: string;
        thumbnail: string;
        event_date?: string;
        stories_count: number;
        creator?: {
            name: string;
            avatar?: string;
        };
    };
    stories: FeedStory[];
    pagination?: {
        next_cursor: string | null;
        path: string;
        per_page: number;
    };
    flash?: {
        success?: string;
    };
}

/* ─── Media Type Icon Helper ──────────────────────────────── */
function MediaTypeIcon({ type }: { type: string }) {
    const icons: Record<string, React.ReactNode> = {
        photo: <ImageIcon size={14} />,
        video: <Video size={14} />,
        audio: <Music size={14} />,
        document: <FileText size={14} />,
        collection: <Files size={14} />,
    };

    return <>{icons[type] || <FileText size={14} />}</>;
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

/* ─── Media Viewer Modal ──────────────────────────────────── */
interface MediaViewerModalProps {
    stories: any[];
    initialIndex: number;
    onClose: () => void;
}

function MediaViewerModal({ stories, initialIndex, onClose }: MediaViewerModalProps) {
    const [currentIdx, setCurrentIdx] = useState(initialIndex);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const story = stories[currentIdx];
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx < stories.length - 1;

    // Determine the best media URL to play
    const mediaUrl = story?.file_url || story?.assets?.[0]?.url || null;
    const isDocument = story?.type === 'document' || story?.type === 'collection';

    // Close on escape
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

    // Auto-pause/play when story changes
    useEffect(() => {
        setIsPlaying(false);
    }, [currentIdx]);

    const handlePlayPause = () => {
        if (!videoRef.current) {
return;
}

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) {
return;
}

        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const goNext = () => {
        if (hasNext) {
setCurrentIdx((p) => p + 1);
}
    };

    const goPrev = () => {
        if (hasPrev) {
setCurrentIdx((p) => p - 1);
}
    };

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
                    className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                >
                    <X size={24} />
                </button>

                {/* Counter */}
                <div className="absolute top-6 left-6 z-10 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-mono tracking-wider text-white/80">
                    {currentIdx + 1} / {stories.length}
                </div>

                {/* Previous */}
                {hasPrev && (
                    <button
                        onClick={goPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                    >
                        <ChevronLeft size={28} />
                    </button>
                )}

                {/* Next */}
                {hasNext && (
                    <button
                        onClick={goNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                    >
                        <ChevronRight size={28} />
                    </button>
                )}

                {/* Media Content */}
                <div className="w-full max-w-5xl mx-auto px-4 md:px-16 flex flex-col items-center">
                    {/* Title & Author */}
                    <div className="text-center mb-6 w-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white">{story.title}</h3>
                        <p className="text-sm text-white/50 mt-1">
                            {story.author} · {story.date}
                        </p>
                    </div>

                    {/* Media Player */}
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
                                    onEnded={() => setIsPlaying(false)}
                                />
                            </div>
                        ) : (story.type === 'audio' && mediaUrl) ? (
                            <div className="w-full max-w-lg">
                                <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-24 h-24 rounded-full bg-accent-gold/20 border-2 border-accent-gold/40 flex items-center justify-center">
                                        <Music size={40} className="text-accent-gold" />
                                    </div>
                                    <audio
                                        src={mediaUrl}
                                        controls
                                        autoPlay
                                        className="w-full"
                                    />
                                    {story.description && (
                                        <p className="text-sm text-white/60 italic text-center">"{story.description}"</p>
                                    )}
                                </div>
                            </div>
                        ) : (story.type === 'photo' && mediaUrl) ? (
                            <div className="relative max-w-full max-h-[65vh]">
                                <img
                                    src={mediaUrl}
                                    alt={story.title}
                                    className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-2xl"
                                />
                            </div>
                        ) : isDocument ? (
                            <div className="w-full max-w-lg text-center">
                                <div className="flex flex-col items-center gap-6 p-12 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-24 h-24 rounded-2xl bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                                        <FileIcon size={40} className="text-accent-gold" />
                                    </div>
                                    <h3 className="text-lg text-white font-bold">{story.title}</h3>
                                    {story.description && (
                                        <p className="text-sm text-white/60 italic">"{story.description}"</p>
                                    )}
                                    {mediaUrl && (
                                        <a
                                            href={mediaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all inline-flex items-center gap-2"
                                        >
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

                    {/* Description */}
                    {story.description && story.type !== 'audio' && (
                        <p className="mt-6 text-sm text-white/50 italic text-center max-w-2xl">"{story.description}"</p>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

/* ─── Guest Contribution Modal ────────────────────────────── */
interface GuestContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventSlug: string;
}

type ContributionStep = 'selection' | 'upload' | 'details' | 'success';
type ContributionMediaType = 'photo' | 'video' | 'audio' | 'document';

function GuestContributionModal({ isOpen, onClose, eventSlug }: GuestContributionModalProps) {
    const [step, setStep] = useState<ContributionStep>('selection');
    const [mediaType, setMediaType] = useState<ContributionMediaType | null>(null);

    const [audioRecState, setAudioRecState] = useState<'idle' | 'recording' | 'preview'>('idle');
    const [audioSeconds, setAudioSeconds] = useState(0);
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        guest_name: '',
        guest_email: '',
        title: '',
        description: '',
        type: '' as ContributionMediaType | '',
        files: [] as File[],
        thumbnail: null as File | null,
    });

    const [previews, setPreviews] = useState<{ url: string; type: string; name: string }[]>([]);

    const handleMediaTypeSelect = (type: ContributionMediaType) => {
        setMediaType(type);
        setData('type', type);
        setStep('upload');
    };

    const handleFileChange = (files: File[]) => {
        if (files.length > 0) {
            setData('files', [...data.files, ...files]);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => [...prev, {
                        url: reader.result as string,
                        type: file.type,
                        name: file.name
                    }]);
                };
                reader.readAsDataURL(file);
            });
            setStep('details');
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...data.files];
        newFiles.splice(index, 1);
        setData('files', newFiles);
        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);

        if (newFiles.length === 0) {
setStep('upload');
}
    };

    const startAudioRecording = useCallback(async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(s);
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
                setAudioBlob(blob);
                setAudioBlobUrl(url);
                setAudioRecState('preview');
                s.getTracks().forEach((t) => t.stop());
                setAudioStream(null);
            };
            mr.start();
            mediaRecorderRef.current = mr;
            setAudioSeconds(0);
            setAudioRecState('recording');
            timerRef.current = setInterval(() => setAudioSeconds((p) => p + 1), 1000);
        } catch {
            toast.error('Could not access microphone. Please allow microphone access and try again.');
        }
    }, []);

    const stopAudioRecording = useCallback(() => {
        if (timerRef.current) {
clearInterval(timerRef.current);
}

        mediaRecorderRef.current?.stop();
    }, []);

    const rerecordAudio = useCallback(() => {
        if (audioBlobUrl) {
URL.revokeObjectURL(audioBlobUrl);
}

        setAudioBlob(null);
        setAudioBlobUrl(null);
        setAudioSeconds(0);
        setAudioRecState('idle');
    }, [audioBlobUrl]);

    const confirmAudio = useCallback(() => {
        if (audioBlob) {
            const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
            setData('files', [file]);
            setPreviews([{ url: audioBlobUrl || '', type: 'audio/webm', name: 'Voice Recording' }]);
            setStep('details');
        }
    }, [audioBlob, audioBlobUrl, setData]);

    const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        post(`/share/events/${eventSlug}/contributions`, {
            forceFormData: true,
            onSuccess: () => {
                setStep('success');
            },
        });
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep('selection');
            setMediaType(null);
            setPreviews([]);
            setAudioRecState('idle');
            setAudioBlob(null);
            setAudioBlobUrl(null);
            reset();
        }, 300);
    };

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Contribute to this Event"
            titleHidden
            desktopMaxWidth="max-w-xl"
        >
            <div className="relative p-8 md:p-10">
                    <button onClick={handleClose} className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary md:top-8 md:right-8"><X size={24} /></button>

                    {step === 'selection' && (
                        <div className="space-y-6">
                            <div className="mb-8">
                                <h2 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">Contribute to this Event</h2>
                                <p className="text-sm leading-relaxed text-text-muted">Share your photos, videos, voice notes, or documents. Every contribution adds to the legacy.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { type: 'photo' as ContributionMediaType, icon: Camera, label: 'Photo', color: 'bg-blue-500/10 text-blue-500' },
                                    { type: 'video' as ContributionMediaType, icon: Video, label: 'Video', color: 'bg-red-500/10 text-red-500' },
                                    { type: 'audio' as ContributionMediaType, icon: Mic, label: 'Voice', color: 'bg-accent-gold/10 text-accent-gold' },
                                    { type: 'document' as ContributionMediaType, icon: Files, label: 'Document', color: 'bg-emerald-500/10 text-emerald-500' },
                                ].map((item) => (
                                    <button key={item.type} onClick={() => handleMediaTypeSelect(item.type)}
                                        className="group flex flex-col items-center gap-4 rounded-3xl border border-border-subtle bg-bg-dark p-6 transition-all hover:border-accent-gold/40 hover:bg-surface">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} transition-transform group-hover:scale-110`}><item.icon size={24} /></div>
                                        <span className="text-sm font-bold text-text-primary">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'upload' && (
                        <div className="space-y-6">
                            <button onClick={() => setStep('selection')} className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase hover:opacity-80"><ArrowLeft size={14} /> Back</button>
                            {mediaType === 'audio' ? (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="mb-2 text-2xl font-bold text-text-primary">Record a Voice Note</h2>
                                        <p className="mb-6 text-sm text-text-muted">Capture a memory or share your thoughts.</p>
                                    </div>
                                    {audioRecState === 'idle' && (
                                        <div className="flex flex-col items-center gap-4 py-6">
                                            <div className="w-20 h-20 rounded-full bg-accent-gold/10 border-2 border-dashed border-accent-gold/40 flex items-center justify-center"><Mic className="w-8 h-8 text-accent-gold" /></div>
                                            <p className="text-sm text-text-muted text-center max-w-xs">Record a personal message, a memory, or your reflections on this event.</p>
                                            <button type="button" onClick={startAudioRecording} className="bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all flex items-center gap-2"><Mic size={14} /> Start Recording</button>
                                        </div>
                                    )}
                                    {audioRecState === 'recording' && (
                                        <div className="flex flex-col items-center gap-4 py-4">
                                            <div className="relative">
                                                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center"><Mic className="w-8 h-8 text-red-400" /></motion.div>
                                                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                            </div>
                                            <span className="font-mono text-xl text-text-primary tracking-widest">{fmt(audioSeconds)}</span>
                                            <div className="w-full px-4"><RecordingWaveform stream={audioStream} /></div>
                                            <p className="text-[11px] text-text-muted font-mono uppercase tracking-wider">Recording in progress…</p>
                                            <button type="button" onClick={stopAudioRecording} className="bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-widest transition-all flex items-center gap-2"><Square size={14} fill="white" /> Stop Recording</button>
                                        </div>
                                    )}
                                    {audioRecState === 'preview' && audioBlobUrl && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-accent-gold"><Check size={14} /><span className="text-xs font-mono uppercase tracking-wider">Recording ready — {fmt(audioSeconds)}</span></div>
                                            <audio src={audioBlobUrl} controls className="w-full rounded-lg" />
                                            <div className="flex gap-3">
                                                <button type="button" onClick={rerecordAudio} className="text-xs text-text-muted hover:text-text-primary font-mono tracking-wider uppercase flex items-center gap-1.5 transition-colors"><RotateCcw size={12} /> Re-record</button>
                                                <button type="button" onClick={confirmAudio} className="ml-auto bg-accent-gold hover:bg-accent-gold/80 text-bg-dark font-mono text-xs font-bold py-2 px-4 rounded-xl uppercase tracking-widest transition-all flex items-center gap-2"><Check size={14} /> Use Recording</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <h2 className="mb-2 text-2xl font-bold text-text-primary">Upload {mediaType === 'photo' ? 'a Photo' : mediaType === 'video' ? 'a Video' : 'a Document'}</h2>
                                    <p className="mb-8 text-sm text-text-muted">Select the file you'd like to contribute to this event.</p>
                                    <UploadDropzone
                                        onFilesSelected={handleFileChange}
                                        accept={mediaType === 'photo' ? 'image/*' : mediaType === 'video' ? 'video/*' : mediaType === 'document' ? '.pdf,.doc,.docx,.txt' : '*/*'}
                                        multiple={mediaType === 'photo' || mediaType === 'document'}
                                        maxSizeMB={50}
                                        label="Click to browse or drag and drop"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'details' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <button type="button" onClick={() => setStep('upload')} className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase hover:opacity-80"><ArrowLeft size={14} /> Back</button>
                            <div><h2 className="mb-1 text-2xl font-bold text-text-primary">Your Details</h2><p className="text-sm text-text-muted">Tell us about yourself and this memory.</p></div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">Your Name <span className="text-accent-gold">*</span></label>
                                    <input type="text" required placeholder="Enter your full name" value={data.guest_name} onChange={(e) => setData('guest_name', e.target.value)} className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none" />
                                    {errors.guest_name && <p className="text-xs text-red-500">{errors.guest_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">Email <span className="text-text-muted font-normal">(Optional)</span></label>
                                    <input type="email" placeholder="name@example.com" value={data.guest_email} onChange={(e) => setData('guest_email', e.target.value)} className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">Memory Title <span className="text-accent-gold">*</span></label>
                                    <input type="text" required placeholder="e.g., My favorite moment" value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none" />
                                    {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">Story / Description</label>
                                    <textarea placeholder="Tell the story behind this memory..." rows={3} value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full resize-none rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none" />
                                </div>
                                {previews.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">Preview ({previews.length})</label>
                                        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                                            {previews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square h-24 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-dark">
                                                    {preview.type.startsWith('image/') ? <img src={preview.url} className="h-full w-full object-cover" alt="" />
                                                    : preview.type.startsWith('audio/') ? <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-text-muted"><Mic size={20} className="text-accent-gold" /><span className="text-[8px]">Voice Recording</span></div>
                                                    : <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-text-muted">{preview.type.startsWith('video/') ? <Video size={16} /> : <Files size={16} />}<span className="truncate text-[8px]">{preview.name}</span></div>}
                                                    <button type="button" onClick={() => removeFile(index)} className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-red-500"><X size={10} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button variant="primary" className="w-full" type="submit" disabled={processing || !data.guest_name || !data.title || data.files.length === 0}>
                                {processing ? <div className="flex items-center gap-2"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="h-4 w-4 rounded-full border-2 border-bg-dark border-t-transparent" /> Submitting...</div> : 'Share Memory'}
                            </Button>
                        </form>
                    )}

                    {step === 'success' && (
                        <div className="py-8 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><Check size={40} /></div>
                            <h2 className="mb-2 text-3xl font-bold text-text-primary">Memory Shared</h2>
                            <p className="mb-8 text-text-muted">Thank you for your contribution! It will appear here after review.</p>
                            <Button variant="primary" className="w-full" onClick={handleClose}>Done</Button>
                        </div>
                    )}
            </div>
        </ResponsiveModal>
    );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function ShareEvent({ event, stories: initialStories = [], pagination }: ShareEventProps) {
    const [allStories, setAllStories] = useState<FeedStory[]>(initialStories);
    const [activeTab, setActiveTab] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

    // Merge paginated stories & handle reset
    useEffect(() => {
        const handleAppended = (e: CustomEvent) => {
            const { stories: newStories } = e.detail;
            setAllStories((prev) => {
                const existingIds = new Set(prev.map((s) => s.id));
                const unique = newStories.filter((s: FeedStory) => !existingIds.has(s.id));

                return [...prev, ...unique];
            });
        };
        const handleReset = (e: CustomEvent) => {
            setAllStories(e.detail.stories);
        };
        window.addEventListener('feed:appended', handleAppended as EventListener);
        window.addEventListener('feed:reset', handleReset as EventListener);

        return () => {
            window.removeEventListener('feed:appended', handleAppended as EventListener);
            window.removeEventListener('feed:reset', handleReset as EventListener);
        };
    }, []);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        (allStories || []).forEach((s) => s.tags?.forEach((t: string) => tags.add(t)));

        return Array.from(tags);
    }, [allStories]);

    const viewerOpen = viewerIndex !== null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative min-h-screen bg-bg-dark">
            <Head title={`${event.name} - Uloak, House of Stories`} />

            {/* Atmosphere background */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="atmosphere absolute inset-0 opacity-30" />
                {event.thumbnail && (
                    <motion.img initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 0.08 }} transition={{ duration: 3 }}
                        src={event.thumbnail} className="h-full w-full object-cover blur-[100px]" alt="" />
                )}
                <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-accent-gold/5 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-gold/5 blur-[120px]" />
            </div>

            {/* Video Playlist Player - full-width hero */}
            <div className="relative z-10">
                <VideoPlaylistPlayer stories={initialStories} fullscreen/>
            </div>

            <main className="relative z-10 mx-auto max-w-7xl p-5 pb-32 md:p-8 lg:p-16">
                <header className="mb-16 mt-10">
                    <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                {event.stories_count > 0 && (
                                    <><Badge>{event.stories_count} Memories</Badge><div className="h-px w-12 bg-accent-gold/30" /></>
                                )}
                                <span className="text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase">Public Event</span>
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl leading-none font-bold tracking-tight text-text-primary md:text-7xl">{event.name}</h1>
                                <p className="max-w-2xl text-lg leading-relaxed font-light text-text-muted">{event.description}</p>
                                {event.event_date && (
                                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-accent-gold uppercase">
                                        <Calendar size={14} /><span>Event Date: {new Date(event.event_date).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <Button icon={Upload} onClick={() => setIsContributionModalOpen(true)} className="shadow-[0_20px_40px_rgba(198,161,91,0.15)]">Contribute</Button>
                        </div>
                    </div>
                </header>

                {/* Stories Grid */}
                <section>
                    <div className="text-center space-y-3 mb-10">
                        <span className="text-[11px] font-mono tracking-[0.25em] text-accent-gold uppercase block">📖 Memory Archive</span>
                        <h2 className="font-serif text-3xl md:text-4xl text-text-primary font-light">All Memories</h2>
                        <div className="h-px w-20 bg-accent-gold/30 mx-auto mt-4" />
                    </div>

                    <StoryFeed
                        stories={allStories}
                        nextCursor={pagination?.next_cursor ?? null}
                        routeName="share.events.show"
                        routeParams={{ slug: event.slug }}
                        filters={{
                            tabs: ['All', 'Photo Gallery', 'Cinema Hall', 'Whispering Voices', 'Manuscripts'],
                            activeTab,
                            onTabChange: setActiveTab,
                            tags: allTags.filter(t => t !== 'guest-contribution'),
                            selectedTag,
                            onTagChange: setSelectedTag,
                            viewMode,
                            onViewModeChange: setViewMode,
                        }}
                        emptyLabel='Be the first to contribute a memory to this event. Click the "Contribute" button above to share your photos, videos, voice notes, or documents.'
                        addCard={
                            <div onClick={() => setIsContributionModalOpen(true)}
                                className={`group flex cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-white/10 bg-surface/20 transition-all hover:border-accent-gold/40 hover:bg-surface/40 ${viewMode === 'grid' ? 'h-[400px]' : 'h-32 flex-row gap-6'}`}>
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/5 bg-bg-dark text-text-muted transition-all group-hover:scale-110 group-hover:text-accent-gold"><Plus size={32} /></div>
                                <span className="text-xs font-bold tracking-[0.3em] text-text-primary uppercase transition-colors group-hover:text-accent-gold">Contribute Memory</span>
                            </div>
                        }
                    >
                        {(story) => (
                            <div
                                onClick={() => setViewerIndex(allStories.findIndex(s => s.id === story.id))}
                                className={`${viewMode === 'grid' ? 'surface-glow flex h-full flex-col overflow-hidden rounded-[32px] border border-white/5 bg-surface/40 transition-all duration-500 hover:border-accent-gold/20 cursor-pointer' : 'surface-glow flex items-center gap-8 rounded-3xl border border-white/5 bg-surface/40 p-6 transition-all hover:border-accent-gold/20 cursor-pointer'}`}
                            >
                                {viewMode === 'grid' ? (
                                    <>
                                        <div className="relative aspect-4/3 overflow-hidden group">
                                            <img src={story.thumbnail || '/logo-stacked.png'} alt={story.title}
                                                onError={(e) => {
 e.currentTarget.src = '/logo-stacked.png'; 
}}
                                                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <div className="flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-accent-gold text-bg-dark shadow-2xl transition-transform duration-500 group-hover:scale-100">
                                                    <Play size={24} fill="currentColor" className="ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute top-6 left-6 flex items-center gap-2">
                                                <Badge className="border-white/10 flex bg-bg-dark/60 text-[10px] tracking-widest uppercase backdrop-blur-md">
                                                    <MediaTypeIcon type={story.type} /><span className="ml-1.5">{story.type}</span>
                                                </Badge>
                                                {story.tags?.includes('guest-contribution') && (
                                                    <Badge className="border-accent-gold/20 bg-accent-gold/10 text-[9px] text-accent-gold tracking-widest uppercase backdrop-blur-md">Guest</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex grow flex-col justify-between gap-6 p-8">
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-bold text-text-primary transition-colors">{story.title}</h3>
                                                <p className="line-clamp-2 text-sm font-light text-text-muted italic">"{story.description}"</p>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-white/5 pt-6 text-[10px] font-bold tracking-[0.2em] text-text-muted uppercase">
                                                <div className="flex items-center gap-2"><UserIcon size={12} className="text-accent-gold" /> {story.author}</div>
                                                <div className="flex items-center gap-2"><Clock size={12} className="text-accent-gold" /> {story.date}</div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="relative aspect-video w-48 shrink-0 overflow-hidden rounded-2xl">
                                            <img src={story.thumbnail || '/logo-stacked.png'} alt={story.title} onError={(e) => {
 e.currentTarget.src = '/logo-stacked.png'; 
}} className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/20">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"><Play size={16} fill="white" className="ml-0.5" /></div>
                                            </div>
                                        </div>
                                        <div className="grow space-y-2">
                                            <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                <Badge className="border-white/10 bg-white/5"><MediaTypeIcon type={story.type} /><span className="ml-1.5">{story.type}</span></Badge>
                                                <span className="flex items-center gap-1"><Clock size={12} className="text-accent-gold" /> {story.date}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-text-primary transition-colors">{story.title}</h3>
                                            <p className="text-sm text-text-muted italic">"{story.description}"</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </StoryFeed>
                </section>

                <section className="mt-20 max-w-4xl mx-auto text-center">
                    <div className="space-y-2"><div className="h-px bg-accent-gold/40 w-full" /><div className="h-px bg-accent-gold/20 w-full" /></div>
                    <p className="mt-8 text-xs text-text-muted font-light">Every memory shared here becomes part of a lasting legacy.</p>
                </section>
            </main>

            {/* Media Viewer Modal */}
            {viewerOpen && (
                <MediaViewerModal
                    stories={allStories}
                    initialIndex={viewerIndex}
                    onClose={() => setViewerIndex(null)}
                />
            )}

            {/* Contribution Modal */}
            {isContributionModalOpen && (
                <GuestContributionModal isOpen={isContributionModalOpen} onClose={() => setIsContributionModalOpen(false)} eventSlug={event.slug} />
            )}
        </motion.div>
    );
}