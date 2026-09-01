import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Camera, Check, ChevronDown, ChevronUp, Gift, Heart, Image, Link2, Lock, MessageSquare, Mic, QrCode, Share2, Shield, Users, Video } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { RegionOption } from '@/components/pricing/RegionSelector';
import { StickyCTA } from '@/components/pricing/StickyCTA';
import { cinematicText, fadeUp, parallaxFloat, staggerContainer, viewportOnce } from '@/lib/animations';
interface WeddingsProps {
    pricing: Record<string, RegionOption>;
    defaultRegion: string;
}

const WEDDING_FAQS = [
    { q: 'What is an Ulo Wedding Room?', a: 'A dedicated space for one wedding where the couple can bring together memories contributed by their guests.' },
    { q: 'How much does it cost?', a: '₦15,000 for one Wedding Room, paid once.' },
    { q: 'Do guests have to pay?', a: 'No. The Wedding Room purchaser pays for the room; guests are not charged to contribute.' },
    { q: 'Does Ulo replace my photographer or videographer?', a: 'No. Your professional team captures the official wedding story. Ulo helps you collect additional moments captured by the people who attended.' },
    { q: 'How do guests contribute?', a: 'They use the Wedding Room link or QR code and follow the contribution flow on their phone.' },
    { q: 'Can I use one room for my traditional and white wedding?', a: 'Yes — where these are parts of the same couple\'s wedding story, one paid Wedding Room covers them.' },
    { q: 'Do guests need the Ulo app?', a: 'No. Guests contribute directly in the browser — no app required.' },
    { q: 'How many guests can contribute?', a: 'Unlimited guests can contribute within the 10GB storage allowance.' },
];

