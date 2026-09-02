export interface HousePattern {
    label: string;
    background: string;
    preview: string;
}

export const HOUSE_PATTERNS: Record<string, HousePattern> = {
    none: {
        label: 'Clean',
        background: '',
        preview: '',
    },
    dots: {
        label: 'Dots',
        background:
            'radial-gradient(circle, rgba(192, 160, 96, 0.08) 1px, transparent 1px) 0 0 / 20px 20px',
        preview:
            'radial-gradient(circle, rgba(192, 160, 96, 0.12) 1px, transparent 1px) 0 0 / 12px 12px',
    },
    grid: {
        label: 'Grid',
        background:
            'linear-gradient(rgba(192, 160, 96, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(192, 160, 96, 0.06) 1px, transparent 1px) 0 0 / 24px 24px',
        preview:
            'linear-gradient(rgba(192, 160, 96, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(192, 160, 96, 0.1) 1px, transparent 1px) 0 0 / 14px 14px',
    },
    diagonal: {
        label: 'Diagonal',
        background:
            'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(192, 160, 96, 0.05) 12px, rgba(192, 160, 96, 0.05) 13px)',
        preview:
            'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(192, 160, 96, 0.1) 8px, rgba(192, 160, 96, 0.1) 9px)',
    },
    crosshatch: {
        label: 'Crosshatch',
        background:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(192, 160, 96, 0.04) 10px, rgba(192, 160, 96, 0.04) 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(192, 160, 96, 0.04) 10px, rgba(192, 160, 96, 0.04) 11px)',
        preview:
            'repeating-linear-gradient(45deg, transparent, transparent 7px, rgba(192, 160, 96, 0.08) 7px, rgba(192, 160, 96, 0.08) 8px), repeating-linear-gradient(-45deg, transparent, transparent 7px, rgba(192, 160, 96, 0.08) 7px, rgba(192, 160, 96, 0.08) 8px)',
    },
    waves: {
        label: 'Waves',
        background:
            'repeating-linear-gradient(0deg, transparent, transparent 14px, rgba(192, 160, 96, 0.04) 14px, rgba(192, 160, 96, 0.04) 15px)',
        preview:
            'repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(192, 160, 96, 0.08) 9px, rgba(192, 160, 96, 0.08) 10px)',
    },
    herringbone: {
        label: 'Herringbone',
        background:
            'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(192, 160, 96, 0.03) 8px, rgba(192, 160, 96, 0.03) 9px), repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(192, 160, 96, 0.03) 8px, rgba(192, 160, 96, 0.03) 9px)',
        preview:
            'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(192, 160, 96, 0.07) 5px, rgba(192, 160, 96, 0.07) 6px), repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(192, 160, 96, 0.07) 5px, rgba(192, 160, 96, 0.07) 6px)',
    },
    scales: {
        label: 'Scales',
        background:
            'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(192, 160, 96, 0.04) 6px, rgba(192, 160, 96, 0.04) 7px), repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(192, 160, 96, 0.04) 12px, rgba(192, 160, 96, 0.04) 13px), repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(192, 160, 96, 0.02) 6px, rgba(192, 160, 96, 0.02) 7px)',
        preview:
            'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(192, 160, 96, 0.08) 4px, rgba(192, 160, 96, 0.08) 5px), repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(192, 160, 96, 0.08) 8px, rgba(192, 160, 96, 0.08) 9px)',
    },
};

export function getPatternBackground(
    pattern: string | null | undefined,
): string {
    if (!pattern || pattern === 'none') {
        return '';
    }

    return HOUSE_PATTERNS[pattern]?.background ?? '';
}
