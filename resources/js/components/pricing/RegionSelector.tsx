import { Globe, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

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

export function RegionSelector({ regions, selectedRegion, onChange, className = '' }: RegionSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 256 });

    const selected = regions[selectedRegion];

    const updateCoords = useCallback(() => {
        if (!buttonRef.current) {
            return;
        }

        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 256;
        let left = rect.left;
        const maxLeft = window.innerWidth - dropdownWidth - 8;

        if (left > maxLeft) {
            left = Math.max(8, maxLeft);
        }

        setCoords({
            top: rect.bottom + 8,
            left,
            width: Math.max(rect.width, 256),
        });
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        updateCoords();
        window.addEventListener('resize', updateCoords);
        window.addEventListener('scroll', updateCoords, true);

        return () => {
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords, true);
        };
    }, [isOpen, updateCoords]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                event.target instanceof Element &&
                !event.target.closest('[data-region-selector]') &&
                !event.target.closest('[data-region-selector-dropdown]')
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <div data-region-selector className={`relative inline-block ${className}`}>
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => {
                        updateCoords();
                        setIsOpen(!isOpen);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border-subtle bg-surface text-text-primary hover:border-accent-gold/30 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold/30"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <Globe className="h-5 w-5 text-text-muted" />
                    <span className="font-medium">{selected?.label || selectedRegion}</span>
                    <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <ul
                        data-region-selector-dropdown
                        role="listbox"
                        style={{
                            position: 'fixed',
                            top: coords.top,
                            left: coords.left,
                            width: 256,
                        }}
                        className="rounded-xl border border-border-subtle bg-surface py-2 shadow-xl z-[100] animate-in fade-in-0 zoom-in-95 duration-200 max-h-[60vh] overflow-auto"
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
                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                                    key === selectedRegion
                                        ? 'bg-accent-gold/10 text-accent-gold'
                                        : 'text-text-primary hover:bg-white/5'
                                }`}
                            >
                                <span className="font-medium">{region.label}</span>
                                <span className="ml-auto text-xs text-text-muted">{region.currency}</span>
                                {key === selectedRegion && <Check className="h-4 w-4 flex-shrink-0" />}
                            </li>
                        ))}
                    </ul>,
                    document.body,
                )}
        </>
    );
}
