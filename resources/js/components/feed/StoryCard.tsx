import { Music } from 'lucide-react';
import MediaPlaceholder from '@/components/feed/MediaPlaceholder';
import { VideoCard } from '@/components/media/VideoCard';
import type { FeedStory } from '@/types/feed';

interface StoryCardProps {
    story: FeedStory;
    onClick?: () => void;
    renderMedia?: (story: FeedStory) => React.ReactNode;
    className?: string;
    aspectRatio?: string;
}

export default function StoryCard({
    story,
    onClick,
    renderMedia,
    className = '',
    aspectRatio = 'aspect-video',
}: StoryCardProps) {
    const mediaUrl = story.file_url || story.assets?.[0]?.url || null;
    // Video processes silently in background — do not show processing UI per user request
    const isVideoProcessing =
        story.type === 'video' &&
        ((story as any).is_processing ||
            (story.assets?.some((a: any) => a?.status === 'processing' || a?.status === 'uploading') ?? false));

    // Do not show processing UI — hide video until ready (user requested)
    if (isVideoProcessing) {
        return null;
    }

    const defaultMedia = () => {
        if (renderMedia) {
            return renderMedia(story);
        }

        if (story.type === 'video' && mediaUrl) {
            return (
                <VideoCard
                    video={{
                        id: story.id,
                        storyId: story.id,
                        title: story.title,
                        url: mediaUrl,
                        thumbnail: story.thumbnail || null,
                        preview: null,
                        sprite: null,
                    }}
                    onClick={onClick}
                />
            );
        }

        if (story.type === 'audio') {
            return <MediaPlaceholder type="audio" />;
        }

        if (mediaUrl) {
            return (
                <img
                    src={story.thumbnail || mediaUrl || '/logo-stacked.png'}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                        e.currentTarget.src = '/logo-stacked.png';
                    }}
                />
            );
        }

        return <MediaPlaceholder />;
    };

    return (
        <div
            className={`relative ${aspectRatio} cursor-pointer overflow-hidden bg-bg-dark ${className}`}
            onClick={onClick}
        >
            {defaultMedia()}
        </div>
    );
}
