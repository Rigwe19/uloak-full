// RealisticCandle.tsx
import { motion } from 'framer-motion';
import { CANDLE_THEMES, CandleType, Candle } from './candleThemes';

export default function CandleSVG({ candle, delay }: { candle: Candle; delay: number }) {
    const p = CANDLE_THEMES[candle.candle_type];
    const id = candle.id;

    return (
        <svg width="56" height="92" viewBox="0 0 56 92" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id={`gl${id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={p.glow} stopOpacity="1" />
                    <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`bd${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={p.body[0]} />
                    <stop offset="28%" stopColor={p.body[1]} />
                    <stop offset="62%" stopColor={p.body[2]} />
                    <stop offset="100%" stopColor={p.body[3]} />
                </linearGradient>
                <linearGradient id={`tp${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={p.top[0]} />
                    <stop offset="50%" stopColor={p.top[1]} />
                    <stop offset="100%" stopColor={p.top[2]} />
                </linearGradient>
                <linearGradient id={`fo${id}`} x1="30%" y1="0%" x2="70%" y2="100%">
                    <stop offset="0%" stopColor={p.outer[0]} />
                    <stop offset="42%" stopColor={p.outer[1]} />
                    <stop offset="100%" stopColor={p.outer[2]} />
                </linearGradient>
                <linearGradient id={`fi${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor={p.inner[0]} />
                    <stop offset="55%" stopColor={p.inner[1]} />
                    <stop offset="100%" stopColor={p.inner[2]} />
                </linearGradient>
                <filter id={`bf${id}`}><feGaussianBlur stdDeviation="4" /></filter>
            </defs>

            {/* halo glow */}
            <ellipse cx="28" cy="29" rx="14" ry="11"
                fill={`url(#gl${id})`} filter={`url(#bf${id})`} opacity="0.45"
                style={{ animation: `glowPulse 1.9s ease-in-out infinite`, animationDelay: `${delay}s` }} />

            {/* outer flame */}
            <g style={{ transformOrigin: '50% 100%', animation: `candleFlicker 1.9s ease-in-out infinite`, animationDelay: `${delay}s` }}>
                <path d="M28 9 C23.5 17 20 22 20 27.5 C20 34 23.8 38 28 38 C32.2 38 36 34 36 27.5 C36 22 32.5 17 28 9Z"
                    fill={`url(#fo${id})`} />
            </g>

            {/* inner blue core */}
            <g style={{ transformOrigin: '50% 100%', animation: `candleInner 1.5s ease-in-out infinite`, animationDelay: `${delay + 0.18}s` }}>
                <path d="M28 19 C26.2 23.5 25.2 26 25.2 29.5 C25.2 33 26.5 35.5 28 35.5 C29.5 35.5 30.8 33 30.8 29.5 C30.8 26 29.8 23.5 28 19Z"
                    fill={`url(#fi${id})`} opacity="0.85" />
            </g>

            {/* wick */}
            <line x1="28" y1="37.5" x2="28.5" y2="42" stroke="#2a1a0a" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="28" cy="37.5" r="1.8" fill={p.outer[1]} opacity="0.9" />

            {/* candle top */}
            <ellipse cx="28" cy="42" rx="11.5" ry="3.8" fill={`url(#tp${id})`} />

            {/* wax drips */}
            <path d="M18.5 45 Q17.5 51 18 56" stroke={p.drip} strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.55" />
            <path d="M37 47 Q38 52 37.5 56" stroke={p.drip} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.35" />

            {/* body */}
            <rect x="16.5" y="42" width="23" height="42" rx="1.5" fill={`url(#bd${id})`} />
            {/* specular stripe */}
            <rect x="24.5" y="43" width="3.5" height="40" fill="white" opacity="0.11" rx="1" />
            {/* top shadow band */}
            <rect x="16.5" y="42" width="23" height="5" rx="1.5" fill="black" opacity="0.08" />
            {/* base shadow */}
            <ellipse cx="28" cy="84" rx="11.5" ry="2.8" fill={p.shadow} opacity="0.4" />
        </svg>
    );
}
