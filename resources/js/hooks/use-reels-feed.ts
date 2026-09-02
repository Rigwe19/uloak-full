import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FeedVideoData } from '@/types/feed';

interface ReelsFeedOptions {
    roomId: number;
    initialVideos: FeedVideoData[];
    initialCursor: number | null;
    initialHasMore: boolean;
}

export function useReelsFeed({
    roomId,
    initialVideos,
    initialCursor,
    initialHasMore,
}: ReelsFeedOptions) {
    const [videos, setVideos] = useState<FeedVideoData[]>(initialVideos);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [nextCursor, setNextCursor] = useState<number | null>(initialCursor);

    useEffect(() => {
        setVideos(initialVideos);
        setHasMore(initialHasMore);
        setNextCursor(initialCursor);
    }, [initialVideos, initialHasMore, initialCursor]);

    const fetchMore = async () => {
        if (!hasMore || isFetching) {
            return;
        }

        setIsFetching(true);

        try {
            const response = await fetch(
                `/dashboard/rooms/${roomId}/feed?cursor=${nextCursor}`,
            );
            const data = await response.json();

            if (data.videos?.length) {
                setVideos((prev) => [...prev, ...data.videos]);
                setNextCursor(data.nextCursor);
                setHasMore(data.hasMore);
            }
        } catch (error) {
            console.error('Failed to fetch more videos:', error);
        } finally {
            setIsFetching(false);
        }
    };

    const goNext = () => {
        if (currentIndex < videos.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else if (hasMore) {
            fetchMore();
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    return {
        videos,
        currentIndex,
        isFetching,
        hasMore,
        currentVideo: videos[currentIndex] || null,
        goNext,
        goPrev,
    };
}
