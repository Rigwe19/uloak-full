import { useCallback, useEffect, useRef, useState } from 'react';
import type { FeedVideoData } from '@/types/feed';

const PRELOAD_THRESHOLD = 3;

interface UseReelsFeedOptions {
    roomId: number;
    initialVideos: FeedVideoData[];
    initialCursor?: number | null;
    initialHasMore?: boolean;
}

interface ReelsFeedState {
    videos: FeedVideoData[];
    currentIndex: number;
    isLoading: boolean;
    isFetching: boolean;
    hasMore: boolean;
    error: string | null;
    direction: 'up' | 'down' | null;
}

export function useReelsFeed({ roomId, initialVideos, initialCursor, initialHasMore = false }: UseReelsFeedOptions) {
    const [state, setState] = useState<ReelsFeedState>({
        videos: initialVideos,
        currentIndex: 0,
        isLoading: false,
        isFetching: false,
        hasMore: initialHasMore,
        error: null,
        direction: null,
    });

    const abortRef = useRef<AbortController | null>(null);
    const cursorRef = useRef<number | null>(initialCursor ?? null);

    const fetchMore = useCallback(async () => {
        if (state.isFetching || !state.hasMore) return;

        setState(s => ({ ...s, isFetching: true, error: null }));

        if (abortRef.current) {
            abortRef.current.abort();
        }
        abortRef.current = new AbortController();

        try {
            const cursor = cursorRef.current;
            const url = cursor
                ? `/api/feed?room=${roomId}&cursor=${cursor}`
                : `/api/feed?room=${roomId}`;

            const res = await fetch(url, {
                headers: { Accept: 'application/json' },
                signal: abortRef.current.signal,
            });

            if (!res.ok) throw new Error('Failed to fetch feed');

            const json = await res.json();
            const newVideos: FeedVideoData[] = json.data ?? [];
            const nextCursor: number | null = json.next_cursor ?? null;
            const hasMore: boolean = json.has_more ?? false;

            cursorRef.current = nextCursor;

            setState(s => ({
                ...s,
                videos: [...s.videos, ...newVideos],
                isFetching: false,
                hasMore,
                error: null,
            }));
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;

            setState(s => ({ ...s, isFetching: false, error: 'Failed to load more videos' }));
        }
    }, [roomId, state.isFetching, state.hasMore]);

    useEffect(() => {
        const remaining = state.videos.length - state.currentIndex;
        if (remaining <= PRELOAD_THRESHOLD && state.hasMore && !state.isFetching) {
            fetchMore();
        }
    }, [state.currentIndex, state.videos.length, state.hasMore, state.isFetching, fetchMore]);

    const goNext = useCallback(() => {
        setState(s => {
            if (s.currentIndex >= s.videos.length - 1) return s;
            return { ...s, currentIndex: s.currentIndex + 1, direction: 'down' };
        });
    }, []);

    const goPrev = useCallback(() => {
        setState(s => {
            if (s.currentIndex <= 0) return s;
            return { ...s, currentIndex: s.currentIndex - 1, direction: 'up' };
        });
    }, []);

    const goTo = useCallback((index: number) => {
        setState(s => ({
            ...s,
            currentIndex: Math.max(0, Math.min(index, s.videos.length - 1)),
            direction: index > s.currentIndex ? 'down' : 'up',
        }));
    }, []);

    const retry = useCallback(() => {
        setState(s => ({ ...s, error: null }));
        fetchMore();
    }, [fetchMore]);

    useEffect(() => {
        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, []);

    const currentVideo = state.videos[state.currentIndex] ?? null;
    const prevVideo = state.currentIndex > 0 ? state.videos[state.currentIndex - 1] : null;
    const nextVideo = state.currentIndex < state.videos.length - 1 ? state.videos[state.currentIndex + 1] : null;

    return {
        ...state,
        currentVideo,
        prevVideo,
        nextVideo,
        goNext,
        goPrev,
        goTo,
        retry,
    };
}
