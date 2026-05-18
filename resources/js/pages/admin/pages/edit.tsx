import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    ChevronLeft,
    Save,
    Image as ImageIcon,
    Type,
    Link as LinkIcon,
    Plus,
    Trash2,
    MoveUp,
    MoveDown,
    Globe,
    FileText,
    Eye,
    CheckCircle2,
    Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/dashboard/ui';
import admin from '@/routes/admin';

interface Page {
    id: number;
    title: string;
    slug: string;
    content: any;
    is_published: boolean;
    meta_description?: string;
    updated_at: string;
}

interface Props {
    page: Page;
}

export default function EditPage({ page }: Props) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        title: page.title,
        content: page.content || {},
        is_published: page.is_published,
        meta_description: page.meta_description || '',
    });

    const [activeSection, setActiveSection] = useState<string | null>(null);

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sectionParam = params.get('section');
        
        if (sectionParam && data.content[sectionParam]) {
            setActiveSection(sectionParam);
        } else if (!activeSection && Object.keys(data.content).length > 0) {
            setActiveSection(Object.keys(data.content)[0]);
        }
    }, [data.content]);

    const handleSave = (e?: React.BaseSyntheticEvent) => {
        if (e) e.preventDefault();
        patch(admin.pages.update(page.id).url);
    };

    const handleImageUpload = async (path: string[], file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(admin.uploadImage().url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                }
            });

            if (response.ok) {
                const result = await response.json();
                updateContentValue(path, result.url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const updateContentValue = (path: string[], value: any) => {
        // Deep clone the content to ensure React picks up changes
        const newContent = JSON.parse(JSON.stringify(data.content));
        let current = newContent;

        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }

        current[path[path.length - 1]] = value;
        setData('content', newContent);
    };

    const addListItem = (path: string[], template: any) => {
        const newContent = JSON.parse(JSON.stringify(data.content));
        let current = newContent;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        const list = [...(current[path[path.length - 1]] || [])];
        list.push({ ...template, id: Math.random().toString(36).substr(2, 9) });
        current[path[path.length - 1]] = list;
        setData('content', newContent);
    };

    const removeListItem = (path: string[], index: number) => {
        const newContent = JSON.parse(JSON.stringify(data.content));
        let current = newContent;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        const list = [...current[path[path.length - 1]]];
        list.splice(index, 1);
        current[path[path.length - 1]] = list;
        setData('content', newContent);
    };

    const renderContent = (value: any, path: string[], label?: string) => {
        // Handle Arrays (Lists)
        if (Array.isArray(value)) {
            const fieldLabel = label?.replace(/_/g, ' ') || 'List';
            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Plus size={14} className="text-accent-gold/60" />
                            <label className="text-[10px] font-bold text-accent-gold uppercase tracking-[0.2em]">
                                {fieldLabel}
                            </label>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1.5 rounded-xl text-[10px]"
                            onClick={() => addListItem(path, value[0] ? Object.fromEntries(Object.keys(value[0]).map(k => [k, ''])) : { title: '', subtitle: '', image: '', badge: '' })}
                        >
                            <Plus size={14} /> Add Item
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {value.length === 0 && (
                            <div className="p-12 text-center border border-dashed border-white/5 rounded-4xl bg-surface/10">
                                <FileText className="mx-auto mb-4 opacity-20" size={32} />
                                <p className="text-sm text-text-muted">This list is currently empty.</p>
                            </div>
                        )}
                        {value.map((item: any, index: number) => (
                            <div key={item.id || index} className="group relative rounded-3xl border border-white/5 bg-surface/30 p-8 transition-all hover:border-white/10 hover:bg-surface/50">
                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button 
                                        type="button"
                                        onClick={() => removeListItem(path, index)}
                                        className="rounded-xl bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-8">
                                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Item #{index + 1}</h4>
                                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                        {typeof item === 'object' && item !== null ? (
                                            Object.entries(item).filter(([k]) => k !== 'id').map(([subKey, subValue]) => (
                                                <div key={subKey}>
                                                    {renderContent(subValue, [...path, index.toString(), subKey], subKey)}
                                                </div>
                                            ))
                                        ) : (
                                            renderContent(item, [...path, index.toString()], 'Value')
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Handle Objects
        if (typeof value === 'object' && value !== null) {
            return (
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                    {Object.entries(value).map(([subKey, subValue]) => (
                        <div key={subKey} className={typeof subValue === 'object' ? 'col-span-full' : ''}>
                            {renderContent(subValue, [...path, subKey], subKey)}
                        </div>
                    ))}
                </div>
            );
        }

        // Handle Primitive Fields
        const fieldLabel = label?.replace(/_/g, ' ') || 'Field';
        const isImage = label?.toLowerCase().includes('image') || label?.toLowerCase().includes('icon') || (typeof value === 'string' && value.match(/\.(webp|jpg|png|svg)$/i));
        const isLongText = typeof value === 'string' && (value.length > 60 || label?.toLowerCase().includes('subtitle') || label?.toLowerCase().includes('desc') || label?.toLowerCase().includes('body') || label?.toLowerCase().includes('paragraph'));

        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    {isImage ? <ImageIcon size={14} className="text-accent-gold/60" /> : <Type size={14} className="text-accent-gold/60" />}
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        {fieldLabel}
                    </label>
                </div>
                
                {isImage ? (
                    <div className="space-y-4">
                        <div className="group relative aspect-video overflow-hidden rounded-2xl border border-white/5 bg-bg-dark transition-all hover:border-accent-gold/30">
                            <img 
                                src={value} 
                                className="h-full w-full object-cover opacity-50 transition-opacity group-hover:opacity-80" 
                                alt={label} 
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100 p-4">
                                <div className="flex w-full gap-2">
                                    <input 
                                        type="text" 
                                        value={value} 
                                        onChange={(e) => updateContentValue(path, e.target.value)}
                                        className="flex-1 rounded-xl border border-white/20 bg-bg-dark/90 px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-gold"
                                        placeholder="Paste Image URL"
                                    />
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            id={`file-${path.join('-')}`}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageUpload(path, file);
                                            }}
                                        />
                                        <label 
                                            htmlFor={`file-${path.join('-')}`}
                                            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-xl bg-accent-gold px-3 text-[10px] font-bold text-black hover:bg-yellow-500 transition-all"
                                        >
                                            <Upload size={14} />
                                            Upload
                                        </label>
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/40">URL or Upload</p>
                            </div>
                        </div>
                    </div>
                ) : isLongText ? (
                    <textarea
                        value={value}
                        onChange={(e) => updateContentValue(path, e.target.value)}
                        rows={4}
                        className="w-full resize-none rounded-2xl border border-white/10 bg-bg-dark/50 px-5 py-4 text-base leading-relaxed text-text-primary transition-all focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/50"
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => updateContentValue(path, e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-bg-dark/50 px-5 py-4 text-lg font-medium text-text-primary transition-all focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/50"
                    />
                )}
            </div>
        );
    }

    return (
        <AdminLayout>
            <Head title={`Edit ${page.title}`} />
            
            <div className="flex h-full flex-col">
                {/* Editor Header */}
                <header className="sticky top-0 z-40 border-b border-white/5 bg-bg-dark/80 px-6 py-4 backdrop-blur-xl md:px-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link 
                                href={admin.pages().url}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-text-muted transition-all hover:bg-white/5 hover:text-text-primary"
                            >
                                <ChevronLeft size={20} />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-text-primary">{page.title}</h1>
                                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                        {page.slug}
                                    </span>
                                </div>
                                <p className="text-xs text-text-muted">Last updated {new Date(page.updated_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <a 
                                href={page.slug} 
                                target="_blank"
                                className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 px-5 text-sm font-medium text-text-muted transition-all hover:bg-white/5 hover:text-text-primary"
                            >
                                <Eye size={18} /> Preview
                            </a>
                            <Button 
                                className="h-11 gap-2 rounded-2xl px-8" 
                                disabled={processing}
                                onClick={handleSave}
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Saving...</span>
                                ) : recentlySuccessful ? (
                                    <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Saved!</span>
                                ) : (
                                    <><Save size={18} /> Publish Changes</>
                                )}
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
                    {/* Sidebar Navigation */}
                    <aside className="w-full shrink-0 border-r border-white/5 bg-surface/10 p-6 lg:w-72 lg:p-8">
                        <div className="space-y-8">
                            <div>
                                <h3 className="mb-4 px-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Structure</h3>
                                <nav className="space-y-1">
                                    {Object.keys(data.content).map((section) => (
                                        <button
                                            key={section}
                                            onClick={() => setActiveSection(section)}
                                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                                activeSection === section 
                                                    ? 'bg-accent-gold/10 text-accent-gold shadow-lg shadow-accent-gold/5' 
                                                    : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                                            }`}
                                        >
                                            <FileText size={16} />
                                            {section.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div>
                                <h3 className="mb-4 px-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">SEO & Meta</h3>
                                <div className="space-y-4 rounded-2xl bg-bg-dark/50 p-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-text-muted uppercase font-bold">Page Title</label>
                                        <input 
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="w-full bg-transparent text-sm text-text-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-text-muted uppercase font-bold">Status</label>
                                        <button 
                                            type="button"
                                            onClick={() => setData('is_published', !data.is_published)}
                                            className={`flex items-center gap-2 text-xs font-bold ${data.is_published ? 'text-green-400' : 'text-yellow-400'}`}
                                        >
                                            <div className={`h-2 w-2 rounded-full ${data.is_published ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                            {data.is_published ? 'LIVE' : 'DRAFT'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Editor Canvas */}
                    <main className="flex-1 overflow-y-auto bg-bg-dark/30 p-6 md:p-12 lg:p-20">
                        <div className="mx-auto max-w-4xl">
                            <AnimatePresence mode="wait">
                                {activeSection ? (
                                    <motion.div
                                        key={activeSection}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-12"
                                    >
                                        <div className="border-b border-white/5 pb-8">
                                            <h2 className="text-3xl font-bold text-text-primary capitalize tracking-tight">
                                                {activeSection.replace(/_/g, ' ')}
                                            </h2>
                                            <p className="mt-2 text-text-muted">Modify the content of the {activeSection.replace(/_/g, ' ')} section below.</p>
                                        </div>

                                        <div className="space-y-10">
                                            {renderContent(data.content[activeSection], [activeSection], activeSection)}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 text-center">
                                        <FileText className="mb-4 opacity-20" size={48} />
                                        <p className="text-text-muted">Select a section from the sidebar to begin editing.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </main>
                </div>
            </div>
        </AdminLayout>
    );
}
