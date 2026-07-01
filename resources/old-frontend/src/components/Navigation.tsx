import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './UI';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const isApp = location.pathname.startsWith('/app');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { name: 'About', path: '/about' },
        { name: 'How It Works', path: '/how-it-works' },
        { name: 'Legacy Films', path: '/legacy-films' },
        { name: 'Community', path: '/community-projects' },
        { name: 'Contact', path: '/contact' },
    ];

    if (isApp) return null; // App has its own navigation or minimal top bar

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${isScrolled ? 'border-b border-border-subtle bg-bg-dark/80 py-4 backdrop-blur-md' : 'bg-transparent py-8'}`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8">
                <Link to="/" className="flex items-center">
                    <img
                        src="/logo.png"
                        alt="ULOAK - House of Stories"
                        className="h-10 w-auto object-contain lg:h-12"
                    />
                </Link>

                {/* Desktop Links */}
                <div className="hidden items-center gap-8 lg:flex">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
                        >
                            {link.name}
                        </Link>
                    ))}

                    <ThemeToggle className="ml-2" />

                    <Link to="/login">
                        <Button variant="outline" className="px-6 py-2 text-sm">
                            Dashboard
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button className="px-6 py-2 text-sm">
                            Start Your Story
                        </Button>
                    </Link>
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
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-lg font-medium text-text-muted transition-colors hover:text-text-primary"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-4 border-t border-border-subtle pt-4">
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Button variant="outline" className="w-full">
                                    Dashboard
                                </Button>
                            </Link>
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Button className="w-full">
                                    Start Your Story
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

export function Footer() {
    const location = useLocation();
    if (location.pathname.startsWith('/app')) return null;

    return (
        <footer className="border-t border-border-subtle bg-bg-dark pt-24 pb-12">
            <div className="mx-auto max-w-7xl px-8">
                <div className="mb-24 grid grid-cols-2 gap-12 md:grid-cols-2 lg:grid-cols-4">
                    <div className="col-span-full flex flex-col gap-6">
                        <Link to="/" className="flex items-center">
                            <img
                                src="logo-stacked.png"
                                alt="ULOAK - House of Stories"
                                className="h-auto w-10 object-contain"
                            />
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed text-text-muted">
                            A private digital home where diaspora families
                            preserve family stories, culture, and memory.
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-6 text-xs font-bold tracking-widest text-text-primary uppercase">
                            Platform
                        </h4>
                        <ul className="flex flex-col gap-4">
                            <li>
                                <Link
                                    to="/how-it-works"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    How it Works
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/legacy-films"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Legacy Films
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/community-projects"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Community Projects
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
                                    to="/about"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy"
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
                                    href="#"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    Instagram
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                                >
                                    LinkedIn
                                </a>
                            </li>
                            <li>
                                <a
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
