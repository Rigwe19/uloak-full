import React, { useState, useEffect } from 'react';
import {
    Save,
    CheckCircle,
    RefreshCcw,
    FileText,
    ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/UI';

const PAGES = [
    { id: 'home', title: 'Landing Page' },
    { id: 'about', title: 'About Us' },
    { id: 'legacy-films', title: 'Legacy Films' },
    { id: 'community-projects', title: 'Community Projects' },
    { id: 'how-it-works', title: 'How it Works' },
];

export default function PageEditor() {
    const [selectedPage, setSelectedPage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<any>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (selectedPage) {
            loadPageData(selectedPage);
        }
    }, [selectedPage]);

    const loadPageData = async (pageId: string) => {
        setLoading(true);
        setSuccess(false);

        // Simulate loading from a local store or mock DB
        setTimeout(() => {
            setData({
                hero: {
                    title:
                        pageId === 'home'
                            ? 'Every family is a home.'
                            : 'Our Legacy Story',
                    subtitle: 'Your family’s digital architecture...',
                    badge: 'Uloak Studio',
                },
                content: {},
                lists: {},
            });
            setLoading(false);
        }, 500);
    };

    const handleSave = async () => {
        if (!selectedPage) return;
        setSaving(true);
        setSuccess(false);

        // Simulate saving
        setTimeout(() => {
            setSuccess(true);
            setSaving(false);
            setTimeout(() => setSuccess(false), 3000);
        }, 1000);
    };

    const updateField = (section: string, field: string, value: any) => {
        setData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                    Pages Content
                </h1>
                <p className="mt-2 text-text-muted">
                    Update the messaging and content across all marketing pages.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
                {/* Page Selector */}
                <div className="space-y-4 lg:col-span-1">
                    {PAGES.map((page) => (
                        <button
                            key={page.id}
                            onClick={() => setSelectedPage(page.id)}
                            className={`flex w-full items-center justify-between rounded-2xl border p-6 text-left transition-all ${
                                selectedPage === page.id
                                    ? 'border-accent-gold bg-accent-gold/10 text-text-primary shadow-lg shadow-accent-gold/5'
                                    : 'border-border-subtle bg-surface/30 text-text-muted hover:bg-surface/50'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <FileText size={18} />
                                <span className="text-sm font-bold tracking-tight">
                                    {page.title}
                                </span>
                            </div>
                            <ChevronRight
                                size={16}
                                className={
                                    selectedPage === page.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                }
                            />
                        </button>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-3">
                    {!selectedPage ? (
                        <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border-subtle bg-surface/10 p-12 text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                                <FileText
                                    className="text-border-subtle"
                                    size={32}
                                />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-text-primary">
                                Select a Page
                            </h3>
                            <p className="max-w-xs text-sm text-text-muted">
                                Choose a page from the sidebar to begin editing
                                its live content.
                            </p>
                        </div>
                    ) : loading || !data ? (
                        <div className="flex h-full min-h-[400px] items-center justify-center rounded-3xl bg-surface/10">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-4">
                            {/* Hero Section Editor */}
                            <div className="space-y-8 rounded-3xl border border-border-subtle bg-surface/50 p-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold tracking-[0.3em] text-accent-gold uppercase italic">
                                        Hero Section
                                    </h3>
                                    <div className="rounded-full bg-accent-gold/10 px-3 py-1 text-[8px] font-bold tracking-widest text-accent-gold uppercase">
                                        Header Group
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Main Heading
                                        </label>
                                        <input
                                            type="text"
                                            value={data.hero?.title || ''}
                                            onChange={(e) =>
                                                updateField(
                                                    'hero',
                                                    'title',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-border-subtle bg-bg-dark px-6 py-4 text-sm text-text-primary transition-all outline-none focus:border-accent-gold"
                                            placeholder="Every family is a home..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Sub-heading / Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={data.hero?.subtitle || ''}
                                            onChange={(e) =>
                                                updateField(
                                                    'hero',
                                                    'subtitle',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full resize-none rounded-xl border border-border-subtle bg-bg-dark px-6 py-4 text-sm text-text-primary transition-all outline-none focus:border-accent-gold"
                                            placeholder="Your family's digital architecture..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                            Hero Badge / Tag
                                        </label>
                                        <input
                                            type="text"
                                            value={data.hero?.badge || ''}
                                            onChange={(e) =>
                                                updateField(
                                                    'hero',
                                                    'badge',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-border-subtle bg-bg-dark px-6 py-4 text-sm text-text-primary transition-all outline-none focus:border-accent-gold"
                                            placeholder="Uloak Studio"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between rounded-2xl border border-accent-gold/10 bg-accent-gold/5 p-6">
                                <div className="flex items-center gap-3">
                                    {saving && (
                                        <span className="flex items-center gap-2 text-xs font-medium text-accent-gold">
                                            <RefreshCcw
                                                size={14}
                                                className="animate-spin"
                                            />{' '}
                                            Saving changes...
                                        </span>
                                    )}
                                    {success && (
                                        <span className="flex items-center gap-2 text-xs font-medium text-green-400">
                                            <CheckCircle size={14} /> Changes
                                            published to live site
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            loadPageData(selectedPage)
                                        }
                                    >
                                        Discard
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex min-w-[140px] items-center justify-center gap-2"
                                    >
                                        <Save size={16} /> Save & Publish
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-dashed border-border-subtle bg-bg-dark p-8">
                                <p className="text-center text-[10px] font-bold tracking-[0.2em] text-text-muted uppercase italic">
                                    Advanced Content Blocks Loading...
                                </p>
                                <p className="mx-auto mt-2 max-w-xs text-center text-[9px] text-text-muted">
                                    Dynamic list editing (Services, Values,
                                    Steps) is coming soon in the next update.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
