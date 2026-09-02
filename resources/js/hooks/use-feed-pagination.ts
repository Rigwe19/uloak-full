import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PaginationState {
    loading: boolean;
    hasMore: boolean;
    nextCursor: string | null;
}

type UrlBuilder = (...args: unknown[]) => string;

export function useFeedPagination(
    urlBuilder: UrlBuilder,
    routeParams: Record<string, unknown>,
    initialNextCursor: string | null = null,
    debounceMs = 200,
) {
    const [state, setState] = useState<PaginationState>({
        loading: false,
        hasMore: initialNextCursor !== null,
        nextCursor: initialNextCursor,
    });
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const loadMore = useCallback(() => {
        if (state.loading || !state.hasMore) {
            return;
        }

        setState((s) => ({ ...s, loading: true }));

        const url = urlBuilder(routeParams, {
            query: { cursor: state.nextCursor },
        });

        router.visit(url, {
            only: ['stories'],
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const data = page.props as any;
                const stories: any[] = data.stories ?? [];
                const paginated = data.pagination as
                    | { next_cursor?: string | null }
                    | undefined;

                setState({
                    loading: false,
                    hasMore: paginated?.next_cursor ? true : false,
                    nextCursor: paginated?.next_cursor ?? null,
                });

                if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                        new CustomEvent('feed:appended', {
                            detail: {
                                stories,
                                nextCursor: paginated?.next_cursor ?? null,
                            },
                        }),
                    );
                }
            },
            onError: () => setState((s) => ({ ...s, loading: false })),
        });
    }, [
        urlBuilder,
        routeParams,
        state.loading,
        state.hasMore,
        state.nextCursor,
    ]);

    const onScroll = useCallback(() => {
        const scrollBottom = window.innerHeight + window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const threshold = docHeight - 600;

        if (scrollBottom >= threshold) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(loadMore, debounceMs);
        }
    }, [loadMore, debounceMs]);

    useEffect(() => {
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);

            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [onScroll]);

    return state;
}
