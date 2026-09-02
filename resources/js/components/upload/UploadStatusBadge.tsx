import { motion } from 'framer-motion';
import { Check, Loader2, AlertCircle, Clock } from 'lucide-react';

interface UploadStatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

const statusConfig: Record<
    string,
    { icon: typeof Check; color: string; bg: string }
> = {
    pending: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    queued: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    uploading: {
        icon: Loader2,
        color: 'text-accent-gold',
        bg: 'bg-accent-gold/10',
    },
    processing: {
        icon: Loader2,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
    },
    ready: { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
};

export function UploadStatusBadge({
    status,
    size = 'sm',
}: UploadStatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    const isSpinning = status === 'uploading' || status === 'processing';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center gap-1.5 rounded-full ${config.bg} ${config.color} ${
                size === 'sm'
                    ? 'px-2 py-0.5 text-[9px]'
                    : 'px-3 py-1 text-[10px]'
            } font-mono font-bold tracking-wider uppercase`}
        >
            <Icon
                size={size === 'sm' ? 10 : 12}
                className={isSpinning ? 'animate-spin' : ''}
            />
            {status === 'processing'
                ? 'Processing'
                : status === 'uploading'
                  ? 'Uploading'
                  : status === 'queued'
                    ? 'Queued'
                    : status === 'ready'
                      ? 'Ready'
                      : status === 'failed'
                        ? 'Failed'
                        : 'Pending'}
        </motion.div>
    );
}
