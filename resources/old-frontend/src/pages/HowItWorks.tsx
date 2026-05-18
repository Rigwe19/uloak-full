import { motion } from 'motion/react';
import { Camera, BookOpen, Share2, Shield, Film, Users } from 'lucide-react';
import { Button } from '../components/UI';
import { Link } from 'react-router-dom';

const steps = [
    {
        title: 'Share your story',
        desc: 'Start with what matters to you. Our guided system helps you find the right thread to pull from your family history.',
        icon: Users,
    },
    {
        title: 'Capture what matters',
        desc: 'Record high-quality video or voice notes directly through the platform, or upload precious existing archives.',
        icon: Camera,
    },
    {
        title: 'Organise and connect',
        desc: 'Sort memories into curated rooms. Connect stories together to build a rich tapestry of heritage.',
        icon: BookOpen,
    },
    {
        title: 'Preserve privately',
        desc: 'Your stories stay in your family. Our private architecture ensures control and longevity for generations.',
        icon: Shield,
    },
    {
        title: 'Create a legacy film',
        desc: 'Opt for our professional production service to turn your recorded stories into cinematic short documentaries.',
        icon: Film,
    },
    {
        title: 'Pass it on',
        desc: "Invite family members to view, contribute, and inherit the digital house of stories you've built.",
        icon: Share2,
    },
];

export default function HowItWorks() {
    return (
        <div className="pt-40 pb-32">
            <div className="mx-auto max-w-7xl px-8">
                <div className="mb-32 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 text-5xl font-bold md:text-7xl"
                    >
                        How it Works
                    </motion.h1>
                    <p className="mx-auto max-w-2xl text-xl leading-relaxed font-light text-text-muted">
                        Building a house of stories is a journey. We walk with
                        you through every step of preservation.
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical line for desktop */}
                    <div className="absolute top-0 bottom-0 left-1/2 hidden w-[1px] bg-border-subtle lg:block" />

                    <div className="grid gap-24 lg:gap-40">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className={`flex flex-col items-center gap-12 lg:flex-row lg:gap-24 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
                            >
                                <div className="w-full flex-1">
                                    <div
                                        className={`flex flex-col ${i % 2 !== 0 ? 'lg:items-start' : 'lg:items-end'}`}
                                    >
                                        <div className="mb-4 flex items-center gap-4 text-accent-gold">
                                            <span className="font-outfit text-3xl font-bold opacity-30">
                                                0{i + 1}
                                            </span>
                                            <div className="h-px w-12 bg-accent-gold/30" />
                                        </div>
                                        <h2
                                            className={`mb-6 text-3xl font-bold text-text-primary md:text-4xl ${i % 2 !== 0 ? 'lg:text-left' : 'text-left lg:text-right'}`}
                                        >
                                            {step.title}
                                        </h2>
                                        <p
                                            className={`max-w-md text-lg leading-relaxed text-text-muted ${i % 2 !== 0 ? 'lg:text-left' : 'text-left lg:text-right'}`}
                                        >
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border border-border-subtle bg-bg-dark lg:h-32 lg:w-32">
                                        <step.icon
                                            size={32}
                                            className="text-accent-gold lg:h-10 lg:w-10"
                                        />
                                    </div>
                                    {/* Glowing halo */}
                                    <div className="absolute inset-0 scale-150 rounded-full bg-accent-gold/10 blur-[40px]" />
                                </div>

                                <div className="hidden flex-1 lg:block" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-40 text-center">
                    <Link to="/login">
                        <Button className="px-12 py-5 text-xl">
                            Start Your Journey
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
