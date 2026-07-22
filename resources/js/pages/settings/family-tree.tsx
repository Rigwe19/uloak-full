import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Users, Heart, ChevronRight } from 'lucide-react';
import React from 'react';
import RelationshipCard from '@/components/people/RelationshipCard';
import type { Person, RelationshipNode, FamilyTree, TreeNode, SiblingNode, SpouseNode } from '@/types/person';

interface SettingsFamilyTreeProps {
    person: Person | null;
    graph: {
        outgoing: RelationshipNode[];
        incoming: RelationshipNode[];
        graph: FamilyTree;
    };
}

export default function SettingsFamilyTree({ person, graph }: SettingsFamilyTreeProps) {
    const baseUrl = `/people/${person?.uuid}`;

    return (
        <>
            <Head title={(person?.name || 'Family Tree') + ' - Uloak'} />

            <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight text-text-primary">Family Tree</h2>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {graph.graph.spouses.length > 0 && (
                    <section>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
                            <Heart size={16} /> Spouses
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {graph.graph.spouses.map((s: SpouseNode) => (
                                <div key={s.person.id} className="rounded-xl border border-border-subtle bg-surface p-3">
                                    <p className="text-sm font-bold text-text-primary">{s.person.name}</p>
                                    <p className="text-xs text-text-muted capitalize">{s.status}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {graph.graph.siblings.length > 0 && (
                    <section>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
                            <Users size={16} /> Siblings
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {graph.graph.siblings.map((s: SiblingNode) => (
                                <div key={s.person.id} className="rounded-xl border border-border-subtle bg-surface p-3">
                                    <p className="text-sm font-bold text-text-primary">{s.person.name}</p>
                                    <p className="text-xs text-text-muted capitalize">{s.kind}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <section>
                        <h3 className="mb-3 text-sm font-bold text-text-primary">Parents & Ancestors</h3>
                        <TreeView nodes={graph.graph.ancestors} baseUrl={baseUrl} />
                    </section>
                    <section>
                        <h3 className="mb-3 text-sm font-bold text-text-primary">Children & Descendants</h3>
                        <TreeView nodes={graph.graph.descendants} baseUrl={baseUrl} />
                    </section>
                </div>

                <section>
                    <h3 className="mb-3 text-sm font-bold text-text-primary">All Relationships</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {graph.outgoing.map((rel) => (
                            <RelationshipCard key={rel.id} rel={rel} baseUrl={baseUrl} />
                        ))}
                        {graph.incoming.map((rel) => (
                            <RelationshipCard key={rel.id} rel={rel} baseUrl={baseUrl} />
                        ))}
                    </div>
                </section>

                {graph.outgoing.length === 0 && graph.incoming.length === 0 && (
                    <div className="py-16 text-center text-sm italic text-text-muted">
                        No relationships recorded yet.
                    </div>
                )}
            </motion.div>
        </>
    );
}

function TreeView({ nodes, baseUrl, depth = 0 }: { nodes: TreeNode[]; baseUrl: string; depth?: number }) {
    if (!nodes || nodes.length === 0) {
return (
        <p className="text-xs italic text-text-muted">None recorded</p>
    );
}

    return (
        <div className="space-y-2" style={{ paddingLeft: depth > 0 ? 16 : 0 }}>
            {nodes.map((node, i) => (
                <div key={node.person.id + '-' + i}>
                    <a
                        href={`${baseUrl}/${node.person.id}`}
                        className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm transition-colors hover:border-accent-gold/30"
                    >
                        <ChevronRight size={14} className="text-text-muted" />
                        <span className="font-medium text-text-primary">{node.person.name}</span>
                        <span className="text-xs text-text-muted capitalize">({node.kind})</span>
                    </a>
                    <TreeView nodes={node.ancestors || node.descendants || []} baseUrl={baseUrl} depth={depth + 1} />
                </div>
            ))}
        </div>
    );
}
