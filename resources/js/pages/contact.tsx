import { Head } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone, Send, Globe, Users, BookOpen, Heart, Film, Zap, Database, Microscope, Key, LayoutGrid, Camera, Mic, Book, Briefcase, FileText, Coffee, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';

import { Button } from '@/components/ui-elements';
import GuestLayout from '@/layouts/guest-layout';

interface Props {
    page?: {
        title: string;
        meta_description?: string;
        content: any;
    };
}

export default function Contact({ page }: Props) {
    const iconMap: Record<string, any> = {
        Clock, Mail, MapPin, Phone, Send, Globe, Users, BookOpen, Heart, Film, Zap, Database, Microscope, Key, LayoutGrid, Camera, Mic, Book, Briefcase, FileText, Coffee, Lock
    };

    const content = page?.content || {};
    const hero = content.hero || {
        title: "Let's start a conversation.",
        subtitle: "Whether you're a family with a story to tell or an organization looking to partner — we'd love to hear from you.",
    };

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const contactInfo = content.contact_info || [
        { label: 'Email', value: 'hello@uloak.co.uk', icon: 'Mail', link: 'mailto:hello@uloak.co.uk' },
        { label: 'Phone', value: '+44 7830 129816', icon: 'Phone', link: 'tel:+447830129816' },
        { label: 'Location', value: 'Nottingham, UK', icon: 'MapPin', link: '#' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setTimeout(() => {
            setSent(true);
            setSending(false);
        }, 1500);
    };

    return (
        <GuestLayout>
            <Head>
                <title>{page?.title || 'Contact Us'} | Uloak</title>
                <meta name="description" content={page?.meta_description || 'Get in touch with Uloak for storytelling services and collaborations.'} />
            </Head>

            <div className="bg-bg-dark text-text-primary selection:bg-accent-gold/30">
                <section className="relative min-h-[60vh] overflow-hidden px-6 pt-32 pb-20 md:px-12 lg:px-24">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-bg-dark/95 to-bg-dark/90" />
                        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent-gold/5 blur-[120px]" />
                        <div className="absolute bottom-48 -left-24 h-[500px] w-[500px] rounded-full bg-accent-gold/5 blur-[150px]" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <span className="mb-6 inline-block text-[10px] font-bold text-accent-gold uppercase tracking-[0.4em]">Get in Touch</span>
                            <h1 className="text-5xl leading-[1.1] font-bold tracking-tight text-text-primary md:text-7xl">
                                {hero.title}
                            </h1>
                            <p className="mt-8 max-w-2xl text-xl leading-relaxed text-text-muted">
                                {hero.subtitle}
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="px-6 py-24 md:px-12 lg:px-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
                            {/* Form */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="rounded-[40px] border border-white/5 bg-surface/20 p-10 md:p-16"
                            >
                                {sent ? (
                                    <div className="text-center py-20">
                                        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent-gold/20 text-accent-gold">
                                            <Send size={32} />
                                        </div>
                                        <h2 className="text-3xl font-bold mb-4">Message Sent.</h2>
                                        <p className="text-text-muted mb-8">We'll be in touch with you shortly.</p>
                                        <Button onClick={() => setSent(false)} variant="outline">Send Another</Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Full Name</label>
                                                <input
                                                    type="text" required
                                                    className="w-full rounded-2xl border border-white/5 bg-bg-dark px-6 py-4 text-sm outline-none transition-all focus:border-accent-gold/50"
                                                    placeholder="Nnanna Adim"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Email Address</label>
                                                <input
                                                    type="email" required
                                                    className="w-full rounded-2xl border border-white/5 bg-bg-dark px-6 py-4 text-sm outline-none transition-all focus:border-accent-gold/50"
                                                    placeholder="hello@uloak.co.uk"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Subject</label>
                                            <select
                                                className="w-full appearance-none rounded-2xl border border-white/5 bg-bg-dark px-6 py-4 text-sm outline-none transition-all focus:border-accent-gold/50"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            >
                                                <option>General Inquiry</option>
                                                <option>Legacy Film Inquiry</option>
                                                <option>Partnership Proposal</option>
                                                <option>Support</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Message</label>
                                            <textarea
                                                rows={5} required
                                                className="w-full resize-none rounded-2xl border border-white/5 bg-bg-dark px-6 py-4 text-sm outline-none transition-all focus:border-accent-gold/50"
                                                placeholder="How can we help you tell your story?"
                                                value={formData.message}
                                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            />
                                        </div>
                                        <Button type="submit" disabled={sending} className="h-16 w-full rounded-2xl text-lg font-bold">
                                            {sending ? 'Sending...' : 'Send Message'}
                                        </Button>
                                    </form>
                                )}
                            </motion.div>

                            {/* Info */}
                            <div className="space-y-16">
                                <div className="space-y-12">
                                    <h2 className="text-3xl font-bold tracking-tight">Direct Channels</h2>
                                    <div className="grid gap-12">
                                        {contactInfo.map((info: any, i: number) => {
                                            const IconComponent = iconMap[info.icon as keyof typeof iconMap] || Mail;
                                            return (
                                                <div key={i} className="group flex items-start gap-6">
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-surface/30 text-text-muted transition-all group-hover:border-accent-gold/30 group-hover:text-accent-gold">
                                                        <IconComponent size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold tracking-widest text-accent-gold uppercase mb-1">{info.label}</p>
                                                        <a href={info.link} className="text-2xl font-bold hover:text-accent-gold transition-colors">{info.value}</a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="h-[400px] overflow-hidden rounded-[40px] border border-white/5 grayscale invert-[0.9] opacity-80 transition-all hover:grayscale-0 hover:invert-0 hover:opacity-100">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d153835.3742416194!2d-1.2847055734375005!3d52.9548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4879c2049e79435b%3A0x86f91605ec7a602c!2sNottingham!5e0!3m2!1sen!2suk!4v1714472000000!5m2!1sen!2suk"
                                        width="100%" height="100%" style={{ border: 0 }} loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </GuestLayout>
    );
}
