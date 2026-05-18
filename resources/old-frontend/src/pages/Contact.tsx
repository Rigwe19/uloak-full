import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '../components/UI';
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Tell a Story (Legacy Films)',
        message: '',
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const contactInfo = [
        {
            label: 'Email',
            value: 'hello@uloak.co.uk',
            icon: Mail,
            link: 'mailto:hello@uloak.co.uk',
        },
        {
            label: 'Phone',
            value: '+44 7830 129816',
            icon: Phone,
            link: 'tel:+447830129816',
        },
        {
            label: 'Address',
            value: 'Nottingham, United Kingdom',
            icon: MapPin,
            link: 'https://www.google.com/maps/place/Nottingham/@52.9548248,-1.189578,13z',
        },
        {
            label: 'Response Time',
            value: 'We aim to respond within 48 hours.',
            icon: Clock,
            link: null,
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) return;
        setSending(true);
        try {
            await addDoc(collection(db, 'messages'), {
                ...formData,
                status: 'new',
                createdAt: serverTimestamp(),
            });
            setSent(true);
            setFormData({
                name: '',
                email: '',
                subject: 'Tell a Story (Legacy Films)',
                message: '',
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'messages');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-bg-dark pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 md:py-32">
                <div className="relative z-10 mx-auto max-w-7xl px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        <div className="mb-8 flex items-center gap-4 text-xs font-bold tracking-[0.4em] text-accent-gold uppercase">
                            <div className="h-px w-12 bg-accent-gold/40" />
                            <span>Contact Us</span>
                        </div>
                        <h1 className="mb-10 text-6xl leading-[0.9] font-bold tracking-tighter text-text-primary md:text-8xl">
                            Let's start a <br />
                            <span className="text-accent-gold italic">
                                conversation.
                            </span>
                        </h1>
                        <p className="mb-6 max-w-2xl text-xl leading-relaxed font-light text-text-muted md:text-2xl">
                            Whether you're a family with a story to tell, a care
                            home looking for storytelling services, or a partner
                            with an idea — we'd love to hear from you.
                        </p>
                    </motion.div>
                </div>

                {/* Decorative Grid Background */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </section>

            {/* Main Content */}
            <section className="border-t border-border-subtle px-8 py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-24 lg:grid-cols-2">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-12"
                        >
                            <div>
                                <h2 className="mb-4 text-3xl font-bold tracking-tight text-text-primary">
                                    Send a Message
                                </h2>
                                <p className="text-text-muted">
                                    Tell us a bit about what's on your mind.
                                </p>
                            </div>

                            {sent ? (
                                <div className="animate-in rounded-3xl border border-accent-gold/20 bg-accent-gold/5 p-12 text-center duration-500 zoom-in-95">
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold/20">
                                        <Send
                                            className="text-accent-gold"
                                            size={32}
                                        />
                                    </div>
                                    <h3 className="mb-4 text-2xl font-bold text-text-primary italic">
                                        Message Sent
                                    </h3>
                                    <p className="mb-8 text-text-muted italic">
                                        Thank you for reaching out. We've
                                        received your message and will be in
                                        touch shortly.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSent(false)}
                                    >
                                        Send another message
                                    </Button>
                                </div>
                            ) : (
                                <form
                                    className="space-y-8"
                                    onSubmit={handleSubmit}
                                >
                                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold tracking-widest text-text-muted uppercase">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                placeholder="Nnanna Adim"
                                                className="w-full rounded-2xl border border-border-subtle bg-surface px-6 py-4 text-sm text-text-primary transition-all outline-none placeholder:text-text-muted/30 focus:border-accent-gold"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold tracking-widest text-text-muted uppercase">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        email: e.target.value,
                                                    }))
                                                }
                                                placeholder="hello@uloak.co.uk"
                                                className="w-full rounded-2xl border border-border-subtle bg-surface px-6 py-4 text-sm text-text-primary transition-all outline-none placeholder:text-text-muted/30 focus:border-accent-gold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">
                                            Subject
                                        </label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    subject: e.target.value,
                                                }))
                                            }
                                            className="w-full appearance-none rounded-2xl border border-border-subtle bg-surface px-6 py-4 text-sm text-text-primary transition-all outline-none focus:border-accent-gold"
                                        >
                                            <option>
                                                Tell a Story (Legacy Films)
                                            </option>
                                            <option>Care & Reminiscence</option>
                                            <option>Academic Research</option>
                                            <option>
                                                Business & Partnerships
                                            </option>
                                            <option>General Inquiry</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">
                                            Message
                                        </label>
                                        <textarea
                                            rows={6}
                                            required
                                            value={formData.message}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    message: e.target.value,
                                                }))
                                            }
                                            placeholder="Share your thoughts with us..."
                                            className="w-full resize-none rounded-2xl border border-border-subtle bg-surface px-6 py-4 text-sm text-text-primary transition-all outline-none placeholder:text-text-muted/30 focus:border-accent-gold"
                                        ></textarea>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={sending}
                                        className="flex w-full items-center justify-center gap-3 rounded-2xl py-5"
                                    >
                                        {sending
                                            ? 'Sending...'
                                            : 'Send Message'}{' '}
                                        <Send size={18} />
                                    </Button>
                                </form>
                            )}
                        </motion.div>

                        {/* Sidebar info */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-16 lg:pl-24"
                        >
                            <div className="space-y-12">
                                <h2 className="text-3xl font-bold tracking-tight text-text-primary">
                                    Get in Touch
                                </h2>
                                <div className="grid grid-cols-1 gap-12">
                                    {contactInfo.map((info, i) => (
                                        <div
                                            key={i}
                                            className="group flex items-start gap-6"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface text-text-muted transition-all duration-500 group-hover:border-accent-gold group-hover:text-accent-gold">
                                                <info.icon size={22} />
                                            </div>
                                            <div>
                                                <p className="mb-1 text-[10px] font-bold tracking-widest text-accent-gold uppercase italic">
                                                    {info.label}
                                                </p>
                                                {info.link ? (
                                                    <a
                                                        href={info.link}
                                                        className="text-lg font-medium text-text-primary transition-colors hover:text-accent-gold"
                                                    >
                                                        {info.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-lg font-medium text-text-primary">
                                                        {info.value}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Map Card */}
                        <div className="group relative col-span-full h-[400px] overflow-hidden rounded-[40px] border border-border-subtle bg-surface">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d153835.3742416194!2d-1.2847055734375005!3d52.9548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4879c2049e79435b%3A0x86f91605ec7a602c!2sNottingham!5e0!3m2!1sen!2suk!4v1714472000000!5m2!1sen!2suk"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Uloak Headquarters - Nottingham"
                                className="opacity-80 contrast-[1.2] grayscale invert-[0.9] transition-all duration-700 hover:opacity-100 hover:contrast-100 [[data-theme='light']_&]:invert-0"
                            ></iframe>

                            <div className="pointer-events-none absolute right-6 bottom-6 left-6 rounded-2xl border border-border-subtle bg-surface/90 p-6 backdrop-blur-md transition-opacity duration-500 group-hover:opacity-0">
                                <p className="mb-1 text-[10px] font-bold tracking-widest text-accent-gold uppercase italic">
                                    Our Location
                                </p>
                                <h4 className="text-xl font-bold tracking-tighter text-text-primary">
                                    Nottingham, UK
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
