import { Bell, BellRing } from 'lucide-react';
import { useState } from 'react';
import { usePushSubscription } from '@/hooks/use-push-subscription';

export function PushSubscriptionManager() {
    const [showPrompt, setShowPrompt] = useState(true);
    const { enableNotifications } = usePushSubscription();

    if (!('Notification' in window)) {
        return null;
    }

    if (Notification.permission === 'granted') {
        return null;
    }

    if (!showPrompt) {
        return null;
    }

    const handleEnable = async () => {
        const ok = await enableNotifications();

        if (ok) {
            setShowPrompt(false);
        }
    };

    return (
        <div className="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-2xl border border-white/10 bg-surface p-3 shadow-2xl backdrop-blur-xl">
            <button
                onClick={handleEnable}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gold/10 text-accent-gold transition-all hover:scale-105 hover:bg-accent-gold/20"
                title="Enable push notifications"
            >
                <Bell size={18} />
            </button>
            <div className="max-w-[200px] text-xs leading-tight text-text-muted">
                <p className="mb-0.5 text-[11px] font-medium text-text-primary">
                    Get notified
                </p>
                <p>Receive alerts when new messages arrive.</p>
            </div>
            <button
                onClick={() => setShowPrompt(false)}
                className="ml-1 text-text-muted/40 transition-colors hover:text-text-muted"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
