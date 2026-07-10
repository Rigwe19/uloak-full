import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Activity as ActivityIcon, Clock } from 'lucide-react';
import React from 'react';
import PersonLayout from '@/layouts/person-layout';
import type { Person } from '@/types/person';

interface ActivityProps {
    person: Person;
    logs: any[];
}

export default function Activity({ person, logs }: ActivityProps) {
    return (
        <PersonLayout person={person}>
            <Head title={(person.name || 'Activity') + ' - Uloak'} />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                {logs.length > 0 ? (
                    logs.map((log: any) => (
                        <div key={log.id} className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-3">
                            <ActivityIcon size={16} className="shrink-0 text-text-muted" />
                            <div className="min-w-0 grow">
                                <p className="text-sm text-text-primary">
                                    <span className="font-bold">{log.actor_name}</span>
                                    {' '}
                                    <span className="text-text-muted">{log.action.replace(/_/g, ' ')}</span>
                                </p>
                            </div>
                            <span className="shrink-0 text-[10px] text-text-muted">
                                {new Date(log.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center gap-3 py-16">
                        <Clock size={40} className="text-text-muted/30" />
                        <p className="text-sm text-text-muted italic">No activity recorded yet.</p>
                    </div>
                )}
            </motion.div>
        </PersonLayout>
    );
}
