export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [
    0.25, 0.5, 0.75, 1, 1.25, 1.5, 2,
];

export const SPEED_LABELS: Record<PlaybackSpeed, string> = {
    0.25: '0.25x',
    0.5: '0.5x',
    0.75: '0.75x',
    1: 'Normal',
    1.25: '1.25x',
    1.5: '1.5x',
    2: '2x',
};

export interface PlayerVideo {
    id: string | number;
    storyId?: string | number;
    title: string;
    description?: string;
    url: string | null;
    thumbnail: string | null;
    preview: string | null;
    sprite: SpriteData | null;
    duration?: number | null;
    author?: string;
    date?: string;
    status?: string;
}

export interface SpriteData {
    image_url?: string;
    frame_width?: number;
    frame_height?: number;
    columns?: number;
    rows?: number;
    total_frames?: number;
    interval?: number;

    vtt?: string;
    image?: string;
}

export interface PlayerState {
    activeVideoId: string | number | null;
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    speed: PlaybackSpeed;
    currentTime: number;
    duration: number;
    buffered: number;
    isFullscreen: boolean;
    isPip: boolean;
    overlayVisible: boolean;
    showPreview: boolean;
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string | null;
}

export interface PlayerActions {
    play: (videoId: string | number) => void;
    pause: () => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setVolume: (vol: number) => void;
    toggleMute: () => void;
    setSpeed: (speed: PlaybackSpeed) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (dur: number) => void;
    setBuffered: (buffered: number) => void;
    toggleFullscreen: () => void;
    setIsFullscreen: (val: boolean) => void;
    togglePip: () => void;
    showOverlay: () => void;
    hideOverlay: () => void;
    setLoading: (val: boolean) => void;
    setError: (msg: string | null) => void;
    stop: () => void;
    reset: () => void;
}

export interface ScrubFrame {
    x: number;
    y: number;
    width: number;
    height: number;
    timestamp: number;
}

export interface VideoSocialAction {
    icon: React.ComponentType<{ className?: string; size?: number }>;
    label: string;
    count?: number;
    active?: boolean;
    activeColor?: string;
    onClick?: () => void;
}
