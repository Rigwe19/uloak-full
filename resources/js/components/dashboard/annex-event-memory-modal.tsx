import React, { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Camera, Video, MessageSquare, Files,
    Upload, ArrowLeft, Check, Loader2
} from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { Button } from './ui';
import { VoiceRecorder } from './voice-recorder';

interface EventType {
    id: string | number;
    name: string;
    slug: string;
    thumbnail?: string;
    stories_count: number;
}

interface AnnexEventMemoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventType;
    onSuccess?: () => void;
}

type AnnexStep = 'selection' | 'upload' | 'voice' | 'details' | 'success';
type MediaType = 'photo' | 'video' | 'audio' | 'document';

export function AnnexEventMemoryModal({ isOpen, onClose, event, onSuccess }: AnnexEventMemoryModalProps) {
    const [step, setStep] = useState<AnnexStep>('selection');
    const [mediaType, setMediaType] = useState<MediaType | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        type: '' as MediaType | '',
        files: [] as File[],
        thumbnail: null as File | null,
        recording: null as File | null,
        duration: '',
    });

    const [previews, setPreviews] = useState<{ url: string, type: string, name: string }[]>([]);
    const [customThumbnailPreview, setCustomThumbnailPreview] = useState<string | null>(null);

    const handleMediaTypeSelect = (type: MediaType) => {
        setMediaType(type);
        setData('type', type);
        if (type === 'audio') {
            setStep('voice');
        } else {
            setStep('upload');
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
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

    const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('thumbnail', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveVoice = (blob: Blob, duration: string) => {
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        setData({
            ...data,
            type: 'audio',
            recording: file,
            duration: duration,
        });
        setStep('details');
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        post(`/dashboard/events/${event.slug}/stories`, {
            forceFormData: true,
            onSuccess: () => {
                setStep('success');
                onSuccess?.();
            },
        });
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep('selection');
            setMediaType(null);
            setCustomThumbnailPreview(null);
            setPreviews([]);
            reset();
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-110 flex items-end justify-center bg-black/80 p-4 backdrop-blur-md md:items-center md:p-8"
            >
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="relative mb-24 w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-surface p-8 shadow-2xl ring-1 ring-white/5 md:mb-0 md:p-10"
                >
                    <div className="absolute top-4 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-white/10 md:hidden" />

                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary md:top-8 md:right-8"
                    >
                        <X size={24} />
                    </button>

                    {/* Step: Media Type Selection */}
                    {step === 'selection' && (
                        <div className="space-y-6">
                            <div className="mb-8">
                                <h2 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">
                                    Add to {event.name}
                                </h2>
                                <p className="text-sm leading-relaxed text-text-muted">
                                    What format does this event legacy take? Select a media type to continue.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { type: 'photo', icon: Camera, label: 'Photo', color: 'bg-blue-500/10 text-blue-500' },
                                    { type: 'video', icon: Video, label: 'Video', color: 'bg-red-500/10 text-red-500' },
                                    { type: 'audio', icon: MessageSquare, label: 'Voice', color: 'bg-accent-gold/10 text-accent-gold' },
                                    { type: 'document', icon: Files, label: 'Document', color: 'bg-emerald-500/10 text-emerald-500' },
                                ].map((item) => (
                                    <button
                                        key={item.type}
                                        onClick={() => handleMediaTypeSelect(item.type as MediaType)}
                                        className="group flex flex-col items-center gap-4 rounded-3xl border border-border-subtle bg-bg-dark p-6 transition-all hover:border-accent-gold/40 hover:bg-surface"
                                    >
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} transition-transform group-hover:scale-110`}>
                                            <item.icon size={24} />
                                        </div>
                                        <span className="text-sm font-bold text-text-primary">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step: Upload */}
                    {step === 'upload' && (
                        <div className="space-y-6">
                            <button
                                onClick={() => setStep('selection')}
                                className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase hover:opacity-80"
                            >
                                <ArrowLeft size={14} /> Back
                            </button>
                            <div className="text-center">
                                <h2 className="mb-2 text-2xl font-bold text-text-primary">
                                    Upload {mediaType === 'photo' ? 'a Photo' : mediaType === 'video' ? 'a Video' : 'a Document'}
                                </h2>
                                <p className="mb-8 text-sm text-text-muted">
                                    Select the file you'd like to preserve in this event.
                                </p>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer rounded-3xl border-2 border-dashed border-border-subtle bg-bg-dark/50 p-12 transition-all hover:border-accent-gold/40 hover:bg-accent-gold/5"
                                >
                                    <Upload className="mx-auto mb-4 text-text-muted" size={40} />
                                    <span className="block text-sm font-medium text-text-primary">
                                        Click to browse or drag and drop
                                    </span>
                                    <span className="mt-2 block text-xs text-text-muted">
                                        Max file size: 50MB
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    multiple={mediaType === 'photo' || mediaType === 'video'}
                                    accept={
                                        mediaType === 'photo' ? 'image/*' :
                                        mediaType === 'video' ? 'video/*' :
                                        '*/*'
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {/* Step: Details Form */}
                    {step === 'details' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <button
                                type="button"
                                onClick={() => setStep(mediaType === 'audio' ? 'voice' : 'upload')}
                                className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase hover:opacity-80"
                            >
                                <ArrowLeft size={14} /> Back
                            </button>

                            <div>
                                <h2 className="mb-1 text-2xl font-bold text-text-primary">Memory Details</h2>
                                <p className="text-sm text-text-muted">Give your memory a title and description.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Memory Title
                                    </label>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="e.g., Opening ceremony speeches"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                    />
                                    {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Story / Description
                                    </label>
                                    <textarea
                                        placeholder="Tell the story behind this memory..."
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full resize-none rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                    />
                                </div>

                                {previews.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Collection Previews ({previews.length})
                                        </label>
                                        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                                            {previews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square h-24 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-dark">
                                                    {preview.type.startsWith('image/') ? (
                                                        <img src={preview.url} className="h-full w-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-text-muted">
                                                            {preview.type.startsWith('video/') ? <Video size={16} /> : <Files size={16} />}
                                                            <span className="truncate text-[8px]">{preview.name}</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-red-500"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex aspect-square h-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border-subtle bg-bg-dark text-text-muted transition-all hover:border-accent-gold/40 hover:text-accent-gold"
                                            >
                                                <Plus size={16} />
                                                <span className="text-[8px] font-bold">Add More</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {customThumbnailPreview ? (
                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Custom Thumbnail
                                        </label>
                                        <div
                                            onClick={() => document.getElementById('event-story-thumbnail-input')?.click()}
                                            className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border border-border-subtle bg-bg-dark"
                                        >
                                            <img
                                                src={customThumbnailPreview}
                                                className="h-full w-full object-cover"
                                                alt="Preview"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                                <Camera size={24} className="text-white" />
                                            </div>
                                            <input
                                                id="event-story-thumbnail-input"
                                                type="file"
                                                className="hidden"
                                                onChange={handleThumbnailChange}
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Custom Thumbnail (Optional)
                                        </label>
                                        <div
                                            onClick={() => document.getElementById('event-story-thumbnail-input')?.click()}
                                            className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-subtle bg-bg-dark text-text-muted transition-all hover:border-accent-gold/40"
                                        >
                                            <Camera size={24} />
                                            <span className="text-xs">Add a cover image</span>
                                            <input
                                                id="event-story-thumbnail-input"
                                                type="file"
                                                className="hidden"
                                                onChange={handleThumbnailChange}
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                variant="primary"
                                className="w-full"
                                type="submit"
                                disabled={processing || !data.title || (data.files.length === 0 && !data.recording)}
                            >
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={18} className="animate-spin" /> Preserving...
                                    </div>
                                ) : 'Preserve Memory'}
                            </Button>
                        </form>
                    )}

                    {/* Step: Success */}
                    {step === 'success' && (
                        <div className="py-8 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                                <Check size={40} />
                            </div>
                            <h2 className="mb-2 text-3xl font-bold text-text-primary">Memory Preserved</h2>
                            <p className="mb-8 text-text-muted">
                                Your memory has been successfully added to {event.name}.
                            </p>
                            <Button variant="primary" className="w-full" onClick={handleClose}>
                                Done
                            </Button>
                        </div>
                    )}
                </motion.div>

                {/* Voice Recorder Overlay */}
                {step === 'voice' && (
                    <VoiceRecorder
                        onClose={() => setStep('selection')}
                        onSave={handleSaveVoice}
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );
}
