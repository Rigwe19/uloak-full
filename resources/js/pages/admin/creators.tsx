import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

interface Profile {
    id: number;
    user_id: number;
    creator_type: string;
    ref_code: string;
    is_approved_vip: boolean;
    user?: { id: number; name: string; email: string };
}

interface Earning {
    id: number;
    amount_minor: number;
    currency: string;
    split_pct: number;
    status: string;
    creator_profile?: { user?: { name: string } };
}

interface Props {
    profiles: Profile[];
    earnings: Earning[];
}

export default function AdminCreators({ profiles, earnings }: Props) {
    return (
        <AdminLayout>
            <Head title="Creators" />
            <div className="space-y-10 p-6 md:p-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Creators</h1>
                    <p className="mt-2 text-sm opacity-70">Approve VIP creators and track payouts.</p>
                </div>
                <section>
                    <h2 className="mb-3 text-xl font-semibold">Profiles</h2>
                    <div className="space-y-2">
                        {profiles.map((p) => (
                            <div key={p.id} className="flex items-center justify-between rounded-xl border p-3">
                                <div className="text-sm">
                                    <span className="font-semibold">{p.user?.name}</span>
                                    <span className="opacity-60"> · {p.ref_code} · {p.creator_type}</span>
                                </div>
                                {p.is_approved_vip ? (
                                    <button
                                        className="text-xs underline"
                                        onClick={() => router.post(`/admin/creators/${p.id}/revoke`)}
                                    >
                                        Revoke VIP
                                    </button>
                                ) : (
                                    <button
                                        className="text-xs underline"
                                        onClick={() => router.post(`/admin/creators/${p.id}/approve`)}
                                    >
                                        Approve VIP
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
                <section>
                    <h2 className="mb-3 text-xl font-semibold">Earnings</h2>
                    <div className="space-y-2">
                        {earnings.map((e) => (
                            <div key={e.id} className="flex items-center justify-between rounded-xl border p-3">
                                <div className="text-sm">
                                    {e.creator_profile?.user?.name} · {e.amount_minor} {e.currency} · {e.split_pct}% · {e.status}
                                </div>
                                {e.status !== 'paid' && (
                                    <button
                                        className="text-xs underline"
                                        onClick={() => router.post(`/admin/creator-earnings/${e.id}/pay`)}
                                    >
                                        Mark paid
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
