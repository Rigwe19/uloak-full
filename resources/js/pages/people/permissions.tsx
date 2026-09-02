import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Shield, Check, X, FileText } from 'lucide-react';
import React from 'react';
import PersonLayout from '@/layouts/person-layout';
import type { Person, PermissionEntry, ConsentEntry } from '@/types/person';

interface PermissionsProps {
    person: Person;
    permissions: PermissionEntry[];
    consents: ConsentEntry[];
}

export default function Permissions({
    person,
    permissions,
    consents,
}: PermissionsProps) {
    return (
        <PersonLayout person={person}>
            <Head
                title={
                    (person.name || 'Permissions') +
                    ' - Ulo of Storiesf Stories'
                }
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <section className="rounded-xl border border-border-subtle bg-surface p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-text-primary">
                        <Shield size={16} /> Permissions
                    </h3>
                    {permissions.length > 0 ? (
                        <div className="space-y-2">
                            {permissions.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-dark px-3 py-2"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-text-primary capitalize">
                                            {p.ability}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            {p.grantee_type} ·{' '}
                                            {p.grantee_id
                                                ? `User #${p.grantee_id}`
                                                : 'All'}
                                        </p>
                                    </div>
                                    {p.allowed ? (
                                        <Check
                                            size={18}
                                            className="text-green-400"
                                        />
                                    ) : (
                                        <X size={18} className="text-red-400" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-text-muted italic">
                            No permissions configured.
                        </p>
                    )}
                </section>

                <section className="rounded-xl border border-border-subtle bg-surface p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-text-primary">
                        <FileText size={16} /> Consent History
                    </h3>
                    {consents.length > 0 ? (
                        <div className="space-y-2">
                            {consents.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-dark px-3 py-2"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-text-primary capitalize">
                                            {c.consent_type.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            v{c.version} · {c.status}
                                            {c.expires_at &&
                                                ` · Expires ${c.expires_at}`}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs font-bold uppercase ${
                                            c.status === 'granted'
                                                ? 'text-green-400'
                                                : c.status === 'withdrawn'
                                                  ? 'text-red-400'
                                                  : 'text-accent-gold'
                                        }`}
                                    >
                                        {c.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-text-muted italic">
                            No consent records.
                        </p>
                    )}
                </section>
            </motion.div>
        </PersonLayout>
    );
}
