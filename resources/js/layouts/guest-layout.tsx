import { usePage } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { Navbar, Footer } from '@/components/navigation';
import { PageTransition } from '@/components/page-transition';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-bg-dark text-text-primary selection:bg-accent-gold/30">
            <Navbar />
            <main>
                <AnimatePresence mode="wait" initial={false}>
                    <PageTransition key={url} type="high-impact">
                        {children}
                    </PageTransition>
                </AnimatePresence>
            </main>
            <PwaInstallPrompt />
            <Footer />
        </div>
    );
}
