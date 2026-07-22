import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Image } from 'lucide-react';
import React from 'react';
import PersonMediaGrid from '@/components/people/PersonMediaGrid';
import PersonLayout from '@/layouts/person-layout';
import type { Person } from '@/types/person';

interface MediaProps {
    person: Person;
    media: any[];
}

export default function Media({ person, media }: MediaProps) {
    return (
        <PersonLayout person={person}>
            <Head title={(person.name || 'Media') + ' - Uloak'} />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <PersonMediaGrid items={media} />
            </motion.div>
        </PersonLayout>
    );
}
