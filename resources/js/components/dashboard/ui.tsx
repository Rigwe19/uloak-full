import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface ButtonProps {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    id?: string;
    icon?: LucideIcon;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Button({
    children,
    onClick,
    className = '',
    variant = 'primary',
    id,
    icon: Icon,
    disabled,
    type = 'button',
    size = 'md',
}: ButtonProps) {
    const variants = {
        primary: 'bg-accent-gold text-bg-dark hover:bg-opacity-90',
        secondary:
            'bg-surface text-text-primary hover:bg-white/5 border border-white/10',
        outline:
            'border border-accent-gold text-accent-gold hover:bg-accent-gold/10',
        ghost: 'text-text-muted hover:text-text-primary hover:bg-white/5',
        danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20',
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
        xl: 'px-10 py-5 text-lg',
    };

    return (
        <motion.button
            id={id}
            type={type}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
            className={`${sizes[size]} flex items-center justify-center gap-2 rounded-full font-medium transition-all ${variants[variant]} ${className} disabled:cursor-not-allowed disabled:opacity-50`}
        >
            {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
            {children}
        </motion.button>
    );
}

export function Badge({
    children,
    className = '',
    id,
}: {
    children: React.ReactNode;
    className?: string;
    id?: string;
}) {
    return (
        <span
            id={id}
            className={`rounded-full bg-accent-gold/20 px-2 py-0.5 text-xs font-semibold tracking-wider text-accent-gold uppercase ${className}`}
        >
            {children}
        </span>
    );
}

export function AvatarGroup({
    users,
    limit = 3,
    id,
}: {
    users: {
        avatar?: string | null;
        avatar_url?: string | null;
        name: string;
    }[];
    limit?: number;
    id?: string;
}) {
    const displayUsers = users.slice(0, limit);
    const remaining = users.length - limit;

    return (
        <div id={id} className="flex -space-x-2">
            {displayUsers.map((user, i) => (
                <div
                    key={i}
                    className="bg-surface-light flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-surface"
                    title={user.name}
                >
                    {user.avatar_url || user.avatar ? (
                        <img
                            src={user.avatar_url || (user.avatar as string)}
                            alt={user.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-[10px] font-bold text-text-muted">
                            {user.name.charAt(0)}
                        </span>
                    )}
                </div>
            ))}
            {remaining > 0 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface text-[10px] font-bold text-text-muted">
                    +{remaining}
                </div>
            )}
        </div>
    );
}
