// File: app/coming-soon/page.tsx
"use client";

import { CountdownTimer } from "@/components/client/Coming-soon/CountdownTimer";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const socials = [
        { href: "#", icon: <FaFacebookF /> },
        { href: "#", icon: <FaLinkedinIn /> },
        { href: "#", icon: <FaTwitter /> },
        { href: "#", icon: <FaInstagram /> },
];

export default function ComingSoonPage() {
        const launchDate = new Date("2026-12-31T00:00:00");

        return (
                <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight text-center p-4">
                        <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col items-center gap-4"
                        >
                                <motion.div variants={itemVariants} className="p-6 bg-white/60 rounded-full shadow-lg">
                                        <Rocket size={48} className="text-brand-purple" strokeWidth={1.5} />
                                </motion.div>

                                <motion.h1
                                        variants={itemVariants}
                                        className="text-4xl md:text-6xl font-bold font-roboto-serif text-brand-black mt-4"
                                >
                                        Something Big is Coming Soon
                                </motion.h1>

                                <motion.p variants={itemVariants} className="max-w-lg text-brand-grey">
                                        We are working hard to bring you a new and exciting experience. Stay tuned for
                                        our launch!
                                </motion.p>

                                <motion.div variants={itemVariants}>
                                        <CountdownTimer targetDate={launchDate} />
                                </motion.div>

                                <motion.div variants={itemVariants} className="mt-6 w-full max-w-md">
                                        <p className="mb-4 text-sm font-medium">Be the first to know when we launch:</p>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                                <input
                                                        type="email"
                                                        placeholder="Enter your email address"
                                                        className="flex-grow px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple"
                                                />
                                                <button className="px-6 py-3 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90 transition-colors">
                                                        Notify Me
                                                </button>
                                        </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="mt-8 flex items-center gap-4">
                                        {socials.map((social, index) => (
                                                <Link
                                                        key={index}
                                                        href={social.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 text-brand-purple shadow-md hover:bg-brand-purple hover:text-white transition-all duration-300"
                                                >
                                                        {social.icon}
                                                </Link>
                                        ))}
                                </motion.div>
                        </motion.div>
                </section>
        );
}
