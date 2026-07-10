import { create } from 'zustand';
import type { PlaybackMemory } from '@/types/feed';

const MEMORY_TTL = 5 * 60 * 1000;

function isExpired(memory: PlaybackMemory): boolean {
    return Date.now() - memory.timestamp > MEMORY_TTL;
}

interface PlaybackCoordinatorState {
    activeId: number | null;
    pausedById: Set<number>;
    memoryById: Map<number, PlaybackMemory>;
}

interface PlaybackCoordinatorActions {
    startPlaying: (id: number) => void;
    stop: (id: number) => void;
    remember: (id: number, memory: Omit<PlaybackMemory, 'timestamp'>) => void;
    recall: (id: number) => PlaybackMemory | null;
    forget: (id: number) => void;
    isPlaying: (id: number) => boolean;
    cleanup: () => void;
    reset: () => void;
}

type PlaybackCoordinatorStore = PlaybackCoordinatorState & PlaybackCoordinatorActions;

export const usePlaybackCoordinator = create<PlaybackCoordinatorStore>((set, get) => ({
    activeId: null,
    pausedById: new Set(),
    memoryById: new Map(),

    startPlaying: (id) => {
        const { activeId, pausedById } = get();

        if (activeId && activeId !== id) {
            const prev = pausedById;
            prev.add(activeId);
            set({ pausedById: new Set(prev) });
        }

        const pausing = pausedById;
        pausing.delete(id);
        set({ activeId: id, pausedById: new Set(pausing) });
    },

    stop: (id) => {
        const { activeId, pausedById } = get();

        if (activeId === id) {
            const next = pausedById;
            next.delete(id);
            set({ activeId: null, pausedById: new Set(next) });
        }
    },

    remember: (id, memory) => {
        const { memoryById } = get();
        const next = new Map(memoryById);
        next.set(id, { ...memory, timestamp: Date.now() });
        set({ memoryById: next });
    },

    recall: (id) => {
        const memory = get().memoryById.get(id);

        if (!memory || isExpired(memory)) {
            if (memory) {
                get().forget(id);
            }

            return null;
        }

        return memory;
    },

    forget: (id) => {
        const { memoryById } = get();
        const next = new Map(memoryById);
        next.delete(id);
        set({ memoryById: next });
    },

    isPlaying: (id) => get().activeId === id,

    cleanup: () => {
        const { memoryById } = get();
        let changed = false;
        const next = new Map(memoryById);

        for (const [id, memory] of next) {
            if (isExpired(memory)) {
                next.delete(id);
                changed = true;
            }
        }

        if (changed) {
set({ memoryById: next });
}
    },

    reset: () => set({ activeId: null, pausedById: new Set(), memoryById: new Map() }),
}));
