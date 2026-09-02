import { Globe, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface RegionOption {
    key: string;
    label: string;
    currency: string;
    full_room: number;
    full_room_formatted: string;
    family_monthly: number;
    family_monthly_formatted: string;
    family_yearly: number;
    family_yearly_formatted: string;
    yearly_savings: number;
    yearly_savings_formatted: string;
}

interface RegionSelectorProps {
    regions: Record<string, RegionOption>;
    selectedRegion: string;
    onChange: (regionKey: string) => void;
    className?: string;
}

export function RegionSelector({
    regions,
    selectedRegion,
    onChange,
    className = '',
}: RegionSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selected = regions[selectedRegion];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                event.target instanceof Element &&
                !event.target.closest('[data-region-selector]')
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            data-region-selector
            className={`relative inline-block ${className}`}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2.5 text-text-primary transition-colors hover:border-accent-gold/30 focus:ring-2 focus:ring-accent-gold/30 focus:outline-none"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <Globe className="h-5 w-5 text-text-muted" />
                <span className="font-medium">
                    {selected?.label || selectedRegion}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <ul
                    role="listbox"
                    className="absolute top-full left-0 z-50 mt-2 w-64 animate-in rounded-xl border border-border-subtle bg-surface py-2 shadow-lg duration-200 fade-in-0 zoom-in-95"
                >
                    {Object.entries(regions).map(([key, region]) => (
                        <li
                            key={key}
                            role="option"
                            aria-selected={key === selectedRegion}
                            onClick={() => {
                                onChange(key);
                                setIsOpen(false);
                            }}
                            className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors ${
                                key === selectedRegion
                                    ? 'bg-accent-gold/10 text-accent-gold'
                                    : 'text-text-primary hover:bg-white/5'
                            }`}
                        >
                            <span className="font-medium">{region.label}</span>
                            <span className="ml-auto text-xs text-text-muted">
                                {region.currency}
                            </span>
                            {key === selectedRegion && (
                                <Check className="h-4 w-4 flex-shrink-0" />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