export default function Weddings({ pricing, defaultRegion }: WeddingsProps) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const region = pricing[defaultRegion] ?? pricing['nigeria'];
    const weddingPrice = region?.full_room_formatted ?? '₦15,000';

    // Capture ?ref= attribution for checkout (also handled server-side via TrackReferral middleware)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');

        if (ref) {
            try {
                localStorage.setItem('ulo_ref', ref);
            } catch {
                // ignore storage errors
            }
        }

        // Preserve UTM through session for analytics parity
        ['utm_source', 'utm_medium', 'utm_campaign'].forEach((k) => {
            const v = params.get(k);

            if (v) {
                try {
                    sessionStorage.setItem(k, v);
                } catch {
                    // ignore storage errors
                }
            }
        });
    }, []);

    const ctaHref = '/weddings/create';

    return (
        <>
            <Head title="Ulo Weddings — One Wedding. One Room. Everyone's Memories. | Ulo of Stories">
                <meta name="description" content="Bring the photos, videos and stories your guests capture into one Ulo Wedding Room. ₦15,000 one-off per wedding." />
                <meta property="og:title" content="Don't let your wedding memories scatter." />
                <meta property="og:description" content="One wedding. One room. Everyone's memories. Create an Ulo Wedding Room for ₦15,000." />
            </Head>

            {/* 01 — Hero */}
            <section className="relative overflow-hidden px-6 pt-28 pb-16 md:px-12 lg:px-24 lg:pt-36">
                <motion.div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-gold/5 blur-[120px]" variants={parallaxFloat} initial="initial" animate="animate" aria-hidden />
                <motion.div className="absolute bottom-0 -left-24 h-125 w-125 rounded-full bg-accent-gold/5 blur-[120px]" variants={parallaxFloat} initial="initial" animate="animate" style={{ animationDelay: '2s' } as any} aria-hidden />

                <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
                    <motion.div variants={staggerContainer} initial="hidden" animate="show">
                        <motion.p variants={fadeUp} className="text-[10px] font-bold tracking-[0.4em] text-accent-gold uppercase">Ulo Weddings</motion.p>
                        <motion.h1 variants={cinematicText} className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-6xl lg:text-7xl">
                            Don&apos;t let your wedding memories scatter.
                        </motion.h1>
                        <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
                            Your guests will capture hundreds of moments you may never see. Bring their photos, videos and stories together in one private Ulo Wedding Room.
                        </motion.p>
                        <motion.p variants={fadeUp} className="mt-4 text-sm font-semibold tracking-widest text-text-primary uppercase">₦15,000 · One wedding · One payment</motion.p>
                        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
                            <Link href={ctaHref} className="inline-flex items-center justify-center rounded-full bg-accent-gold px-8 py-4 text-sm font-semibold text-bg-dark transition hover:bg-accent-gold/90">
                                Create My Wedding Room
                            </Link>
                            <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full border border-border-subtle px-8 py-4 text-sm font-medium text-text-primary transition hover:border-accent-gold/30">
                                See How It Works
                            </a>
                        </motion.div>
                        <motion.p variants={fadeUp} className="mt-3 text-xs text-text-muted">Guests never pay to contribute.</motion.p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
                        <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-border-subtle bg-surface/50">
                            <img src="/images/03-ulo-family-reunion.jpg" alt="Joyful Nigerian wedding moment — guests capturing memories" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-accent-gold/10 via-transparent to-surface/40 p-8">
                                <div className="rounded-2xl bg-bg-dark/80 px-6 py-4 backdrop-blur text-center">
                                    <p className="text-xs tracking-widest text-accent-gold uppercase">Guest contribution arriving</p>
                                    <p className="mt-1 font-serif text-lg text-text-primary">“The moment Dad saw you dressed.”</p>
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 text-center text-xs text-text-muted">Your photographer captures the official story. Your guests capture everything around it.</p>
                    </motion.div>
                </div>
            </section>

            {/* 03 — Problem recognition */}
            <section className="border-t border-border-subtle bg-surface/10 px-6 py-16 md:px-12 lg:px-24">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.h2 initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeUp} className="text-3xl font-light leading-tight text-text-primary md:text-4xl">
                        Your photographer captures the official story. Your guests capture everything around it.
                    </motion.h2>
                    <motion.p initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeUp} className="mx-auto mt-6 max-w-2xl leading-relaxed text-text-muted">
                        The bridesmaid&apos;s video. Dad&apos;s reaction. Grandma dancing. The table that would not stop laughing. The moment someone caught from the other side of the room. After the wedding, those memories are usually scattered across WhatsApp chats, Instagram Stories and hundreds of phones. <strong className="text-text-primary">Ulo gives them one home.</strong>
                    </motion.p>
                </div>
            </section>

            {/* 04 — How it works (3 steps) */}
            <section id="how-it-works" className="scroll-mt-20 px-6 py-16 md:px-12 lg:px-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-[10px] font-bold tracking-[0.4em] text-accent-gold uppercase">How it works</p>
                        <h2 className="mt-3 text-3xl font-light text-text-primary md:text-4xl">Three simple steps</h2>
                    </div>
                    <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
                        {[
                            { n: '01', title: 'Create your room', desc: 'Set up your private Wedding Room and personalise it for your wedding.', icon: Heart },
                            { n: '02', title: 'Share one QR code or link', desc: 'Put it on your programme, tables, welcome sign, WhatsApp group or screen. Guests open it from their phones.', icon: QrCode },
                            { n: '03', title: 'Everyone contributes', desc: 'Guests add the wedding memories they captured so you can experience the day from more than one perspective.', icon: Users },
                        ].map((step) => (
                            <motion.div key={step.n} initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeUp} className="rounded-3xl border border-border-subtle bg-surface/30 p-8 text-center">
                                <step.icon className="mx-auto h-10 w-10 text-accent-gold" />
                                <p className="mt-4 text-xs font-bold tracking-widest text-accent-gold">{step.n}</p>
                                <h3 className="mt-1 text-lg font-medium text-text-primary">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-10 text-center">
                        <Link href={ctaHref} className="inline-flex items-center justify-center rounded-full bg-accent-gold px-8 py-4 text-sm font-semibold text-bg-dark transition hover:bg-accent-gold/90">
                            Create My Wedding Room — {weddingPrice}
                        </Link>
                    </div>
                </div>
            </section>

            {/* 05 — What guests can contribute */}
            <section className="bg-surface/10 px-6 py-16 md:px-12 lg:px-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-light text-text-primary md:text-4xl">The best memory from your wedding may be on someone else&apos;s phone.</h2>
                        <p className="mt-4 text-text-muted">Only contribution types live at launch are shown. Guests contribute free — no purchase required.</p>
                    </div>
                    <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
                        {[
                            { icon: Image, title: 'Photos', desc: 'Guest photos that would otherwise stay on individual phones.' },
                            { icon: Video, title: 'Videos', desc: 'Short and long guest clips from different parts of the celebration.' },
                            { icon: MessageSquare, title: 'Written stories & messages', desc: 'Guests add context, a memory or a message for the couple.' },
                            { icon: QrCode, title: 'QR / share link', desc: 'A simple way for guests to reach the room from their phones.' },
                            { icon: Lock, title: 'Private room', desc: 'A dedicated space for your wedding — not an open social feed.' },
                            { icon: Mic, title: 'Voice messages', desc: 'Spoken contributions where supported at launch.', muted: true },
                        ].map((card) => (
                            <div key={card.title} className={`rounded-2xl border p-6 ${card.muted ? 'border-border-subtle bg-surface/10 opacity-60' : 'border-border-subtle bg-surface/30'}`}>
                                <card.icon className="h-7 w-7 text-accent-gold" />
                                <h3 className="mt-3 font-medium text-text-primary">{card.title}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-text-muted">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border-subtle bg-surface/20 p-6">
                        <p className="text-sm font-medium text-text-primary">Wedding moments guests capture best:</p>
                        <ul className="mt-3 grid gap-2 text-sm text-text-muted md:grid-cols-2">
                            <li className="flex gap-2"><span className="text-accent-gold">—</span> The moment Dad saw you dressed.</li>
                            <li className="flex gap-2"><span className="text-accent-gold">—</span> The cousin who caught Grandma dancing.</li>
                            <li className="flex gap-2"><span className="text-accent-gold">—</span> The table that filmed your entrance from a different angle.</li>
                            <li className="flex gap-2"><span className="text-accent-gold">—</span> Friends who recorded what happened while you were taking portraits.</li>
                            <li className="flex gap-2 md:col-span-2"><span className="text-accent-gold">—</span> The messages people wanted you to hear after the celebration.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 06/07 — Photographer objection block */}
            <section className="px-6 py-16 md:px-12 lg:px-24">
                <div className="mx-auto max-w-4xl rounded-3xl border border-accent-gold/20 bg-accent-gold/5 p-8 md:p-12">
                    <div className="flex gap-4">
                        <Camera className="h-8 w-8 shrink-0 text-accent-gold" />
                        <div>
                            <h2 className="text-2xl font-light text-text-primary md:text-3xl">Your photographer gives you the professional story. Ulo helps you keep the guest story too.</h2>
                            <p className="mt-4 leading-relaxed text-text-muted">Ulo is not a replacement for professional wedding photography or videography. It gives your guests one simple place to contribute the moments they captured around the official coverage — making photographers and vendors comfortable recommending it.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 08 — Guest experience */}
            <section className="bg-surface/10 px-6 py-16 md:px-12 lg:px-24">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-center text-3xl font-light text-text-primary md:text-4xl">How guests contribute</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-center text-text-muted">No purchase. No mandatory account. Straight from the camera roll on iOS and Android.</p>
                    <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                        {[
                            { step: '1', text: 'Scan QR / tap link' },
                            { step: '2', text: 'See couple & wedding identity' },
                            { step: '3', text: 'Choose photo, video or message' },
                            { step: '4', text: 'Confirm consent to share' },
                            { step: '5', text: 'Upload with progress' },
                            { step: '6', text: '“Add another memory”' },
                        ].map((item) => (
                            <div key={item.step} className="rounded-2xl border border-border-subtle bg-surface/30 p-5 text-center">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-gold text-sm font-bold text-bg-dark">{item.step}</span>
                                <p className="mt-3 text-sm text-text-primary">{item.text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-text-muted">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle px-3 py-1"><Share2 size={14} /> Link or QR</span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle px-3 py-1"><Link2 size={14} /> No app required</span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle px-3 py-1"><Shield size={14} /> Consent before upload</span>
                    </div>
                </div>
            </section>

            {/* 09 — Privacy & control */}
            <section className="px-6 py-16 md:px-12 lg:px-24">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-light text-text-primary md:text-4xl">Your wedding memories are for your people — not a public social feed.</h2>
                    <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-text-muted">Your Ulo Wedding Room is designed as a dedicated space for your wedding contributions. You control the room according to the privacy and access settings available in Ulo.</p>
                    <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
                        <div className="rounded-2xl border border-border-subtle bg-surface/20 p-6"><Shield className="h-6 w-6 text-accent-gold" /><p className="mt-2 text-sm font-medium text-text-primary">Private by design</p><p className="mt-1 text-sm text-text-muted">Dedicated contribution space, not an open feed.</p></div>
                        <div className="rounded-2xl border border-border-subtle bg-surface/20 p-6"><Users className="h-6 w-6 text-accent-gold" /><p className="mt-2 text-sm font-medium text-text-primary">You control access</p><p className="mt-1 text-sm text-text-muted">Decide who can view and contribute.</p></div>
                        <div className="rounded-2xl border border-border-subtle bg-surface/20 p-6"><Gift className="h-6 w-6 text-accent-gold" /><p className="mt-2 text-sm font-medium text-text-primary">Download & keep</p><p className="mt-1 text-sm text-text-muted">Bulk download your collected memories.</p></div>
                    </div>
                </div>
            </section>

            {/* 10 — Pricing */}
            <section className="bg-surface/10 px-6 py-16 md:px-12 lg:px-24">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-[10px] font-bold tracking-[0.4em] text-accent-gold uppercase">Pricing</p>
                    <h2 className="mt-3 text-3xl font-light text-text-primary md:text-4xl">One wedding. One payment.</h2>
                    <div className="mx-auto mt-8 max-w-sm rounded-3xl border border-accent-gold bg-surface/50 p-8 shadow-[0_0_40px_rgba(212,175,55,0.12)]">
                        <h3 className="text-lg font-medium text-text-primary">Ulo Wedding Room</h3>
                        <p className="mt-2 text-4xl font-light text-text-primary">{weddingPrice}</p>
                        <p className="mt-1 text-sm text-text-muted">One-off payment for one Wedding Room</p>
                        <ul className="mt-6 space-y-2 text-left text-sm text-text-muted">
                            <li className="flex gap-2"><Check size={16} className="mt-0.5 text-accent-gold" /> One private Wedding Room</li>
                            <li className="flex gap-2"><Check size={16} className="mt-0.5 text-accent-gold" /> Shareable link / QR access</li>
                            <li className="flex gap-2"><Check size={16} className="mt-0.5 text-accent-gold" /> Guest contributions (photos, videos, messages)</li>
                            <li className="flex gap-2"><Check size={16} className="mt-0.5 text-accent-gold" /> No subscription for this Room</li>
                            <li className="flex gap-2"><Check size={16} className="mt-0.5 text-accent-gold" /> Guests do not pay</li>
                        </ul>
                        <Link href={ctaHref} className="mt-8 flex w-full items-center justify-center rounded-full bg-accent-gold px-6 py-3 text-sm font-semibold text-bg-dark transition hover:bg-accent-gold/90">
                            Create My Wedding Room — {weddingPrice}
                        </Link>
                    </div>
                    <p className="mt-4 text-xs text-text-muted">One traditional + white wedding for the same couple counts as one Room. Guests never pay.</p>
                </div>
            </section>

            {/* 11 — FAQ */}
            <section className="px-6 py-16 md:px-12 lg:px-24">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-center text-3xl font-light text-text-primary md:text-4xl">Frequently asked questions</h2>
                    <div className="mt-10 flex flex-col gap-3">
                        {WEDDING_FAQS.map((faq, i) => (
                            <div key={i} className="overflow-hidden rounded-2xl border border-border-subtle bg-surface/20">
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between p-6 text-left">
                                    <span className="pr-4 font-medium text-text-primary">{faq.q}</span>
                                    {openFaq === i ? <ChevronUp className="h-5 w-5 shrink-0 text-text-muted" /> : <ChevronDown className="h-5 w-5 shrink-0 text-text-muted" />}
                                </button>
                                {openFaq === i && <div className="px-6 pb-6 text-sm leading-relaxed text-text-muted">{faq.a}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 12 — Final CTA */}
            <section className="bg-surface/10 px-6 py-16 md:px-12 lg:px-24">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-light text-text-primary md:text-4xl">Bring your wedding memories home.</h2>
                    <p className="mx-auto mt-4 max-w-xl text-text-muted">Create your Ulo Wedding Room today. One wedding. One room. Everyone&apos;s memories — for {weddingPrice}, paid once.</p>
                    <Link href={ctaHref} className="mt-8 inline-flex items-center justify-center rounded-full bg-accent-gold px-10 py-4 text-base font-semibold text-bg-dark transition hover:bg-accent-gold/90">
                        Create My Wedding Room
                    </Link>
                </div>
            </section>

            <StickyCTA price={weddingPrice} label="Create Wedding Room" href={ctaHref} />
        </>
    );
}
