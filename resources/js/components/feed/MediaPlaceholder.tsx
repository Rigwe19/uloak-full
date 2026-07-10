import { FileText, ImageIcon, Music } from 'lucide-react';

interface MediaPlaceholderProps {
    type?: string;
    className?: string;
}

export default function MediaPlaceholder({ type, className = '' }: MediaPlaceholderProps) {
    const icon = type === 'audio' ? (
        <Music size={40} className="text-accent-gold/60 mx-auto mb-2" />
    ) : type === 'document' ? (
        <FileText size={40} className="text-accent-gold/60 mx-auto mb-2" />
    ) : (
        <ImageIcon size={40} className="text-accent-gold/60 mx-auto mb-2" />
    );

    const label = type === 'audio' ? 'Voice Recording' : type === 'document' ? 'Document' : 'No Media';

    return (
        <div className={`flex items-center justify-center h-full bg-gradient-to-br from-accent-gold/5 to-surface ${className}`}>
            <div className="text-center">
                {icon}
                <span className="text-[10px] font-mono tracking-wider text-accent-gold uppercase block">{label}</span>
            </div>
        </div>
    );
}
