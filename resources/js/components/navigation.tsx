import { Link, usePage } from '@inertiajs/react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { useAppearance } from '@/hooks/use-appearance';
import {
    about,
    communityProjects,
    contact,
    dashboard,
    home,
    howItWorks,
    legacyFilms,
    login,
    membership,
    privacy,
    register,
} from '@/routes';
import { Button } from './ui-elements';

export function ThemeToggle({ className = '' }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-all hover:border-accent-gold/20 hover:text-text-primary ${className}`}
            title={`Switch to ${appearance === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
            {appearance === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
}

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { url } = usePage();
    const { auth } = usePage().props;
    const isApp = url.startsWith('/dashboard') || url.startsWith('/settings');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { name: 'About', path: about().url },
        { name: 'How It Works', path: howItWorks().url },
        { name: 'Services', path: legacyFilms().url },
        { name: 'Community', path: communityProjects().url },
        { name: 'Subcription', path: membership().url },
        { name: 'Contact', path: contact().url },
    ];

    if (isApp) return null;

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${isScrolled ? 'border-b border-border-subtle bg-bg-dark/80 py-2 backdrop-blur-md' : 'bg-transparent py-4'}`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8">
                <Link href={home().url} className="flex items-center">
                    <img
                        src="/logo.png"
                        alt="ULOAK - House of Stories"
                        className="h-18 w-auto object-contain lg:h-24"
                    />
                </Link>

                {/* Desktop Links */}
                <div className="hidden items-center gap-8 lg:flex">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            href={link.path}
                            className={`text-sm font-medium transition-colors hover:text-text-primary ${url === link.path ? 'text-accent-gold' : 'text-text-muted'}`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <ThemeToggle className="ml-2" />

                    {auth.user ? (
                        <Link href={dashboard()}>
                            <Button variant="outline" className="px-6 py-2 text-sm">
                                Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href={login().url}>
                                <Button variant="outline" className="px-6 py-2 text-sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href={register().url}>
                                <Button className="px-6 py-2 text-sm">
                                    Start Your Story
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="flex items-center gap-4 lg:hidden">
                    <ThemeToggle />
                    <button
                        className="text-text-primary"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full right-0 left-0 flex flex-col gap-6 border-b border-border-subtle bg-surface p-8 lg:hidden"
                    >
                        {links.map((link) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`text-lg font-medium transition-colors hover:text-text-primary ${url === link.path ? 'text-accent-gold' : 'text-text-muted'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-4 border-t border-border-subtle pt-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Button variant="outline" className="w-full">
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login().url}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Button variant="outline" className="w-full">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link
                                        href={register().url}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Button className="w-full">
                                            Start Your Story
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

export function Footer() {
    const { url } = usePage();
    const isApp = url.startsWith('/dashboard') || url.startsWith('/settings');

    if (isApp) return null;

    return (
        <footer className="border-t border-border-subtle bg-bg-dark pt-24 pb-12">
            <div className="mx-auto max-w-7xl px-8">
                <div className="mb-24 grid grid-cols-2 gap-12 md:grid-cols-2 lg:grid-cols-4">
                    <div className="col-span-full flex flex-col gap-6">
                        <Link href={home().url} className="flex items-center">
                            <img
                                src="/logo-stacked.png"
                                alt="ULOAK - House of Stories"
                                className="h-auto w-24 object-contain"
                            />
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed text-text-muted">
                            A private digital home to capture moments, collect tributes, and preserve memories in organised rooms.
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-6 text-xs font-bold tracking-widest text-text-primary uppercase">
                            Platform
                        </h4>
                        <ul className="flex flex-col gap-4">
                            <li>
                                <Link
                                    href={howItWorks().url}
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    How it Works
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={legacyFilms().url}
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={communityProjects().url}
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Community Projects
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={membership().url}
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Membership
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-6 text-xs font-bold tracking-widest text-text-primary uppercase">
                            Company
                        </h4>
                        <ul className="flex flex-col gap-4">
                            <li>
                                <Link
                                    href={about().url}
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={contact().url}
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={privacy().url}
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-6 text-xs font-bold tracking-widest text-text-primary uppercase">
                            Connect
                        </h4>
                        <ul className="flex flex-col gap-4">
                            <li>
                                <a
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href="https://www.instagram.com/uloakstories/"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Instagram
                                </a>
                            </li>
                            <li>
                                <a
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href="https://linkedin.com/company/uloak"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    LinkedIn
                                </a>
                            </li>
                            <li>
                                <a
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href="https://x.com/uloakHQ"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    X
                                </a>
                            </li>
                            <li>
                                <a
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href="https://www.facebook.com/profile.php?id=61582751621270"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href="http://www.youtube.com/@ULOAK"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Youtube
                                </a>
                            </li>
                            <li>
                                <a
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href="https://www.tiktok.com/@uloakhq"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Tiktok
                                </a>
                            </li>
                            <li>
                                <a
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href="mailto:hello@uloakstories.com"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    hello@uloakstories.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-6 border-t border-border-subtle pt-12 md:flex-row">
                    <p className="text-xs text-text-muted">
                        &copy; {new Date().getFullYear()} ULOAK. All rights
                        reserved.
                    </p>
                    <p className="text-xs text-text-muted italic">
                        Preserving the past, inspiring the future.
                    </p>
                </div>
            </div>
        </footer>
    );
}
