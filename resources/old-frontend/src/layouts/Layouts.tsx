import { Outlet, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar, Footer } from '../components/Navigation';
import React, { useEffect } from 'react';

export function PublicLayout() {
    const location = useLocation();
    const outlet = useOutlet();
    const isAuthPage = location.pathname === '/login';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="perspective-2000 flex min-h-screen flex-col overflow-x-hidden bg-bg-dark selection:bg-accent-gold/30">
            {!isAuthPage && <Navbar />}
            <main
                className={`relative flex-grow ${isAuthPage ? 'h-screen' : ''} bg-bg-dark`}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {outlet && (
                        <motion.div
                            key={location.pathname}
                            initial={{
                                opacity: 0,
                                rotateY: 90,
                                scale: 0.9,
                                transformOrigin: 'left center',
                                z: -500,
                            }}
                            animate={{
                                opacity: 1,
                                rotateY: 0,
                                scale: 1,
                                transformOrigin: 'left center',
                                z: 0,
                            }}
                            exit={{
                                opacity: 0,
                                rotateY: -90,
                                scale: 0.9,
                                transformOrigin: 'right center',
                                z: -500,
                            }}
                            transition={{
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="h-full w-full bg-bg-dark"
                        >
                            {outlet}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            {!isAuthPage && <Footer />}
        </div>
    );
}

export function AppLayout() {
    const location = useLocation();
    const outlet = useOutlet();

    return (
        <div className="perspective-2000 min-h-screen overflow-x-hidden bg-bg-dark text-text-primary selection:bg-accent-gold/30">
            <AnimatePresence mode="wait" initial={false}>
                {outlet && (
                    <motion.div
                        key={location.pathname}
                        initial={{
                            opacity: 0,
                            rotateY: 90,
                            scale: 0.9,
                            transformOrigin: 'left center',
                            z: -500,
                        }}
                        animate={{
                            opacity: 1,
                            rotateY: 0,
                            scale: 1,
                            transformOrigin: 'left center',
                            z: 0,
                        }}
                        exit={{
                            opacity: 0,
                            rotateY: -90,
                            scale: 0.9,
                            transformOrigin: 'right center',
                            z: -500,
                        }}
                        transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="min-h-screen origin-center bg-bg-dark"
                    >
                        {outlet}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
