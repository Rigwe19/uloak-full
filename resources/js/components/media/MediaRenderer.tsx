import { Play, Music, ImageIcon, Mic, FileText, Download } from 'lucide-react';
import React from 'react';
import type { PlayerVideo } from '@/types/video-player';
import AudioWaveformPlayer from './AudioWaveformPlayer';
import { VideoCard } from './VideoCard';
import { VideoPlayer } from './VideoPlayer';

interface MediaRendererProps {
    type: string;
    video?: PlayerVideo;
    asset?: { url: string; type: string; title?: string };
    story?: {
        title: string;
        description?: string;
        fileUrl?: string;
        thumbnail?: string;
        transcript?: any;
    };
    onVideoClick?: () => void;
    mode?: 'card' | 'player';
}

export function MediaRenderer({ type, video, asset, story, onVideoClick, mode = 'card' }: MediaRendererProps) {
    if (type === 'video' && video) {
        if (mode === 'player') {
            return (
                <VideoPlayer
                    video={video}
                    showControls
                    showSpeedControl
                    showPip
                    showVolumeSlider
                    showStatusOverlay
                    className="h-full w-full"
                />
            );
        }

        return <VideoCard video={video} onClick={onVideoClick} />;
    }

    if (type === 'audio') {
        if (mode === 'player') {
            return (
                <div className="flex h-full w-full items-center justify-center p-6 md:p-12">
                    <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
                        <div className="mb-8 flex items-center gap-6">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-accent-gold/10 text-accent-gold shadow-2xl">
                                <Play size={40} fill="currentColor" />
                            </div>
                            <div className="min-w-0">
                                <p className="mb-2 text-xs font-bold tracking-[0.3em] text-accent-gold uppercase">
                                    Audio Archive
                                </p>
                                <h2 className="truncate text-2xl font-bold text-white md:text-3xl">
                                    {asset?.title || story?.title}
                                </h2>
                            </div>
                        </div>
                        <AudioWaveformPlayer
                            src={story?.fileUrl || asset?.url || ''}
                            title={story?.title || ''}
                            transcript={story?.transcript}
                        />
                        <div className="mt-6 flex items-center justify-between text-xs tracking-widest text-text-muted uppercase">
                            <span>Digital Preservation Artifact</span>
                            <span>Audio Format</span>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-accent-gold/5 to-surface">
                <div className="text-center">
                    <Music size={40} className="text-accent-gold/60 mx-auto mb-2" />
                    <span className="text-[10px] font-mono tracking-wider text-accent-gold uppercase block">Voice Recording</span>
                </div>
            </div>
        );
    }

    if (type === 'document' || type === 'pdf') {
        if (mode === 'player') {
            return (
                <div className="flex h-full w-full items-center justify-center p-6 md:p-12">
                    <div className="group relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl transition-all hover:border-accent-gold/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 to-transparent opacity-50" />
                        <div className="relative flex flex-col items-center text-center">
                            <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-[28px] bg-accent-gold/10 text-accent-gold shadow-2xl">
                                <FileText size={64} />
                            </div>
                            <p className="mb-3 text-xs font-bold tracking-[0.35em] text-accent-gold uppercase">
                                Archived Document
                            </p>
                            <h2 className="mb-4 text-2xl font-bold text-white">
                                {asset?.title || story?.title || 'Untitled Document'}
                            </h2>
                            <a
                                href={asset?.url || story?.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-accent-gold/30 hover:bg-white/20"
                            >
                                <FileText size={16} />
                                Open Document
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-accent-gold/5 to-surface">
                <FileText size={32} className="text-accent-gold/40" />
            </div>
        );
    }

    if (type === 'photo' || type === 'image') {
        return (
            <img
                src={asset?.url || story?.fileUrl || story?.thumbnail || '/logo-stacked.png'}
                alt={asset?.title || story?.title || ''}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
 e.currentTarget.src = '/logo-stacked.png'; 
}}
            />
        );
    }

    return null;
}
