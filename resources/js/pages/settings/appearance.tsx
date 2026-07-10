import { Head } from '@inertiajs/react';
import React from 'react';
import AppearanceTabs from '@/components/appearance-tabs';

export default function Appearance() {
    return (
        <div className="space-y-8">
            <Head title="Appearance" />

            <div>
                <h3 className="mb-2 text-xl font-bold text-text-primary">
                    Appearance
                </h3>
                <p className="text-sm text-text-muted">
                    Customize how the house feels to you.
                </p>
            </div>

            <div className="pt-2">
                <AppearanceTabs />
            </div>
        </div>
    );
}
