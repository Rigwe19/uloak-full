import React from 'react';
import { Heart, Users } from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { RelationshipNode } from '@/types/person';

const typeLabels: Record<string, string> = {
    is_child_of: 'Child of',
    is_parent_of: 'Parent of',
    is_married_to: 'Married to',
    is_sibling_of: 'Sibling of',
    is_former_spouse_of: 'Former spouse of',
    is_guardian_of: 'Guardian of',
    is_foster_parent_of: 'Foster parent of',
    is_adoptive_parent_of: 'Adoptive parent of',
    is_step_parent_of: 'Step parent of',
    is_friend_of: 'Friend of',
    is_spiritual_kin_of: 'Spiritual kin of',
};

export default function RelationshipCard({ rel, baseUrl }: { rel: RelationshipNode; baseUrl: string }) {
    const label = typeLabels[rel.relationship_type] || rel.relationship_type.replace(/_/g, ' ');

    return (
        <Link
            href={`${baseUrl}/${rel.person_id}`}
            className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3 transition-all hover:border-accent-gold/30 hover:shadow-sm"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
                <Users size={18} />
            </div>
            <div className="min-w-0 grow">
                <p className="text-sm font-bold text-text-primary truncate">{rel.name}</p>
                <p className="text-xs text-text-muted">{label}</p>
                {rel.called_them && (
                    <p className="text-xs text-accent-gold/80">"<span className="italic">{rel.called_them}</span>"</p>
                )}
            </div>
            {rel.closeness && (
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Heart
                            key={i}
                            size={10}
                            className={i < rel.closeness! / 20 ? 'fill-accent-gold text-accent-gold' : 'text-border-subtle'}
                        />
                    ))}
                </div>
            )}
        </Link>
    );
}