import {
    Check,
    Copy,
    Link as LinkIcon,
    Mail,
    QrCode,
    Share2,
    Sparkles,
    X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useState } from 'react';

import { Button } from './ui-elements';

interface ShareQRCodeProps {
    roomId: string;
    roomName: string;
}

export const ShareQRCode: React.FC<ShareQRCodeProps> = ({
    roomId,
    roomName,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'qr' | 'link' | 'email'>('qr');

    // Create shared URL
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/share/${roomId}` : "";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendEmail = () => {
        const subject = encodeURIComponent(
            `Welcome to the ${roomName} Homestead`,
        );
        const body = encodeURIComponent(
            `I'm inviting you to step into our heritage space: ${roomName}.\n\nEnter the gateway here: ${shareUrl}`,
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <>
            <Button
                variant="outline"
                className="flex items-center gap-2 rounded-full border-accent-gold/20 hover:border-accent-gold/40"
                onClick={() => setIsOpen(true)}
            >
                <Share2 size={18} />
                <span>Share Room</span>
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative z-10 w-full max-w-sm rounded-[2rem] border border-border-subtle bg-surface p-8 shadow-2xl"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-6 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-gold/20 bg-accent-gold/10">
                                    <Sparkles
                                        className="text-accent-gold"
                                        size={32}
                                    />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">
                                    Open the Gateway
                                </h3>
                                <p className="mt-2 text-sm text-text-muted">
                                    Choose how you wish to welcome guests to{' '}
                                    {roomName}.
                                </p>
                            </div>

                            <div className="mb-6 flex rounded-2xl bg-bg-dark/50 p-1">
                                {[
                                    {
                                        id: 'qr',
                                        label: 'QR Code',
                                        icon: QrCode,
                                    },
                                    {
                                        id: 'link',
                                        label: 'Link',
                                        icon: LinkIcon,
                                    },
                                    { id: 'email', label: 'Email', icon: Mail },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() =>
                                            setActiveTab(tab.id as any)
                                        }
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === tab.id ? 'bg-accent-gold text-bg-dark shadow-lg' : 'text-text-muted hover:text-white'}`}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex min-h-[280px] flex-col items-center justify-center">
                                {activeTab === 'qr' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center"
                                    >
                                        <div className="mx-auto mb-6 inline-block rounded-3xl bg-white p-6 shadow-inner ring-8 ring-accent-gold/5">
                                            <QRCodeSVG
                                                value={shareUrl}
                                                size={200}
                                                fgColor="#000000"
                                                bgColor="#FFFFFF"
                                                level="L"
                                                includeMargin={false}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold tracking-[0.2em] text-text-muted uppercase">
                                            Physical Key
                                        </p>
                                    </motion.div>
                                )}

                                {activeTab === 'link' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="w-full space-y-6 text-center"
                                    >
                                        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-accent-gold/10">
                                            <LinkIcon
                                                className="text-accent-gold"
                                                size={32}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-bold">
                                                Digital Keyway
                                            </h4>
                                            <p className="px-4 text-xs leading-relaxed text-text-muted">
                                                This unique link grants access
                                                to the {roomName} memories.
                                            </p>
                                            <div className="group relative">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={shareUrl}
                                                    className="w-full rounded-2xl border border-border-subtle bg-bg-dark py-4 pr-12 pl-6 font-mono text-xs text-text-muted"
                                                />
                                                <button
                                                    onClick={copyToClipboard}
                                                    className="absolute top-1/2 right-4 -translate-y-1/2 text-accent-gold transition-transform hover:scale-110"
                                                >
                                                    {copied ? (
                                                        <Check size={20} />
                                                    ) : (
                                                        <Copy size={20} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'email' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="w-full space-y-6 text-center"
                                    >
                                        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-accent-gold/10">
                                            <Mail
                                                className="text-accent-gold"
                                                size={32}
                                            />
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-lg font-bold">
                                                Digital Messenger
                                            </h4>
                                            <p className="px-4 text-xs leading-relaxed text-text-muted">
                                                Send a formal invitation to your
                                                family's inbox.
                                            </p>
                                            <Button
                                                className="w-full rounded-2xl py-5"
                                                onClick={sendEmail}
                                                icon={Mail}
                                            >
                                                Dispatch Invitation
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="mt-8 border-t border-white/5 pt-6">
                                <Button
                                    variant="ghost"
                                    className="w-full py-4 text-[10px] font-bold tracking-widest uppercase"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Close the Gateway
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
