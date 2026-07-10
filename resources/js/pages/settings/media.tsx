import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Image } from 'lucide-react';
import React from 'react';
import PersonMediaGrid from '@/components/people/PersonMediaGrid';
import type { Person } from '@/types/person';

interface SettingsMediaProps {
    person: Person | null;
    media: any[];
}

export default function SettingsMedia({ person, media }: SettingsMediaProps) {
    return (
        <>
            <Head title={(person?.name || 'Media') + ' - Uloak'} />

            <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight text-text-primary">Photos & Documents</h2>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <PersonMediaGrid items={media} />
            </motion.div>
        </>
    );
}
