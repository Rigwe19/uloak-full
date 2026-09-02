import { X } from 'lucide-react';
import { Button } from '@/components/dashboard/ui';

interface ReelsOverlayProps {
    title: string;
    author: string;
    date: string;
    description?: string;
    onClose: () => void;
}

export function ReelsOverlay({
    title,
    author,
    date,
    description,
    onClose,
}: ReelsOverlayProps) {
    return (
        <>
            <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between p-4 md:p-8">
                <button
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/10 text-text-primary backdrop-blur-md transition-all hover:bg-white/20 md:h-12 md:w-12"
                >
                    <X size={20} className="md:size-[24px]" />
                </button>
            </div>

            <div className="absolute right-0 bottom-0 left-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16 md:p-8 md:pt-20">
                <h2 className="text-xl font-bold text-white md:text-2xl">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-white/70">
                    {author} &middot; {date}
                </p>
                {description && (
                    <p className="mt-2 line-clamp-2 max-w-md text-sm leading-relaxed text-white/50">
                        {description}
                    </p>
                )}
            </div>
        </>
    );
}
