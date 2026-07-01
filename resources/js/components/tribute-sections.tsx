import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Heart, User, Mic, Check, X, Trash2, Expand, Download, X as XIcon } from "lucide-react";
import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";

const tributeCardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" as const },
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

function ImageLightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
    const [current, setCurrent] = useState(startIndex);

    const prev = useCallback(() => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
    const next = useCallback(() => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-bg-dark/95 backdrop-blur-xl p-4"
            onClick={onClose}
        >
            <button onClick={onClose} className="absolute top-6 right-6 z-10 text-white/60 hover:text-white transition-colors">
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
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-md transition-all"
                    >
                        ‹
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-md transition-all"
                    >
                        ›
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-white/50 tracking-wider">
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
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border
        ${variant === "pending"
                    ? "bg-surface border-white/10 text-yellow-400"
                    : "bg-surface border-white/10 text-accent-gold"
                }`}
        >
            <User className="w-4 h-4" />
        </div>
    );
}

function TributeMeta({
    tribute,
    variant,
    dateKey = "created_at",
    relationKey = "relationship",
}: {
    tribute: any;
    variant: 'pending' | 'approved';
    dateKey?: string;
    relationKey?: string;
}) {
    const date = new Date(tribute[dateKey] ?? tribute.createdAt ?? tribute.created_at);
    const relation = tribute[relationKey] ?? tribute.relation ?? tribute.relationship;
    return (
        <div className="flex items-start gap-3">
            <TributeAvatar variant={variant} />
            <div>
                <h4 className="font-serif text-sm text-text-primary font-semibold leading-snug">
                    {tribute.name}
                </h4>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] tracking-widest uppercase font-mono mt-0.5 text-text-muted">
                    {relation && (
                        <>
                            <span className={variant === "pending" ? "text-yellow-400 font-semibold" : "text-accent-gold font-semibold"}>
                                {relation}
                            </span>
                            <span className="opacity-30">•</span>
                        </>
                    )}
                    <span>
                        {date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                </div>
            </div>
        </div>
    );
}

function TributeQuote({ quote, variant }: { quote: string | null | undefined; variant: 'pending' | 'approved' }) {
    if (!quote) return null;
    return (
        <div
            className={`px-4 py-3 rounded-r-lg border-l-2
        ${variant === "pending"
                    ? "bg-yellow-500/5 border-yellow-400"
                    : "bg-accent-gold/5 border-accent-gold"
                }`}
        >
            <p className="font-serif italic text-xs text-text-primary leading-relaxed">"{quote}"</p>
            {variant === "approved" && (
                <p className="font-mono text-[9px] tracking-widest text-accent-gold uppercase mt-1">
                    — memorable quote
                </p>
            )}
        </div>
    );
}

function TributeAudio({ audio, transcript, transcriptStatus }: { audio: string | null | undefined; transcript?: string | null; transcriptStatus?: string | null }) {
    if (!audio) return null;
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-accent-gold">
                <Mic size={12} />
                <span className="text-[9px] font-mono uppercase tracking-wider">Audio Recording</span>
            </div>
            <audio
                src={audio}
                controls
                className="w-full rounded-lg"
                style={{ height: 36 }}
                preload="metadata"
            />
            {transcript && (
                <div className="bg-accent-gold/5 border border-accent-gold/15 rounded-lg p-3">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-accent-gold block mb-1">✨ Transcript</span>
                    <p className="text-xs text-text-muted italic leading-relaxed">"{transcript}"</p>
                </div>
            )}
            {transcriptStatus === 'processing' && (
                <div className="flex items-center gap-2 text-text-muted">
                    <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-[9px] font-mono uppercase tracking-wider"
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

    if (!images || images.length === 0) return null;

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
                        className="aspect-[4/3] overflow-hidden border border-white/5 rounded-lg group relative cursor-pointer"
                    >
                        <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Expand size={14} className="text-white/0 group-hover:text-white/80 transition-all" />
                        </div>
                    </button>
                ))}
            </div>

            {createPortal(<AnimatePresence>
                {lightboxOpen && (
                    <ImageLightbox
                        images={images}
                        startIndex={lightboxIndex}
                        onClose={() => setLightboxOpen(false)}
                    />
                )}
            </AnimatePresence>, document.body)}
        </>
    );
}

function TributeVideo({ video }: { video: string | null | undefined }) {
    if (!video) return null;
    return (
        <div className="border border-white/5 rounded-lg overflow-hidden bg-surface">
            <video src={video} controls className="w-full aspect-video" preload="metadata" />
        </div>
    );
}

interface ActionButtonProps {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    className?: string;
}

function ActionButton({ onClick, icon: Icon, label, className = "" }: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3.5 py-1.5 rounded-lg border transition-opacity hover:opacity-75 ${className}`}
        >
            <Icon className="w-3.5 h-3.5" />
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

function SectionHeader({ icon: Icon, iconClass, title, count }: SectionHeaderProps) {
    return (
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
            <Icon size={15} className={iconClass} />
            <h3 className="text-sm font-medium text-text-primary tracking-wide">{title}</h3>
            <span className="ml-auto text-[10px] font-mono tracking-wider text-text-muted bg-surface border border-white/5 rounded-full px-2.5 py-0.5">
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

function PendingTributeCard<T extends TributeItem>({ tribute, index, onApprove, onReject }: PendingTributeCardProps<T>) {
    return (
        <motion.div
            custom={index}
            variants={tributeCardVariants}
            initial="hidden"
            animate="visible"
            className="bg-yellow-500/5 border border-yellow-500/20 p-5 rounded-2xl relative"
        >
            <div className="absolute top-5 right-5 text-yellow-400/25">
                <AlertCircle className="w-4 h-4" />
            </div>

            <div className="space-y-3">
                <TributeMeta tribute={tribute} variant="pending" />
                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">{tribute.message}</p>
                <TributeQuote quote={tribute.quote || null} variant="pending" />
                <TributeAudio
                    audio={tribute.audio}
                    transcript={tribute.audio_transcript}
                    transcriptStatus={tribute.audio_transcript_status}
                />
                <TributeImages images={tribute.images} />
                <TributeVideo video={tribute.video} />
            </div>

            <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center gap-2.5">
                <ActionButton
                    onClick={() => onApprove(tribute)}
                    icon={Check}
                    label="Approve"
                    className="bg-accent-gold/10 border-accent-gold/25 text-accent-gold"
                />
                <ActionButton
                    onClick={() => onReject(tribute)}
                    icon={X}
                    label="Reject"
                    className="bg-transparent border-red-400/20 text-red-400"
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

function ApprovedTributeCard<T extends TributeItem>({ tribute, index, onDelete, showPreservedTag = false }: ApprovedTributeCardProps<T>) {
    const hasMedia = (tribute.images && tribute.images.length > 0) || !!tribute.video;

    return (
        <motion.div
            custom={index}
            variants={tributeCardVariants}
            initial="hidden"
            animate="visible"
            className="bg-surface/40 border border-white/5 p-5 rounded-2xl relative"
        >
            <div className="absolute top-5 right-5 text-accent-gold/20">
                <Heart className="w-4 h-4 fill-current" />
            </div>

            <div className="space-y-3">
                <TributeMeta
                    tribute={tribute}
                    variant="approved"
                    dateKey={tribute.created_at ? "created_at" : "createdAt"}
                    relationKey={tribute.relationship ? "relationship" : "relation"}
                />
                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">{tribute.message}</p>
                <TributeQuote quote={tribute.quote || null} variant="approved" />
                <TributeAudio
                    audio={tribute.audio}
                    transcript={tribute.audio_transcript}
                    transcriptStatus={tribute.audio_transcript_status}
                />
                <TributeImages images={tribute.images} />
                <TributeVideo video={tribute.video} />
            </div>

            <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center gap-2">
                <ActionButton
                    onClick={() => onDelete(tribute)}
                    icon={Trash2}
                    label="Delete"
                    className="bg-transparent border-red-400/20 text-red-400"
                />
                {showPreservedTag && (
                    <span className="ml-auto text-[9px] font-mono tracking-widest text-text-muted/50 uppercase">
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

export function PendingTributesSection<T extends TributeItem>({ pendingTributes, onApprove, onDelete }: PendingTributesSectionProps<T>) {
    if (!pendingTributes || pendingTributes.length === 0) return null;

    return (
        <div className="mt-16">
            <SectionHeader
                icon={AlertCircle}
                iconClass="text-yellow-400"
                title="Pending review"
                count={`${pendingTributes.length} awaiting`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

export function ApprovedTributesSection<T extends TributeItem>({ approvedTributes, onDelete, context }: ApprovedTributesSectionProps<T>) {
    if (!approvedTributes || approvedTributes.length === 0) return null;

    const isBirthday = context?.room_type === 'birthday';

    return (
        <div className="mt-16">
            <SectionHeader
                icon={Heart}
                iconClass="text-accent-gold"
                title={isBirthday ? 'Wishes' : 'Tributes'}
                count={`${approvedTributes.length} ${isBirthday ? 'wishes' : 'published'}`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

export function SubmittedTributesSection<T extends TributeItem>({ tributes }: SubmittedTributesSectionProps<T>) {
    if (!tributes || tributes.length === 0) return null;

    return (
        <div className="mt-16">
            <SectionHeader
                icon={Heart}
                iconClass="text-accent-gold"
                title="Wishes"
                count={`${tributes.length} submitted`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tributes.map((tribute, i) => (
                    <ApprovedTributeCard
                        key={tribute.id}
                        tribute={tribute}
                        index={i}
                        onDelete={() => { }}
                        showPreservedTag
                    />
                ))}
            </div>
        </div>
    );
}