import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Check,
    ChevronDown,
    ChevronUp,
    Shield,
    Users,
    Heart,
    Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { RegionSelector } from '@/components/pricing/RegionSelector';
import type { RegionOption } from '@/components/pricing/RegionSelector';
import { StickyCTA } from '@/components/pricing/StickyCTA';
import GuestLayout from '@/layouts/guest-layout';
import {
    cinematicText,
    fadeUp,
    staggerContainer,
    viewportOnce,
} from '@/lib/animations';
import { register, privacy } from '@/routes';

interface PricingPageProps {
    pricing: Record<string, RegionOption>;
    defaultRegion: string;
}

const FAQS = [
    {
        q: 'Is the Full Room payment per event or per Room?',
        a: 'The payment is per Room. In most cases, one Room represents one occasion. A birthday Room requires one payment. A wedding held later requires another Room and another payment. A burial or memorial tribute also has its own Room.',
    },
    {
        q: 'Do guests have to pay?',
        a: 'No. Only the person creating or upgrading the Room pays. Invited guests can contribute their stories without paying for a plan.',
    },
    {
        q: 'Can I start free and upgrade later?',
        a: 'Yes. You can create a Starter Room and upgrade that same Room when you need more contributions, storage, time or features. Contributions already received remain in the Room.',
    },
    {
        q: 'What counts as one contribution?',
        a: 'Each story submitted by a guest counts as one contribution. A contribution may contain a written story, photo, video or voice note.',
    },
    {
        q: 'What happens after 30 days on the Starter Room?',
        a: 'New contributions close. You can still access and download the stories already collected or upgrade the Room to continue.',
    },
    {
        q: 'What happens after 12 months on a Full Room?',
        a: 'Ulo will remind the organiser before online access ends. The organiser can download the complete Room or move it into an active Family Archive. A Full Room does not renew automatically.',
    },
    {
        q: 'What is the difference between a Full Room and a Family Archive?',
        a: 'A Full Room is designed for one occasion, such as a wedding, birthday, burial or memorial. A Family Archive is an ongoing private space where family members preserve stories across different people, generations and moments.',
    },
    {
        q: 'Does a Family Archive include Full Event or Tribute Rooms?',
        a: 'Not at launch. Full Event and Tribute Rooms are purchased separately. A completed Room can, however, be moved into an active Family Archive.',
    },
    {
        q: 'Can I cancel the Family Archive?',
        a: 'Yes. You can cancel at any time. Your subscription remains active until the end of the period you have already paid for.',
    },
    {
        q: 'Will the Family Archive renew automatically?',
        a: 'Yes. Monthly and yearly Family Archive subscriptions renew automatically unless cancelled before the next billing date.',
    },
    {
        q: 'Can I download my stories?',
        a: 'Yes. Starter Rooms allow individual downloads. Full Rooms and Family Archives include bulk download.',
    },
    {
        q: 'Who controls access?',
        a: 'The organiser or family administrator controls invitations and access. Ulo spaces are private by default unless the organiser chooses to share them.',
    },
];

function usePersistedRegion(
    defaultRegion: string,
    regions: Record<string, RegionOption>,
) {
    const [region, setRegion] = useState(defaultRegion);

    useEffect(() => {
        const stored =
            typeof window !== 'undefined'
                ? localStorage.getItem('ulo_region')
                : null;

        if (stored && regions[stored]) {
            setRegion(stored);
        }

        // Auto-detect via Intl if no stored value and default is nigeria
        if (!stored) {
            try {
                const locale = Intl.DateTimeFormat().resolvedOptions().timeZone;
                // Keep nigeria as default; no aggressive auto-switch to avoid confusion.
            } catch {}
        }
    }, [regions]);

    const update = (key: string) => {
        setRegion(key);

        try {
            localStorage.setItem('ulo_region', key);
        } catch {}
    };

    return [region, update] as const;
}

