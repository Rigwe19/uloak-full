import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Grid, List as ListIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import StoryFeedEmpty from '@/components/feed/StoryFeedEmpty';
import StorySkeleton from '@/components/feed/StorySkeleton';
import { useFeedPagination } from '@/hooks/use-feed-pagination';
import type { FeedStory } from '@/types/feed';

interface FeedFilterConfig {
    tabs?: string[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    tags?: string[];
    selectedTag?: string | null;
    onTagChange?: (tag: string | null) => void;
    viewMode?: 'grid' | 'list';
    onViewModeChange?: (mode: 'grid' | 'list') => void;
}

type UrlBuilder = (...args: unknown[]) => string;

interface StoryFeedProps {
    stories: FeedStory[];
    nextCursor?: string | null;
    urlBuilder?: UrlBuilder;
    routeParams?: Record<string, unknown>;
    filters?: FeedFilterConfig;
    loading?: boolean;
    emptyLabel?: string;
    emptyAction?: { label: string; onClick: () => void };
    children: (story: FeedStory, index: number) => ReactNode;
    addCard?: ReactNode;
}

export default function StoryFeed({
    stories,
    nextCursor = null,
    urlBuilder = () => '#',
    routeParams = {},
    filters,
    loading = false,
    emptyLabel,
    emptyAction,
    children,
    addCard,
}: StoryFeedProps) {
    const { loading: pagLoading, hasMore } = useFeedPagination(urlBuilder, routeParams, nextCursor);

    const filteredStories = useMemo(() => {
        if (!filters) {
            return stories;
        }

        let result = stories;

        if (filters.activeTab && filters.activeTab !== 'All') {
            const typeMap: Record<string, string> = {
                'Photo Gallery': 'photo',
                'Cinema Hall': 'video',
                'Whispering Voices': 'audio',
                Manuscripts: 'document',
            };
            const targetType = typeMap[filters.activeTab] || filters.activeTab.toLowerCase();
            result = result.filter((s) => s.type.toLowerCase().includes(targetType));
        }

        if (filters.selectedTag) {
            result = result.filter((s) => s.tags?.includes(filters.selectedTag!));
        }

        return result;
    }, [stories, filters]);

    const hasNoStories = stories.length === 0;
    const hasFilteredStories = filteredStories.length > 0;
    const showSkeleton = loading && stories.length === 0;
    const viewMode = filters?.viewMode ?? 'grid';

    return (
        <>
            {filters && !hasNoStories && (
                <div className="mb-12 flex flex-col justify-between gap-8 border-b border-white/5 pb-8 sm:flex-row sm:items-center">
                    {filters.tabs && filters.tabs.length > 0 && (
                        <div className="no-scrollbar flex items-center gap-8 overflow-x-auto pb-2">
                            {filters.tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => filters.onTabChange?.(tab)}
                                    className={`relative shrink-0 py-2 text-xs font-bold tracking-[0.2em] uppercase transition-all ${filters.activeTab === tab ? 'text-accent-gold' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    {tab}
                                    {filters.activeTab === tab && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        {filters.onViewModeChange && (
                            <div className="flex items-center gap-1 rounded-2xl border border-white/5 bg-surface/50 p-1 backdrop-blur-sm">
                                <button
                                    onClick={() => filters.onViewModeChange?.('grid')}
                                    className={`rounded-xl p-2 transition-all ${viewMode === 'grid' ? 'bg-white/5 text-accent-gold' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => filters.onViewModeChange?.('list')}
                                    className={`rounded-xl p-2 transition-all ${viewMode === 'list' ? 'bg-white/5 text-accent-gold' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    <ListIcon size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {filters?.tags && filters.tags.length > 0 && !hasNoStories && (
                <div className="mb-12 flex flex-wrap gap-3">
                    <span className="mr-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                        <Filter size={12} /> Filter:
                    </span>
                    {filters.tags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => filters.onTagChange?.(filters.selectedTag === tag ? null : tag)}
                            className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${filters.selectedTag === tag ? 'border-accent-gold bg-accent-gold text-bg-dark' : 'border-white/5 bg-surface/30 text-text-muted hover:border-accent-gold/40'}`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            )}

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-6'}>
                <AnimatePresence mode="popLayout">
                    {showSkeleton ? (
                        <StorySkeleton viewMode={viewMode} count={6} />
                    ) : hasFilteredStories ? (
                        filteredStories.map((story, i) => (
                            <motion.div
                                key={story.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                {children(story, i)}
                            </motion.div>
                        ))
                    ) : (
                        <StoryFeedEmpty
                            hasStories={!hasNoStories}
                            onContribute={emptyAction?.onClick}
                            contributeLabel={emptyLabel}
                        />
                    )}
                </AnimatePresence>

                {addCard && (
                    <motion.div layout>
                        {addCard}
                    </motion.div>
                )}
            </div>

            {pagLoading && !loading && (
                <div className="flex justify-center py-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="h-6 w-6 rounded-full border-2 border-accent-gold border-t-transparent"
                    />
                </div>
            )}
        </>
    );
}
