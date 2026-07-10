import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title = 'Confirm',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                            <div className="flex items-center gap-3">
                                {variant === 'danger' && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                                        <AlertTriangle size={16} />
                                    </div>
                                )}
                                <h3 className="text-sm font-bold text-text-primary">{title}</h3>
                            </div>
                            <button
                                onClick={onCancel}
                                className="rounded-full p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm leading-relaxed text-text-muted">{message}</p>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-white/5 px-6 py-4">
                            <button
                                onClick={onCancel}
                                className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-bold tracking-widest text-text-muted uppercase transition-colors hover:bg-white/5 hover:text-text-primary"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`rounded-xl px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-all ${
                                    variant === 'danger'
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-accent-gold text-bg-dark hover:opacity-90'
                                }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
