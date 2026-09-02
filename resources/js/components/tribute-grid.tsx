import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Heart,
    Image as ImageIcon,
    MessageCircle,
    Mic,
    User,
    Video,
    X,
} from 'lucide-react';
import type { SetStateAction } from 'react';
import { Key, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import type { PlayerVideo } from '@/types/video-player';
import type { TributeItem } from './tribute-sections';

const PAGE_SIZE = 12;

// Derive a single type per tribute so filtering/icons don't need to
// re-check multiple optional fields all over the render tree.
function getTributeType(tribute: {
    audio: any;
    video: any;
    images: string | any[];
}) {
    if (tribute.audio) {
        return 'audio';
    }

    if (tribute.video) {
        return 'video';
    }

    if (tribute.images && tribute.images.length > 0) {
        return 'photo';
    }

    return 'text';
}

const FILTERS = [
    { key: 'all', label: 'All', icon: Heart },
    { key: 'audio', label: 'Audio', icon: Mic },
    { key: 'video', label: 'Video', icon: Video },
    { key: 'photo', label: 'Photos', icon: ImageIcon },
    { key: 'text', label: 'Messages', icon: MessageCircle },
];

function FilterChip({
    active,
    onClick,
    label,
    count,
    Icon,
}: {
    active: boolean;
    onClick: VoidFunction;
    label: string;
    count: number;
    Icon: any;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs tracking-wider uppercase transition-colors ${
                active
                    ? 'border-accent-gold bg-accent-gold/15 text-accent-gold'
                    : 'border-white/10 bg-surface/40 text-text-muted hover:border-white/20'
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
    onOpenLightbox: (
        images: string[],
        index: number,
        tributeId: number,
    ) => void;
}) {
    const hasMedia =
        (tribute.images && tribute.images.length > 0) || !!tribute.video;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative mb-6 break-inside-avoid rounded-2xl border border-white/5 bg-surface/40 p-6"
        >
            <div className="absolute top-6 right-6 text-accent-gold/25">
                {tribute.audio ? (
                    <Mic className="h-5 w-5" />
                ) : tribute.video ? (
                    <Video className="h-5 w-5" />
                ) : (
                    <Heart className="h-5 w-5 fill-current" />
                )}
            </div>
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface text-accent-gold">
                        <User className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <h4 className="font-serif text-base font-semibold text-text-primary">
                            {tribute.name}
                        </h4>
                        {tribute.relationship && (
                            <span className="font-mono text-[10px] tracking-wider text-accent-gold uppercase">
                                {tribute.relationship}
                            </span>
                        )}
                    </div>
                </div>

                {/* Audio tribute */}
                {tribute.audio && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-accent-gold">
                            <Mic size={12} />
                            <span className="font-mono text-[10px] tracking-wider uppercase">
                                Audio Wish
                            </span>
                        </div>
                        <audio
                            src={tribute.audio}
                            controls
                            className="w-full rounded-lg"
                            style={{ height: 36 }}
                        />
                        {tribute.audio_transcript_status === 'completed' &&
                            tribute.audio_transcript && (
                                <div className="mt-2 rounded-lg border border-accent-gold/15 bg-accent-gold/5 p-3">
                                    <span className="mb-1 block font-mono text-[9px] tracking-wider text-accent-gold uppercase">
                                        ✨ Transcript
                                    </span>
                                    <p className="text-xs leading-relaxed text-text-muted italic">
                                        "{tribute.audio_transcript}"
                                    </p>
                                </div>
                            )}
                        {tribute.audio_transcript_status === 'processing' && (
                            <div className="mt-1 flex items-center gap-2 text-text-muted">
                                <motion.span
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                    }}
                                    className="font-mono text-[9px] tracking-wider uppercase"
                                >
                                    ⏳ Transcribing audio…
                                </motion.span>
                            </div>
                        )}
                    </div>
                )}

                {/* Text tribute */}
                {tribute.message && !tribute.audio && (
                    <p className="text-sm leading-relaxed whitespace-pre-line text-text-muted">
                        {tribute.message}
                    </p>
                )}

                {tribute.quote && (
                    <div className="rounded-r-lg border-l border-accent-gold bg-accent-gold/5 p-4">
                        <p className="font-serif text-xs text-text-primary italic">
                            "{tribute.quote}"
                        </p>
                    </div>
                )}

                {tribute.images && tribute.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                        {tribute.images.map(
                            (img: string | undefined, i: number) => (
                                <button
                                    key={i}
                                    onClick={() =>
                                        onOpenLightbox(
                                            tribute.images as string[],
                                            i,
                                            tribute.id,
                                        )
                                    }
                                    className="block aspect-[4/3] overflow-hidden rounded-lg border border-white/5"
                                >
                                    <img
                                        src={img}
                                        alt=""
                                        className="h-full w-full object-cover transition-transform hover:scale-105"
                                    />
                                </button>
                            ),
                        )}
                    </div>
                )}

                {tribute.video && (
                    <div className="overflow-hidden rounded-lg border border-white/5">
                        <VideoPlayer
                            video={{
                                id: `tribute-${tribute.id}-video`,
                                title: 'Tribute Video',
                                url: tribute.video,
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
                )}
            </div>
        </motion.div>
    );
}

