import { usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Hero: React.FC = () => {
    const { room } = usePage<{
        room: {
            name: string;
            description?: string;
            created_at?: string;
            media_items?: { url: string; type: string }[];
            room_type: string;
            tribute_name?: string;
            start_date?: string;
            end_date?: string;
            enable_tributes?: boolean;
        };
    }>().props;
    const media = room?.media_items?.map((item: any, idx: number) => ({
        url: item.url,
        id: idx,
        alt: room?.name,
        date: room?.created_at,
        caption: room?.description ?? '',
    }));

    // GSAP Hero Carousel State
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const heroImagesRef = useRef<(HTMLDivElement | null)[]>([]);
    const heroImgContentRef = useRef<(HTMLImageElement | null)[]>([]);
    const heroTextRef = useRef<HTMLDivElement>(null);
    const progressLineRef = useRef<HTMLDivElement>(null);
    // Lightbox view state
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [lightboxImages, setLightboxImages] = useState<
        { url: string; alt: string; caption: string }[]
    >([]);

    // GSAP Carousel Autoplay loop
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % (media?.length ?? 0));
        }, 6000);

        return () => clearInterval(timer);
    }, []);

    // GSAP Carousel Animation effect
    useEffect(() => {
        // 1. Image slides crossfade & upscale Ken burns transition
        heroImagesRef.current.forEach((el, index) => {
            if (!el) {
                return;
            }

            if (index === currentHeroIndex) {
                gsap.killTweensOf(el);

                if (heroImgContentRef.current[index]) {
                    gsap.killTweensOf(heroImgContentRef.current[index]);
                }

                // Wipe in active
                gsap.fromTo(
                    el,
                    { opacity: 0, scale: 1.05, zIndex: 10 },
                    {
                        opacity: 1,
                        scale: 1,
                        zIndex: 20,
                        duration: 1.2,
                        ease: 'power2.out',
                    },
                );

                // Gentle Ken Burns slow zoom
                if (heroImgContentRef.current[index]) {
                    gsap.fromTo(
                        heroImgContentRef.current[index],
                        { scale: 1 },
                        { scale: 1.08, duration: 6.0, ease: 'sine.out' },
                    );
                }
            } else {
                // Send previous to background, fade out
                gsap.set(el, { zIndex: 5 });
                gsap.to(el, { opacity: 0, duration: 1.0, ease: 'power2.out' });
            }
        });

        // 2. Animated text caption entrance
        if (heroTextRef.current) {
            const texts =
                heroTextRef.current.querySelectorAll('.gsap-hero-text');

            if (texts.length > 0) {
                gsap.killTweensOf(texts);
                gsap.fromTo(
                    texts,
                    { opacity: 0, y: 30, skewY: 1 },
                    {
                        opacity: 1,
                        y: 0,
                        skewY: 0,
                        stagger: 0.12,
                        duration: 0.9,
                        ease: 'power3.out',
                    },
                );
            }
        }

        // 3. Reset and animate the progress bar
        if (progressLineRef.current) {
            gsap.killTweensOf(progressLineRef.current);
            gsap.fromTo(
                progressLineRef.current,
                { width: '0%' },
                { width: '100%', duration: 6.0, ease: 'none' },
            );
        }
    }, [currentHeroIndex]);

    // Lightbox helpers
    const openGalleryLightbox = (idx: number) => {
        const imgList = media?.map((img) => ({
            url: img.url,
            alt: img.alt,
            caption: img?.caption ?? '',
        }));
        setLightboxImages(imgList ?? []);
        setLightboxIndex(idx);
    };

    const openTributeLightbox = (
        tributeImgUrls: string[],
        selectedUrl: string,
        tributeName: string,
    ) => {
        const imgList = tributeImgUrls.map((url) => ({
            url,
            alt: `Photo shared by ${tributeName}`,
            caption: `Shared in loving memory by ${tributeName}`,
        }));
        const targetIdx = tributeImgUrls.indexOf(selectedUrl);
        setLightboxImages(imgList);
        setLightboxIndex(targetIdx >= 0 ? targetIdx : 0);
    };

    const handleLightboxNav = (dir: 'prev' | 'next', e: React.MouseEvent) => {
        e.stopPropagation();

        if (lightboxIndex === null || lightboxImages.length <= 1) {
            return;
        }

        if (dir === 'prev') {
            setLightboxIndex((prev) =>
                prev !== null
                    ? (prev - 1 + lightboxImages.length) % lightboxImages.length
                    : 0,
            );
        } else {
            setLightboxIndex((prev) =>
                prev !== null ? (prev + 1) % lightboxImages.length : 0,
            );
        }
    };
    const heroContent: {
        [key: 'burial' | 'birthday' | 'wedding' | string]: {
            badge: string;
            title: React.ReactNode;
            subtitle: string;
            banner: string;
            dates?: string;
        };
    } = {
        burial: {
            badge: 'Tributes for Mrs. Adefunke “Mrs. K” Kuyoro',
            title: (
                <>
                    Celebrating the Life and Legacy of Our Darling{' '}
                    <span className="font-medium italic">
                        {room?.tribute_name}
                    </span>
                </>
            ),
            subtitle: 'A Life That Touched Many, Remembered Always.',
            banner: 'Forever Remembered • Forever Celebrated',
            dates: 'Oct 3, 1961 – June 2, 2026',
        },

        birthday: {
            badge: 'Birthday Celebration',
            title: (
                <>
                    Celebrating the Joy and Journey of{' '}
                    <span className="font-medium italic">
                        {room?.tribute_name}
                    </span>
                </>
            ),
            subtitle: 'Another Year of Love, Laughter and Beautiful Memories.',
            banner: 'Cheers to Many More Wonderful Years',
            dates: 'Born Oct 3, 1961',
        },

        wedding: {
            badge: 'Wedding Celebration',
            title: <>Celebrating Love, Unity and New Beginnings</>,
            subtitle: 'Two Hearts, One Journey, A Lifetime Together.',
            banner: 'Happily Ever After Begins Here',
        },
    };

    const content = heroContent[room?.room_type] || heroContent.birthday;

    return (
        <div className="w-full space-y-0">
            {/* GSAP-DRIVEN HERO CAROUSEL - Full width and rounded-none on mobile, elegant with border-radius on desktop */}
            {room?.media_items && room?.media_items?.length > 0 && (
                <div className="w-full">
                    <div className="bg-navy group/carousel relative h-screen w-full overflow-hidden border-b border-accent-gold/25">
                        {/* Progress Timeline Indicator at the top of the Carousel */}
                        <div className="absolute top-0 right-0 left-0 z-30 h-[3px] bg-white/10">
                            <div
                                ref={progressLineRef}
                                className="h-full w-0 bg-accent-gold"
                            />
                        </div>

                        {/* Carousel Images Stack */}
                        {media?.map((img, index) => (
                            <div
                                key={img.id}
                                ref={(el) => {
                                    heroImagesRef.current[index] = el;
                                }}
                                onClick={() => openGalleryLightbox(index)}
                                className="pointer-events-none absolute inset-0 h-full w-full cursor-pointer overflow-hidden opacity-0 transition-all duration-300"
                            >
                                <img
                                    ref={(el) => {
                                        heroImgContentRef.current[index] = el;
                                    }}
                                    src={img.url}
                                    alt={img.alt}
                                    className="h-full w-full object-cover object-top md:object-[center_30%]"
                                    referrerPolicy="no-referrer"
                                />
                                {/* Premium dark vignette gradient to overlay text cleanly */}
                                <div className="from-navy/95 via-navy/55 to-navy/15 absolute inset-0 z-10 bg-linear-to-t" />
                            </div>
                        ))}

                        {/* Dynamic Content Overlay (Texts & Controls) */}
                        <div
                            ref={heroTextRef}
                            className="absolute right-0 bottom-0 left-0 z-30 flex flex-col justify-between gap-6 p-6 pb-10 text-left text-white sm:p-10 md:flex-row md:items-end md:p-14 md:pb-16"
                        >
                            <div className="max-w-xl space-y-2">
                                <div className="gsap-hero-text flex items-center gap-2.5">
                                    <span className="bg-navy/80 rounded-full border border-accent-gold/25 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-[#B0BFD0] uppercase backdrop-blur-md sm:text-xs">
                                        {/* {media?.[currentHeroIndex]?.tags?.[0] || "Tribute"} */}
                                        Memories
                                    </span>
                                    <span className="font-mono text-[10px] tracking-widest text-[#B0BFD0] uppercase sm:text-xs">
                                        • {currentHeroIndex + 1} of{' '}
                                        {media?.length}
                                    </span>
                                </div>

                                <h3 className="gsap-hero-text font-serif text-xl leading-tight font-light text-[#FAF8F5] sm:text-2xl md:text-4xl">
                                    {media?.[currentHeroIndex]?.alt}
                                </h3>

                                <p className="gsap-hero-text line-clamp-2 font-sans text-xs leading-relaxed font-light text-[#DFE7F0] sm:text-sm md:line-clamp-none">
                                    {media?.[currentHeroIndex]?.caption}
                                </p>
                            </div>

                            {/* Slider navigation buttons and indicator */}
                            <div className="gsap-hero-text flex shrink-0 items-center gap-4">
                                <div className="hidden items-center gap-2 sm:flex">
                                    {media?.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentHeroIndex(idx);
                                            }}
                                            className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${idx === currentHeroIndex ? 'w-8 bg-accent-gold' : 'w-1.5 bg-white/35 hover:bg-white/60'}`}
                                        />
                                    ))}
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentHeroIndex(
                                                (prev) =>
                                                    (prev -
                                                        1 +
                                                        (media?.length ?? 0)) %
                                                    (media?.length ?? 0),
                                            );
                                        }}
                                        className="bg-navy/90 hover:text-navy flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white shadow-md transition-all hover:border-accent-gold hover:bg-accent-gold active:scale-95"
                                        title="Previous Archive"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentHeroIndex(
                                                (prev) =>
                                                    (prev + 1) %
                                                    (media?.length ?? 0),
                                            );
                                        }}
                                        className="bg-navy/90 hover:text-navy flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white shadow-md transition-all hover:border-accent-gold hover:bg-accent-gold active:scale-95"
                                        title="Next Archive"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openGalleryLightbox(
                                                currentHeroIndex,
                                            );
                                        }}
                                        className="bg-navy/90 hover:text-navy flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-accent-gold/45 text-accent-gold shadow-md transition-all hover:border-accent-gold hover:bg-white active:scale-95"
                                        title="Enlarge Photo"
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HERO SECTION */}
            {room?.enable_tributes && (
                <section className="relative z-10 mx-auto w-full max-w-6xl grow-0 px-6 py-10 text-center md:py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mx-auto max-w-4xl space-y-4"
                    >
                        <span className="inline-block font-sans text-xs font-semibold tracking-[0.3em] text-accent-gold uppercase md:text-sm">
                            {content.badge}
                        </span>

                        <h1 className="font-serif text-4xl leading-tight font-light text-accent-gold sm:text-5xl md:text-6xl">
                            {content.title}
                        </h1>

                        <p className="mx-auto max-w-xl font-serif text-base font-light text-accent-gold italic sm:text-lg md:text-xl">
                            "{content.subtitle}"
                        </p>

                        {['burial', 'memorial'].includes(room?.room_type) && (
                            <div className="flex items-center justify-center gap-3 pt-3">
                                <span className="h-px w-8 bg-accent-gold/40"></span>
                                <span className="text-xs tracking-widest text-accent-gold uppercase">
                                    {format(
                                        new Date(
                                            room?.start_date ??
                                                new Date().toISOString(),
                                        ),
                                        'MMM d, yyyy',
                                    )}{' '}
                                    –{' '}
                                    {format(
                                        new Date(
                                            room?.end_date ??
                                                new Date().toISOString(),
                                        ),
                                        'MMM d, yyyy',
                                    )}
                                </span>
                                <span className="h-px w-8 bg-accent-gold/40"></span>
                            </div>
                        )}
                    </motion.div>

                    {/* SUBTLE TRIBUTE BANNER */}
                    <div className="border-gold-muted mx-auto mt-10 flex max-w-4xl items-center justify-center gap-6 rounded-2xl border bg-white px-6 py-5 font-serif text-sm font-medium tracking-[0.25em] text-accent-gold uppercase shadow-sm md:mt-12 dark:bg-neutral-700">
                        <span className="text-center">{content.banner}</span>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Hero;
