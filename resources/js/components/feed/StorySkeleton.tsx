import { motion } from 'framer-motion';

interface StorySkeletonProps {
    viewMode?: 'grid' | 'list';
    count?: number;
}

function SkeletonCard({ viewMode }: { viewMode: 'grid' | 'list' }) {
    if (viewMode === 'list') {
        return (
            <div className="surface-glow flex items-center gap-8 rounded-3xl border border-white/5 bg-surface/20 p-6">
                <div className="aspect-video w-48 shrink-0 rounded-2xl bg-white/5 animate-pulse" />
                <div className="grow space-y-3">
                    <div className="h-3 w-32 rounded-full bg-white/5 animate-pulse" />
                    <div className="h-5 w-64 rounded-full bg-white/5 animate-pulse" />
                    <div className="h-3 w-48 rounded-full bg-white/5 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="surface-glow flex flex-col overflow-hidden rounded-[32px] border border-white/5 bg-surface/20">
            <div className="aspect-4/3 bg-white/5 animate-pulse" />
            <div className="space-y-3 p-8">
                <div className="h-4 w-3/4 rounded-full bg-white/5 animate-pulse" />
                <div className="h-3 w-full rounded-full bg-white/5 animate-pulse" />
                <div className="h-3 w-1/2 rounded-full bg-white/5 animate-pulse" />
            </div>
        </div>
    );
}

export default function StorySkeleton({ viewMode = 'grid', count = 6 }: StorySkeletonProps) {
    return (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-6'}>
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
