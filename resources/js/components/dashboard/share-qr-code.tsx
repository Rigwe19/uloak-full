import { motion, AnimatePresence } from 'framer-motion';
import {
    QrCode,
    X,
    Share2,
    Copy,
    Check,
    Link as LinkIcon,
    Mail,
    MessageCircle,
    Send,
    Smartphone,
    Download,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import React, { useState, useCallback, useRef } from 'react';
import { Button } from './ui';

interface ShareQRCodeProps {
    roomSlug: string;
    roomName: string;
    roomType?: 'events' | 'rooms';
    shareUrl?: string;
    entityName?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export const ShareQRCode: React.FC<ShareQRCodeProps> = ({
    roomSlug,
    roomName,
    roomType = 'rooms',
    shareUrl: externalShareUrl,
    entityName,
    isOpen: controlledOpen,
    onClose,
}) => {
    const [internalIsOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'qr' | 'link' | 'email'>('qr');
    const qrContainerRef = useRef<HTMLDivElement>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalIsOpen;
    const setOpen = (v: boolean) => {
        if (isControlled) {
            if (!v && onClose) {
onClose();
}
        } else {
            setIsOpen(v);
        }
    };

    const displayName = entityName || roomName;

    const shareUrl = externalShareUrl || (
        typeof window !== 'undefined'
            ? `${window.location.origin}/share/${roomType}/${roomSlug}`
            : ''
    );

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareMessage = `I'm inviting you to step into our heritage space: ${displayName}.\n\nEnter the gateway here: ${shareUrl}`;

    const sendEmail = () => {
        const subject = encodeURIComponent(`Welcome to the ${displayName} Homestead`);
        const body = encodeURIComponent(shareMessage);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const shareWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
    };

    const shareTelegram = () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Welcome to ${displayName}`)}`, '_blank');
    };

    const shareNative = useCallback(() => {
        if (navigator.share) {
            navigator.share({
                title: displayName,
                text: shareMessage,
                url: shareUrl,
            }).catch(() => {});
        } else {
            copyToClipboard();
        }
    }, [displayName, shareUrl]);

    const getQRImageData = useCallback(async (): Promise<string | null> => {
        const canvas = qrContainerRef.current?.querySelector('canvas');

        if (!canvas) {
return null;
}

        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');

        if (!ctx) {
return null;
}

        tempCanvas.width = 600;
        tempCanvas.height = 600;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(canvas, Math.round((600 - canvas.width) / 2), Math.round((600 - canvas.height) / 2), canvas.width, canvas.height);

        return tempCanvas.toDataURL('image/png');
    }, []);

    const downloadQRCode = useCallback(async () => {
        const dataUrl = await getQRImageData();

        if (!dataUrl) {
return;
}

        const link = document.createElement('a');
        link.download = `${displayName.replace(/\s+/g, '-').toLowerCase()}-access-qr.png`;
        link.href = dataUrl;
        link.click();
    }, [getQRImageData, displayName]);

    const shareQRAsImage = useCallback(async () => {
        const dataUrl = await getQRImageData();

        if (!dataUrl) {
return;
}

        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${displayName.replace(/\s+/g, '-').toLowerCase()}-access-qr.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({
                title: displayName,
                text: shareMessage,
                files: [file],
            });
        } else {
            downloadQRCode();
        }
    }, [getQRImageData, displayName, shareMessage, downloadQRCode]);

    return (
        <>
            {!isControlled && (
                <Button
                    variant="outline"
                    className="flex items-center md:gap-2 px-3! rounded-full border-accent-gold/20 hover:border-accent-gold/40"
                    onClick={() => setOpen(true)}
                >
                    <Share2 size={18} />
                    <span className='hidden md:inline'>Share Room</span>
                </Button>
            )}

            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative z-10 w-full max-w-sm rounded-4xl border border-border-subtle bg-surface p-8 shadow-2xl"
                        >
                            <button
                                onClick={() => setOpen(false)}
                                className="absolute top-6 right-6 text-text-muted transition-colors hover:text-text-primary"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-6 text-center">
                                <h3 className="text-2xl font-bold tracking-tight text-text-primary">
                                    Open the Gateway
                                </h3>
                                <p className="mt-2 text-sm text-text-muted">
                                    Choose how you wish to welcome guests to{' '}
                                    {displayName}.
                                </p>
                            </div>

                            <div className="mb-6 flex rounded-2xl bg-bg-dark/50 p-1">
                                {[
                                    { id: 'qr', label: 'QR Code', icon: QrCode },
                                    { id: 'link', label: 'Link', icon: LinkIcon },
                                    { id: 'email', label: 'Email', icon: Mail },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === tab.id ? 'bg-accent-gold text-bg-dark shadow-lg' : 'text-text-muted hover:text-white'}`}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Mobile share bar */}
                            <div className="mb-6 flex items-center justify-center gap-3">
                                <span className="text-[9px] font-mono tracking-wider text-text-muted uppercase">Share via</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={shareWhatsApp}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition-all hover:bg-[#25D366]/20 hover:scale-110"
                                        title="Share on WhatsApp"
                                    >
                                        <MessageCircle size={18} />
                                    </button>
                                    <button
                                        onClick={shareTelegram}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0088CC]/10 text-[#0088CC] transition-all hover:bg-[#0088CC]/20 hover:scale-110"
                                        title="Share on Telegram"
                                    >
                                        <Send size={18} />
                                    </button>
                                    <button
                                        onClick={shareNative}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold transition-all hover:bg-accent-gold/20 hover:scale-110"
                                        title="Share"
                                    >
                                        <Smartphone size={18} />
                                    </button>
                                    <a
                                        href={shareUrl}
                                        rel='noreferrer noopener'
                                        target='_blank'
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold transition-all hover:bg-accent-gold/20 hover:scale-110"
                                        title="Open"
                                    >
                                        <Smartphone size={18} />
                                    </a>
                                </div>
                            </div>

                            <div className="flex min-h-[280px] flex-col items-center justify-center">
                                {activeTab === 'qr' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center"
                                    >
                                        <div ref={qrContainerRef} className="mx-auto mb-6 inline-block rounded-3xl bg-white p-6 shadow-inner ring-8 ring-accent-gold/5">
                                            <QRCodeCanvas
                                                value={shareUrl}
                                                size={200}
                                                fgColor="#000000"
                                                bgColor="#FFFFFF"
                                                level="M"
                                                includeMargin={false}
                                                imageSettings={{
                                                    src: '/favicon.svg',
                                                    x: undefined,
                                                    y: undefined,
                                                    height: 48,
                                                    width: 48,
                                                    excavate: true,
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-center gap-3 mb-4">
                                            <button
                                                onClick={shareQRAsImage}
                                                className="flex items-center gap-2 rounded-xl bg-accent-gold/10 text-accent-gold px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all hover:bg-accent-gold/20 border border-accent-gold/20"
                                            >
                                                <Smartphone size={14} />
                                                Share as Image
                                            </button>
                                            <button
                                                onClick={downloadQRCode}
                                                className="flex items-center gap-2 rounded-xl bg-white/5 text-text-muted px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all hover:bg-white/10 border border-white/10"
                                            >
                                                <Download size={14} />
                                                Download
                                            </button>
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
                                        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
                                            <LinkIcon size={32} />
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-bold text-text-primary">
                                                Digital Keyway
                                            </h4>
                                            <p className="px-4 text-xs leading-relaxed text-text-muted">
                                                This unique link grants access
                                                to the {displayName} memories.
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
                                                    {copied ? <Check size={20} /> : <Copy size={20} />}
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
                                        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
                                            <Mail size={32} />
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-lg font-bold text-text-primary">
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
