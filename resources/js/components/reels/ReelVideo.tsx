import { VideoPlayer } from '@/components/media/VideoPlayer';
import type { FeedVideoData } from '@/types/feed';
import type { PlayerVideo } from '@/types/video-player';

interface ReelVideoProps {
    video: FeedVideoData;
    isActive?: boolean;
    preload?: 'none' | 'metadata' | 'auto';
}

const playerVideo = (v: FeedVideoData): PlayerVideo => ({
    id: v.id,
    storyId: v.id,
    title: v.title,
    description: v.description,
    url: v.file_url ?? null,
    thumbnail: v.thumbnail ?? null,
    preview: null,
    sprite: null,
    author: v.author,
    date: v.date,
});

export function ReelVideo({ video, isActive, preload = 'metadata' }: ReelVideoProps) {
    const playerVideoData = playerVideo(video);

    return (
        <div className="absolute inset-0">
            <VideoPlayer
                video={playerVideoData}
                autoPlay={isActive}
                preload={preload}
                showControls
                showSpeedControl
                showPip
                showVolumeSlider
                showStatusOverlay
                className="h-full w-full"
                videoClassName="h-full w-full object-contain"
            />
        </div>
    );
}
