import { motion } from 'framer-motion';

interface StorySkeletonProps {
    viewMode?: 'grid' | 'list';
    count?: number;
}

function SkeletonCard({ viewMode }: { viewMode: 'grid' | 'list' }) {
    if (viewMode === 'list') {
        return (
            <div className="surface-glow flex items-center gap-8 rounded-3xl border border-white/5 bg-surface/20 p-6">
                <div className="aspect-video w-48 shrink-0 animate-pulse rounded-2xl bg-white/5" />
                <div className="grow space-y-3">
                    <div className="h-3 w-32 animate-pulse rounded-full bg-white/5" />
                    <div className="h-5 w-64 animate-pulse rounded-full bg-white/5" />
                    <div className="h-3 w-48 animate-pulse rounded-full bg-white/5" />
                </div>
            </div>
        );
    }

    return (
        <div className="surface-glow flex flex-col overflow-hidden rounded-[32px] border border-white/5 bg-surface/20">
            <div className="aspect-4/3 animate-pulse bg-white/5" />
            <div className="space-y-3 p-8">
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/5" />
                <div className="h-3 w-full animate-pulse rounded-full bg-white/5" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/5" />
            </div>
        </div>
    );
}

export default function StorySkeleton({
    viewMode = 'grid',
    count = 6,
}: StorySkeletonProps) {
    return (
        <div
            className={
                viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'
                    : 'flex flex-col gap-6'
            }
        >
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <SkeletonCard viewMode={viewMode} />
                </motion.div>
            ))}
        </div>
    );
}