export default function Pricing({ pricing, defaultRegion }: PricingPageProps) {
    const [selectedRegion, setRegion] = usePersistedRegion(
        defaultRegion,
        pricing,
    );
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [subscribing, setSubscribing] = useState<string | null>(null);
    const region = pricing[selectedRegion] ?? pricing[defaultRegion];
    const { auth } = usePage<{ auth: { user: { id: number } | null } }>().props;

    const startFamilyArchive = async (tier: string) => {
        if (!auth?.user) {
            router.visit(
                `${register().url}?tier=${tier}&region=${selectedRegion}`,
            );

            return;
        }

        setSubscribing(tier);

        try {
            const csrf =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement | null
                )?.content ?? '';
            const res = await fetch('/billing/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ region: selectedRegion, tier }),
            });
            const data = await res.json();

            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            } else if (data.message) {
                alert(data.message);
            }
        } catch {
            alert('Failed to start checkout. Please try again.');
        } finally {
            setSubscribing(null);
        }
    };

    return (
        <>
            <Head title="Pricing — Ulo of Stories" />

            {/* Hero */}
            <section className="relative px-6 pt-32 pb-12 md:px-12 lg:px-24 overflow-hidden">
                <div
                    className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-gold/5 blur-[120px]"
                    aria-hidden
                />
                <div className="mx-auto max-w-7xl text-center">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.p
                            variants={fadeUp}
                            className="text-[10px] font-bold tracking-[0.4em] text-accent-gold uppercase"
                        >
                            Pricing
                        </motion.p>
                        <motion.h1
                            variants={cinematicText}
                            className="mt-3 text-5xl font-bold tracking-tight text-text-primary md:text-6xl"
                        >
                            Simple pricing for stories that matter
                        </motion.h1>
                        <motion.p
                            variants={fadeUp}
                            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-muted"
                        >
                            Start with a free Room. Upgrade once when you need
                            more space and features, or choose a Family Archive
                            to preserve stories together over time.
                        </motion.p>
                        <motion.p
                            variants={fadeUp}
                            className="mt-4 text-sm font-semibold text-text-primary"
                        >
                            Guests never pay to contribute a story.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: 0.3 }}
                        className="mt-10 flex flex-col items-center gap-3"
                    >
                        <p className="text-xs font-semibold tracking-widest text-text-muted uppercase">
                            Choose your location
                        </p>
                        <RegionSelector
                            regions={pricing}
                            selectedRegion={selectedRegion}
                            onChange={setRegion}
                        />
                        <p className="text-xs text-text-muted">
                            Prices are shown in the selected regional currency.
                            Applicable taxes and the final amount will be shown
                            before payment.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Visual storytelling strip — uses remaining Ulo library images */}
            <section className="mx-auto max-w-7xl">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="overflow-hidden rounded-3xl border border-border-subtle">
                        <img
                            src="/images/05-ulo-merchandise-family.jpg"
                            alt="Ulo family merchandise and keepsakes"
                            className="h-64 w-full object-cover md:h-72"
                            loading="lazy"
                        />
                    </div>
                    <div className="overflow-hidden rounded-3xl border border-border-subtle">
                        <img
                            src="/images/08-ulo-event-kit.jpg"
                            alt="Ulo event kit and story materials"
                            className="h-64 w-full object-cover md:h-72"
                            loading="lazy"
                        />
                    </div>
                </div>
                <p className="mt-3 text-center text-xs text-text-muted">
                    Real families, real keepsakes, real event kits — everything
                    in its place.
                </p>
            </section>

            {/* Three cards */}
            <section className="mt-12 px-6 pb-16 md:px-12 lg:px-24">
                <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
                    {/* Starter */}
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={viewportOnce}
                        variants={fadeUp}
                        className="relative flex flex-col rounded-3xl border border-border-subtle bg-surface/30 p-8"
                    >
                        <p className="text-[10px] font-bold tracking-widest text-accent-gold uppercase">
                            Start at no cost
                        </p>
                        <h3 className="mt-2 text-2xl font-light text-text-primary">
                            Starter Room
                        </h3>
                        <p className="mt-1 text-sm text-text-muted">
                            A simple way to try Ulo or collect stories from a
                            small group.
                        </p>
                        <div className="mt-6 flex items-baseline gap-1">
                            <span className="text-4xl font-light text-text-primary">
                                Free
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-text-muted">
                            No card required.
                        </p>
                        <ul className="mt-8 flex flex-col gap-3 text-sm text-text-muted">
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                One active Starter Room
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Up to 50 guest contributions
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                1GB total storage
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Photos, videos, voice notes and written stories
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                One private sharing link
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Guests contribute without paying
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Collect for 30 days
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Download contributions individually
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Organiser controls access
                            </li>
                        </ul>
                        <p className="mt-6 text-xs leading-relaxed text-text-muted">
                            After 30 days: New contributions close. The
                            organiser can still access and download the stories
                            already collected or upgrade the same Room.
                        </p>
                        <div className="mt-6">
                            <Link
                                href={register().url}
                                className="flex w-full items-center justify-center rounded-full border border-accent-gold px-6 py-3 text-sm font-medium text-accent-gold transition hover:bg-accent-gold/10"
                            >
                                Create a free Room
                            </Link>
                        </div>
                    </motion.div>

                    {/* Full Room — Most Popular */}
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={viewportOnce}
                        variants={fadeUp}
                        transition={{ delay: 0.08 }}
                        className="relative flex flex-col rounded-3xl border border-accent-gold bg-surface/50 p-8 shadow-[0_0_40px_rgba(212,175,55,0.12)]"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent-gold px-4 py-1 text-[10px] font-bold tracking-widest text-bg-dark uppercase">
                            Most Popular
                        </div>
                        <p className="text-[10px] font-bold tracking-widest text-accent-gold uppercase">
                            One-off payment per Room
                        </p>
                        <h3 className="mt-2 text-2xl font-light text-text-primary">
                            Full Ulo Room
                        </h3>
                        <p className="mt-1 text-sm text-text-muted italic">
                            One occasion. Every voice. One lasting collection.
                        </p>
                        <p className="mt-2 text-xs text-text-muted">
                            Use it for: One wedding, birthday, anniversary,
                            graduation, reunion, burial, funeral, memorial or
                            other meaningful occasion.
                        </p>
                        <div className="mt-6">
                            <span className="text-4xl font-light text-text-primary">
                                {region.full_room_formatted}
                            </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-text-muted">
                            One-off payment per Room
                        </p>
                        <ul className="mt-6 flex flex-col gap-3 text-sm text-text-muted">
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                One complete Room for one occasion
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Unlimited invited guests
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Unlimited contributions within 10GB
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Photos, videos, voice notes & written stories
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Personalised Room cover & welcome message
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Private link & downloadable QR code
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Review & manage contributions
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Download all stories together
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Slideshow from collected memories
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                12 months of online access
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Move into Family Archive later
                            </li>
                        </ul>
                        <div className="mt-6">
                            <Link
                                href="/weddings/create"
                                className="flex w-full items-center justify-center rounded-full bg-accent-gold px-6 py-3 text-sm font-semibold text-bg-dark transition hover:bg-accent-gold/90"
                            >
                                Create a Full Room —{' '}
                                {region.full_room_formatted}
                            </Link>
                            <p className="mt-2 text-center text-xs font-medium text-text-muted">
                                One payment. No monthly subscription. Guests
                                contribute free.
                            </p>
                        </div>
                        <p className="mt-4 text-xs leading-relaxed text-text-muted">
                            Meaning of per Room: One birthday is one Room and
                            one payment. A separate wedding, funeral, memorial
                            or future celebration requires a separate Room and
                            payment.
                        </p>
                    </motion.div>

                    {/* Family Archive */}
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={viewportOnce}
                        variants={fadeUp}
                        transition={{ delay: 0.16 }}
                        className="relative flex flex-col rounded-3xl border border-border-subtle bg-surface/30 p-8"
                    >
                        <p className="text-[10px] font-bold tracking-widest text-accent-gold uppercase">
                            Your family&apos;s ongoing story
                        </p>
                        <h3 className="mt-2 text-2xl font-light text-text-primary">
                            Family Archive
                        </h3>
                        <p className="mt-1 text-sm text-text-muted italic">
                            A private home for family stories, not limited to
                            one occasion.
                        </p>
                        <div className="mt-6">
                            <span className="text-4xl font-light text-text-primary">
                                {region.family_monthly_formatted}
                            </span>
                            <span className="text-sm text-text-muted">
                                {' '}
                                / month
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-text-muted">
                            or {region.family_yearly_formatted} / year — Save{' '}
                            {region.yearly_savings_formatted}
                        </p>
                        <ul className="mt-6 flex flex-col gap-3 text-sm text-text-muted">
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                One private Family Archive
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Invite whole family — no per-person charge
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                25GB total family storage
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Photos, videos, voice notes & written stories
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Organise by person, generation, branch or theme
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Ongoing capture while active
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Administrator controls invitations & access
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Download individually or complete archive
                            </li>
                            <li className="flex gap-3">
                                <Check
                                    size={16}
                                    className="mt-0.5 shrink-0 text-accent-gold"
                                />{' '}
                                Cancel anytime
                            </li>
                        </ul>
                        <p className="mt-4 text-xs leading-relaxed text-text-muted">
                            Launch boundary: Does not include Full Event or
                            Tribute Rooms at launch. Those are purchased
                            separately, but a completed Room can later be moved
                            into an active Family Archive.
                        </p>
                        <div className="mt-6 flex flex-col gap-2">
                            <button
                                onClick={() =>
                                    startFamilyArchive('family_monthly')
                                }
                                disabled={!!subscribing}
                                className="flex w-full items-center justify-center rounded-full border border-white/10 bg-surface px-6 py-3 text-sm font-medium text-text-primary transition hover:bg-white/5 disabled:opacity-50"
                            >
                                {subscribing === 'family_monthly'
                                    ? 'Starting…'
                                    : `Start monthly — ${region.family_monthly_formatted}`}
                            </button>
                            <button
                                onClick={() =>
                                    startFamilyArchive('family_yearly')
                                }
                                disabled={!!subscribing}
                                className="flex w-full items-center justify-center rounded-full bg-accent-gold px-6 py-3 text-sm font-semibold text-bg-dark transition hover:bg-accent-gold/90 disabled:opacity-50"
                            >
                                {subscribing === 'family_yearly'
                                    ? 'Starting…'
                                    : `Start yearly — ${region.family_yearly_formatted}`}{' '}
                                <span className="ml-1 text-xs opacity-80">
                                    Save {region.yearly_savings_formatted}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Private by default */}
            <section className="bg-surface/10 px-6 py-16 md:px-12 lg:px-24">
                <div className="mx-auto max-w-5xl">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-2xl font-light text-text-primary md:text-3xl">
                            Private by default
                        </h2>
                        <p className="mt-3 text-text-muted">
                            Your Ulo Room or Family Archive is private unless
                            you choose to share it.
                        </p>
                    </div>
                    <div className="mt-10 grid gap-6 md:grid-cols-4">
                        {[
                            {
                                icon: Shield,
                                title: 'Viewing',
                                desc: 'Who can view the Room or Archive.',
                            },
                            {
                                icon: Users,
                                title: 'Contributing',
                                desc: 'Who can submit stories and memories.',
                            },
                            {
                                icon: Heart,
                                title: 'Selection',
                                desc: 'Which contributions are included.',
                            },
                            {
                                icon: Sparkles,
                                title: 'Export',
                                desc: 'When to download the collected stories.',
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="rounded-2xl border border-border-subtle bg-surface/20 p-6 text-center"
                            >
                                <item.icon className="mx-auto h-8 w-8 text-accent-gold" />
                                <h3 className="mt-3 font-medium text-text-primary">
                                    {item.title}
                                </h3>
                                <p className="mt-1 text-sm text-text-muted">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 rounded-2xl border border-border-subtle bg-surface/20 p-6 text-sm leading-relaxed text-text-muted">
                        <p>
                            <strong className="text-text-primary">
                                Full Rooms
                            </strong>{' '}
                            One-off purchases. They do not renew automatically.
                        </p>
                        <p className="mt-2">
                            <strong className="text-text-primary">
                                Family Archive
                            </strong>{' '}
                            Monthly and yearly subscriptions renew automatically
                            until cancelled. Access continues to the end of the
                            billing period already paid for.
                        </p>
                        <p className="mt-3 text-xs">
                            A bank or card provider may charge a
                            currency-conversion fee when paying in a different
                            currency.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="px-6 py-16 md:px-12 lg:px-24">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-center text-3xl font-light text-text-primary md:text-4xl">
                        Frequently asked questions
                    </h2>
                    <div className="mt-10 flex flex-col gap-3">
                        {FAQS.map((faq, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-2xl border border-border-subtle bg-surface/20"
                            >
                                <button
                                    onClick={() =>
                                        setOpenFaq(
                                            openFaq === index ? null : index,
                                        )
                                    }
                                    className="flex w-full items-center justify-between p-6 text-left"
                                >
                                    <span className="pr-4 font-medium text-text-primary">
                                        {faq.q}
                                    </span>
                                    {openFaq === index ? (
                                        <ChevronUp className="h-5 w-5 shrink-0 text-text-muted" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 shrink-0 text-text-muted" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-6 text-sm leading-relaxed text-text-muted">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Policy links */}
            <section className="border-t border-border-subtle px-6 py-8 md:px-12 lg:px-24">
                <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-6 text-sm text-text-muted">
                    <Link href="/terms" className="hover:text-text-primary">
                        Terms of Use
                    </Link>
                    <span aria-hidden>·</span>
                    <Link
                        href={privacy().url}
                        className="hover:text-text-primary"
                    >
                        Privacy Policy
                    </Link>
                    <span aria-hidden>·</span>
                    <Link
                        href="/refund-policy"
                        className="hover:text-text-primary"
                    >
                        Refund Policy
                    </Link>
                </div>
            </section>

            <StickyCTA
                price={region.full_room_formatted}
                label="Create a Full Room"
                href="/weddings/create"
            />
        </>
    );
}
