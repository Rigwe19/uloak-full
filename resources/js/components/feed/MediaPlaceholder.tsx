import { FileText, ImageIcon, Music } from 'lucide-react';

interface MediaPlaceholderProps {
    type?: string;
    className?: string;
}

export default function MediaPlaceholder({
    type,
    className = '',
}: MediaPlaceholderProps) {
    const icon =
        type === 'audio' ? (
            <Music size={40} className="mx-auto mb-2 text-accent-gold/60" />
        ) : type === 'document' ? (
            <FileText size={40} className="mx-auto mb-2 text-accent-gold/60" />
        ) : (
            <ImageIcon size={40} className="mx-auto mb-2 text-accent-gold/60" />
        );

    const label =
        type === 'audio'
            ? 'Voice Recording'
            : type === 'document'
              ? 'Document'
              : 'No Media';

    return (
        <div
            className={`flex h-full items-center justify-center bg-gradient-to-br from-accent-gold/5 to-surface ${className}`}
        >
            <div className="text-center">
                {icon}
                <span className="block font-mono text-[10px] tracking-wider text-accent-gold uppercase">
                    {label}
                </span>
            </div>
        </div>
    );
}
