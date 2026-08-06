import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    MessageSquare, 
    Search,
    Filter,
    CheckCircle2,
    Clock,
    Mail,
    ArrowUpRight,
    Trash2
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/dashboard/ui';
import AdminLayout from '@/layouts/admin-layout';

interface Enquiry {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
}

interface Props {
    enquiries: Enquiry[];
}

export default function AdminEnquiries({ enquiries }: Props) {
    return (
        <AdminLayout>
            <Head title="Enquiries" />
            
            <div className="space-y-10 p-6 md:p-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                            Inbound Enquiries
                        </h1>
                        <p className="mt-2 text-text-muted">
                            Review and respond to messages from the Ulo of Storiesf Stories community.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" size={16} />
                            <input 
                                type="text"
                                placeholder="Search enquiries..."
                                className="h-10 w-64 rounded-xl border border-border-subtle bg-surface/50 pl-10 pr-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-hidden"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter size={16} /> Filter
                        </Button>
                    </div>
                </div>

                {/* Enquiries List */}
                <div className="grid grid-cols-1 gap-6">
                    {enquiries.length > 0 ? (
                        enquiries.map((enquiry, i) => (
                            <motion.div
                                key={enquiry.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative overflow-hidden rounded-3xl border border-border-subtle bg-surface/20 p-8 transition-all hover:border-accent-gold/20"
                            >
                                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase ${
                                                enquiry.status === 'new' 
                                                    ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30' 
                                                    : 'bg-green-400/20 text-green-400 border border-green-400/30'
                                            }`}>
                                                {enquiry.status === 'new' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                                                {enquiry.status}
                                            </span>
                                            <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                                {new Date(enquiry.created_at).toLocaleDateString(undefined, { 
                                                    month: 'long', 
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-gold transition-colors">
                                                {enquiry.subject}
                                            </h3>
                                            <div className="mt-2 flex items-center gap-2 text-sm text-text-muted">
                                                <span className="font-bold text-text-primary">{enquiry.name}</span>
                                                <span className="opacity-50">&bull;</span>
                                                <span className="flex items-center gap-1"><Mail size={12} /> {enquiry.email}</span>
                                            </div>
                                        </div>

                                        <p className="max-w-3xl text-sm leading-relaxed text-text-muted">
                                            {enquiry.message}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 gap-2">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            Reply <ArrowUpRight size={14} />
                                        </Button>
                                        <button className="rounded-xl border border-border-subtle bg-surface/50 p-2.5 text-text-muted transition-all hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Background Decorative Icon */}
                                <MessageSquare size={120} className="pointer-events-none absolute -right-8 -bottom-8 opacity-[0.03] transition-transform group-hover:scale-110" />
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed border-border-subtle py-32">
                            <div className="rounded-2xl bg-surface/50 p-6 text-text-muted opacity-20 shadow-inner">
                                <MessageSquare size={48} />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-text-primary">No enquiries yet</p>
                                <p className="text-sm text-text-muted">When users send messages, they will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
