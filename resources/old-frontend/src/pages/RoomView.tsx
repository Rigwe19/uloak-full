import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect, ChangeEvent, useMemo } from 'react';
import { mockUsers } from '../data/mockData';
import { useData } from '../components/DataProvider';
import { Button, Badge, AvatarGroup } from '../components/UI';
import {
    ArrowLeft,
    Play,
    Upload,
    MoreHorizontal,
    Share2,
    Filter,
    Grid,
    List as ListIcon,
    Clock,
    User as UserIcon,
    Mic,
    Pause,
    X,
    RotateCcw,
    RotateCw,
    Volume2,
    Image as ImageIcon,
    Video,
    FileText,
    Scissors,
    Sparkles,
    LogIn,
    Key,
    Download,
    Shield,
    Users,
    Check,
    Trash2,
    Mail,
    Link as LinkIcon,
    QrCode,
} from 'lucide-react';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useAuth } from '../components/AuthProvider';
import { ShareQRCode } from '../components/ShareQRCode';

export default function RoomView() {
    const { roomId } = useParams();
    const location = useLocation();
    const { user } = useAuth();

    const isSharedView = location.pathname.startsWith('/share');
    const canModify = !!user && !isSharedView;
    const { rooms, stories, addStory, updateRoom } = useData();
    const navigate = useNavigate();

    const room = rooms.find((r) => r.id === roomId) || rooms[0];
    const roomStories = stories;
    const [activeTab, setActiveTab] = useState('All');
    const [showUpload, setShowUpload] = useState(false);
    const [showRecorder, setShowRecorder] = useState(false);
    const [activeAudio, setActiveAudio] = useState<{
        id: string;
        url: string;
        title: string;
    } | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingFile, setPendingFile] = useState<string | null>(null);
    const [pendingFileName, setPendingFileName] = useState('');
    const [pendingFileDesc, setPendingFileDesc] = useState('');
    const [pendingFileType, setPendingFileType] = useState('');
    const [rotation, setRotation] = useState(0);
    const [activeFilter, setActiveFilter] = useState('none');
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [isSquare, setIsSquare] = useState(false);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [roomOwner, setRoomOwner] = useState(room.members[0]?.id || '1');
    const [sharedAspects, setSharedAspects] = useState({
        photos: true,
        videos: true,
        voices: true,
        docs: true,
        tree: true,
    });
    const [pendingFiles, setPendingFiles] = useState<
        { file: string; type: string; name: string }[]
    >([]);
    const [isAiSuggesting, setIsAiSuggesting] = useState(false);
    const [aiHashtags, setAiHashtags] = useState<string[]>([]);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newPendingFiles: { file: string; type: string; name: string }[] =
            [];

        files.forEach((file) => {
            if (
                file.type.startsWith('image/') ||
                file.type.startsWith('video/')
            ) {
                const url = URL.createObjectURL(file);
                newPendingFiles.push({
                    file: url,
                    type: file.type,
                    name: file.name.split('.')[0],
                });
            } else {
                newPendingFiles.push({
                    file: 'DOCUMENT_PREVIEW',
                    type: file.type,
                    name: file.name.split('.')[0],
                });
            }
        });

        setPendingFiles((prev) => [...prev, ...newPendingFiles]);
        if (!pendingFileName) setPendingFileName(newPendingFiles[0].name);
        if (newPendingFiles.length === 1 && !pendingFile) {
            setPendingFile(newPendingFiles[0].file);
            setPendingFileType(newPendingFiles[0].type);
        }
    };

    const suggestHashtags = () => {
        setIsAiSuggesting(true);
        // Simulate AI thinking
        setTimeout(() => {
            const suggestions = [
                'Heritage',
                'Lineage',
                'Ancestry',
                'Legacy',
                'Homestead',
                'Roots',
            ];
            const randomTags = suggestions
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            setAiHashtags(randomTags);
            setIsAiSuggesting(false);
        }, 1500);
    };

    const processImage = (): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = pendingFile!;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(pendingFile!);

                // Set dimensions based on rotation
                if (rotation % 180 === 0) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                } else {
                    canvas.width = img.height;
                    canvas.height = img.width;
                }

                // Apply rotation
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((rotation * Math.PI) / 180);

                if (isSquare) {
                    const size = Math.min(img.width, img.height);
                    canvas.width = size;
                    canvas.height = size;
                    ctx.translate(0, 0); // Reset for square logic or adjust
                    // For square, we actually need to set canvas size before translation or handle offset
                    // Simpler: re-set canvas size for square and draw image with center crop
                    canvas.width = size;
                    canvas.height = size;
                    ctx.setTransform(1, 0, 0, 1, size / 2, size / 2);
                    ctx.rotate((rotation * Math.PI) / 180);
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);
                } else {
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);
                }

                // Apply global filters (simple approximation via canvas filter)
                let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) `;
                if (activeFilter === 'sepia') filterString += 'sepia(0.8)';
                if (activeFilter === 'grayscale')
                    filterString += 'grayscale(1)';
                if (activeFilter === 'vivid')
                    filterString += 'saturate(1.8) contrast(1.2)';

                ctx.filter = filterString.trim();

                resolve(canvas.toDataURL(pendingFileType));
            };
        });
    };

    const confirmUpload = async () => {
        if (pendingFiles.length === 0 && !pendingFile) return;

        setIsUploading(true);

        // Simulate upload delay
        setTimeout(() => {
            const storyType =
                pendingFiles.length > 1
                    ? 'collection'
                    : pendingFileType.startsWith('image/')
                        ? 'photo'
                        : pendingFileType.startsWith('video/')
                            ? 'video'
                            : 'document';

            const newStoryData = {
                title:
                    pendingFileName ||
                    (pendingFiles.length > 1
                        ? 'New Heritage Collection'
                        : 'New Artifact'),
                thumbnail:
                    pendingFiles.length > 0
                        ? pendingFiles[0].file === 'DOCUMENT_PREVIEW'
                            ? 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=500&q=80'
                            : pendingFiles[0].file
                        : pendingFile ||
                        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
                type: storyType as any,
                author: 'You', // Assuming current user
                date: new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                }),
                description: pendingFileDesc,
                tags: aiHashtags,
                assets: pendingFiles.map((file) => ({
                    type: file.type.startsWith('image/')
                        ? 'photo'
                        : ((file.type.startsWith('video/')
                            ? 'video'
                            : 'document') as any),
                    url: file.file,
                    title: file.name,
                })),
            };

            addStory(newStoryData);

            // Update room story count
            updateRoom(room.id, { storyCount: room.storyCount + 1 });

            setIsUploading(false);
            resetUpload();
            handleCloseUpload();
            alert(
                'Your heritage artifact has been preserved in the Homestead archives.',
            );
        }, 2000);
    };

    const triggerFileUpload = (accept?: string) => {
        if (fileInputRef.current) {
            if (accept) fileInputRef.current.accept = accept;
            else
                fileInputRef.current.accept =
                    'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt';
            fileInputRef.current.click();
        }
    };

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        stories.forEach((s) => s.tags?.forEach((t) => tags.add(t)));
        return Array.from(tags);
    }, [stories]);

    const filteredStories = useMemo(() => {
        let result = roomStories;

        // Filter by Tab (Type)
        if (activeTab !== 'All') {
            const typeMap: Record<string, string> = {
                'Photo Gallery': 'photo',
                'Cinema Hall': 'video',
                'Whispering Voices': 'voice',
                Manuscripts: 'document',
            };
            const targetType = typeMap[activeTab] || activeTab.toLowerCase();
            result = result.filter((s) =>
                s.type.toLowerCase().includes(targetType),
            );
        }

        // Filter by Tag
        if (selectedTag) {
            result = result.filter((s) => s.tags?.includes(selectedTag));
        }

        return result;
    }, [roomStories, activeTab, selectedTag]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, activeAudio]);

    const handleSaveVoice = (blob: Blob, durationStr: string) => {
        const url = URL.createObjectURL(blob);
        const newStory = {
            title: 'Voice Memory',
            author: 'You',
            date: 'Just now',
            type: 'voice' as const,
            thumbnail:
                'https://images.unsplash.com/photo-1478737270239-2fccd2c78623?w=500&q=80',
            duration: durationStr,
            audioUrl: url,
        };

        addStory(newStory);
        setShowRecorder(false);
    };

    const playVoice = (story: any) => {
        const url =
            story.audioUrl ||
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        setActiveAudio({ id: story.id, url, title: story.title });
        setIsPlaying(true);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    const handleScrub = (e: ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) audioRef.current.currentTime = time;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const resetUpload = () => {
        setPendingFile(null);
        setPendingFiles([]);
        setPendingFileName('');
        setPendingFileDesc('');
        setPendingFileType('');
        setIsUploading(false);
        setRotation(0);
        setActiveFilter('none');
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setIsSquare(false);
        setAiHashtags([]);
    };

    const handleCloseUpload = () => {
        setShowUpload(false);
        resetUpload();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-bg-dark"
        >
            <AnimatePresence>
                {showRecorder && (
                    <VoiceRecorder
                        onClose={() => setShowRecorder(false)}
                        onSave={handleSaveVoice}
                    />
                )}
            </AnimatePresence>
            {/* Background Ambience / Atmosphere blur */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="atmosphere absolute inset-0 opacity-30" />
                <motion.img
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.1 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    src={room.thumbnail}
                    className="h-full w-full object-cover blur-[100px]"
                />
            </div>

            <main className="relative z-10 mx-auto max-w-7xl p-5 pb-32 md:p-8 md:pb-16 lg:p-16">
                <motion.header
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-12 md:mb-16"
                >
                    <div className="mb-8 flex items-center justify-between">
                        {isSharedView ? (
                            <Link
                                to="/"
                                className="group inline-flex items-center gap-2 text-text-muted transition-colors hover:text-text-primary"
                            >
                                <img
                                    src="/logo.png"
                                    alt="ULOAK"
                                    className="h-6"
                                />
                                <span className="text-sm font-bold tracking-widest uppercase">
                                    Uloak
                                </span>
                            </Link>
                        ) : (
                            <Link
                                to="/app"
                                className="group inline-flex items-center gap-2 text-text-muted transition-colors hover:text-text-primary"
                            >
                                <ArrowLeft
                                    size={18}
                                    className="transition-transform group-hover:-translate-x-1"
                                />
                                <span className="text-sm">House</span>
                            </Link>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="hidden items-center gap-2 md:flex">
                                <AvatarGroup
                                    users={room.members.map((u) => ({
                                        avatar: u.avatar,
                                        name: u.name,
                                    }))}
                                />
                            </div>
                            {isSharedView && !user && (
                                <Link to="/login">
                                    <Button
                                        variant="outline"
                                        className="rounded-full px-4 py-2 text-xs"
                                        icon={LogIn}
                                    >
                                        Join the Home
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <Badge>{room.storyCount} Memories</Badge>
                                <div className="hidden h-px w-8 bg-border-subtle md:block" />
                                <div className="text-xs font-bold tracking-widest text-text-muted uppercase">
                                    A Shared Heritage
                                </div>
                            </div>
                            <h1 className="text-3xl leading-tight font-bold tracking-tight text-text-primary md:text-6xl">
                                {room.name}
                            </h1>
                            <p className="max-w-2xl text-base leading-relaxed font-light text-text-muted md:text-xl">
                                {room.description}
                            </p>
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
                            <div className="flex items-center gap-3">
                                <ShareQRCode
                                    roomId={room.id}
                                    roomName={room.name}
                                />
                                <Button
                                    variant="outline"
                                    icon={Download}
                                    className="p-3 md:p-2.5"
                                    onClick={() =>
                                        alert(
                                            'Preparing the Heritage Collection for download...',
                                        )
                                    }
                                >
                                    <span className="ml-2 hidden lg:inline">
                                        Collect Heritage
                                    </span>
                                </Button>
                            </div>
                            {canModify && (
                                <>
                                    <Button
                                        variant="secondary"
                                        icon={Key}
                                        className="flex-1 py-4 text-sm md:flex-none md:py-2.5"
                                        onClick={() => setShowAccessModal(true)}
                                    >
                                        Hand over Keys
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        icon={Mic}
                                        className="flex-1 py-4 text-sm md:flex-none md:py-2.5"
                                        onClick={() => setShowRecorder(true)}
                                    >
                                        Record
                                    </Button>
                                    <Button
                                        icon={Upload}
                                        className="flex-1 py-4 text-sm md:flex-none md:py-2.5"
                                        onClick={() => setShowUpload(true)}
                                    >
                                        Annex Memory
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.header>

                {/* Story Grid Container */}
                <section>
                    <div className="mb-8 flex flex-col justify-between gap-6 border-b border-border-subtle pb-6 sm:flex-row sm:items-center md:pb-8">
                        <div className="no-scrollbar flex items-center gap-6 overflow-x-auto pb-2 sm:pb-0 md:gap-8">
                            {[
                                'All',
                                'Photo Gallery',
                                'Cinema Hall',
                                'Whispering Voices',
                                'Manuscripts',
                            ].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative shrink-0 py-1 text-[10px] font-semibold tracking-widest uppercase transition-colors md:text-sm ${activeTab === tab ? 'text-accent-gold' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute right-0 -bottom-[26px] left-0 h-1 bg-accent-gold md:-bottom-8 md:h-0.5"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 self-end sm:self-auto">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`text-xs font-bold tracking-widest uppercase transition-colors ${selectedTag ? 'text-accent-gold hover:text-white' : 'cursor-default text-text-muted'}`}
                                disabled={!selectedTag}
                            >
                                Clear Filter
                            </button>
                            <div className="flex items-center gap-1 rounded-xl border border-border-subtle bg-surface p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-lg p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    <Grid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`rounded-lg p-1.5 transition-colors ${viewMode === 'list' ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    <ListIcon size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tags Filter Row */}
                    <div className="mb-12 flex flex-wrap gap-2">
                        <span className="mr-2 flex items-center gap-1 self-center text-[10px] font-bold tracking-widest text-text-muted uppercase">
                            <Filter size={10} />
                            Filter by:
                        </span>
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() =>
                                    setSelectedTag(
                                        selectedTag === tag ? null : tag,
                                    )
                                }
                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selectedTag === tag ? 'border-accent-gold bg-accent-gold text-bg-dark' : 'border-border-subtle bg-surface text-text-muted hover:border-accent-gold/40 hover:text-text-primary'}`}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>

                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3'
                                : 'flex flex-col gap-4'
                        }
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredStories.map((story, i) => (
                                <motion.div
                                    key={story.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{
                                        delay: i * 0.05,
                                        duration: 0.5,
                                    }}
                                >
                                    <Link to={`/app/story/${story.id}`}>
                                        {viewMode === 'grid' ? (
                                            <div className="group surface-glow h-full overflow-hidden rounded-2xl border border-border-subtle bg-surface transition-all hover:border-accent-gold/20">
                                                <div className="relative aspect-video">
                                                    <img
                                                        src={story.thumbnail}
                                                        alt={story.title}
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                        {story.type ===
                                                            'voice' ? (
                                                            <button
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    playVoice(
                                                                        story,
                                                                    );
                                                                }}
                                                                className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-accent-gold text-bg-dark shadow-xl transition-transform hover:scale-110"
                                                            >
                                                                <Play
                                                                    size={24}
                                                                    fill="currentColor"
                                                                    className="ml-1"
                                                                />
                                                            </button>
                                                        ) : (
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
                                                                <Play
                                                                    fill="white"
                                                                    size={20}
                                                                    className="ml-0.5"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute top-4 left-4">
                                                        <Badge className="bg-black/60 py-1 text-[10px]">
                                                            {story.type}
                                                        </Badge>
                                                    </div>
                                                    {story.duration && (
                                                        <div className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                                                            <Volume2
                                                                size={10}
                                                                className="text-accent-gold"
                                                            />
                                                            {story.duration}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-6">
                                                    <div className="mb-4 flex flex-col gap-2">
                                                        <h3 className="text-lg font-bold text-text-primary transition-colors group-hover:text-accent-gold">
                                                            {story.title}
                                                        </h3>
                                                        {story.description && (
                                                            <p className="line-clamp-2 text-xs leading-relaxed text-text-muted italic">
                                                                "
                                                                {
                                                                    story.description
                                                                }
                                                                "
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-text-muted/60 uppercase">
                                                        <div className="flex items-center gap-2">
                                                            <UserIcon
                                                                size={12}
                                                                className="text-accent-gold"
                                                            />
                                                            <span>
                                                                {story.author}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock
                                                                size={12}
                                                                className="text-accent-gold"
                                                            />
                                                            <span>
                                                                {story.date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface p-4 transition-all hover:border-accent-gold/20 hover:bg-white/5 md:gap-8 md:p-6">
                                                <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-xl md:w-40">
                                                    <img
                                                        src={story.thumbnail}
                                                        alt={story.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
                                                        <div className="scale-75 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm md:scale-100">
                                                            <Play
                                                                fill="white"
                                                                size={16}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex min-w-0 flex-grow flex-col justify-center">
                                                    <div className="mb-1 flex flex-wrap items-center gap-2 md:gap-3">
                                                        <Badge className="shrink-0 py-0.5 text-[9px] tracking-tighter uppercase">
                                                            {story.type}
                                                        </Badge>
                                                        <div className="flex items-center gap-1 text-[10px] text-text-muted">
                                                            <Clock
                                                                size={10}
                                                                className="text-accent-gold"
                                                            />
                                                            <span>
                                                                {story.date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <h3 className="mb-1 truncate text-sm font-bold text-text-primary md:mb-2 md:text-xl">
                                                        {story.title}
                                                    </h3>
                                                    {story.description && (
                                                        <p className="mb-2 line-clamp-1 text-[10px] text-text-muted italic md:mb-3 md:text-sm">
                                                            "{story.description}
                                                            "
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-[10px] text-text-muted md:text-xs">
                                                            <UserIcon
                                                                size={12}
                                                                className="text-accent-gold"
                                                            />
                                                            <span>
                                                                {story.author}
                                                            </span>
                                                        </div>
                                                        {story.duration && (
                                                            <div className="flex items-center gap-2 text-[10px] text-text-muted md:text-xs">
                                                                <Play
                                                                    size={10}
                                                                    className="text-accent-gold"
                                                                />
                                                                <span>
                                                                    {
                                                                        story.duration
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    className="shrink-0 p-2 text-text-muted transition-colors hover:text-text-primary"
                                                >
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Add Story Card */}
                        {canModify && (
                            <motion.div
                                layout
                                onClick={() => setShowUpload(true)}
                                className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-subtle bg-surface/50 transition-colors hover:bg-surface ${viewMode === 'grid' ? 'h-[340px] p-8' : 'h-24 flex-row gap-4 p-4 sm:h-32'}`}
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-bg-dark text-text-muted transition-colors group-hover:text-accent-gold">
                                    <Upload size={24} />
                                </div>
                                <span className="text-sm font-bold text-text-primary">
                                    Add New Memory
                                </span>
                            </motion.div>
                        )}
                    </div>
                </section>
            </main>

            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-4 backdrop-blur-md md:items-center md:p-8"
                    >
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{
                                type: 'spring',
                                damping: 30,
                                stiffness: 300,
                            }}
                            className="relative mb-24 w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-surface p-8 shadow-2xl ring-1 ring-white/5 md:mb-0 md:p-10"
                        >
                            <div className="absolute top-4 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-white/10 md:hidden" />

                            <button
                                onClick={handleCloseUpload}
                                className="absolute top-6 right-6 z-10 text-text-muted transition-colors hover:text-text-primary md:top-8 md:right-8"
                            >
                                <X size={24} />
                            </button>

                            {pendingFiles.length > 0 ? (
                                <div className="flex flex-col">
                                    <div className="mb-6 text-center md:mb-8 md:text-left">
                                        <h2 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">
                                            Preserving{' '}
                                            {pendingFiles.length > 1
                                                ? 'Collection'
                                                : 'Memory'}
                                        </h2>
                                        <p className="text-xs text-text-muted md:text-sm">
                                            Review these artifacts before they
                                            are sealed in the heritage wing.
                                        </p>
                                    </div>

                                    <div className="relative mb-6 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-border-subtle bg-bg-dark">
                                        {pendingFiles.length > 1 ? (
                                            <div className="grid h-full w-full grid-cols-2 gap-2 overflow-y-auto p-4">
                                                {pendingFiles.map((f, i) => (
                                                    <div
                                                        key={i}
                                                        className="group relative aspect-square overflow-hidden rounded-xl border border-white/10"
                                                    >
                                                        {f.file ===
                                                            'DOCUMENT_PREVIEW' ? (
                                                            <div className="flex h-full w-full items-center justify-center bg-accent-gold/5 text-accent-gold">
                                                                <FileText
                                                                    size={24}
                                                                />
                                                            </div>
                                                        ) : f.type.startsWith(
                                                            'video/',
                                                        ) ? (
                                                            <div className="flex h-full w-full items-center justify-center bg-black">
                                                                <Video
                                                                    size={24}
                                                                    className="text-white"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={f.file}
                                                                className="h-full w-full object-cover"
                                                                alt=""
                                                            />
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPendingFiles(
                                                                    (prev) =>
                                                                        prev.filter(
                                                                            (
                                                                                _,
                                                                                idx,
                                                                            ) =>
                                                                                idx !==
                                                                                i,
                                                                        ),
                                                                );
                                                            }}
                                                            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() =>
                                                        triggerFileUpload()
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border-subtle text-text-muted transition-all hover:border-accent-gold/50 hover:text-accent-gold"
                                                >
                                                    <Upload size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {pendingFiles[0].file ===
                                                    'DOCUMENT_PREVIEW' ? (
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-gold/10 text-accent-gold shadow-2xl">
                                                            <FileText
                                                                size={40}
                                                            />
                                                        </div>
                                                        <p className="text-xs font-bold tracking-widest text-text-muted uppercase">
                                                            Manuscript Archive
                                                        </p>
                                                    </div>
                                                ) : pendingFiles[0].type.startsWith(
                                                    'video/',
                                                ) ? (
                                                    <video
                                                        src={
                                                            pendingFiles[0].file
                                                        }
                                                        controls
                                                        className="h-full w-full bg-black object-contain"
                                                    />
                                                ) : (
                                                    <motion.img
                                                        animate={{
                                                            rotate: rotation,
                                                            scale: isSquare
                                                                ? 1.2
                                                                : 1,
                                                        }}
                                                        src={
                                                            pendingFiles[0].file
                                                        }
                                                        alt="Preview"
                                                        className={`h-full w-full transition-all duration-300 ${isSquare
                                                                ? 'aspect-square object-cover'
                                                                : 'object-contain'
                                                            } ${activeFilter ===
                                                                'sepia'
                                                                ? 'sepia-[0.8]'
                                                                : activeFilter ===
                                                                    'grayscale'
                                                                    ? 'grayscale'
                                                                    : activeFilter ===
                                                                        'vivid'
                                                                        ? 'contrast-[1.2] saturate-[1.8]'
                                                                        : ''
                                                            }`}
                                                        style={{
                                                            filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                                                        }}
                                                    />
                                                )}

                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-black/60 backdrop-blur-md">
                                                        {pendingFiles[0].type
                                                            .split('/')[0]
                                                            .toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="mb-4 flex flex-col gap-4">
                                        <label className="text-xs font-bold tracking-widest text-accent-gold uppercase">
                                            Heritage Label
                                        </label>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={pendingFileName}
                                            onChange={(e) =>
                                                setPendingFileName(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Title this memory..."
                                            className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 font-medium text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                        />
                                    </div>

                                    <div className="mb-6 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold tracking-widest text-accent-gold uppercase">
                                                Archetype (Hashtags)
                                            </label>
                                            <button
                                                onClick={suggestHashtags}
                                                disabled={isAiSuggesting}
                                                className="flex items-center gap-1 text-[10px] font-bold text-accent-gold uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
                                            >
                                                {isAiSuggesting ? (
                                                    'Summoning AI...'
                                                ) : (
                                                    <>
                                                        <Sparkles size={12} />
                                                        Suggest Archetypes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="flex min-h-[32px] flex-wrap gap-2">
                                            {aiHashtags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    className="flex items-center gap-2 border border-accent-gold/20 bg-accent-gold/10 pr-1"
                                                >
                                                    {tag}
                                                    <button
                                                        onClick={() =>
                                                            setAiHashtags(
                                                                (prev) =>
                                                                    prev.filter(
                                                                        (t) =>
                                                                            t !==
                                                                            tag,
                                                                    ),
                                                            )
                                                        }
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </Badge>
                                            ))}
                                            {aiHashtags.length === 0 &&
                                                !isAiSuggesting && (
                                                    <span className="text-[10px] text-text-muted italic">
                                                        No archetypes assigned
                                                        yet...
                                                    </span>
                                                )}
                                            {isAiSuggesting && (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-gold/20 border-t-accent-gold" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-8 flex flex-col gap-4">
                                        <label className="text-xs font-bold tracking-widest text-accent-gold uppercase">
                                            The Chronicle (Description)
                                        </label>
                                        <textarea
                                            value={pendingFileDesc}
                                            onChange={(e) =>
                                                setPendingFileDesc(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Describe the significance of this artifact..."
                                            rows={3}
                                            className="w-full resize-none rounded-2xl border border-border-subtle bg-bg-dark px-6 py-4 font-medium text-text-primary transition-all focus:border-accent-gold/50 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6 md:mb-8">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-gold/10 text-accent-gold md:mb-6 md:h-14 md:w-14">
                                            <Upload size={28} />
                                        </div>
                                        <h2 className="mb-1 text-2xl font-bold text-balance text-text-primary md:mb-2 md:text-3xl">
                                            Annex to {room.name}
                                        </h2>
                                        <p className="text-xs leading-relaxed text-text-muted md:text-sm">
                                            Preserve artifacts, docs, or
                                            high-fidelity cinematic memories.
                                        </p>
                                    </div>

                                    <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:gap-4">
                                        {[
                                            {
                                                label: 'Photo',
                                                icon: ImageIcon,
                                                accept: 'image/*',
                                            },
                                            {
                                                label: 'Cinema',
                                                icon: Video,
                                                accept: 'video/*',
                                            },
                                            {
                                                label: 'Manuscript',
                                                icon: FileText,
                                                accept: '.pdf,.doc,.docx,.txt',
                                            },
                                            {
                                                label: 'Echo (Voice)',
                                                icon: Mic,
                                                accept: 'audio/*',
                                            },
                                        ].map((type) => (
                                            <button
                                                key={type.label}
                                                onClick={() =>
                                                    triggerFileUpload(
                                                        type.accept,
                                                    )
                                                }
                                                className="group flex flex-col items-center gap-2 rounded-2xl border border-border-subtle bg-bg-dark p-4 transition-all hover:border-accent-gold/40 md:gap-3 md:p-6"
                                            >
                                                <type.icon
                                                    size={20}
                                                    className="text-text-muted transition-colors group-hover:text-accent-gold md:size-[24px]"
                                                />
                                                <span className="text-[10px] font-bold tracking-widest text-text-primary uppercase md:text-xs">
                                                    {type.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <div
                                        onClick={() => triggerFileUpload()}
                                        className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border-subtle bg-bg-dark/50 p-8 text-center transition-colors hover:border-accent-gold/40 md:p-12"
                                    >
                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="relative h-12 w-12">
                                                    <div className="absolute inset-0 rounded-full border-4 border-accent-gold/20" />
                                                    <motion.div
                                                        className="absolute inset-0 rounded-full border-4 border-accent-gold border-t-transparent"
                                                        animate={{
                                                            rotate: 360,
                                                        }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            ease: 'linear',
                                                        }}
                                                    />
                                                </div>
                                                <p className="animate-pulse text-sm font-bold text-accent-gold">
                                                    Preserving Memory...
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload
                                                    size={24}
                                                    className="mb-3 text-text-muted md:size-[32px]"
                                                />
                                                <p className="text-xs text-text-muted md:text-sm">
                                                    Tap to{' '}
                                                    <span className="text-accent-gold">
                                                        browse
                                                    </span>{' '}
                                                    archives
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Hidden File Input */}
                            <input
                                multiple
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                            />

                            <div className="mt-8 flex flex-col gap-3 pb-8 sm:flex-row md:gap-4 md:pb-0">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={
                                        pendingFiles.length > 0
                                            ? resetUpload
                                            : handleCloseUpload
                                    }
                                >
                                    {pendingFiles.length > 0
                                        ? 'Back'
                                        : 'Cancel'}
                                </Button>
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={
                                        pendingFiles.length > 0
                                            ? confirmUpload
                                            : triggerFileUpload
                                    }
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                            <span>Preserving...</span>
                                        </div>
                                    ) : pendingFiles.length > 0 ? (
                                        'Seal in Archive'
                                    ) : (
                                        'Select Artifacts'
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Access and Ownership Modal (Hand over the Keys) */}
            <AnimatePresence>
                {showAccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-4 backdrop-blur-md md:items-center md:p-8"
                    >
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{
                                type: 'spring',
                                damping: 30,
                                stiffness: 300,
                            }}
                            className="relative mb-24 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 bg-surface p-8 shadow-2xl ring-1 ring-white/5 md:mb-0 md:p-10"
                        >
                            <button
                                onClick={() => setShowAccessModal(false)}
                                className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary md:top-8 md:right-8"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-gold/10 text-accent-gold md:mb-6 md:h-14 md:w-14">
                                    <Key size={28} />
                                </div>
                                <h2 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">
                                    Hand over the Keys
                                </h2>
                                <p className="text-sm leading-relaxed text-text-muted">
                                    Manage who guards this room and what parts
                                    of the heritage are visible.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {/* Ownership Section */}
                                <section>
                                    <h3 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase">
                                        <Shield size={14} />
                                        The Custodian
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {room.members.map((member) => (
                                            <button
                                                key={member.id}
                                                onClick={() =>
                                                    setRoomOwner(member.id)
                                                }
                                                className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${roomOwner === member.id ? 'border-accent-gold bg-accent-gold/10' : 'border-border-subtle bg-bg-dark'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={member.avatar}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        alt=""
                                                    />
                                                    <div className="text-left">
                                                        <span className="block font-bold text-text-primary">
                                                            {member.name}
                                                        </span>
                                                        <span className="text-[10px] tracking-widest text-text-muted uppercase">
                                                            {member.id ===
                                                                roomOwner
                                                                ? 'Primary Custodian'
                                                                : 'Legacy Member'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {roomOwner === member.id && (
                                                    <Check
                                                        size={18}
                                                        className="text-accent-gold"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* Granular Sharing Aspects */}
                                <section>
                                    <h3 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-accent-gold uppercase">
                                        <Users size={14} />
                                        Heritage Wings (Visible Aspects)
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {[
                                            {
                                                id: 'photos',
                                                label: 'Photo Gallery',
                                                icon: ImageIcon,
                                            },
                                            {
                                                id: 'videos',
                                                label: 'Cinema Hall',
                                                icon: Video,
                                            },
                                            {
                                                id: 'voices',
                                                label: 'Whisperings (Voices)',
                                                icon: Mic,
                                            },
                                            {
                                                id: 'docs',
                                                label: 'Manuscripts',
                                                icon: FileText,
                                            },
                                            {
                                                id: 'tree',
                                                label: 'Family Tapestry',
                                                icon: Users,
                                            },
                                        ].map((aspect) => (
                                            <div
                                                key={aspect.id}
                                                className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-dark p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <aspect.icon
                                                        size={16}
                                                        className="text-text-muted"
                                                    />
                                                    <span className="text-sm font-bold text-text-primary">
                                                        {aspect.label}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        setSharedAspects(
                                                            (prev) => ({
                                                                ...prev,
                                                                [aspect.id]:
                                                                    !prev[
                                                                    aspect.id as keyof typeof prev
                                                                    ],
                                                            }),
                                                        )
                                                    }
                                                    className={`relative h-5 w-10 rounded-full transition-all ${sharedAspects[aspect.id as keyof typeof sharedAspects] ? 'bg-accent-gold' : 'bg-white/10'}`}
                                                >
                                                    <div
                                                        className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all ${sharedAspects[aspect.id as keyof typeof sharedAspects] ? 'right-1' : 'left-1'}`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            setShowAccessModal(false)
                                        }
                                    >
                                        Close Archive
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="w-full"
                                        onClick={() => {
                                            setShowAccessModal(false);
                                            alert(
                                                'Ownership and access permissions preserved.',
                                            );
                                        }}
                                    >
                                        Seal Changes
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeAudio && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed right-4 bottom-24 left-4 z-50 px-0 md:bottom-8 md:left-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 md:px-4"
                    >
                        <div className="flex items-center gap-4 rounded-3xl border border-accent-gold/30 bg-surface p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5 backdrop-blur-xl md:gap-6 md:p-6">
                            <button
                                onClick={togglePlay}
                                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-gold text-bg-dark shadow-lg shadow-accent-gold/20 transition-transform hover:scale-105"
                            >
                                {isPlaying ? (
                                    <Pause size={24} fill="currentColor" />
                                ) : (
                                    <Play
                                        size={24}
                                        fill="currentColor"
                                        className="ml-1"
                                    />
                                )}
                            </button>

                            <div className="min-w-0 flex-grow">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="truncate pr-4 text-sm font-bold text-text-primary">
                                        {activeAudio.title}
                                    </span>
                                    <span className="font-mono text-[10px] text-text-muted">
                                        {formatTime(currentTime)} /{' '}
                                        {formatTime(duration)}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={duration}
                                    step="0.1"
                                    value={currentTime}
                                    onChange={handleScrub}
                                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-gold"
                                />
                            </div>

                            <div className="flex shrink-0 items-center gap-3 pl-2">
                                <button
                                    onClick={() => {
                                        if (audioRef.current)
                                            audioRef.current.currentTime = 0;
                                    }}
                                    className="p-2 text-text-muted hover:text-white"
                                >
                                    <RotateCcw size={18} />
                                </button>
                                <button
                                    onClick={() => setActiveAudio(null)}
                                    className="p-2 text-text-muted hover:text-red-400"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <audio
                                ref={audioRef}
                                src={activeAudio.url}
                                onTimeUpdate={() =>
                                    setCurrentTime(
                                        audioRef.current?.currentTime || 0,
                                    )
                                }
                                onLoadedMetadata={() =>
                                    setDuration(audioRef.current?.duration || 0)
                                }
                                onEnded={() => setIsPlaying(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
