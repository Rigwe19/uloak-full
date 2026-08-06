import { Download, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePwaInstall } from '@/hooks/use-pwa-install';

export function PwaInstallPrompt() {
    const { canInstall, promptInstall } = usePwaInstall();
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (canInstall) {
            setDismissed(false);
        }
    }, [canInstall]);

    if (!canInstall || dismissed) {
return null;
}

    return (
        <div className="sticky top-0 z-50 border-b border-accent-gold/20 bg-gradient-to-r from-accent-gold/5 via-bg-dark to-accent-gold/5 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-gold/10">
                        <Download size={14} className="text-accent-gold" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate">
                            Install Ulo of Stories on your device
                        </p>
                        <p className="text-[10px] text-text-muted/70 truncate">
                            Access your family stories faster
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={promptInstall}
                        className="rounded-lg bg-accent-gold px-3 py-1.5 text-[10px] font-bold tracking-wider text-bg-dark uppercase transition-all hover:opacity-90"
                    >
                        Install
                    </button>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className="rounded-lg p-1.5 text-text-muted transition-colors hover:text-text-primary"
                        aria-label="Dismiss"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
