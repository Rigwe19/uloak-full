import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';

interface UpgradePromptProps {
    reason: 'draft' | 'closed' | 'expired' | 'storage_full' | 'contribution_limit';
    onUpgrade?: () => void;
    onDismiss?: () => void;
    roomTier?: string;
    roomSlug?: string;
}

const MESSAGES: Record<string, { title: string; description: string; actionText: string }> = {
    draft: {
        title: 'Room not activated',
        description: 'This room has not been activated yet. Complete the purchase to start collecting contributions.',
        actionText: 'Activate Room',
    },
    closed: {
        title: 'Contributions closed',
        description: 'New contributions are closed for this room. The organiser can upgrade to reopen.',
        actionText: 'Upgrade Room',
    },
    expired: {
        title: 'Collection period ended',
        description: 'The 30-day collection period for this Starter Room has ended. You can still view existing stories or upgrade to continue.',
        actionText: 'Upgrade Room',
    },
    storage_full: {
        title: 'Storage limit reached',
        description: 'This room has reached its storage limit. Upgrade to add more space for contributions.',
        actionText: 'Upgrade Room',
    },
    contribution_limit: {
        title: 'Contribution limit reached',
        description: 'This Starter Room has reached its 50-contribution limit. Upgrade to a Full Room for unlimited contributions.',
        actionText: 'Upgrade Room',
    },
};

export function UpgradePrompt({
    reason,
    onUpgrade,
    onDismiss,
    roomTier = 'starter',
    roomSlug,
}: UpgradePromptProps) {
    const [dismissed, setDismissed] = useState(false);
    const message = MESSAGES[reason];

    if (dismissed || !message) {
        return null;
    }

    const handleDismiss = () => {
        setDismissed(true);
        onDismiss?.();
    };

    const handleUpgrade = () => {
        if (roomSlug) {
            window.location.href = `/pricing?upgrade=${roomTier}&room=${roomSlug}`;
        } else {
            onUpgrade?.();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
            role="alert"
        >
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-5 w-5" />
            </button>

            <div className="flex gap-3">
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text-primary">{message.title}</h4>
                    <p className="mt-1 text-sm text-text-muted">{message.description}</p>
                </div>

                <motion.button
                    onClick={handleUpgrade}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-shrink-0 flex items-center gap-2 rounded-full bg-accent-gold px-4 py-2 text-sm font-medium text-bg-dark hover:bg-opacity-90 transition-colors"
                >
                    {message.actionText}
                    <ArrowRight className="h-4 w-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}