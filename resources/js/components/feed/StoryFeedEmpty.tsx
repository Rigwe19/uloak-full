import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface StoryFeedEmptyProps {
    hasStories: boolean;
    onContribute?: () => void;
    contributeLabel?: string;
}

export default function StoryFeedEmpty({
    hasStories,
    onContribute,
    contributeLabel,
}: StoryFeedEmptyProps) {
    return (
        <motion.div
            key="empty"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full"
        >
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-accent-gold/20 bg-accent-gold/5 text-accent-gold/70">
                    <Sparkles size={36} className="stroke-[1.5]" />
                </div>
                <h3 className="mb-2 text-2xl font-bold tracking-tight text-text-primary">
                    {hasStories
                        ? 'No Stories Match This Filter'
                        : 'No Memories Yet'}
                </h3>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-text-muted">
                    {hasStories
                        ? 'Try selecting a different media type or clearing the filter.'
                        : contributeLabel ||
                          'No memories have been shared yet.'}
                </p>
                {onContribute && (
                    <button
                        onClick={onContribute}
                        className="mt-6 rounded-xl bg-accent-gold px-6 py-3 font-mono text-xs font-bold tracking-widest text-bg-dark uppercase transition-all hover:bg-accent-gold/80"
                    >
                        {contributeLabel || 'Share a Memory'}
                    </button>
                )}
            </div>
        </motion.div>
    );
}
