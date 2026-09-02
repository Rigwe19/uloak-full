// candleThemes.ts
export type CandleType =
    | 'amber'
    | 'golden'
    | 'rose'
    | 'classic'
    | 'violet'
    | 'teal'
    | 'midnight';

export interface CandleTheme {
    glow: string;
    outer: [string, string, string]; // flame tip → mid → base
    inner: [string, string, string]; // core tip → mid → base
    body: [string, string, string, string]; // left shadow → left hi → right hi → right shadow
    top: [string, string, string];
    drip: string;
    shadow: string;
}

export const CANDLE_THEMES: Record<CandleType, CandleTheme> = {
    amber: {
        glow: '#FFB830',
        outer: ['#fff5a0', '#FFB700', '#FF5500'],
        inner: ['#ffffff', '#c8f0ff', '#5bb8ff'],
        body: ['#7a4e10', '#d4914a', '#c07a38', '#5a3408'],
        top: ['#6a3e0c', '#b87840', '#4e3008'],
        drip: '#c07838',
        shadow: '#3a1a04',
    },
    golden: {
        glow: '#FFE060',
        outer: ['#fffce0', '#FFD040', '#FF8800'],
        inner: ['#ffffff', '#d8f8ff', '#70d8ff'],
        body: ['#c8a96e', '#f5e6c8', '#ede0c4', '#a8845a'],
        top: ['#b8944e', '#ddd0a8', '#9a7838'],
        drip: '#d4c090',
        shadow: '#806040',
    },
    rose: {
        glow: '#FFB0C0',
        outer: ['#fff0d0', '#FFB060', '#FF4488'],
        inner: ['#ffffff', '#ffe0f8', '#ff90d8'],
        body: ['#7a2040', '#c85878', '#b84868', '#5a1830'],
        top: ['#681830', '#a84060', '#501020'],
        drip: '#c05070',
        shadow: '#380818',
    },
    classic: {
        glow: '#FFE8B0',
        outer: ['#fffdf0', '#FFE080', '#FF7700'],
        inner: ['#ffffff', '#e0f4ff', '#80ccff'],
        body: ['#a8a090', '#eeeae0', '#e4e0d8', '#888078'],
        top: ['#989088', '#ccc8c0', '#888078'],
        drip: '#c8c0b0',
        shadow: '#605850',
    },
    // bonus types — easy to extend
    violet: {
        glow: '#C8A0FF',
        outer: ['#f0e0ff', '#B060FF', '#6600CC'],
        inner: ['#ffffff', '#e8d0ff', '#b080ff'],
        body: ['#3a1060', '#8050b0', '#7040a0', '#280848'],
        top: ['#300c50', '#6a3898', '#200840'],
        drip: '#7040a8',
        shadow: '#180430',
    },
    teal: {
        glow: '#60FFD8',
        outer: ['#e0fff8', '#40E8B0', '#008866'],
        inner: ['#ffffff', '#c0fff0', '#40d0b0'],
        body: ['#0a4840', '#208878', '#186860', '#083830'],
        top: ['#083830', '#186858', '#062828'],
        drip: '#1a7868',
        shadow: '#042018',
    },
    midnight: {
        glow: '#8090FF',
        outer: ['#e0e8ff', '#6080FF', '#2020AA'],
        inner: ['#ffffff', '#d0d8ff', '#8090ff'],
        body: ['#0a0a30', '#202858', '#181e48', '#080818'],
        top: ['#080818', '#181e48', '#050510'],
        drip: '#1a2050',
        shadow: '#050510',
    },
};

export interface Candle {
    id: number;
    name: string;
    message: string;
    candle_type: CandleType;
    is_approved: boolean;
}
