import { useState, KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../components/DataProvider';
import {
    X,
    ChevronLeft,
    ChevronRight,
    Heart,
    MessageCircle,
    Share2,
    MoreVertical,
    Calendar,
    User,
    Play,
    Tag,
    Plus,
    Hash,
    Download,
    Image as ImageIcon,
    Video,
    FileText,
} from 'lucide-react';
import { Button, Badge } from '../components/UI';

export default function StoryViewer() {
    const { storyId } = useParams();
    const { stories } = useData();
    const navigate = useNavigate();
    const [likes, setLikes] = useState(12);
    const [isLiked, setIsLiked] = useState(false);

    const currentStoryIndex = stories.findIndex((s) => s.id === storyId);
    const story = stories[currentStoryIndex === -1 ? 0 : currentStoryIndex];

    const [tags, setTags] = useState<string[]>(story.tags || []);
    const [newTag, setNewTag] = useState('');
    const [showTagInput, setShowTagInput] = useState(false);
    const [activeAssetIndex, setActiveAssetIndex] = useState(0);

    const handleClose = () => navigate(-1);

    const navigateStory = (direction: 'prev' | 'next') => {
        const nextIndex =
            direction === 'next'
                ? (currentStoryIndex + 1) % stories.length
                : (currentStoryIndex - 1 + stories.length) % stories.length;
        navigate(`/app/story/${stories[nextIndex].id}`);
    };

    const toggleLike = () => {
        setIsLiked(!isLiked);
        setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
            setShowTagInput(false);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addTag();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-bg-dark lg:flex-row lg:overflow-hidden">
            {/* Visual Content Section */}
            <div className="group relative flex h-[60vh] flex-none items-center justify-center overflow-hidden bg-black lg:h-full lg:flex-grow">
                {story.type === 'collection' && story.assets ? (
                    <div className="relative flex h-full w-full items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeAssetIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex h-full w-full items-center justify-center p-4"
                            >
                                {story.assets[activeAssetIndex].type ===
                                'video' ? (
                                    <video
                                        src={story.assets[activeAssetIndex].url}
                                        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                                        controls
                                    />
                                ) : story.assets[activeAssetIndex].type ===
                                  'document' ? (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-accent-gold/10 text-accent-gold shadow-2xl">
                                            <FileText size={64} />
                                        </div>
                                        <p className="text-xl font-bold tracking-widest text-white uppercase">
                                            {
                                                story.assets[activeAssetIndex]
                                                    .title
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <img
                                        src={story.assets[activeAssetIndex].url}
                                        alt=""
                                        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Collection Pagers */}
                        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/40 p-2 backdrop-blur-md">
                            {story.assets.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveAssetIndex(idx)}
                                    className={`h-2 w-2 rounded-full transition-all ${activeAssetIndex === idx ? 'w-6 bg-accent-gold' : 'bg-white/20 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                ) : story.type === 'video' ? (
                    <video
                        src={
                            story.fileUrl ||
                            'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
                        }
                        className="h-full w-full object-contain"
                        controls
                        autoPlay
                        poster={story.thumbnail}
                    />
                ) : (
                    <motion.img
                        layoutId={`story-${story.id}`}
                        src={story.thumbnail}
                        alt={story.title}
                        className="h-full w-full object-contain"
                    />
                )}

                {/* Cinematic Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Top Bar (Mobile/Internal) */}
                <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between p-4 md:p-8">
                    <button
                        onClick={handleClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/10 text-text-primary backdrop-blur-md transition-all hover:bg-white/20 md:h-12 md:w-12"
                    >
                        <X size={20} className="md:size-[24px]" />
                    </button>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="secondary"
                            className="px-4 py-2 text-[10px] md:text-xs"
                            icon={Download}
                            onClick={() =>
                                alert(
                                    'Collecting the Artifact for preservation...',
                                )
                            }
                        >
                            Collect Artifact
                        </Button>
                        <Button
                            variant="secondary"
                            className="px-4 py-2 text-[10px] md:text-xs"
                            icon={Share2}
                        >
                            Share
                        </Button>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="absolute inset-y-0 left-2 flex items-center md:left-4">
                    <button
                        onClick={() => navigateStory('prev')}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/20 text-text-primary/40 backdrop-blur-sm transition-all hover:bg-surface/40 hover:text-text-primary md:h-12 md:w-12"
                    >
                        <ChevronLeft size={24} className="md:size-[32px]" />
                    </button>
                </div>
                <div className="absolute inset-y-0 right-2 flex items-center md:right-4">
                    <button
                        onClick={() => navigateStory('next')}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/20 text-text-primary/40 backdrop-blur-sm transition-all hover:bg-surface/40 hover:text-text-primary md:h-12 md:w-12"
                    >
                        <ChevronRight size={24} className="md:size-[32px]" />
                    </button>
                </div>

                {/* Playback Controls (if video) */}
                {story.type === 'video' && (
                    <div className="absolute bottom-6 left-1/2 flex w-full max-w-[200px] -translate-x-1/2 items-center gap-8 px-4 md:bottom-12 md:max-w-[256px]">
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                            <div className="h-full w-1/2 bg-accent-gold" />
                        </div>
                    </div>
                )}
            </div>

            {/* Meta/Context Sidebar */}
            <aside className="w-full flex-grow overflow-y-auto border-l border-border-subtle bg-bg-dark p-6 md:p-8 lg:w-[450px] lg:p-12">
                <div className="flex flex-col gap-8">
                    <Badge className="w-fit">{story.type}</Badge>

                    <div>
                        <h1 className="mb-4 text-3xl leading-tight font-bold text-text-primary md:text-4xl">
                            {story.title}
                        </h1>
                        <div className="flex items-center gap-6 text-sm text-text-muted">
                            <div className="flex items-center gap-2">
                                <User size={14} className="text-accent-gold" />
                                <span>{story.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar
                                    size={14}
                                    className="text-accent-gold"
                                />
                                <span>{story.date}</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-border-subtle" />

                    {/* Engagement */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleLike}
                            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface/50 p-4 transition-all hover:bg-surface"
                        >
                            <Heart
                                size={20}
                                className={`transition-all ${isLiked ? 'fill-red-400 text-red-400' : 'text-text-muted group-hover:text-red-400'}`}
                            />
                            <span
                                className={`text-sm font-semibold ${isLiked ? 'text-text-primary' : 'text-text-muted'}`}
                            >
                                {likes}
                            </span>
                        </button>
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface/50 p-4 text-text-muted transition-all hover:bg-surface hover:text-text-primary">
                            <MessageCircle size={20} />
                            <span className="text-sm font-semibold text-text-primary">
                                4
                            </span>
                        </button>
                        <button className="rounded-xl border border-border-subtle bg-surface/50 p-4 text-text-muted transition-all hover:bg-surface hover:text-text-primary">
                            <MoreVertical size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h3 className="text-xs font-bold tracking-widest text-accent-gold uppercase">
                            Archive Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Archivist', value: story.author },
                                { label: 'Preserved', value: story.date },
                                {
                                    label: 'Format',
                                    value: story.type.toUpperCase(),
                                },
                                {
                                    label: 'Archive ID',
                                    value: `HER-${story.id.substring(0, 8).toUpperCase()}`,
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-border-subtle bg-surface p-3"
                                >
                                    <p className="mb-1 text-[10px] tracking-wider text-text-muted uppercase">
                                        {item.label}
                                    </p>
                                    <p className="text-xs font-bold text-text-primary">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h3 className="text-xs font-bold tracking-widest text-accent-gold uppercase">
                            Narrative
                        </h3>
                        <p className="border-l-2 border-accent-gold/30 py-2 pl-6 text-sm leading-relaxed text-text-muted italic md:text-base">
                            "
                            {story.description ||
                                'No narrative description provided for this memory. Add context to help future generations understand this moment.'}
                            "
                        </p>
                    </div>

                    {/* Tagging System */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase">
                                <Tag size={12} />
                                Tags
                            </h3>
                            <button
                                onClick={() => setShowTagInput(true)}
                                className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-text-muted uppercase transition-colors hover:text-accent-gold"
                            >
                                <Plus size={10} />
                                Add Tag
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <AnimatePresence mode="popLayout">
                                {tags.map((tag) => (
                                    <motion.button
                                        key={tag}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={() => removeTag(tag)}
                                        className="group flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5 transition-all hover:border-red-400/30"
                                    >
                                        <Hash
                                            size={10}
                                            className="text-accent-gold transition-colors group-hover:text-red-400"
                                        />
                                        <span className="text-xs text-text-primary transition-colors group-hover:text-red-400">
                                            {tag}
                                        </span>
                                    </motion.button>
                                ))}
                            </AnimatePresence>

                            <AnimatePresence>
                                {showTagInput && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex items-center gap-2 rounded-full border border-accent-gold/30 bg-surface px-3 py-1"
                                    >
                                        <Hash
                                            size={10}
                                            className="text-accent-gold"
                                        />
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newTag}
                                            onChange={(e) =>
                                                setNewTag(e.target.value)
                                            }
                                            onKeyDown={handleKeyPress}
                                            onBlur={() =>
                                                !newTag &&
                                                setShowTagInput(false)
                                            }
                                            placeholder="Story tag..."
                                            className="w-24 border-none bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted/40"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Reactions/Comments Preview */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-xs font-bold tracking-widest text-accent-gold uppercase">
                            Reaction Voice Notes
                        </h3>
                        <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold">
                                <Play size={18} fill="black" />
                            </div>
                            <div className="h-1 flex-grow overflow-hidden rounded-full bg-border-subtle">
                                <div className="h-full w-1/3 bg-accent-gold" />
                            </div>
                            <span className="font-mono text-[10px] text-text-muted">
                                0:45
                            </span>
                        </div>
                    </div>

                    <div className="mt-auto pt-12">
                        <Button className="w-full" icon={Share2}>
                            Share this memory
                        </Button>
                    </div>
                </div>
            </aside>
        </div>
    );
}
