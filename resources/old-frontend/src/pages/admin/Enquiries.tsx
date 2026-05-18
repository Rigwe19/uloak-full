import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Trash2,
    CheckSquare,
    Mail,
    Clock,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Enquiries() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        // Mock data for enquiries
        const mockEnquiries = [
            {
                id: '1',
                name: 'Kwame Mensah',
                email: 'kwame@ghana.com',
                subject: 'Digitalizing Archive',
                message:
                    'Hello, I have a collection of old photographs from the 1960s in Accra. Can Uloak help me preserve them?',
                status: 'new',
                createdAt: { seconds: Date.now() / 1000 - 3600 },
            },
            {
                id: '2',
                name: 'Zainab Bello',
                email: 'zainab@nigeria.ng',
                subject: 'Family Tree Help',
                message:
                    'I am looking for someone to help me map out my lineage in Kano. Does your platform support complex family trees?',
                status: 'replied',
                createdAt: { seconds: Date.now() / 1000 - 72000 },
            },
        ];
        setMessages(mockEnquiries);
        setLoading(false);
    }, []);

    const toggleStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'new' ? 'read' : 'replied';
        setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)),
        );
    };

    const deleteMessage = (id: string) => {
        if (!window.confirm('Are you sure you want to delete this enquiry?'))
            return;
        setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                    Customer Enquiries
                </h1>
                <p className="mt-2 text-text-muted">
                    Manage all communications coming from the contact forms.
                </p>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <div className="rounded-3xl border border-border-subtle bg-surface/30 py-24 text-center">
                        <MessageSquare
                            size={48}
                            className="mx-auto mb-4 text-border-subtle"
                        />
                        <p className="text-text-muted">No messages yet.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`rounded-2xl border transition-all ${
                                expandedId === msg.id
                                    ? 'border-accent-gold/40 bg-surface shadow-xl'
                                    : 'border-border-subtle bg-surface/30 hover:bg-surface/50'
                            }`}
                        >
                            <div
                                className="flex cursor-pointer items-center justify-between p-6"
                                onClick={() =>
                                    setExpandedId(
                                        expandedId === msg.id ? null : msg.id,
                                    )
                                }
                            >
                                <div className="flex min-w-0 flex-1 items-start gap-6">
                                    <div
                                        className={`rounded-xl p-3 ${msg.status === 'new' ? 'bg-accent-gold/10 text-accent-gold' : 'bg-surface text-text-muted'}`}
                                    >
                                        <Mail size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-center gap-3">
                                            <h4 className="truncate font-bold text-text-primary">
                                                {msg.name}
                                            </h4>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase ${
                                                    msg.status === 'new'
                                                        ? 'bg-accent-gold/20 text-accent-gold'
                                                        : 'bg-green-400/20 text-green-400'
                                                }`}
                                            >
                                                {msg.status || 'new'}
                                            </span>
                                        </div>
                                        <p className="truncate text-sm text-text-muted italic">
                                            "{msg.subject}"
                                        </p>
                                    </div>
                                </div>

                                <div className="ml-8 flex items-center gap-6">
                                    <div className="hidden text-right sm:block">
                                        <p className="text-[10px] font-bold text-text-muted uppercase">
                                            Received
                                        </p>
                                        <p className="text-xs font-medium text-text-primary">
                                            {new Date(
                                                msg.createdAt?.seconds * 1000,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {expandedId === msg.id ? (
                                        <ChevronUp
                                            size={20}
                                            className="text-text-muted"
                                        />
                                    ) : (
                                        <ChevronDown
                                            size={20}
                                            className="text-text-muted"
                                        />
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedId === msg.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-8 border-t border-border-subtle px-6 pt-2 pb-6">
                                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 text-text-muted">
                                                        <Mail size={16} />
                                                        <a
                                                            href={`mailto:${msg.email}`}
                                                            className="text-sm font-medium transition-colors hover:text-accent-gold"
                                                        >
                                                            {msg.email}
                                                        </a>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-text-muted">
                                                        <Clock size={16} />
                                                        <span className="text-sm font-medium">
                                                            {new Date(
                                                                msg.createdAt
                                                                    ?.seconds *
                                                                    1000,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() =>
                                                            toggleStatus(
                                                                msg.id,
                                                                msg.status ||
                                                                    'new',
                                                            )
                                                        }
                                                        className="flex items-center gap-2 rounded-xl border border-border-subtle bg-white/5 px-4 py-2 text-xs font-bold transition-all hover:border-accent-gold/50"
                                                    >
                                                        <CheckSquare
                                                            size={14}
                                                            className="text-accent-gold"
                                                        />
                                                        {msg.status === 'new'
                                                            ? 'Mark as Read'
                                                            : 'Advance Status'}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deleteMessage(
                                                                msg.id,
                                                            )
                                                        }
                                                        className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-bold text-red-100 transition-all hover:bg-red-400/20"
                                                    >
                                                        <Trash2 size={14} />{' '}
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-white/5 bg-bg-dark p-6">
                                                <p className="mb-4 text-[10px] font-bold tracking-widest text-accent-gold uppercase italic">
                                                    Message Body
                                                </p>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-text-primary">
                                                    {msg.message}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
