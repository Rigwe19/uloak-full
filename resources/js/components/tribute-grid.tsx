import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Heart, Image as ImageIcon, MessageCircle, Mic, User, Video, X } from 'lucide-react';
import { Key, SetStateAction, useEffect, useMemo, useState } from 'react';
import { TributeItem } from './tribute-sections';
import { createPortal } from 'react-dom';
import {
    TransformWrapper,
    TransformComponent,
} from "react-zoom-pan-pinch";

const PAGE_SIZE = 12;

// Derive a single type per tribute so filtering/icons don't need to
// re-check multiple optional fields all over the render tree.
function getTributeType(tribute: { audio: any; video: any; images: string | any[]; }) {
    if (tribute.audio) return 'audio';
    if (tribute.video) return 'video';
    if (tribute.images && tribute.images.length > 0) return 'photo';
    return 'text';
}

const FILTERS = [
    { key: 'all', label: 'All', icon: Heart },
    { key: 'audio', label: 'Audio', icon: Mic },
    { key: 'video', label: 'Video', icon: Video },
    { key: 'photo', label: 'Photos', icon: ImageIcon },
    { key: 'text', label: 'Messages', icon: MessageCircle },
];

function FilterChip({ active, onClick, label, count, Icon }: {
    active: boolean,
    onClick: VoidFunction,
    label: string;
    count: number;
    Icon: any
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${active
                ? 'bg-accent-gold/15 border-accent-gold text-accent-gold'
                : 'bg-surface/40 border-white/10 text-text-muted hover:border-white/20'
                }`}
        >
            <Icon size={12} />
            {label} ({count})
        </button>
    );
}

function TributeCard({
    tribute,
    isBirthday,
    onOpenLightbox,
}: {
    tribute: TributeItem;
    isBirthday: boolean;
    onOpenLightbox: (images: string[], index: number, tributeId: number) => void;
}) {
    const hasMedia = (tribute.images && tribute.images.length > 0) || !!tribute.video;
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-surface/40 border border-white/5 p-6 rounded-2xl relative break-inside-avoid mb-6"
        >
            <div className="absolute top-6 right-6 text-accent-gold/25">
                {tribute.audio ? (
                    <Mic className="w-5 h-5" />
                ) : tribute.video ? (
                    <Video className="w-5 h-5" />
                ) : (
                    <Heart className="w-5 h-5 fill-current" />
                )}
            </div>
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-accent-gold shrink-0">
                        <User className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <h4 className="font-serif text-base text-text-primary font-semibold">{tribute.name}</h4>
                        {tribute.relationship && (
                            <span className="text-[10px] tracking-wider uppercase font-mono text-accent-gold">{tribute.relationship}</span>
                        )}
                    </div>
                </div>

                {/* Audio tribute */}
                {tribute.audio && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-accent-gold">
                            <Mic size={12} />
                            <span className="text-[10px] font-mono uppercase tracking-wider">Audio Wish</span>
                        </div>
                        <audio
                            src={tribute.audio}
                            controls
                            className="w-full rounded-lg"
                            style={{ height: 36 }}
                        />
                        {tribute.audio_transcript_status === 'completed' && tribute.audio_transcript && (
                            <div className="bg-accent-gold/5 border border-accent-gold/15 rounded-lg p-3 mt-2">
                                <span className="text-[9px] font-mono uppercase tracking-wider text-accent-gold block mb-1">✨ Transcript</span>
                                <p className="text-xs text-text-muted italic leading-relaxed">"{tribute.audio_transcript}"</p>
                            </div>
                        )}
                        {tribute.audio_transcript_status === 'processing' && (
                            <div className="flex items-center gap-2 text-text-muted mt-1">
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
                )}

                {/* Text tribute */}
                {tribute.message && !tribute.audio && (
                    <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">{tribute.message}</p>
                )}

                {tribute.quote && (
                    <div className="p-4 bg-accent-gold/5 border-l border-accent-gold rounded-r-lg">
                        <p className="font-serif italic text-xs text-text-primary">"{tribute.quote}"</p>
                    </div>
                )}

                {tribute.images && tribute.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                        {tribute.images.map((img: string | undefined, i: number) => (
                            <button
                                key={i}
                                onClick={() => onOpenLightbox(tribute.images as string[], i, tribute.id,)}
                                className="aspect-[4/3] overflow-hidden border border-white/5 rounded-lg block"
                            >
                                <img
                                    src={img}
                                    alt=""
                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                            </button>
                        ))}
                    </div>
                )}

                {tribute.video && (
                    <div className="border border-white/5 rounded-lg overflow-hidden">
                        <video src={tribute.video} controls className="w-full aspect-video" />
                    </div>
                )}
            </div>

        </motion.div>
    );
}

export default function TributesGrid({ tributes, isBirthday }: { tributes: TributeItem[], isBirthday: boolean }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // Tag each tribute with its type once, rather than recomputing
    // on every filter click.
    const typedTributes = useMemo(
        () => tributes.map((t: any) => ({ ...t, _type: getTributeType(t) })),
        [tributes]
    );

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: typedTributes.length, audio: 0, video: 0, photo: 0, text: 0 };
        typedTributes.forEach((t: { _type: string | number; }) => { c[t._type] += 1; });
        return c;
    }, [typedTributes]);

    const filtered: TributeItem[] = useMemo(
        () => activeFilter === 'all'
            ? typedTributes
            : typedTributes.filter((t: { _type: string; }) => t._type === activeFilter),
        [typedTributes, activeFilter]
    );
    const [lightbox, setLightbox] = useState<{
        images: string[];
        index: number;
        tributeId: number;
    } | null>(null);

    const visible: TributeItem[] = filtered.slice(0, visibleCount);
    const remaining = filtered.length - visible.length;

    function handleFilterChange(key: SetStateAction<string>) {
        setActiveFilter(key);
        setVisibleCount(PAGE_SIZE); // reset pagination when switching filters
    }

    return (
        <div className="mt-16">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Heart size={18} className="text-accent-gold" />
                    {isBirthday ? 'Wishes' : 'Tributes'} ({typedTributes.length})
                </h3>
            </div>

            <div className="flex items-center gap-2 mb-8 flex-wrap">
                {FILTERS.map(({ key, label, icon }: { key: any, label: string, icon: any }) => (
                    <FilterChip
                        key={key}
                        active={activeFilter === key}
                        onClick={() => handleFilterChange(key)}
                        label={label}
                        count={counts[key]}
                        Icon={icon}
                    />
                ))}
            </div>

            {/* CSS columns give true masonry packing for variable-height
                cards (audio+transcript vs a one-line message) without a
                library. Falls back to a single column on small screens. */}
            <div className="[column-fill:_balance] sm:columns-1 md:columns-2 lg:columns-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {visible.map((tribute) => (
                        <TributeCard key={tribute.id}
                            onOpenLightbox={(images, index, tributeId) =>
                                setLightbox({ images, index, tributeId })
                            } tribute={tribute} isBirthday={isBirthday} />
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <p className="text-center text-text-muted text-sm py-12">No tributes in this category yet.</p>
            )}

            {remaining > 0 && (
                <div className="flex flex-col items-center gap-2 mt-4">
                    <button
                        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                        className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-accent-gold border border-accent-gold/30 rounded-full px-5 py-2.5 hover:bg-accent-gold/10 transition-colors"
                    >
                        Load {Math.min(PAGE_SIZE, remaining)} more
                        <ChevronDown size={14} />
                    </button>
                    <span className="text-[11px] text-text-muted font-mono">
                        Showing {visible.length} of {filtered.length}
                    </span>
                </div>
            )}
            {lightbox && (
                <ImageLightbox
                    images={lightbox.images}
                    index={lightbox.index}
                    tributeId={lightbox.tributeId}
                    setIndex={(index) =>
                        setLightbox((prev) =>
                            prev ? { ...prev, index } : null
                        )
                    }
                    onClose={() => setLightbox(null)}
                />
            )}
        </div>
    );
}

function ImageLightbox({
    images,
    index,
    tributeId,
    onClose,
    setIndex,
}: {
    images: string[];
    index: number;
    tributeId: number;
    onClose: () => void;
    setIndex: (index: number) => void;
}) {
    useEffect(() => {
        const previous = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previous;
        };
    }, []);
    useEffect(() => {
        if (images.length <= 1) return;

        const next =
            images[(index + 1) % images.length];

        const prev =
            images[
            (index - 1 + images.length) %
            images.length
            ];

        [next, prev].forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, [index, images]);
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();

            if (e.key === "ArrowLeft") prev();

            if (e.key === "ArrowRight") next();
        };

        window.addEventListener("keydown", handler);

        return () =>
            window.removeEventListener(
                "keydown",
                handler
            );
    }, [index]);

    const [scale, setScale] = useState(1);
    const prev = () =>
        setIndex((index - 1 + images.length) % images.length);

    const next = () =>
        setIndex((index + 1) % images.length);

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white"
                >
                    <X />
                </button>
                {scale === 1 && (
                    <>
                        {/* left hotspot */}
                        <button
                            onClick={prev}
                            className="absolute left-0 top-0 bottom-0 w-[20vw] z-20"
                            aria-label="Previous image"
                        />

                        {/* right hotspot */}
                        <button
                            onClick={next}
                            className="absolute right-0 top-20 bottom-0 w-[20vw] z-20"
                            aria-label="Next image"
                        />
                    </>)}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-4 text-white z-20 md:block hidden"
                        >
                            <ChevronLeft size={40} />
                        </button>

                        <button
                            onClick={next}
                            className="absolute right-4 text-white z-20 md:block hidden"
                        >
                            <ChevronRight size={40} />
                        </button>
                    </>
                )}

                <TransformWrapper
                    minScale={1}
                    maxScale={5}
                    doubleClick={{
                        disabled: true,
                    }}
                    pinch={{
                        step: 5,
                    }}
                    onZoom={(ref) => {
                        setScale(ref.state.scale);
                    }}
                    panning={{ disabled: scale === 1 }}
                >
                    <TransformComponent>
                        <motion.img
                            layoutId={`tribute-image-${tributeId}-${index}`}
                            key={images[index]}
                            src={images[index]}
                            className="max-h-[90vh] max-w-[90vw] object-contain"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            // onDragEnd={(_, info) => {
                            //     if (info.offset.x > 100) prev();
                            //     if (info.offset.x < -100) next();
                            // }}
                            onDragEnd={(_, info) => {
                                const swipe =
                                    Math.abs(info.offset.x) *
                                    info.velocity.x;

                                if (swipe < -10000) {
                                    next();
                                }

                                if (swipe > 10000) {
                                    prev();
                                }
                            }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                        />
                    </TransformComponent>
                </TransformWrapper>
                <div className="absolute bottom-6 text-white text-sm font-mono">
                    {index + 1} / {images.length}
                </div>
            </motion.div>
        </AnimatePresence >,
        document.body
    );
}