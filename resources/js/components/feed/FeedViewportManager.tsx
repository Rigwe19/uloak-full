import { useEffect, useRef } from 'react';
import { useVisibilityObserver } from '@/hooks/use-visibility-observer';
import { usePlaybackCoordinator } from '@/stores/playback-coordinator-store';

interface FeedViewportManagerProps {
    storyId: number;
    children: React.ReactNode;
    onVisible?: () => void;
    onHidden?: () => void;
    className?: string;
}

export default function FeedViewportManager({
    storyId,
    children,
    onVisible,
    onHidden,
    className,
}: FeedViewportManagerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { ratio } = useVisibilityObserver(ref);
    const prevRatio = useRef(0);
    const coordinator = usePlaybackCoordinator();

    useEffect(() => {
        const entering = prevRatio.current < 0.7 && ratio >= 0.7;
        const leaving = prevRatio.current >= 0.4 && ratio < 0.4;

        if (entering) {
            coordinator.startPlaying(storyId);
            onVisible?.();
        } else if (leaving) {
            coordinator.stop(storyId);
            onHidden?.();
        }

        prevRatio.current = ratio;
    }, [ratio, storyId, coordinator, onVisible, onHidden]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}
