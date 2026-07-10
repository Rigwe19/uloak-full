import React, { useEffect } from 'react';
import { useVideoKeyboard } from '@/hooks/use-video-keyboard';
import { usePlayerStore } from '@/stores/video-player-store';
import type { PlayerVideo } from '@/types/video-player';
import { VideoContextMenu } from './VideoContextMenu';
import { VideoControls } from './VideoControls';
import { VideoError } from './VideoError';
import { VideoLoading } from './VideoLoading';
import { VideoOverlay } from './VideoOverlay';
import { VideoStatusOverlay } from './VideoStatusOverlay';
import { VideoSurface } from './VideoSurface';

interface VideoPlayerProps {
    video: PlayerVideo;
    autoPlay?: boolean;
    showControls?: boolean;
    showSpeedControl?: boolean;
    showPip?: boolean;
    showVolumeSlider?: boolean;
    showContextMenu?: boolean;
    showStatusOverlay?: boolean;
    className?: string;
    videoClassName?: string;
    onTimeUpdate?: (time: number) => void;
    onEnded?: () => void;
    onClose?: () => void;
    topRight?: React.ReactNode;
}

export function VideoPlayer({
    video,
    autoPlay = true,
    showControls = true,
    showSpeedControl = true,
    showPip = true,
    showVolumeSlider = true,
    showContextMenu = false,
    showStatusOverlay = false,
    className = '',
    videoClassName = 'h-full w-full object-contain',
    onTimeUpdate,
    onEnded,
    onClose,
    topRight,
}: VideoPlayerProps) {
    const play = usePlayerStore((s) => s.play);
    const setError = usePlayerStore((s) => s.setError);
    const isLoading = usePlayerStore((s) => s.isLoading);
    const setLoading = usePlayerStore((s) => s.setLoading);
    const reset = usePlayerStore((s) => s.reset);

    useVideoKeyboard({ onClose });

    useEffect(() => {
        if (video.url) {
            setLoading(true);
            setError(null);

            if (autoPlay) {
                play(video.id);
            }
        }

        return () => {
            reset();
        };
    }, [video.id, video.url]);

    if (!video.url) {
        return (
            <div className={`flex items-center justify-center bg-black ${className}`}>
                <div className="text-center">
                    <p className="text-xs text-white/40 font-mono">No video available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden bg-black ${className}`}>
            {showStatusOverlay && (
                <VideoStatusOverlay status={video.status} thumbnail={video.thumbnail} />
            )}

            <VideoSurface
                videoId={video.id}
                src={video.url}
                poster={video.thumbnail}
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
                className={videoClassName}
            />

            <VideoLoading visible={isLoading} />
            <VideoError />

            {showControls && (
                <VideoOverlay topRight={topRight}>
                    <VideoControls
                        showTimeline
                        showSpeedControl={showSpeedControl}
                        showPip={showPip}
                        showVolumeSlider={showVolumeSlider}
                        sprite={video.sprite}
                    />
                </VideoOverlay>
            )}

            {showContextMenu && <VideoContextMenu />}
        </div>
    );
}
