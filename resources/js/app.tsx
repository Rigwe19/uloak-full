import { createInertiaApp } from '@inertiajs/react';
import { RequestLoader } from '@/components/request-loader';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { ConfirmProvider } from '@/hooks/use-confirm';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import DashboardLayout from '@/layouts/dashboard-layout';
import GuestLayout from '@/layouts/guest-layout';
import HouseLayout from '@/layouts/house-layout';
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
                'share'
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
            case name.startsWith('family/'):
                return null;
            case name.startsWith('people/'):
                return DashboardLayout;
            case name.startsWith('house/'):
                return HouseLayout;
            default:
                return GuestLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <ConfirmProvider>
                    {app}
                    <RequestLoader />
                    <Toaster />
                </ConfirmProvider>
            </TooltipProvider>
        );
    },
    progress: false,
});

// This will set light / dark mode on load...
initializeTheme();
