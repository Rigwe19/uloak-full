import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Share2, Flag } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface VideoContextMenuProps {
    onCopyLink?: () => void;
    onShare?: () => void;
    onReport?: () => void;
}

export function VideoContextMenu({ onCopyLink, onShare, onReport }: VideoContextMenuProps) {
    const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            setMenuPos({ x: e.clientX, y: e.clientY });
        };

        const handleClick = () => setMenuPos(null);
        const handleScroll = () => setMenuPos(null);

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('click', handleClick);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const items = [
        { icon: Link2, label: 'Copy Link', onClick: onCopyLink },
        { icon: Share2, label: 'Share', onClick: onShare },
        { icon: Flag, label: 'Report', onClick: onReport },
    ];

    return (
        <AnimatePresence>
            {menuPos && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuPos(null)} />
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed z-50 bg-black/95 border border-white/10 rounded-xl p-1.5 shadow-2xl backdrop-blur-xl min-w-[160px]"
                        style={{ left: menuPos.x, top: menuPos.y }}
                    >
                        {items.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => {
                                    item.onClick?.();
                                    setMenuPos(null);
                                }}
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                <item.icon size={14} />
                                {item.label}
                            </button>
                        ))}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
