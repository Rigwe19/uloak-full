import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, Globe, Lock, User, Check } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/dashboard/ui';
import SettingsLayout from '@/layouts/settings/layout';

export default function Privacy() {
    const [settings, setSettings] = useState([
        {
            id: 'global_discovery',
            title: 'Global Discovery',
            desc: 'Allow distant family to find this house via public search.',
            active: false,
        },
        {
            id: 'member_uploads',
            title: 'Member Uploads',
            desc: 'Let any member upload stories without moderator approval.',
            active: true,
        },
        {
            id: 'high_fidelity',
            title: 'High Fidelity Archive',
            desc: 'Enable full-quality archiving (uses more storage).',
            active: true,
        },
    ]);

    const toggleSetting = (id: string) => {
        setSettings((prev) =>
            prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
        );
    };

    return (
        <div className="space-y-8">
            <Head title="Privacy & Access" />
            
            <div>
                <h3 className="mb-2 text-xl font-bold text-text-primary">
                    Privacy & Access
                </h3>
                <p className="text-sm text-text-muted">
                    Control who can view, edit, and contribute to your family legacy.
                </p>
            </div>

            <div className="space-y-6">
                {settings.map((p) => (
                    <div
                        key={p.id}
                        className="flex items-center justify-between py-2"
                    >
                        <div>
                            <span className="mb-1 block font-bold text-text-primary">
                                {p.title}
                            </span>
                            <span className="text-xs text-text-muted">
                                {p.desc}
                            </span>
                        </div>
                        <button
                            onClick={() => toggleSetting(p.id)}
                            className={`relative h-6 w-12 rounded-full transition-all ${p.active ? 'bg-accent-gold' : 'bg-border-subtle'}`}
                        >
                            <div
                                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${p.active ? 'right-1' : 'left-1'}`}
                            />
                        </button>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-border-subtle">
                <Button 
                    variant="primary" 
                    icon={Check}
                    className="w-full sm:w-auto"
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}

