import { useCallback, useEffect, useRef } from 'react';
import { usePlayerStore, setActiveVideoElement } from '@/stores/video-player-store';

interface UseVideoControlsOptions {
    videoId: string | number;
    src: string | null;
    onTimeUpdate?: (time: number) => void;
    onEnded?: () => void;
}

export function useVideoControls({ videoId, src, onTimeUpdate, onEnded }: UseVideoControlsOptions) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const activeVideoId = usePlayerStore((s) => s.activeVideoId);
    const isMuted = usePlayerStore((s) => s.isMuted);
    const volume = usePlayerStore((s) => s.volume);
    const speed = usePlayerStore((s) => s.speed);
    const play = usePlayerStore((s) => s.play);
    const pause = usePlayerStore((s) => s.pause);
    const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
    const setDuration = usePlayerStore((s) => s.setDuration);
    const setBuffered = usePlayerStore((s) => s.setBuffered);
    const setLoading = usePlayerStore((s) => s.setLoading);
    const setError = usePlayerStore((s) => s.setError);

    const isActive = activeVideoId === videoId;

    useEffect(() => {
        const el = videoRef.current;

        if (!el || !src) {
return;
}

        setActiveVideoElement(el);

        const onPlay = () => play(videoId);
        const onPause = () => pause();
        const onTimeUpdateEvt = () => {
            const t = el.currentTime;
            setCurrentTime(t);
            onTimeUpdate?.(t);
        };
        const onLoadedMeta = () => setDuration(el.duration || 0);
        const onProgress = () => {
            if (el.buffered.length > 0) {
                setBuffered(el.buffered.end(el.buffered.length - 1));
            }
        };
        const onWait = () => setLoading(true);
        const onCanPlay = () => setLoading(false);
        const onError = () => {
            setError('Video playback failed. Tap to retry.');
        };
        const onEndedEvt = () => {
            pause();
            onEnded?.();
        };

        el.addEventListener('play', onPlay);
        el.addEventListener('pause', onPause);
        el.addEventListener('timeupdate', onTimeUpdateEvt);
        el.addEventListener('loadedmetadata', onLoadedMeta);
        el.addEventListener('progress', onProgress);
        el.addEventListener('waiting', onWait);
        el.addEventListener('canplay', onCanPlay);
        el.addEventListener('canplaythrough', onCanPlay);
        el.addEventListener('error', onError);
        el.addEventListener('ended', onEndedEvt);

        return () => {
            el.removeEventListener('play', onPlay);
            el.removeEventListener('pause', onPause);
            el.removeEventListener('timeupdate', onTimeUpdateEvt);
            el.removeEventListener('loadedmetadata', onLoadedMeta);
            el.removeEventListener('progress', onProgress);
            el.removeEventListener('waiting', onWait);
            el.removeEventListener('canplay', onCanPlay);
            el.removeEventListener('canplaythrough', onCanPlay);
            el.removeEventListener('error', onError);
            el.removeEventListener('ended', onEndedEvt);
        };
    }, [videoId, src]);

    useEffect(() => {
        const el = videoRef.current;

        if (!el || !src) {
return;
}

        if (isActive && isPlaying) {
            el.play().catch(() => {});
        } else if (!isActive || !isPlaying) {
            el.pause();
        }
    }, [isActive, isPlaying, src]);

    useEffect(() => {
        const el = videoRef.current;

        if (!el) {
return;
}

        el.muted = isMuted;
    }, [isMuted]);

    useEffect(() => {
        const el = videoRef.current;

        if (!el) {
return;
}

        el.volume = volume;
    }, [volume]);

    useEffect(() => {
        const el = videoRef.current;

        if (!el) {
return;
}

        el.playbackRate = speed;
    }, [speed]);

    const retry = useCallback(() => {
        const el = videoRef.current;

        if (!el) {
return;
}

        setError(null);
        setLoading(true);
        el.load();
        el.play().catch(() => {});
    }, [setError, setLoading]);

    return { videoRef, retry };
}
