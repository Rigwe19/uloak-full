import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fadeUp, viewportOnce } from '@/lib/animations';

interface WeddingsCreateProps {
    pricing: Record<
        string,
        { label: string; currency: string; full_room_formatted: string }
    >;
    defaultRegion: string;
    refCode?: string | null;
}

const ROOM_TYPE_LABELS: Record<string, string> = {
    wedding: 'Wedding',
    birthday: 'Birthday',
    burial: 'Burial / Funeral',
    memorial: 'Memorial / Tribute',
    anniversary: 'Anniversary',
    graduation: 'Graduation',
    general: 'Room',
};

const ROOM_TYPE_SHORT: Record<string, string> = {
    wedding: 'Wedding',
    birthday: 'Birthday',
    burial: 'Burial',
    memorial: 'Memorial',
    anniversary: 'Anniversary',
    graduation: 'Graduation',
    general: 'Room',
};

export default function WeddingsCreate({
    pricing,
    defaultRegion,
    refCode,
}: WeddingsCreateProps) {
    const region = pricing[defaultRegion] ?? pricing['nigeria'];
    const priceLabel = region?.full_room_formatted ?? '₦15,000';

    const [regionKey] = useState(defaultRegion);
    const currentPrice = pricing[regionKey]?.full_room_formatted ?? priceLabel;

    const params = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : '',
    );
    const initialRoomType = (params.get('type') as string) || 'wedding';
    const roomLabel = ROOM_TYPE_LABELS[initialRoomType] ?? 'Room';
    const shortLabel = ROOM_TYPE_SHORT[initialRoomType] ?? 'Room';
    const [type, setType] = useState(initialRoomType);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        tribute_name: '',
        start_date: '',
        wedding_dates: '',
        welcome_message: '',
        privacy: 'private',
        room_type: initialRoomType,
        tier: 'full_room',
        region: regionKey,
        ref_code:
            refCode ??
            (typeof window !== 'undefined'
                ? (localStorage.getItem('ulo_ref') ?? '')
                : ''),
    });

    // keep form room_type in sync with local type picker so labels price etc react instantly
    const syncType = (val: string) => {
        setType(val);
        setData('room_type', val);
    };

    // Hydrate from dashboard modal handoff (keeps the "Create Room" modal as the single entry UX)
    // so the user does not retype the name after being redirected to the paid funnel.
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('ulo_pending_room');

            if (raw) {
                const pending = JSON.parse(raw) as { name?: string; description?: string; room_type?: string };

                if (pending?.name) {
                    setData('name', pending.name);
                }

                if (pending?.description) {
                    setData('welcome_message', pending.description);
                }

                if (pending?.room_type && pending.room_type !== type) {
                    // syncType will also setData internally, but we are inside effect so call directly
                    setType(pending.room_type);
                    setData('room_type', pending.room_type);
                }

                sessionStorage.removeItem('ulo_pending_room');
            }
        } catch {}
        // run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/weddings/create', {
            onSuccess: () => {},
        });
    };

    const pageTitle = `Create your ${roomLabel} Room`;
    const currentLabel = ROOM_TYPE_LABELS[type] ?? roomLabel;
    const currentShort = ROOM_TYPE_SHORT[type] ?? shortLabel;

    return (
        <>
            <Head title={`${pageTitle} — Ulo`} />
            <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
                <motion.div initial="hidden" animate="show" variants={fadeUp}>
                    <p className="text-[10px] font-bold tracking-[0.4em] text-accent-gold uppercase">
                        Ulo {currentShort}s
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
                        {pageTitle}
                    </h1>
                    <p className="mt-3 text-text-muted">
                        Set up your private {currentLabel} Room. You&apos;ll review the
                        order summary before any payment.
                    </p>
                </motion.div>

                <motion.form
                    onSubmit={handleSubmit}
                    initial="hidden"
                    whileInView="show"
                    viewport={viewportOnce}
                    variants={fadeUp}
                    className="mt-10 space-y-6 rounded-3xl border border-border-subtle bg-surface/30 p-6 md:p-8"
                >
                    <div>
                        <label
                            htmlFor="room_type"
                            className="text-sm font-medium text-text-primary"
                        >
                            Occasion <span className="text-red-400">*</span>
                        </label>
                        <select
                            id="room_type"
                            value={type as string}
                            onChange={(e) => syncType(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
                        >
                            <option value="wedding">Wedding</option>
                            <option value="birthday">Birthday</option>
                            <option value="burial">Burial / Funeral</option>
                            <option value="memorial">Memorial / Tribute</option>
                            <option value="anniversary">Anniversary</option>
                            <option value="graduation">Graduation</option>
                        </select>
                        <p className="mt-1 text-xs text-text-muted">
                            Burial, birthday, memorial — all are paid Full Rooms
                            (same checkout as weddings). Only “General story” is
                            free via the dashboard.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="name"
                            className="text-sm font-medium text-text-primary"
                        >
                            {currentShort} title <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={
                                type === 'wedding'
                                    ? "e.g. Amaka & Chidi's Wedding"
                                    : type === 'burial'
                                      ? 'e.g. In memory of Papa — Burial Room'
                                      : type === 'memorial'
                                        ? 'e.g. In memory of Mama — Memorial'
                                        : `e.g. My ${currentShort} Room`
                            }
                            className="mt-2 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:outline-none"
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-400">
                                {errors.name}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-text-muted">
                            Default could be “[Name] & [Name]’s Wedding”. You
                            can edit it later.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="tribute_name"
                                className="text-sm font-medium text-text-primary"
                            >
                                {type === 'wedding' ? 'Couple names' : type === 'birthday' ? 'Celebrant name' : type === 'burial' || type === 'memorial' ? 'Honoree name' : 'Tribute name'}
                            </label>
                            <input
                                id="tribute_name"
                                value={data.tribute_name}
                                onChange={(e) =>
                                    setData('tribute_name', e.target.value)
                                }
                                placeholder={type === 'wedding' ? 'Amaka & Chidi' : type === 'burial' ? 'Papa Joseph' : 'Name'}
                                className="mt-2 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="start_date"
                                className="text-sm font-medium text-text-primary"
                            >
                                {type === 'wedding' ? 'Wedding date (first date)' : type === 'birthday' ? 'Birthday date' : type === 'burial' || type === 'memorial' ? 'Date' : 'Start date'}
                            </label>
                            <input
                                id="start_date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) =>
                                    setData('start_date', e.target.value)
                                }
                                className="mt-2 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="wedding_dates"
                            className="text-sm font-medium text-text-primary"
                        >
                            Additional dates{' '}
                            <span className="font-normal text-text-muted">
                                (optional — e.g. traditional + white wedding)
                            </span>
                        </label>
                        <input
                            id="wedding_dates"
                            value={data.wedding_dates}
                            onChange={(e) =>
                                setData('wedding_dates', e.target.value)
                            }
                            placeholder="2026-12-12, 2026-12-14"
                            className="mt-2 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-text-muted">
                            One Room covers all parts of the same couple&apos;s
                            story — even on different dates.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="welcome_message"
                            className="text-sm font-medium text-text-primary"
                        >
                            Welcome message for guests{' '}
                            <span className="font-normal text-text-muted">
                                (optional)
                            </span>
                        </label>
                        <textarea
                            id="welcome_message"
                            value={data.welcome_message}
                            onChange={(e) =>
                                setData('welcome_message', e.target.value)
                            }
                            rows={3}
                            placeholder={type === 'wedding' ? "Welcome to our wedding memories — please share the moments you capture!" : `Welcome to this ${currentShort.toLowerCase()} — please share your memories!`}
                            className="mt-2 w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:outline-none"
                        />
                    </div>

                    <div className="rounded-2xl border border-accent-gold/20 bg-accent-gold/5 p-5">
                        <p className="text-xs font-bold tracking-widest text-accent-gold uppercase">
                            Order summary
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="font-medium text-text-primary capitalize">
                                {currentLabel} Room
                            </span>
                            <span className="text-lg font-semibold text-text-primary">
                                {currentPrice}
                            </span>
                        </div>
                        <p className="text-xs text-text-muted">
                            One-off payment for one {currentLabel} Room. Guests
                            contribute free.
                        </p>
                        {data.ref_code && (
                            <p className="mt-2 text-xs text-text-muted">
                                Referred by{' '}
                                <span className="font-mono font-medium text-text-primary">
                                    {data.ref_code}
                                </span>
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-gold px-8 py-4 text-sm font-semibold text-bg-dark transition hover:bg-accent-gold/90 disabled:opacity-50"
                    >
                        {processing
                            ? 'Creating…'
                            : `Continue to payment — ${currentPrice}`}{' '}
                        <ArrowRight size={16} />
                    </button>

                    <p className="text-center text-xs text-text-muted">
                        You&apos;ll be taken to our secure payment provider.
                        Card details are never stored on Ulo servers.
                    </p>
                </motion.form>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-text-muted">
                    <span className="inline-flex items-center gap-1">
                        <Check size={14} className="text-accent-gold" /> No
                        subscription
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Check size={14} className="text-accent-gold" /> Guests
                        free
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Check size={14} className="text-accent-gold" /> 10GB ·
                        12 months
                    </span>
                </div>
            </section>
        </>
    );
}
