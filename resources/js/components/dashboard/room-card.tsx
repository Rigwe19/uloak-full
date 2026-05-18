import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    AnimatePresence,
} from 'framer-motion';
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Badge, AvatarGroup, Button } from './ui';
import { X, Play, Share2, Info, ArrowRight } from 'lucide-react';
import { show } from '@/routes/dashboard/rooms';

interface User {
    id: number;
    name: string;
    avatar?: string | null;
}

interface Room {
    id: number;
    slug: string;
    name: string;
    thumbnail?: string | null;
    description: string;
    stories_count?: number;
    members: User[];
}

export function RoomCard({ room }: { room: Room }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

    const [isHovered, setIsHovered] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [isEntering, setIsEntering] = useState(false);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (isEntering) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;
        const xPct = mouseXPos / width - 0.5;
        const yPct = mouseYPos / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    const handleEnterRoom = () => {
        setIsEntering(true);
        // Use Inertia visit
        router.visit(show(room.slug).url, {
            onFinish: () => setIsEntering(false),
        });
    };

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
        setIsHovered(false);
    }

    return (
        <>
            <motion.div
                onMouseMove={handleMouseMove}
                onMouseEnter={() => !isEntering && setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d',
                }}
                initial={{ scale: 1, opacity: 1, z: 0 }}
                animate={{
                    scale: isEntering ? 1.5 : 1,
                    opacity: isEntering ? 0 : 1,
                    z: isEntering ? 200 : 0,
                    filter: isEntering ? 'blur(20px)' : 'blur(0px)',
                }}
                whileTap={{
                    scale: isEntering ? 1.5 : 0.95,
                    z: isEntering ? 200 : -20,
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`group surface-glow perspective-1000 relative h-[400px] cursor-pointer overflow-hidden rounded-3xl border border-border-subtle bg-surface ${isEntering ? 'pointer-events-none' : ''}`}
                onClick={handleEnterRoom}
            >
                <div
                    style={{ transform: 'translateZ(50px)' }}
                    className="absolute inset-0 z-0 transition-transform duration-500"
                >
                    {room.thumbnail ? (
                        <img
                            src={room.thumbnail}
                            alt={room.name}
                            className="h-full w-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110"
                        />
                    ) : (
                        <div className="bg-surface-light flex h-full w-full items-center justify-center">
                            <span className="text-4xl font-bold text-text-muted opacity-20">
                                {room.name.charAt(0)}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-bg-dark via-bg-dark/40 to-transparent" />
                </div>

                <div
                    style={{ transform: 'translateZ(100px)' }}
                    className="absolute right-0 bottom-0 left-0 z-10 flex flex-col gap-4 p-8"
                >
                    <div className="flex items-center justify-between">
                        <Badge className="bg-accent-gold/20 text-accent-gold transition-colors duration-500 group-hover:bg-accent-gold group-hover:text-bg-dark">
                            {room.stories_count || 0} STORIES
                        </Badge>
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDetail(true);
                                }}
                                className="flex h-10 w-10 scale-50 items-center justify-center rounded-full bg-white/10 text-text-primary opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 hover:bg-accent-gold hover:text-bg-dark"
                                title="View Details"
                            >
                                <Info size={16} />
                            </button>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-text-primary transition-colors duration-500 group-hover:text-accent-gold">
                        {room.name}
                    </h3>
                    <p className="line-clamp-2 transform-gpu text-sm text-text-muted transition-all duration-500 group-hover:text-text-primary">
                        {room.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between border-t border-border-subtle pt-4">
                        <AvatarGroup
                            users={room.members.map((u) => ({
                                avatar: u.avatar,
                                avatar_url: (u as any).avatar_url,
                                name: u.name,
                            }))}
                        />
                        <div className="flex items-center gap-2 overflow-hidden text-xs font-bold tracking-[0.2em] text-accent-gold uppercase">
                            <motion.span
                                initial={{ y: '100%' }}
                                animate={{ y: isHovered ? 0 : '100%' }}
                                transition={{ duration: 0.3 }}
                            >
                                Step Inside
                            </motion.span>
                            <ArrowRight
                                size={14}
                                className={
                                    isHovered
                                        ? 'translate-x-0 opacity-100'
                                        : '-translate-x-4 opacity-0'
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Dynamic Edge Light */}
                <div className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                    <div className="absolute inset-0 rounded-3xl border border-accent-gold/20" />
                    <div className="absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-accent-gold/50 to-transparent blur-[2px]" />
                </div>
            </motion.div>

            {/* Room Detail Peek Modal - "Inspecting an object" interaction */}
            <AnimatePresence>
                {showDetail && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 lg:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetail(false)}
                            className="absolute inset-0 bg-bg-dark/95 backdrop-blur-2xl"
                        />

                        <motion.div
                            layoutId={`room-peek-${room.id}`}
                            initial={{
                                opacity: 0,
                                scale: 0.85,
                                rotateX: 10,
                                y: 40,
                            }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                            exit={{
                                opacity: 0,
                                scale: 0.85,
                                rotateX: -10,
                                y: 40,
                            }}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 200,
                            }}
                            className="perspective-1000 relative flex h-auto max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[40px] border border-border-subtle bg-surface shadow-[0_0_100px_rgba(0,0,0,0.8)] lg:flex-row"
                        >
                            <div className="relative h-80 w-full overflow-hidden font-bold text-white lg:h-auto lg:w-1/2">
                                {room.thumbnail ? (
                                    <motion.img
                                        initial={{ scale: 1.2 }}
                                        animate={{ scale: 1 }}
                                        src={room.thumbnail}
                                        className="h-full w-full object-cover"
                                        alt={room.name}
                                    />
                                ) : (
                                    <div className="bg-surface-light flex h-full w-full items-center justify-center">
                                        <span className="text-6xl font-bold text-text-muted opacity-20">
                                            {room.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-surface/40" />
                                <div className="vignette absolute inset-0" />

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-accent-gold/20 bg-accent-gold/10 text-accent-gold shadow-[0_0_40px_rgba(198,161,91,0.2)] backdrop-blur-xl">
                                        <Play
                                            size={40}
                                            fill="currentColor"
                                            className="ml-1"
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <div className="relative flex grow flex-col justify-center bg-surface p-10 lg:p-16">
                                <button
                                    onClick={() => setShowDetail(false)}
                                    className="absolute top-10 right-10 flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-surface font-bold text-text-muted transition-all hover:bg-surface/80 hover:text-text-primary"
                                >
                                    <X size={24} />
                                </button>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-col gap-10"
                                >
                                    <div>
                                        <Badge className="mb-6 border border-accent-gold/20 bg-accent-gold/10 text-accent-gold">
                                            Legacy Chamber
                                        </Badge>
                                        <h2 className="mb-6 text-4xl leading-none font-bold tracking-tight text-text-primary md:text-6xl">
                                            {room.name}
                                        </h2>
                                        <p className="text-xl leading-relaxed font-light text-text-muted">
                                            {room.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-12 border-y border-border-subtle py-8">
                                        <div>
                                            <span className="mb-4 block text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase">
                                                Guardians
                                            </span>
                                            <AvatarGroup
                                                users={room.members.map(
                                                    (u) => ({
                                                        avatar: u.avatar,
                                                        avatar_url: (u as any).avatar_url,
                                                        name: u.name,
                                                    }),
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <span className="mb-4 block text-[10px] font-bold tracking-[0.3em] text-accent-gold uppercase">
                                                Stored Memories
                                            </span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-outfit text-4xl font-bold text-text-primary">
                                                    {room.stories_count || 0}
                                                </span>
                                                <span className="text-sm tracking-tighter text-text-muted uppercase">
                                                    Collections
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-5 pt-4">
                                        <Link
                                            href={show(room.slug).url}
                                            className="min-w-[240px] flex-1"
                                        >
                                            <Button className="group w-full rounded-2xl py-5 text-xl font-bold shadow-[0_20px_40px_rgba(198,161,91,0.15)]">
                                                Step Inside Room
                                                <ArrowRight className="transition-transform group-hover:translate-x-2" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            icon={Share2}
                                            className="rounded-2xl border-border-subtle px-8 py-5 font-bold"
                                        >
                                            Invite Kin
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
