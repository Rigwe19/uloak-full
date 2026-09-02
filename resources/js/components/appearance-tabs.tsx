import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div
            className={cn(
                'flex w-full gap-2 rounded-2xl border border-border-subtle bg-surface/50 p-2',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 transition-all md:px-4',
                        appearance === value
                            ? 'border border-accent-gold/20 bg-accent-gold/10 text-accent-gold shadow-lg shadow-accent-gold/5'
                            : 'text-text-muted hover:bg-surface hover:text-text-primary',
                    )}
                >
                    <Icon size={16} />
                    <span className="text-sm font-semibold">{label}</span>
                </button>
            ))}
        </div>
    );
}
