import { create } from 'zustand';
import type { PlayerState as PlayerStateType, PlayerActions } from '@/types/video-player';

interface VideoPlayerStoreState extends PlayerStateType {
    activeVideoElement: HTMLVideoElement | null;
}

interface VideoPlayerStoreActions extends PlayerActions {
    setOverlayVisible: (visible: boolean) => void;
    setActiveVideoElement: (el: HTMLVideoElement | null) => void;
}

const usePlayerStoreBase = create<VideoPlayerStoreState & VideoPlayerStoreActions>((set) => ({
    // State
    activeVideoId: null,
    isPlaying: false,
    isMuted: false,
    volume: 1,
    speed: 1,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    isFullscreen: false,
    isPip: false,
    overlayVisible: true,
    showPreview: false,
    isLoading: false,
    hasError: false,
    errorMessage: null,
    activeVideoElement: null,

    // Actions
    play: (videoId) => set({ activeVideoId: videoId, isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    seek: (time) => set({ currentTime: time }),
    setVolume: (vol) => set({ volume: vol, isMuted: vol === 0 }),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    setSpeed: (speed) => set({ speed }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (dur) => set({ duration: dur }),
    setBuffered: (buffered) => set({ buffered }),
    toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
    setIsFullscreen: (val) => set({ isFullscreen: val }),
    togglePip: () => set((state) => ({ isPip: !state.isPip })),
    showOverlay: () => set({ overlayVisible: true }),
    hideOverlay: () => set({ overlayVisible: false }),
    setLoading: (val) => set({ isLoading: val }),
    setError: (msg) => set({ hasError: !!msg, errorMessage: msg }),
    stop: () => set({ isPlaying: false, currentTime: 0 }),
    reset: () => set({
        activeVideoId: null,
        isPlaying: false,
        isMuted: false,
        volume: 1,
        speed: 1,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        isFullscreen: false,
        isPip: false,
        overlayVisible: true,
        showPreview: false,
        isLoading: false,
        hasError: false,
        errorMessage: null,
        activeVideoElement: null,
    }),
    setOverlayVisible: (visible) => set({ overlayVisible: visible }),
    setActiveVideoElement: (el) => set({ activeVideoElement: el }),
}));

export const usePlayerStore = usePlayerStoreBase;

export const getActiveVideoElement = (): HTMLVideoElement | null => {
    return document.querySelector('video');
};

export const setActiveVideoElement = (el: HTMLVideoElement | null): void => {
    usePlayerStoreBase.getState().setActiveVideoElement(el);
};