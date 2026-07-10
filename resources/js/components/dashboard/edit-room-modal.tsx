import { router } from '@inertiajs/react';
import { Copy, ImagePlus, Link as LinkIcon, Music, Trash2, UserPlus, Users, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ResponsiveModal } from '@/components/responsive-modal';
import { useConfirm } from '@/hooks/use-confirm';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
}

interface FamilyMember {
    id: number;
    name: string;
    email: string;
    relationship: string | null;
    access_url: string;
    created_at: string;
}

interface RoomData {
    id: string;
    slug: string;
    name: string;
    description: string;
    thumbnail: string | null;
    privacy: string;
    room_type: string | null;
    enable_tributes: boolean;
    enable_condolence_attendance: boolean;
    enable_candle_lighting: boolean;
    tribute_name: string | null;
    tribute_song: string | null;
    media_items: MediaItem[] | null;
    start_date: string | null;
    end_date: string | null;
}

interface EditRoomModalProps {
    isOpen: boolean;
    room: RoomData | null;
    onClose: () => void;
}

const roomTypeOptions = [
    { value: 'general', label: 'General' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'burial', label: 'Burial' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'memorial', label: 'Memorial' },
    { value: 'graduation', label: 'Graduation' },
];

const relationshipOptions = [
    'Spouse', 'Child', 'Parent', 'Sibling', 'Grandchild',
    'Niece/Nephew', 'Cousin', 'Friend', 'Neighbor', 'Other',
];

