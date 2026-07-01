import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    FileText, 
    Edit3,
    Eye,
    Globe,
    Clock,
    Plus,
} from 'lucide-react';
import admin from '@/routes/admin';
import { motion } from 'framer-motion';
import { Button } from '@/components/dashboard/ui';

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
    pages: Page[];
}

export default function AdminPages({ pages }: Props) {
    return (
        <AdminLayout>
            <Head title="Page Editor" />
            
            <div className="space-y-10 p-6 md:p-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                            Platform Content
                        </h1>
                        <p className="mt-2 text-text-muted">
                            Manage and edit the dynamic content across the Uloak platform.
                        </p>
                    </div>
                    {/* <Button className="gap-2">
                        <Plus size={18} /> New Page
                    </Button> */}
                </div>

                {/* Pages List */}
                <div className="grid grid-cols-1 gap-4">
                    {pages.map((page, i) => (
                        <motion.div
                            key={page.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group flex flex-col items-center gap-6 rounded-3xl border border-border-subtle bg-surface/20 p-6 transition-all hover:border-accent-gold/30 md:flex-row md:justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-bg-dark border border-white/5 text-text-muted shadow-inner group-hover:text-accent-gold transition-colors">
                                    <FileText size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-text-primary">
                                        {page.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-text-muted">
                                        <span className="flex items-center gap-1"><Globe size={12} /> {page.slug}</span>
                                        <span className="opacity-30">|</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> Modified {new Date(page.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full items-center justify-between gap-4 md:w-auto">
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase ${
                                    page.is_published 
                                        ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                                        : 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                                }`}>
                                    {page.is_published ? 'Published' : 'Draft'}
                                </span>
                                <div className="flex gap-2">
                                    <Link 
                                        href={admin.pages.edit(page.id).url}
                                        className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-text-primary transition-all hover:bg-white/10"
                                    >
                                        <Edit3 size={14} /> Edit
                                    </Link>
                                    <a 
                                        href={page.slug} 
                                        target="_blank" 
                                        className="rounded-xl border border-border-subtle bg-surface/50 p-2.5 text-text-muted transition-all hover:text-text-primary"
                                    >
                                        <Eye size={18} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