export default function TributesGrid({
    tributes,
    isBirthday,
}: {
    tributes: TributeItem[];
    isBirthday: boolean;
}) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // Tag each tribute with its type once, rather than recomputing
    // on every filter click.
    const typedTributes = useMemo(
        () => tributes.map((t: any) => ({ ...t, _type: getTributeType(t) })),
        [tributes],
    );

    const counts = useMemo(() => {
        const c: Record<string, number> = {
            all: typedTributes.length,
            audio: 0,
            video: 0,
            photo: 0,
            text: 0,
        };
        typedTributes.forEach((t: { _type: string | number }) => {
            c[t._type] += 1;
        });

        return c;
    }, [typedTributes]);

    const filtered: TributeItem[] = useMemo(
        () =>
            activeFilter === 'all'
                ? typedTributes
                : typedTributes.filter(
                      (t: { _type: string }) => t._type === activeFilter,
                  ),
        [typedTributes, activeFilter],
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
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h3 className="flex items-center gap-2 text-xl font-bold text-text-primary">
                    <Heart size={18} className="text-accent-gold" />
                    {isBirthday ? 'Wishes' : 'Tributes'} ({typedTributes.length}
                    )
                </h3>
            </div>

            <div className="mb-8 flex flex-wrap items-center gap-2">
                {FILTERS.map(
                    ({
                        key,
                        label,
                        icon,
                    }: {
                        key: any;
                        label: string;
                        icon: any;
                    }) => (
                        <FilterChip
                            key={key}
                            active={activeFilter === key}
                            onClick={() => handleFilterChange(key)}
                            label={label}
                            count={counts[key]}
                            Icon={icon}
                        />
                    ),
                )}
            </div>

            {/* CSS columns give true masonry packing for variable-height
                cards (audio+transcript vs a one-line message) without a
                library. Falls back to a single column on small screens. */}
            <div className="gap-6 [column-fill:_balance] sm:columns-1 md:columns-2 lg:columns-3">
                <AnimatePresence mode="popLayout">
                    {visible.map((tribute) => (
                        <TributeCard
                            key={tribute.id}
                            onOpenLightbox={(images, index, tributeId) =>
                                setLightbox({ images, index, tributeId })
                            }
                            tribute={tribute}
                            isBirthday={isBirthday}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <p className="py-12 text-center text-sm text-text-muted">
                    No tributes in this category yet.
                </p>
            )}

            {remaining > 0 && (
                <div className="mt-4 flex flex-col items-center gap-2">
                    <button
                        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                        className="flex items-center gap-2 rounded-full border border-accent-gold/30 px-5 py-2.5 font-mono text-sm tracking-wider text-accent-gold uppercase transition-colors hover:bg-accent-gold/10"
                    >
                        Load {Math.min(PAGE_SIZE, remaining)} more
                        <ChevronDown size={14} />
                    </button>
                    <span className="font-mono text-[11px] text-text-muted">
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
                            prev ? { ...prev, index } : null,
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

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previous;
        };
    }, []);
    useEffect(() => {
        if (images.length <= 1) {
            return;
        }

        const next = images[(index + 1) % images.length];

        const prev = images[(index - 1 + images.length) % images.length];

        [next, prev].forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, [index, images]);
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }

            if (e.key === 'ArrowLeft') {
                prev();
            }

            if (e.key === 'ArrowRight') {
                next();
            }
        };

        window.addEventListener('keydown', handler);

        return () => window.removeEventListener('keydown', handler);
    }, [index]);

    const [scale, setScale] = useState(1);
    const prev = () => setIndex((index - 1 + images.length) % images.length);

    const next = () => setIndex((index + 1) % images.length);

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
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
                            className="absolute top-0 bottom-0 left-0 z-20 w-[20vw]"
                            aria-label="Previous image"
                        />

                        {/* right hotspot */}
                        <button
                            onClick={next}
                            className="absolute top-20 right-0 bottom-0 z-20 w-[20vw]"
                            aria-label="Next image"
                        />
                    </>
                )}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-4 z-20 hidden text-white md:block"
                        >
                            <ChevronLeft size={40} />
                        </button>

                        <button
                            onClick={next}
                            className="absolute right-4 z-20 hidden text-white md:block"
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
                                    Math.abs(info.offset.x) * info.velocity.x;

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
                <div className="absolute bottom-6 font-mono text-sm text-white">
                    {index + 1} / {images.length}
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body,
    );
}