export function EditRoomModal({ isOpen, room, onClose }: EditRoomModalProps) {
    const [activeTab, setActiveTab] = useState<'settings' | 'members'>('settings');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState('public');
    const [roomType, setRoomType] = useState('general');
    const [enableTributes, setEnableTributes] = useState(false);
    const [enableCondolenceAttendance, setEnableCondolenceAttendance] = useState(false);
    const [enableCandleLighting, setEnableCandleLighting] = useState(false);
    const [tributeName, setTributeName] = useState('');
    const [tributeSongName, setTributeSongName] = useState<string | null>(null);
    const [tributeSongFile, setTributeSongFile] = useState<File | null>(null);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const songInputRef = useRef<HTMLInputElement>(null);

    const confirm = useConfirm();

    // Family member state
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRelationship, setNewMemberRelationship] = useState('');
    const [addingMember, setAddingMember] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const loadFamilyMembers = useCallback(() => {
        if (!room) {
            return;
        }

        setMembersLoading(true);
        fetch(`/dashboard/rooms/${room.slug}/members`)
            .then(res => res.json())
            .then(data => {
                setFamilyMembers(data.members ?? []);
            })
            .catch(() => { })
            .finally(() => setMembersLoading(false));
    }, [room]);

    useEffect(() => {
        if (room) {
            setName(room.name);
            setDescription(room.description ?? '');
            setPrivacy(room.privacy);
            setRoomType(room.room_type ?? 'general');
            setEnableTributes(room.enable_tributes);
            setEnableCondolenceAttendance(room.enable_condolence_attendance);
            setEnableCandleLighting(room.enable_candle_lighting);
            setTributeName(room.tribute_name ?? '');
            setTributeSongFile(null);
            setTributeSongName(room.tribute_song ?? null);
            setMediaItems(room.media_items ?? []);
            setMediaFiles([]);
            setStartDate(room.start_date ?? '');
            setEndDate(room.end_date ?? '');
            setThumbnailPreview(room.thumbnail);
            setThumbnailFile(null);
            loadFamilyMembers();
        }
    }, [room, loadFamilyMembers]);

    const handleThumbnailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setThumbnailFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
        e.target.value = '';
    }, []);

    const removeThumbnail = useCallback(() => {
        setThumbnailPreview(null);
        setThumbnailFile(null);
    }, []);

    const handleTributeSongChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setTributeSongFile(file);
        setTributeSongName(file.name);
        e.target.value = '';
    }, []);

    const removeTributeSong = useCallback(() => {
        setTributeSongFile(null);
        setTributeSongName(null);
    }, []);

    const handleMediaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files) {
            return;
        }

        setMediaFiles(prev => [...prev, ...Array.from(files)]);
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;

                if (dataUrl) {
                    setMediaItems(prev => [...prev, {
                        url: dataUrl,
                        type: file.type.startsWith('video') ? 'video' : 'image',
                    }]);
                }
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    }, []);

    const removeMedia = useCallback((index: number) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!room) {
            return;
        }

        setSubmitting(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('privacy', privacy);
        formData.append('room_type', roomType);
        formData.append('enable_tributes', enableTributes ? '1' : '0');
        formData.append('enable_condolence_attendance', enableCondolenceAttendance ? '1' : '0');
        formData.append('enable_candle_lighting', enableCandleLighting ? '1' : '0');
        formData.append('tribute_name', tributeName || '');

        if (startDate) {
            formData.append('start_date', startDate);
        }

        if (endDate) {
            formData.append('end_date', endDate);
        }

        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        if (tributeSongFile) {
            formData.append('tribute_song', tributeSongFile);
        }

        const retainedExistingUrls = mediaItems
            .filter((item) => item.url.startsWith('/storage/'))
            .map((item) => item.url);
        formData.append('existing_media_urls', JSON.stringify(retainedExistingUrls));

        mediaFiles.forEach((file) => formData.append('media_files[]', file));

        formData.append('_method', 'PUT');

        router.post(`/dashboard/rooms/${room.slug}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setSubmitting(false);
                onClose();
            },
            onError: () => {
                setSubmitting(false);
            },
        });
    }, [room, name, description, privacy, roomType, enableTributes,
        enableCondolenceAttendance, enableCandleLighting, tributeName,
        startDate, endDate, thumbnailFile, tributeSongFile, mediaItems, mediaFiles, onClose]);

    // ── Family Member Handlers ──

    const copyToClipboard = useCallback((url: string, id: number) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    }, []);

    const handleAddMember = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!room || !newMemberName || !newMemberEmail) {
            return;
        }

        setAddingMember(true);
        const formData = new FormData();
        formData.append('name', newMemberName);
        formData.append('email', newMemberEmail);

        if (newMemberRelationship) {
            formData.append('relationship', newMemberRelationship);
        }

        router.post(`/dashboard/rooms/${room.slug}/members`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setNewMemberName('');
                setNewMemberEmail('');
                setNewMemberRelationship('');
                setAddingMember(false);
                loadFamilyMembers();
            },
            onError: () => {
                setAddingMember(false);
            },
        });
    }, [room, newMemberName, newMemberEmail, newMemberRelationship, loadFamilyMembers]);

    const handleRemoveMember = useCallback(async (memberId: number) => {
        if (!room) {
            return;
        }

        const ok = await confirm('Remove this family member? They will lose access to this room.');

        if (!ok) {
            return;
        }

        router.delete(`/dashboard/rooms/${room.slug}/members/${memberId}`, {
            preserveScroll: true,
            onSuccess: () => {
                loadFamilyMembers();
            },
        });
    }, [room, loadFamilyMembers, confirm]);

    const handleRegenerateToken = useCallback(async (memberId: number) => {
        if (!room) {
            return;
        }

        const ok = await confirm('Generate a new access link? The old link will stop working.');

        if (!ok) {
            return;
        }

        router.post(`/dashboard/rooms/${room.slug}/members/${memberId}/regenerate-token`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                loadFamilyMembers();
            },
        });
    }, [room, loadFamilyMembers, confirm]);

    if (!room) {
        return null;
    }

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title={activeTab === 'members' ? 'Family Members' : 'Edit Room'}
            titleHidden
            desktopMaxWidth="max-w-2xl"
            fullHeight
        >
            <div className="flex flex-col h-full overflow-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-surface px-6 py-4 shrink-0">
                    <h2 className="text-lg font-semibold">{activeTab === 'members' ? 'Family Members' : 'Edit Room'}</h2>
                    <button onClick={onClose} className="rounded-full p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary">
                        <X size={18} />
                    </button>
                </div>

                {/* Tab bar */}
                <div className="flex border-b border-white/5 px-6">
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all ${activeTab === 'settings'
                                ? 'text-accent-gold border-b-2 border-accent-gold'
                                : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        Room Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all ${activeTab === 'members'
                                ? 'text-accent-gold border-b-2 border-accent-gold'
                                : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        <Users size={14} />
                        Family Members
                        {familyMembers.length > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-gold/20 text-[10px] text-accent-gold">
                                {familyMembers.length}
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === 'settings' ? (
                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        {/* Name */}
                        <div>
                            <label className="mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase">Room Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 outline-none transition-colors focus:border-accent-gold/50"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 outline-none transition-colors focus:border-accent-gold/50 resize-none"
                            />
                        </div>

                        {/* Privacy */}
                        <div>
                            <label className="mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase">Privacy</label>
                            <select
                                value={privacy}
                                onChange={(e) => setPrivacy(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold/50"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                        </div>

                        {/* Room Type */}
                        <div>
                            <label className="mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase">Room Type</label>
                            <select
                                value={roomType}
                                onChange={(e) => setRoomType(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold/50"
                            >
                                {roomTypeOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Thumbnail */}
                        <div>
                            <label className="mb-2 block text-xs font-medium tracking-wide text-text-muted uppercase">Thumbnail</label>
                            {thumbnailPreview ? (
                                <div className="group relative inline-block overflow-hidden rounded-xl border border-white/10">
                                    <img src={thumbnailPreview} alt="" className="h-32 w-48 object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeThumbnail}
                                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => thumbnailInputRef.current?.click()}
                                    className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-white/10 text-text-muted transition-colors hover:border-accent-gold/40 hover:text-accent-gold"
                                >
                                    <ImagePlus size={24} />
                                </button>
                            )}
                            <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                        </div>

                        {/* Media Items */}
                        <div>
                            <label className="mb-2 block text-xs font-medium tracking-wide text-text-muted uppercase">Media Items (images & videos)</label>
                            {mediaItems.length > 0 && (
                                <div className="mb-3 grid grid-cols-3 gap-2">
                                    {mediaItems.map((item, i) => (
                                        <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10">
                                            {item.type === 'video' ? (
                                                <video src={item.url} className="h-full w-full object-cover" />
                                            ) : (
                                                <img src={item.url} alt="" className="h-full w-full object-cover" />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeMedia(i)}
                                                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => mediaInputRef.current?.click()}
                                className="flex h-20 w-full items-center justify-center rounded-xl border-2 border-dashed border-white/10 text-text-muted transition-colors hover:border-accent-gold/40 hover:text-accent-gold"
                            >
                                <ImagePlus size={24} />
                            </button>
                            <input ref={mediaInputRef} type="file" accept="image/*,video/*" multiple onChange={handleMediaChange} className="hidden" />
                        </div>

                        {/* Tribute Song */}
                        <div>
                            <label className="mb-2 block text-xs font-medium tracking-wide text-text-muted uppercase">Background Music (Optional)</label>
                            {tributeSongName ? (
                                <div className="group relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                    <Music size={18} className="text-accent-gold shrink-0" />
                                    <span className="truncate text-sm text-text-primary">{tributeSongName}</span>
                                    <button
                                        type="button"
                                        onClick={removeTributeSong}
                                        className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => songInputRef.current?.click()}
                                    className="flex h-20 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 text-text-muted transition-colors hover:border-accent-gold/40 hover:text-accent-gold"
                                >
                                    <Music size={20} />
                                    Upload Background Music
                                </button>
                            )}
                            <input ref={songInputRef} type="file" accept="audio/*" onChange={handleTributeSongChange} className="hidden" />
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={enableTributes} onChange={(e) => setEnableTributes(e.target.checked)} className="accent-accent-gold" />
                                <span className="text-sm text-text-primary">Enable Tributes</span>
                            </label>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={enableCondolenceAttendance} onChange={(e) => setEnableCondolenceAttendance(e.target.checked)} className="accent-accent-gold" />
                                <span className="text-sm text-text-primary">Enable Condolence Attendance</span>
                            </label>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={enableCandleLighting} onChange={(e) => setEnableCandleLighting(e.target.checked)} className="accent-accent-gold" />
                                <span className="text-sm text-text-primary">Enable Candle Lighting</span>
                            </label>
                        </div>

                        {/* Tribute Name */}
                        {enableTributes && (
                            <div>
                                <label className="mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase">Tribute Name</label>
                                <input
                                    type="text"
                                    value={tributeName}
                                    onChange={(e) => setTributeName(e.target.value)}
                                    placeholder="e.g. In memory of..."
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 outline-none transition-colors focus:border-accent-gold/50"
                                />
                            </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold/50"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold/50"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-xl bg-accent-gold px-6 py-2.5 text-sm font-medium text-bg-dark transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* ════════════════════════════════════════ */
                    /*  FAMILY MEMBERS TAB                      */
                    /* ════════════════════════════════════════ */
                    <div className="space-y-6 p-6">
                        <p className="text-sm text-text-muted">
                            Add family members to give them access to this room. They'll receive a link they can use from any device — no password needed.
                        </p>

                        {/* Add Member Form */}
                        <form onSubmit={handleAddMember} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                            <div className="flex items-center gap-2 text-accent-gold">
                                <UserPlus size={16} />
                                <span className="text-xs font-bold tracking-widest uppercase">Add a Family Member</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold tracking-wider text-text-muted uppercase">Name</label>
                                    <input
                                        type="text"
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        placeholder="e.g. Mum"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 outline-none transition-colors focus:border-accent-gold/50"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold tracking-wider text-text-muted uppercase">Email</label>
                                    <input
                                        type="email"
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        placeholder="mum@email.com"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 outline-none transition-colors focus:border-accent-gold/50"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[10px] font-bold tracking-wider text-text-muted uppercase">Relationship</label>
                                    <select
                                        value={newMemberRelationship}
                                        onChange={(e) => setNewMemberRelationship(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold/50"
                                    >
                                        <option value="">Select...</option>
                                        {relationshipOptions.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={addingMember || !newMemberName || !newMemberEmail}
                                    className="inline-flex items-center gap-2 rounded-xl bg-accent-gold px-5 py-2.5 text-xs font-bold tracking-widest text-bg-dark uppercase transition-all hover:opacity-90 disabled:opacity-50"
                                >
                                    <UserPlus size={14} />
                                    {addingMember ? 'Adding...' : 'Add Member'}
                                </button>
                            </div>
                        </form>

                        {/* Members List */}
                        {membersLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
                            </div>
                        ) : familyMembers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-12 text-center">
                                <Users size={32} className="mb-3 text-text-muted/50" />
                                <p className="text-sm text-text-muted">No family members added yet.</p>
                                <p className="text-xs text-text-muted/60">Add someone above to share this room.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {familyMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-accent-gold/20"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-text-primary">{member.name}</span>
                                                    <span className="rounded-full border border-accent-gold/20 bg-accent-gold/5 px-2 py-0.5 text-[9px] font-bold tracking-wider text-accent-gold uppercase">
                                                        {member.relationship ?? 'Family'}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-text-muted">{member.email}</p>
                                                <div className="mt-2 flex items-center gap-2 rounded-lg bg-bg-dark/60 px-3 py-2 border border-white/5">
                                                    <LinkIcon size={12} className="shrink-0 text-accent-gold" />
                                                    <span className="truncate text-[11px] text-text-muted">{member.access_url}</span>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(member.access_url, member.id)}
                                                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-bold tracking-wider uppercase transition-all ${copiedId === member.id
                                                            ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                                            : 'border-white/10 text-text-muted hover:border-accent-gold/40 hover:text-accent-gold'
                                                        }`}
                                                    title="Copy access link"
                                                >
                                                    <Copy size={12} />
                                                    {copiedId === member.id ? 'Copied!' : 'Copy Link'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRegenerateToken(member.id)}
                                                    className="rounded-xl border border-white/10 px-3 py-2 text-[10px] font-bold tracking-wider text-text-muted uppercase transition-all hover:border-yellow-500/30 hover:text-yellow-400"
                                                    title="Generate new link (old one stops working)"
                                                >
                                                    Renew
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="rounded-xl border border-white/10 px-3 py-2 text-[10px] font-bold tracking-wider text-text-muted uppercase transition-all hover:border-red-500/30 hover:text-red-400"
                                                    title="Remove access"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ResponsiveModal>
    );
}