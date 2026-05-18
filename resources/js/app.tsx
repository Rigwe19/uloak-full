import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import GuestLayout from '@/layouts/guest-layout';
import DashboardLayout from '@/layouts/dashboard-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case [
                'welcome',
                'about',
                'how-it-works',
                'legacy-films',
                'community-projects',
                'contact',
                'privacy',
            ].includes(name):
                return GuestLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name === 'dashboard/stories/show':
                return null;
            case name.startsWith('dashboard/'):
                return DashboardLayout;
            case name.startsWith('settings/'):
                return [DashboardLayout, SettingsLayout];
            case name.startsWith('admin/'):
                return null;
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
