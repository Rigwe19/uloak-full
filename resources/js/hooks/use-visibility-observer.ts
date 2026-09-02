import { useEffect, useRef, useState } from 'react';

interface VisibilityState {
    ratio: number;
    isIntersecting: boolean;
}

export function useVisibilityObserver(
    ref: React.RefObject<HTMLElement | null>,
    options: IntersectionObserverInit = { threshold: [0, 0.4, 0.7] },
): VisibilityState {
    const [state, setState] = useState<VisibilityState>({
        ratio: 0,
        isIntersecting: false,
    });
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const el = ref.current;

        if (!el) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                if (!entry) {
                    return;
                }

                cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(() => {
                    setState({
                        ratio: entry.intersectionRatio,
                        isIntersecting: entry.isIntersecting,
                    });
                });
            },
            { threshold: options.threshold ?? [0, 0.4, 0.7] },
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(rafRef.current);
        };
    }, [ref, options.threshold]);

    return state;
}
