import { motion } from 'framer-motion';
import React from 'react';

interface VideoStatusOverlayProps {
    status?: string;
    thumbnail?: string | null;
}

export function VideoStatusOverlay({
    status,
    thumbnail,
}: VideoStatusOverlayProps) {
    // User requested: do not show processing UI — video processes silently in background
    return null;
}
