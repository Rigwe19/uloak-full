import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    SkipForward,
    Volume2,
    VolumeX,
    Maximize,
    Tv,
    User,
    Calendar,
} from 'lucide-react';

interface Story {
    id: string | number;
    title: string;
    thumbnail?: string;
    type: string;
    description?: string;
    author?: string;
    date?: string;
    file_url?: string;
    assets?: any[];
}

interface VideoPlaylistPlayerProps {
    stories: Story[];
    fullscreen?: boolean;
}

interface PlayableVideo {
    id: string | number;
    storyId: string | number;
    title: string;
    description: string;
    url: string;
    thumbnail: string;
    author: string;
    date: string;
}

export function VideoPlaylistPlayer({ stories = [], fullscreen = false }: VideoPlaylistPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    // Extract all playable videos from stories & nested assets
    const playlist = useMemo<PlayableVideo[]>(() => {
        const list: PlayableVideo[] = [];

        (stories || []).forEach((story) => {
            // Case 1: Story itself is a video and has a file_url
            if (story.type === 'video' && story.file_url) {
                list.push({
                    id: `story-${story.id}`,
                    storyId: story.id,
                    title: story.title,
                    description: story.description || '',
                    url: story.file_url,
                    thumbnail: story.thumbnail || '/logo-stacked.png',
                    author: story.author || 'Anonymous',
                    date: story.date || '',
                });
            }

            // Case 2: Story has nested assets that are videos
            if (story.assets && Array.isArray(story.assets)) {
                story.assets.forEach((asset, aIdx) => {
                    if (asset.type === 'video' && asset.url) {
                        list.push({
                            id: `story-${story.id}-asset-${aIdx}`,
                            storyId: story.id,
                            title: asset.title || `${story.title} - Video ${aIdx + 1}`,
                            description: story.description || '',
                            url: asset.url,
                            thumbnail: story.thumbnail || '/logo-stacked.png',
                            author: story.author || 'Anonymous',
                            date: story.date || '',
                        });
                    }
                });
            }
        });

        return list;
    }, [stories]);

    const activeVideo = playlist[currentIdx] || null;

    // Reset state and autoplay when active video changes or on initial load
    useEffect(() => {
        setProgress(0);
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((e) => {
                    console.log('Autoplay prevented or failed:', e);
                    setIsPlaying(false);
                });
        }
    }, [currentIdx]);

    const handlePlayPause = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((e) => console.log('Playback error:', e));
        }
    };

    const handleMuteToggle = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const cur = videoRef.current.currentTime;
        const dur = videoRef.current.duration || 0;
        setProgress((cur / dur) * 100 || 0);
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration || 0);
    };

    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        videoRef.current.currentTime = percentage * duration;
        setProgress(percentage * 100);
    };

    const handleVideoEnded = () => {
        // Automatically proceed to the next video in the queue (or loop back to start)
        if (playlist.length > 1) {
            setCurrentIdx((prev) => (prev + 1) % playlist.length);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '00:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFullscreen = () => {
        if (!videoRef.current) return;
        if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen();
        }
    };

    if (playlist.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-4xl border border-white/5 bg-surface/30 p-12 text-center shadow-2xl backdrop-blur-sm"
            >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-accent-gold/20 bg-accent-gold/5 text-accent-gold/70">
                    <Tv size={36} className="stroke-[1.5]" />
                </div>
                <h3 className="mb-2 text-2xl font-bold tracking-tight text-text-primary">
                    Cinema Hall is Quiet
                </h3>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-text-muted">
                    No video memories have been preserved in this homestead yet. Click the "Annex Memory" button below to add your first legacy film.
                </p>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-accent-gold/10 to-transparent" />
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`overflow-hidden ${!fullscreen ? 'rounded-4xl' : ''} border border-white/10 bg-surface/40 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl`}
        >
            <div className={`relative flex flex-col justify-between bg-black/60 w-full ${!fullscreen?'h-75 sm:h-112.5 md:h-137.5 lg:h-150':'aspect-video'} group`}>
                <video
                    ref={videoRef}
                    src={activeVideo?.url}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnded}
                    onClick={handlePlayPause}
                    autoPlay
                    loop={playlist.length === 1}
                    playsInline
                />

                {/* Ambient Light/Backdrop Glow from Active Video */}
                <div className="absolute inset-0 -z-10 pointer-events-none opacity-20 blur-[60px]">
                    <img
                        src={activeVideo?.thumbnail}
                        className="w-full h-full object-cover"
                        alt=""
                    />
                </div>

                {/* Custom Premium Golden Controls Bar Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-4">
                    {/* Progress Bar */}
                    <div
                        onClick={handleProgressBarClick}
                        className="relative h-1.5 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-2"
                    >
                        <div
                            style={{ width: `${progress}%` }}
                            className="absolute top-0 left-0 h-full rounded-full bg-accent-gold shadow-[0_0_10px_rgba(198,161,91,0.6)]"
                        />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={handlePlayPause}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold text-bg-dark hover:scale-105 transition-transform"
                            >
                                {isPlaying ? (
                                    <Pause size={18} fill="currentColor" />
                                ) : (
                                    <Play size={18} fill="currentColor" className="ml-0.5" />
                                )}
                            </button>

                            {playlist.length > 1 && (
                                <button
                                    onClick={handleVideoEnded}
                                    title="Skip to next"
                                    className="text-text-muted hover:text-white transition-colors"
                                >
                                    <SkipForward size={18} />
                                </button>
                            )}

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleMuteToggle}
                                    className="text-text-muted hover:text-white transition-colors"
                                >
                                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                            </div>

                            <span className="font-mono text-text-muted">
                                {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleFullscreen}
                                className="text-text-muted hover:text-white transition-colors"
                            >
                                <Maximize size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Title overlay when controls are hidden */}
                <div className="absolute top-6 left-6 pointer-events-none bg-black/60 backdrop-blur-md border border-white/5 rounded-full px-4 py-2 text-xs font-semibold tracking-wider text-text-primary flex items-center gap-2">
                    <span className="text-accent-gold font-mono">NOW PLAYING:</span>
                    <span className='flex-1 w-1/3 truncate'>{activeVideo?.title}</span>
                    {playlist.length > 1 && (
                        <span className="ml-2 rounded-full bg-accent-gold/10 px-2.5 py-0.5 text-[9px] font-bold text-accent-gold border border-accent-gold/20">
                            {currentIdx + 1} of {playlist.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Description Details bar at the bottom */}
            {!fullscreen && <div className="border-t border-white/5 bg-black/20 p-6 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                    <h4 className="text-xl font-bold text-text-primary">{activeVideo?.title}</h4>
                    <p className="text-xs font-light text-text-muted leading-relaxed max-w-3xl italic">
                        "{activeVideo?.description}"
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-6 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 text-[10px] font-bold tracking-[0.2em] text-text-muted uppercase">
                    <div className="flex items-center gap-2">
                        <User size={12} className="text-accent-gold" />
                        <span>Preserved by {activeVideo?.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-accent-gold" />
                        <span>{activeVideo?.date}</span>
                    </div>
                </div>
            </div>}
        </motion.div>
    );
}
