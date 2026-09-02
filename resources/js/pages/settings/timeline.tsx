import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock, Pencil, X, Save, Plus, Loader2, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import TimelineEvent from '@/components/people/TimelineEvent';
import type { Person, TimelineEvent as TEvent } from '@/types/person';

interface SettingsTimelineProps {
    person: Person | null;
    events: TEvent[];
}

export default function SettingsTimeline({
    person,
    events,
}: SettingsTimelineProps) {
    const [editing, setEditing] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    const { data, setData, post, processing, wasSuccessful } = useForm({
        milestones: [{ title: '', description: '', date: '' }],
    });

    useEffect(() => {
        if (wasSuccessful) {
            setShowAdd(false);
            setData({ milestones: [{ title: '', description: '', date: '' }] });
        }
    }, [wasSuccessful]);

    const handleAdd = () => {
        post('/settings/person', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={(person?.name || 'Timeline') + ' - Ulo of Stories'} />

            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-text-primary">
                    Life Timeline
                </h2>
                {editing ? (
                    <button
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-dark px-3 py-1.5 text-xs font-medium text-text-muted transition-all hover:border-red-500/30 hover:text-red-400"
                    >
                        <X size={14} />
                        Done
                    </button>
                ) : (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface/50 px-3 py-1.5 text-xs font-medium text-text-muted transition-all hover:border-accent-gold/30 hover:text-accent-gold"
                    >
                        <Pencil size={14} />
                        Edit
                    </button>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {editing && (
                    <div className="mb-4">
                        {!showAdd ? (
                            <button
                                onClick={() => setShowAdd(true)}
                                className="flex items-center gap-1.5 rounded-lg border border-dashed border-border-subtle bg-surface/30 px-4 py-2.5 text-xs font-medium text-text-muted transition-all hover:border-accent-gold/30 hover:text-accent-gold"
                            >
                                <Plus size={14} />
                                Add Event
                            </button>
                        ) : (
                            <div className="rounded-xl border border-border-subtle bg-surface p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="text-xs font-bold tracking-wide text-text-muted uppercase">
                                        New Event
                                    </h4>
                                    <button
                                        onClick={() => setShowAdd(false)}
                                        className="text-text-muted hover:text-red-400"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <input
                                        value={data.milestones[0].title}
                                        onChange={(e) =>
                                            setData('milestones', [
                                                {
                                                    ...data.milestones[0],
                                                    title: e.target.value,
                                                },
                                            ])
                                        }
                                        placeholder="Event title"
                                        className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50"
                                    />
                                    <input
                                        value={data.milestones[0].date}
                                        onChange={(e) =>
                                            setData('milestones', [
                                                {
                                                    ...data.milestones[0],
                                                    date: e.target.value,
                                                },
                                            ])
                                        }
                                        placeholder="Date"
                                        className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50"
                                    />
                                    <textarea
                                        value={data.milestones[0].description}
                                        onChange={(e) =>
                                            setData('milestones', [
                                                {
                                                    ...data.milestones[0],
                                                    description: e.target.value,
                                                },
                                            ])
                                        }
                                        placeholder="Description"
                                        rows={2}
                                        className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-2.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleAdd}
                                            disabled={
                                                processing ||
                                                !data.milestones[0].title
                                            }
                                            className="flex items-center gap-1.5 rounded-lg bg-accent-gold px-4 py-2 text-xs font-bold text-bg-dark transition-all hover:bg-accent-gold/90 disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <Loader2
                                                    size={14}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Save size={14} />
                                            )}
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {events.length > 0 ? (
                    <div className="space-y-0">
                        {events.map((event) => (
                            <div key={event.id} className="group relative">
                                <TimelineEvent event={event} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-16">
                        <Clock size={40} className="text-text-muted/30" />
                        <p className="text-sm text-text-muted italic">
                            No timeline events recorded yet.
                        </p>
                    </div>
                )}
            </motion.div>
        </>
    );
}
