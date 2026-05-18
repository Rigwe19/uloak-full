import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem('theme') || 'dark',
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <button
            onClick={toggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-all hover:border-accent-gold/20 hover:text-text-primary ${className}`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
}
