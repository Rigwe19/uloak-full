import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { createPortal } from 'react-dom';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Used for accessibility. Can be visually hidden via titleHidden. */
    title: string;
    children: React.ReactNode;
    /** Extra className applied to both mobile sheet content and desktop dialog card */
    className?: string;
    /** Max-width Tailwind class for the desktop dialog. Defaults to 'max-w-xl' */
    desktopMaxWidth?: string;
    /** Whether the Sheet should take full height (for tall overlays like CommentsModal) */
    fullHeight?: boolean;
    /** Show drag handle pill on the mobile Sheet (default: true) */
    showHandle?: boolean;
    /** Visually hide the title (still present for screen readers) */
    titleHidden?: boolean;
}

/**
 * A responsive modal wrapper:
 * - Mobile (< 768px): shadcn `Sheet side="bottom"` — handles portal, focus trap,
 *   Esc key, and CSS slide-up/down animation natively via Radix.
 * - Desktop (≥ 768px): framer-motion centered dialog via createPortal —
 *   preserves spring animation and the project's dark aesthetic.
 */
export function ResponsiveModal({
    isOpen,
    onClose,
    title,
    children,
    className = '',
    desktopMaxWidth = 'max-w-xl',
    fullHeight = false,
    showHandle = true,
    titleHidden = false,
}: ResponsiveModalProps) {
    const isMobile = useIsMobile();
    if(!document) return null;

    // ── Mobile: shadcn Sheet ──────────────────────────────────────────────────
    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    side="bottom"
                    className={`bg-surface border-t border-white/10 rounded-t-[32px] px-0 pb-0 flex flex-col ${fullHeight ? 'h-[92dvh]' : 'max-h-[92dvh]'} ${className}`}
                >
                    {showHandle && (
                        <div className="mx-auto mt-3 mb-0 h-1 w-12 rounded-full bg-white/15 shrink-0" />
                    )}
                    <SheetHeader className={`px-6 pt-3 pb-0 shrink-0 ${titleHidden ? 'sr-only' : ''}`}>
                        <SheetTitle className="text-text-primary font-bold text-xl text-left">
                            {title}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {children}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // ── Desktop: framer-motion centered dialog via portal ─────────────────────
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-110 flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    {/* Dialog card */}
                    <motion.div
                        initial={{ y: 40, opacity: 0, scale: 0.97 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 40, opacity: 0, scale: 0.97 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={`relative w-full ${desktopMaxWidth} ${fullHeight ? 'h-[90vh] flex flex-col' : 'max-h-[90vh]'} overflow-y-auto rounded-[32px] border border-white/10 bg-surface shadow-2xl ring-1 ring-white/5 ${className}`}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
