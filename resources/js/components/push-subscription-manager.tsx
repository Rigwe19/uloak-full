import { Bell, BellRing } from 'lucide-react';
import { useState } from 'react';
import { usePushSubscription } from '@/hooks/use-push-subscription';

export function PushSubscriptionManager() {
    const [showPrompt, setShowPrompt] = useState(true);
    const { enableNotifications } = usePushSubscription();

    if (!('Notification' in window)) return null;
    if (Notification.permission === 'granted') return null;
    if (!showPrompt) return null;

    const handleEnable = async () => {
        const ok = await enableNotifications();
        if (ok) setShowPrompt(false);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-2xl bg-surface border border-white/10 p-3 shadow-2xl backdrop-blur-xl">
            <button
                onClick={handleEnable}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 transition-all hover:scale-105"
                title="Enable push notifications"
            >
                <Bell size={18} />
            </button>
            <div className="text-xs text-text-muted leading-tight max-w-[200px]">
                <p className="font-medium text-text-primary text-[11px] mb-0.5">Get notified</p>
                <p>Receive alerts when new messages arrive.</p>
            </div>
            <button
                onClick={() => setShowPrompt(false)}
                className="text-text-muted/40 hover:text-text-muted transition-colors ml-1"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
