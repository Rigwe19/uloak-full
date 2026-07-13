import { create } from 'zustand';
import type { PlayerState, PlayerActions, PlaybackSpeed } from '@/types/video-player';

const INITIAL_STATE: PlayerState = {
    activeVideoId: null,
    isPlaying: false,
    isMuted: false,
    volume: 1,
    speed: 1 as PlaybackSpeed,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    isFullscreen: false,
    isPip: false,
    overlayVisible: true,
    showPreview: false,
    isLoading: true,
    hasError: false,
    errorMessage: null,
};

type PlayerStore = PlayerState & PlayerActions;

let activeVideoElement: HTMLVideoElement | null = null;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    ...INITIAL_STATE,

    play: (videoId) => {
        const { activeVideoId } = get();

        if (activeVideoId && activeVideoId !== videoId && activeVideoElement) {
            activeVideoElement.pause();
        }

        set({ activeVideoId: videoId, isPlaying: true, hasError: false, errorMessage: null });
    },

    pause: () => set({ isPlaying: false }),

    togglePlay: () => {
        const { isPlaying, activeVideoId } = get();

        if (isPlaying) {
            set({ isPlaying: false });
        } else if (activeVideoId) {
            set({ isPlaying: true, hasError: false, errorMessage: null });
        }
    },

    seek: (time) => {
        const el = activeVideoElement;

        if (el && !isNaN(time)) {
            el.currentTime = time;
        }

        set({ currentTime: time });
    },

    setVolume: (vol) => {
        const clamped = Math.max(0, Math.min(1, vol));

        set({ volume: clamped, isMuted: clamped === 0 });
    },

    toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

    setSpeed: (speed: PlaybackSpeed) => set({ speed }),

    setCurrentTime: (time) => set({ currentTime: time }),

    setDuration: (dur) => set({ duration: dur }),

    setBuffered: (buffered) => set({ buffered }),

    toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),

    setIsFullscreen: (val) => set({ isFullscreen: val }),

    togglePip: () => set((s) => ({ isPip: !s.isPip })),

    showOverlay: () => set({ overlayVisible: true }),

    hideOverlay: () => {
        const { isPlaying } = get();

        if (isPlaying) {
            set({ overlayVisible: false });
        }
    },

    setLoading: (val) => set({ isLoading: val }),

    setError: (msg) => set({ hasError: msg !== null, errorMessage: msg, isLoading: false, isPlaying: false }),

    stop: () => {
        if (activeVideoElement) {
            activeVideoElement.pause();
            activeVideoElement = null;
        }

        set({ ...INITIAL_STATE });
    },

    reset: () => {
        if (activeVideoElement) {
            activeVideoElement.pause();
            activeVideoElement = null;
        }

        set({ ...INITIAL_STATE });
    },
}));

export function setActiveVideoElement(el: HTMLVideoElement | null) {
    activeVideoElement = el;
}

export function getActiveVideoElement(): HTMLVideoElement | null {
    return activeVideoElement;
}
