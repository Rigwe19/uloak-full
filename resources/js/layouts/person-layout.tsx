import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Users, Clock, BookOpen, Image, Globe, Shield, Activity, ChevronLeft, User, Pencil, Heart, FileText } from 'lucide-react';
import React from 'react';
import type { Person, PersonStats } from '@/types/person';
import { show as peopleShow } from '@/routes/people';

interface Tab {
    name: string;
    route: string;
    icon: React.ReactNode;
}

const tabs: Tab[] = [
    { name: 'About', route: 'about', icon: <User size={16} /> },
    { name: 'Family Tree', route: 'family-tree', icon: <Users size={16} /> },
    { name: 'Life Timeline', route: 'timeline', icon: <Clock size={16} /> },
    { name: 'Stories', route: 'stories', icon: <BookOpen size={16} /> },
    { name: 'Photos & Documents', route: 'media', icon: <Image size={16} /> },
    { name: 'Heritage', route: 'heritage', icon: <Globe size={16} /> },
    { name: 'Memories From Others', route: 'memories', icon: <Heart size={16} /> },
    { name: 'Permissions & Consent', route: 'permissions', icon: <Shield size={16} /> },
    { name: 'Admin Notes', route: 'activity', icon: <FileText size={16} /> },
];

export default function PersonLayout({ children, person, stats }: { children: React.ReactNode; person: Person; stats?: PersonStats }) {
    const { url } = usePage();
    const currentTab = url.split('/').pop() || '';

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link
                    href="/dashboard"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-primary"
                >
                    <ChevronLeft size={16} />
                    Dashboard
                </Link>

                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-gold/10 text-2xl font-bold text-accent-gold sm:h-20 sm:w-20 sm:text-3xl">
                        {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h1 className="truncate text-2xl font-bold text-text-primary md:text-3xl">
                                    {person.name}
                                </h1>
                                {person.legal_name && person.legal_name !== person.name && (
                                    <p className="truncate text-sm text-text-muted">{person.legal_name}</p>
                                )}
                            </div>
                            {person.is_owner && (
                                <Link
                                    href={peopleShow(person.uuid).url + '/edit'}
                                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-surface px-4 py-2 text-xs font-medium text-text-muted transition-all hover:border-accent-gold/30 hover:text-accent-gold"
                                >
                                    <Pencil size={14} />
                                    Edit
                                </Link>
                            )}
                        </div>
                        {stats && (
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-muted">
                                <span>{stats.stories} stories</span>
                                <span>{stats.photos + stats.videos} media</span>
                                <span>{stats.relationships} relationships</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* <nav className="mb-8 flex flex-wrap gap-1 border-b border-border-subtle">
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.route || (currentTab === '' && tab.route === 'about');

                    return (
                        <Link
                            key={tab.route}
                            href={peopleShow(person.uuid).url + '/' + tab.route}
                            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                                isActive
                                    ? 'border-accent-gold text-accent-gold'
                                    : 'border-transparent text-text-muted hover:border-border-subtle hover:text-text-primary'
                            }`}
                        >
                            {tab.icon}
                            {tab.name}
                        </Link>
                    );
                })}
            </nav> */}

            <main>{children}</main>
        </div>
    );
}
