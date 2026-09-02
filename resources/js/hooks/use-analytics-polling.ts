import { useEffect, useRef } from 'react';

const POLL_INTERVAL = 120_000;

export function useAnalyticsPolling(fetchFn: () => void | Promise<void>) {
    const savedCallback = useRef(fetchFn);

    useEffect(() => {
        savedCallback.current = fetchFn;
    }, [fetchFn]);

    useEffect(() => {
        const tick = () => {
            savedCallback.current();
        };

        const id = setInterval(tick, POLL_INTERVAL);

        return () => clearInterval(id);
    }, []);
}
