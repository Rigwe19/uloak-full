/**
 * Shared animation variants for public pages.
 *
 * Easing curves chosen for a warm, organic feel — smooth and deliberate,
 * never jarring or gratuitous. Follows prefers-reduced-motion.
 */
import type { Variants } from 'framer-motion';

// Check for reduced motion preference (accessibility)
export const shouldReduceMotion: boolean =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Warm, cinematic easing — feels like a gentle inhale/exhale
export const easeWarm: [number, number, number, number] = [0.22, 1, 0.36, 1];
// Slightly faster for micro-interactions
export const easeSnappy: [number, number, number, number] = [0.3, 0, 0.2, 1.2];

// Duration presets
export const duration = {
    instant: 0.15,
    fast: 0.25,
    base: 0.5,
    slow: 0.8,
    cinematic: 1.2,
};

// If reduced motion is preferred, collapse all transitions
const safeTransition = (t: Record<string, unknown>) =>
    shouldReduceMotion ? { duration: 0.01 } : t;

/**
 * Staggered container — children animate in sequence.
 * Use as: variants={staggerContainer} initial="hidden" animate="show"
 */
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delay: 0.1,
            duration: shouldReduceMotion ? 0.01 : undefined,
        },
    },
};

/**
 * Fade-in-up — the workhorse of warm section entrances.
 */
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: safeTransition({
            duration: duration.base,
            ease: easeWarm,
        }),
    },
};

/**
 * Fade-in from the side — for elements that should drift in.
 */
export const fadeFromLeft: Variants = {
    hidden: { opacity: 0, x: -40 },
    show: {
        opacity: 1,
        x: 0,
        transition: safeTransition({
            duration: duration.slow,
            ease: easeWarm,
        }),
    },
};

export const fadeFromRight: Variants = {
    hidden: { opacity: 0, x: 40 },
    show: {
        opacity: 1,
        x: 0,
        transition: safeTransition({
            duration: duration.slow,
            ease: easeWarm,
        }),
    },
};

/**
 * Gentle scale pulse — for interactive elements to feel alive.
 */
export const scalePulse: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.03 },
    tap: { scale: 0.98 },
};

/**
 * Cinematic text reveal — smooth fade, drift up, and un-blur.
 */
export const cinematicText: Variants = {
    hidden: {
        opacity: 0,
        y: 30,
        filter: 'blur(4px)',
    },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: safeTransition({
            duration: duration.cinematic,
            ease: easeWarm,
        }),
    },
};

/**
 * Cinematic hero text reveal — staggered lines fade in sequentially.
 */
export const heroTextStagger: Variants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: duration.cinematic,
            ease: easeWarm,
            staggerChildren: 0.2,
            delayChildren: 0.2,
        },
    },
};

export const heroTextLine: Variants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: duration.cinematic, ease: easeWarm },
    },
};

/**
 * Card reveal for grids — scales up gently on scroll into view.
 */
export const cardReveal: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: 20 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: safeTransition({
            duration: duration.slow,
            ease: easeWarm,
        }),
    },
};

/**
 * Soft hover for cards — subtle lift.
 */
export const cardHover = {
    scale: 1.02,
    y: -4,
    transition: { duration: duration.instant, ease: easeSnappy },
};

/**
 * Parallax slow movement — for background decorative elements.
 */
export const parallaxFloat: Variants = {
    initial: { y: 0 },
    animate: {
        y: [-6, 6, -6],
        transition: {
            duration: 24,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'linear',
        },
    },
};

/**
 * Subtle scale pulse for gold accent elements.
 */
export const goldPulse: Variants = {
    initial: { scale: 1, opacity: 0.7 },
    animate: {
        scale: [1, 1.05, 1],
        opacity: [0.7, 0.9, 0.7],
        transition: { duration: 4, repeat: Infinity, repeatType: 'mirror' },
    },
};

/**
 * Viewport config shared across scroll animations
 */
export const viewportOnce = {
    once: true,
    margin: '-50px 0px -50px 0px',
};
