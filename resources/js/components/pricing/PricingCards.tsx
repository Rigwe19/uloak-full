import { Check, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { RegionOption } from './RegionSelector';
import { cardReveal, cardHover, viewportOnce } from '@/lib/animations';

interface PricingCardProps {
    region: RegionOption;
    tier: 'starter' | 'full_room' | 'family_archive';
    isPopular?: boolean;
    className?: string;
}

const TIER_CONFIG = {
    starter: {
        label: 'Starter Room',
        tagline: 'Start at no cost',
        price: 0,
        formattedPrice: 'Free',
        billing: 'No card required',
        features: [
            { text: 'One active Starter Room', included: true },
            { text: 'Up to 50 guest contributions', included: true },
            { text: '1GB total storage', included: true },
            { text: 'Photos, videos, voice notes & written stories', included: true },
            { text: 'One private sharing link', included: true },
            { text: 'Guests contribute free', included: true },
            { text: 'Collect new contributions for 30 days', included: true },
            { text: 'Download contributions individually', included: true },
            { text: 'Organiser controls room access', included: true },
        ],
        cta: 'Create a free Room',
        ctaVariant: 'outline' as const,
        afterText: 'After 30 days: New contributions close. The organiser can still access and download the stories already collected or upgrade the same Room.',
    },
    full_room: {
        label: 'Full Ulo Room',
        tagline: 'One-off payment per Room',
        price: 1500000, // will be overridden by region data
        formattedPrice: '₦15,000',
        billing: 'One payment. No monthly subscription. Guests contribute free.',
        features: [
            { text: 'One complete Room for one occasion', included: true },
            { text: 'Unlimited invited guests', included: true },
            { text: 'Unlimited contributions within 10GB storage', included: true },
            { text: 'Photos, videos, voice notes & written stories', included: true },
            { text: 'Personalised Room cover & welcome message', included: true },
            { text: 'Private contribution link & downloadable QR code', included: true },
            { text: 'Review & manage contributions before completing', included: true },
            { text: 'Download all collected stories together', included: true },
            { text: 'Create a slideshow from collected memories', included: true },
            { text: '12 months of online Room access', included: true },
            { text: 'Move completed Room into Family Archive later', included: true },
        ],
        cta: 'Create a Full Room',
        ctaVariant: 'primary' as const,
        perRoomNote: 'Meaning of per Room: One birthday is one Room and one payment. A separate wedding, funeral, memorial or future celebration requires a separate Room and payment.',
    },
    family_archive: {
        label: 'Family Archive',
        tagline: 'Monthly or yearly subscription',
        price: 350000,
        formattedPrice: '₦3,500 / mo',
        billing: 'Choose monthly or yearly billing. Cancel anytime.',
        features: [
            { text: 'One private Family Archive', included: true },
            { text: 'Invite the whole family — no per-person charge', included: true },
            { text: '25GB total family storage', included: true },
            { text: 'Photos, videos, voice notes & written stories', included: true },
            { text: 'Organise by person, generation, branch or theme', included: true },
            { text: 'Ongoing capture while subscription is active', included: true },
            { text: 'Family administrator controls invitations & access', included: true },
            { text: 'Download individual stories or complete archive', included: true },
            { text: 'Cancel anytime — access continues to end of paid period', included: true },
        ],
        cta: 'Start a Family Archive',
        ctaVariant: 'secondary' as const,
        launchBoundary: 'Launch boundary: The Family Archive does not include Full Event or Tribute Rooms at launch. Those Rooms are purchased separately, but a completed Room can later be moved into an active Family Archive.',
    },
};

export function PricingCard({ region, tier, isPopular = false, className = '' }: PricingCardProps) {
    const config = TIER_CONFIG[tier];
    const price = tier === 'full_room' ? region.full_room : tier === 'family_archive' ? region.family_monthly : 0;
    const formattedPrice = tier === 'full_room'
        ? region.full_room_formatted
        : tier === 'family_archive'
            ? `${region.family_monthly_formatted} / mo`
            : 'Free';

    return (
        <motion.div
            variants={cardReveal}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            whileHover={cardHover}
            className={`relative flex flex-col h-full overflow-hidden rounded-3xl border bg-surface/50 p-6 transition-all duration-300 ${
                isPopular ? 'border-accent-gold/30 shadow-lg' : 'border-border-subtle hover:border-accent-gold/20'
            } ${className}`}
        >
            {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-gold px-3 py-1 text-xs font-semibold text-bg-dark">
                    Most Popular
                </span>
            )}

            <div className="mb-6">
                <h3 className="font-serif text-2xl font-semibold tracking-tight text-text-primary">
                    {config.label}
                </h3>
                <p className="mt-1 text-sm text-text-muted">{config.tagline}</p>
            </div>

            <div className="mb-6">
                <div className="font-display text-5xl font-bold text-text-primary">
                    {formattedPrice}
                </div>
                <p className="mt-1 text-sm text-text-muted">{config.billing}</p>
            </div>

            <ul className="flex-1 space-y-3 mb-6" role="list">
                {config.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <Check
                            className={`h-5 w-5 flex-shrink-0 ${
                                feature.included ? 'text-accent-gold' : 'text-border-subtle'
                            }`}
                            aria-hidden="true"
                        />
                        <span className={`text-sm leading-relaxed ${feature.included ? 'text-text-primary' : 'text-text-muted line-through'}`}>
                            {feature.text}
                        </span>
                    </li>
                ))}
            </ul>

            {tier === 'full_room' && 'perRoomNote' in config && (
                <p className="mb-4 text-xs text-text-muted">
                    {(config as { perRoomNote: string }).perRoomNote}
                </p>
            )}

            {tier === 'family_archive' && 'launchBoundary' in config && (
                <p className="mb-4 text-xs text-text-muted">
                    {(config as { launchBoundary: string }).launchBoundary}
                </p>
            )}

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all ${
                    config.ctaVariant === 'primary'
                        ? 'bg-accent-gold text-bg-dark hover:bg-opacity-90'
                        : config.ctaVariant === 'secondary'
                            ? 'bg-surface text-text-primary hover:bg-white/5 border border-white/10'
                            : 'border border-accent-gold text-accent-gold hover:bg-accent-gold/10'
                }`}
            >
                {config.cta}
                <ExternalLink className="h-4 w-4" />
            </motion.button>

            {tier === 'starter' && 'afterText' in config && (
                <p className="mt-4 text-center text-xs text-text-muted">
                    {(config as { afterText: string }).afterText}
                </p>
            )}
        </motion.div>
    );
}