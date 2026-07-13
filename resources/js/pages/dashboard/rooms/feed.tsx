import { Head, router } from '@inertiajs/react';
import type { FeedVideoData } from '@/types/feed';
import { ReelsPlayer } from '@/components/reels/ReelsPlayer';
import { useReelsFeed } from '@/hooks/use-reels-feed';

interface FeedProps {
    room: {
        id: number;
        slug: string;
        name: string;
    };
    initialVideos: FeedVideoData[];
    nextCursor: number | null;
    hasMore: boolean;
}

export default function Feed({ room, initialVideos, nextCursor, hasMore: initialHasMore }: FeedProps) {
    const {
        videos,
        currentIndex,
        isFetching,
        hasMore,
        currentVideo,
        goNext,
        goPrev,
    } = useReelsFeed({
        roomId: room.id,
        initialVideos,
        initialCursor: nextCursor,
        initialHasMore,
    });

    const handleClose = () => {
        router.get(`/dashboard/rooms/${room.slug}`);
    };

    return (
        <>
            <Head title={`${room.name} - Reels`} />

            <ReelsPlayer
                videos={videos}
                currentIndex={currentIndex}
                hasMore={hasMore}
                isFetching={isFetching}
                onNext={goNext}
                onPrev={goPrev}
                onClose={handleClose}
            />
        </>
    );
}
