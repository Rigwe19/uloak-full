import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Heart,
    User,
    Mic,
    Check,
    X,
    Trash2,
    Expand,
    Download,
    X as XIcon,
} from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { VideoPlayer } from '@/components/media/VideoPlayer';

const tributeCardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.07,
            duration: 0.35,
            ease: 'easeOut' as const,
        },
    }),
};

export interface TributeItem {
    id: number;
    name: string;
    relation?: string | null;
    relationship?: string | null;
    message: string;
    quote?: string | null;
    createdAt?: string;
    created_at?: string;
    images?: string[] | null;
    video?: string | null;
    audio?: string | null;
    audio_transcript?: string | null;
    audio_transcript_status?: string | null;
    is_approved?: boolean;
}

// ---------------------------------------------------------------------------
// Image lightbox overlay
// ---------------------------------------------------------------------------

function ImageLightbox({
    images,
    startIndex,
    onClose,
}: {
    images: string[];
    startIndex: number;
    onClose: () => void;
}) {
    const [current, setCurrent] = useState(startIndex);

    const prev = useCallback(
        () => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1)),
        [images.length],
    );
    const next = useCallback(
        () => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1)),
        [images.length],
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-bg-dark/95 p-4 backdrop-blur-xl"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 text-white/60 transition-colors hover:text-white"
            >
                <XIcon size={28} />
            </button>

            <motion.img
                key={current}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                src={images[current]}
                alt=""
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prev();
                        }}
                        className="absolute top-1/2 left-6 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
                    >
                        ‹
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            next();
                        }}
                        className="absolute top-1/2 right-6 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
                    >
                        ›
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs tracking-wider text-white/50">
                        {current + 1} / {images.length}
                    </div>
                </>
            )}
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function TributeAvatar({ variant }: { variant: 'pending' | 'approved' }) {
    return (
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                variant === 'pending'
                    ? 'border-white/10 bg-surface text-yellow-400'
                    : 'border-white/10 bg-surface text-accent-gold'
            }`}
        >
            <User className="h-4 w-4" />
        </div>
    );
}

function TributeMeta({
    tribute,
    variant,
    dateKey = 'created_at',
    relationKey = 'relationship',
}: {
    tribute: any;
    variant: 'pending' | 'approved';
    dateKey?: string;
    relationKey?: string;
}) {
    const date = new Date(
        tribute[dateKey] ?? tribute.createdAt ?? tribute.created_at,
    );
    const relation =
        tribute[relationKey] ?? tribute.relation ?? tribute.relationship;

    return (
        <div className="flex items-start gap-3">
            <TributeAvatar variant={variant} />
            <div>
                <h4 className="font-serif text-sm leading-snug font-semibold text-text-primary">
                    {tribute.name}
                </h4>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10px] tracking-widest text-text-muted uppercase">
                    {relation && (
                        <>
                            <span
                                className={
                                    variant === 'pending'
                                        ? 'font-semibold text-yellow-400'
                                        : 'font-semibold text-accent-gold'
                                }
                            >
                                {relation}
                            </span>
                            <span className="opacity-30">•</span>
                        </>
                    )}
                    <span>
                        {date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
}

function TributeQuote({
    quote,
    variant,
}: {
    quote: string | null | undefined;
    variant: 'pending' | 'approved';
}) {
    if (!quote) {
        return null;
    }

    return (
        <div
            className={`rounded-r-lg border-l-2 px-4 py-3 ${
                variant === 'pending'
                    ? 'border-yellow-400 bg-yellow-500/5'
                    : 'border-accent-gold bg-accent-gold/5'
            }`}
        >
            <p className="font-serif text-xs leading-relaxed text-text-primary italic">
                "{quote}"
            </p>
            {variant === 'approved' && (
                <p className="mt-1 font-mono text-[9px] tracking-widest text-accent-gold uppercase">
                    — memorable quote
                </p>
            )}
        </div>
    );
}

function TributeAudio({
    audio,
    transcript,
    transcriptStatus,
}: {
    audio: string | null | undefined;
    transcript?: string | null;
    transcriptStatus?: string | null;
}) {
    if (!audio) {
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-accent-gold">
                <Mic size={12} />
                <span className="font-mono text-[9px] tracking-wider uppercase">
                    Audio Recording
                </span>
            </div>
            <audio
                src={audio}
                controls
                className="w-full rounded-lg"
                style={{ height: 36 }}
                preload="metadata"
            />
            {transcript && (
                <div className="rounded-lg border border-accent-gold/15 bg-accent-gold/5 p-3">
                    <span className="mb-1 block font-mono text-[9px] tracking-wider text-accent-gold uppercase">
                        ✨ Transcript
                    </span>
                    <p className="text-xs leading-relaxed text-text-muted italic">
                        "{transcript}"
                    </p>
                </div>
            )}
            {transcriptStatus === 'processing' && (
                <div className="flex items-center gap-2 text-text-muted">
                    <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="font-mono text-[9px] tracking-wider uppercase"
                    >
                        ⏳ Transcribing audio…
                    </motion.span>
                </div>
            )}
        </div>
    );
}

function TributeImages({ images }: { images: string[] | null | undefined }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    if (!images || images.length === 0) {
        return null;
    }

    const openLightbox = (idx: number) => {
        setLightboxIndex(idx);
        setLightboxOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
                {images.map((img: string, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => openLightbox(idx)}
                        className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border border-white/5"
                    >
                        <img
                            src={img}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                            <Expand
                                size={14}
                                className="text-white/0 transition-all group-hover:text-white/80"
                            />
                        </div>
                    </button>
                ))}
            </div>

            {createPortal(
                <AnimatePresence>
                    {lightboxOpen && (
                        <ImageLightbox
                            images={images}
                            startIndex={lightboxIndex}
                            onClose={() => setLightboxOpen(false)}
                        />
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </>
    );
}

function TributeVideo({ video }: { video: string | null | undefined }) {
    if (!video) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-lg border border-white/5 bg-surface">
            <VideoPlayer
                video={{
                    id: `tribute-video-${video}`,
                    title: 'Tribute Video',
                    url: video,
                    thumbnail: null,
                    preview: null,
                    sprite: null,
                }}
                autoPlay={false}
                showControls
                showSpeedControl={false}
                showPip={false}
                showVolumeSlider
                className="aspect-video w-full"
                videoClassName="w-full h-full object-contain"
            />
        </div>
    );
}

interface ActionButtonProps {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    className?: string;
}

function ActionButton({
    onClick,
    icon: Icon,
    label,
    className = '',
}: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-[11px] font-medium transition-opacity hover:opacity-75 ${className}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </button>
    );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    iconClass?: string;
    title: string;
    count: string | number;
}

function SectionHeader({
    icon: Icon,
    iconClass,
    title,
    count,
}: SectionHeaderProps) {
    return (
        <div className="mb-5 flex items-center gap-2 border-b border-white/5 pb-3">
            <Icon size={15} className={iconClass} />
            <h3 className="text-sm font-medium tracking-wide text-text-primary">
                {title}
            </h3>
            <span className="ml-auto rounded-full border border-white/5 bg-surface px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-text-muted">
                {count}
            </span>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Pending tribute card
// ---------------------------------------------------------------------------

interface PendingTributeCardProps<T> {
    tribute: T;
    index: number;
    onApprove: (tribute: T) => void;
    onReject: (tribute: T) => void;
}

function PendingTributeCard<T extends TributeItem>({
    tribute,
    index,
    onApprove,
    onReject,
}: PendingTributeCardProps<T>) {
    return (
        <motion.div
            custom={index}
            variants={tributeCardVariants}
            initial="hidden"
            animate="visible"
            className="relative rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5"
        >
            <div className="absolute top-5 right-5 text-yellow-400/25">
                <AlertCircle className="h-4 w-4" />
            </div>

            <div className="space-y-3">
                <TributeMeta tribute={tribute} variant="pending" />
                <p className="text-xs leading-relaxed whitespace-pre-line text-text-muted">
                    {tribute.message}
                </p>
                <TributeQuote quote={tribute.quote || null} variant="pending" />
                <TributeAudio
                    audio={tribute.audio}
                    transcript={tribute.audio_transcript}
                    transcriptStatus={tribute.audio_transcript_status}
                />
                <TributeImages images={tribute.images} />
                <TributeVideo video={tribute.video} />
            </div>

            <div className="mt-5 flex items-center gap-2.5 border-t border-white/5 pt-3.5">
                <ActionButton
                    onClick={() => onApprove(tribute)}
                    icon={Check}
                    label="Approve"
                    className="border-accent-gold/25 bg-accent-gold/10 text-accent-gold"
                />
                <ActionButton
                    onClick={() => onReject(tribute)}
                    icon={X}
                    label="Reject"
                    className="border-red-400/20 bg-transparent text-red-400"
                />
            </div>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Approved tribute card
// ---------------------------------------------------------------------------

interface ApprovedTributeCardProps<T> {
    tribute: T;
    index: number;
    onDelete: (tribute: T) => void;
    showPreservedTag?: boolean;
}

function ApprovedTributeCard<T extends TributeItem>({
    tribute,
    index,
    onDelete,
    showPreservedTag = false,
}: ApprovedTributeCardProps<T>) {
    const hasMedia =
        (tribute.images && tribute.images.length > 0) || !!tribute.video;

    return (
        <motion.div
            custom={index}
            variants={tributeCardVariants}
            initial="hidden"
            animate="visible"
            className="relative rounded-2xl border border-white/5 bg-surface/40 p-5"
        >
            <div className="absolute top-5 right-5 text-accent-gold/20">
                <Heart className="h-4 w-4 fill-current" />
            </div>

            <div className="space-y-3">
                <TributeMeta
                    tribute={tribute}
                    variant="approved"
                    dateKey={tribute.created_at ? 'created_at' : 'createdAt'}
                    relationKey={
                        tribute.relationship ? 'relationship' : 'relation'
                    }
                />
                <p className="text-xs leading-relaxed whitespace-pre-line text-text-muted">
                    {tribute.message}
                </p>
                <TributeQuote
                    quote={tribute.quote || null}
                    variant="approved"
                />
                <TributeAudio
                    audio={tribute.audio}
                    transcript={tribute.audio_transcript}
                    transcriptStatus={tribute.audio_transcript_status}
                />
                <TributeImages images={tribute.images} />
                <TributeVideo video={tribute.video} />
            </div>

            <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-3.5">
                <ActionButton
                    onClick={() => onDelete(tribute)}
                    icon={Trash2}
                    label="Delete"
                    className="border-red-400/20 bg-transparent text-red-400"
                />
                {showPreservedTag && (
                    <span className="ml-auto font-mono text-[9px] tracking-widest text-text-muted/50 uppercase">
                        Preserved
                    </span>
                )}
            </div>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Main exported sections
// ---------------------------------------------------------------------------

interface PendingTributesSectionProps<T> {
    pendingTributes: T[] | null | undefined;
    onApprove: (tribute: T) => void;
    onDelete: (tribute: T) => void;
}

export function PendingTributesSection<T extends TributeItem>({
    pendingTributes,
    onApprove,
    onDelete,
}: PendingTributesSectionProps<T>) {
    if (!pendingTributes || pendingTributes.length === 0) {
        return null;
    }

    return (
        <div className="mt-16">
            <SectionHeader
                icon={AlertCircle}
                iconClass="text-yellow-400"
                title="Pending review"
                count={`${pendingTributes.length} awaiting`}
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {pendingTributes.map((tribute, i) => (
                    <PendingTributeCard
                        key={tribute.id}
                        tribute={tribute}
                        index={i}
                        onApprove={onApprove}
                        onReject={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}

interface ApprovedTributesSectionProps<T> {
    approvedTributes: T[] | null | undefined;
    onDelete: (tribute: T) => void;
    context?: { room_type?: string };
}

export function ApprovedTributesSection<T extends TributeItem>({
    approvedTributes,
    onDelete,
    context,
}: ApprovedTributesSectionProps<T>) {
    if (!approvedTributes || approvedTributes.length === 0) {
        return null;
    }

    const isBirthday = context?.room_type === 'birthday';

    return (
        <div className="mt-16">
            <SectionHeader
                icon={Heart}
                iconClass="text-accent-gold"
                title={isBirthday ? 'Wishes' : 'Tributes'}
                count={`${approvedTributes.length} ${isBirthday ? 'wishes' : 'published'}`}
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {approvedTributes.map((tribute, i) => (
                    <ApprovedTributeCard
                        key={tribute.id}
                        tribute={tribute}
                        index={i}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}

interface SubmittedTributesSectionProps<T> {
    tributes: T[] | null | undefined;
}

export function SubmittedTributesSection<T extends TributeItem>({
    tributes,
}: SubmittedTributesSectionProps<T>) {
    if (!tributes || tributes.length === 0) {
        return null;
    }

    return (
        <div className="mt-16">
            <SectionHeader
                icon={Heart}
                iconClass="text-accent-gold"
                title="Wishes"
                count={`${tributes.length} submitted`}
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {tributes.map((tribute, i) => (
                    <ApprovedTributeCard
                        key={tribute.id}
                        tribute={tribute}
                        index={i}
                        onDelete={() => {}}
                        showPreservedTag
                    />
                ))}
            </div>
        </div>
    );
}
