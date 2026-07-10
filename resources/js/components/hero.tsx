import { usePage } from "@inertiajs/react";
import { format } from 'date-fns'
import { motion } from "framer-motion";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Hero: React.FC = () => {
    const { room } = usePage<{ room: { name: string, description?: string, created_at?: string, media_items?: { url: string, type: string }[], room_type: string, tribute_name?: string, start_date?: string, end_date?: string; enable_tributes?: boolean } }>().props
    const media = room?.media_items?.map((item: any, idx: number) => ({
        url: item.url,
        id: idx,
        alt: room?.name,
        date: room?.created_at,
        caption: room?.description ?? ''
    }));
    
    // GSAP Hero Carousel State
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const heroImagesRef = useRef<(HTMLDivElement | null)[]>([]);
    const heroImgContentRef = useRef<(HTMLImageElement | null)[]>([]);
    const heroTextRef = useRef<HTMLDivElement>(null);
    const progressLineRef = useRef<HTMLDivElement>(null);
    // Lightbox view state
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [lightboxImages, setLightboxImages] = useState<{ url: string; alt: string; caption: string }[]>([]);

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
                gsap.fromTo(el,
                    { opacity: 0, scale: 1.05, zIndex: 10 },
                    { opacity: 1, scale: 1, zIndex: 20, duration: 1.2, ease: "power2.out" }
                );

                // Gentle Ken Burns slow zoom
                if (heroImgContentRef.current[index]) {
                    gsap.fromTo(heroImgContentRef.current[index],
                        { scale: 1 },
                        { scale: 1.08, duration: 6.0, ease: "sine.out" }
                    );
                }
            } else {
                // Send previous to background, fade out
                gsap.set(el, { zIndex: 5 });
                gsap.to(el, { opacity: 0, duration: 1.0, ease: "power2.out" });
            }
        });

        // 2. Animated text caption entrance
        if (heroTextRef.current) {
            const texts = heroTextRef.current.querySelectorAll(".gsap-hero-text");

            if (texts.length > 0) {
                gsap.killTweensOf(texts);
                gsap.fromTo(texts,
                    { opacity: 0, y: 30, skewY: 1 },
                    { opacity: 1, y: 0, skewY: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" }
                );
            }
        }

        // 3. Reset and animate the progress bar
        if (progressLineRef.current) {
            gsap.killTweensOf(progressLineRef.current);
            gsap.fromTo(progressLineRef.current,
                { width: "0%" },
                { width: "100%", duration: 6.0, ease: "none" }
            );
        }
    }, [currentHeroIndex]);

    // Lightbox helpers
    const openGalleryLightbox = (idx: number) => {
        const imgList = media?.map(img => ({
            url: img.url,
            alt: img.alt,
            caption: img?.caption ?? ''
        }));
        setLightboxImages(imgList ?? []);
        setLightboxIndex(idx);
    };


    const openTributeLightbox = (tributeImgUrls: string[], selectedUrl: string, tributeName: string) => {
        const imgList = tributeImgUrls.map(url => ({
            url,
            alt: `Photo shared by ${tributeName}`,
            caption: `Shared in loving memory by ${tributeName}`
        }));
        const targetIdx = tributeImgUrls.indexOf(selectedUrl);
        setLightboxImages(imgList);
        setLightboxIndex(targetIdx >= 0 ? targetIdx : 0);
    };

    const handleLightboxNav = (dir: "prev" | "next", e: React.MouseEvent) => {
        e.stopPropagation();

        if (lightboxIndex === null || lightboxImages.length <= 1) {
return;
}

        if (dir === "prev") {
            setLightboxIndex((prev) => (prev !== null ? (prev - 1 + lightboxImages.length) % lightboxImages.length : 0));
        } else {
            setLightboxIndex((prev) => (prev !== null ? (prev + 1) % lightboxImages.length : 0));
        }
    };
    const heroContent: {
        [key: "burial" | "birthday" | "wedding" | string]: {
            badge: string;
            title: React.ReactNode;
            subtitle: string;
            banner: string;
            dates?: string;
        }
    } = {
        burial: {
            badge: "Tributes for Mrs. Adefunke “Mrs. K” Kuyoro",
            title: (
                <>
                    Celebrating the Life and Legacy of Our Darling{" "}
                    <span className="font-medium italic">{room?.tribute_name}</span>
                </>
            ),
            subtitle: "A Life That Touched Many, Remembered Always.",
            banner: "Forever Remembered • Forever Celebrated",
            dates: "Oct 3, 1961 – June 2, 2026",
        },

        birthday: {
            badge: "Birthday Celebration",
            title: (
                <>
                    Celebrating the Joy and Journey of{" "}
                    <span className="font-medium italic">{room?.tribute_name}</span>
                </>
            ),
            subtitle: "Another Year of Love, Laughter and Beautiful Memories.",
            banner: "Cheers to Many More Wonderful Years",
            dates: "Born Oct 3, 1961",
        },

        wedding: {
            badge: "Wedding Celebration",
            title: (
                <>
                    Celebrating Love, Unity and New Beginnings
                </>
            ),
            subtitle: "Two Hearts, One Journey, A Lifetime Together.",
            banner: "Happily Ever After Begins Here",
        },
    };

    const content = heroContent[room?.room_type] || heroContent.birthday;

    return (
        <div className="w-full space-y-0">
            {/* GSAP-DRIVEN HERO CAROUSEL - Full width and rounded-none on mobile, elegant with border-radius on desktop */}
            {room?.media_items && room?.media_items?.length > 0 && <div className="w-full">
                <div className="relative w-full h-screen overflow-hidden bg-navy border-b border-accent-gold/25 group/carousel">

                    {/* Progress Timeline Indicator at the top of the Carousel */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/10 z-30">
                        <div
                            ref={progressLineRef}
                            className="h-full bg-accent-gold w-0"
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
                            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none cursor-pointer overflow-hidden transition-all duration-300"
                        >
                            <img
                                ref={(el) => {
 heroImgContentRef.current[index] = el; 
}}
                                src={img.url}
                                alt={img.alt}
                                className="w-full h-full object-cover object-top md:object-[center_30%]"
                                referrerPolicy="no-referrer"
                            />
                            {/* Premium dark vignette gradient to overlay text cleanly */}
                            <div className="absolute inset-0 bg-linear-to-t from-navy/95 via-navy/55 to-navy/15 z-10" />
                        </div>
                    ))}

                    {/* Dynamic Content Overlay (Texts & Controls) */}
                    <div
                        ref={heroTextRef}
                        className="absolute bottom-0 left-0 right-0 z-30 p-6 sm:p-10 md:p-14 pb-10 md:pb-16 text-left text-white flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div className="max-w-xl space-y-2">
                            <div className="flex items-center gap-2.5 gsap-hero-text">
                                <span className="text-[10px] sm:text-xs font-mono tracking-widest text-[#B0BFD0] uppercase font-bold px-3 py-1 bg-navy/80 backdrop-blur-md rounded-full border border-accent-gold/25">
                                    {/* {media?.[currentHeroIndex]?.tags?.[0] || "Tribute"} */}
                                    Memories
                                </span>
                                <span className="text-[10px] sm:text-xs font-mono tracking-widest text-[#B0BFD0] uppercase">
                                    • {currentHeroIndex + 1} of {media?.length}
                                </span>
                            </div>

                            <h3 className="font-serif text-xl sm:text-2xl md:text-4xl font-light text-[#FAF8F5] leading-tight gsap-hero-text">
                                {media?.[currentHeroIndex]?.alt}
                            </h3>

                            <p className="font-sans text-xs sm:text-sm text-[#DFE7F0] font-light leading-relaxed gsap-hero-text line-clamp-2 md:line-clamp-none">
                                {media?.[currentHeroIndex]?.caption}
                            </p>
                        </div>

                        {/* Slider navigation buttons and indicator */}
                        <div className="flex items-center gap-4 gsap-hero-text shrink-0">
                            <div className="hidden sm:flex items-center gap-2">
                                {media?.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentHeroIndex(idx);
                                        }}
                                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentHeroIndex ? "w-8 bg-accent-gold" : "w-1.5 bg-white/35 hover:bg-white/60"}`}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentHeroIndex((prev) => (prev - 1 + (media?.length ?? 0)) % (media?.length ?? 0));
                                    }}
                                    className="w-10 h-10 rounded-full border border-white/20 hover:border-accent-gold bg-navy/90 hover:bg-accent-gold text-white hover:text-navy flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
                                    title="Previous Archive"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentHeroIndex((prev) => (prev + 1) % (media?.length ?? 0));
                                    }}
                                    className="w-10 h-10 rounded-full border border-white/20 hover:border-accent-gold bg-navy/90 hover:bg-accent-gold text-white hover:text-navy flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
                                    title="Next Archive"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openGalleryLightbox(currentHeroIndex);
                                    }}
                                    className="w-10 h-10 rounded-full border border-accent-gold/45 hover:border-accent-gold bg-navy/90 hover:bg-white text-accent-gold hover:text-navy flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
                                    title="Enlarge Photo"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}

            {/* HERO SECTION */}
            {room?.enable_tributes && <section className="relative px-6 py-10 md:py-16 text-center z-10 max-w-6xl mx-auto w-full grow-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-4 max-w-4xl mx-auto"
                >
                    <span className="inline-block font-sans text-xs md:text-sm tracking-[0.3em] text-accent-gold uppercase font-semibold">
                        {content.badge}
                    </span>

                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-accent-gold leading-tight font-light">
                        {content.title}
                    </h1>

                    <p className="font-serif text-base sm:text-lg md:text-xl text-accent-gold italic max-w-xl mx-auto font-light">
                        "{content.subtitle}"
                    </p>

                    {['burial', 'memorial'].includes(room?.room_type) && <div className="pt-3 flex justify-center items-center gap-3">
                        <span className="h-px w-8 bg-accent-gold/40"></span>
                        <span className="text-accent-gold text-xs tracking-widest uppercase">{format(new Date(room?.start_date ?? new Date().toISOString()), 'MMM d, yyyy')} – {format(new Date(room?.end_date ?? new Date().toISOString()), 'MMM d, yyyy')}</span>
                        <span className="h-px w-8 bg-accent-gold/40"></span>
                    </div>}
                </motion.div>

                {/* SUBTLE TRIBUTE BANNER */}
                <div className="mt-10 md:mt-12 bg-white dark:bg-neutral-700 border border-gold-muted max-w-4xl mx-auto py-5 flex items-center justify-center gap-6 text-sm tracking-[0.25em] text-accent-gold font-medium uppercase font-serif px-6 rounded-2xl shadow-sm">
                    <span className="text-center">{content.banner}</span>
                </div>
            </section>}
        </div>
    )
};

export default Hero;