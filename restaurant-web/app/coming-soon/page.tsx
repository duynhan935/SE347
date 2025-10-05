// File: app/coming-soon/page.tsx
"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

// Tái sử dụng các biến thể animation từ trang 404
const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
                opacity: 1,
                transition: {
                        staggerChildren: 0.15,
                },
        },
};

const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
                y: 0,
                opacity: 1,
                transition: {
                        duration: 0.5,
                },
        },
};

// Dữ liệu cho các icon mạng xã hội
const socials = [
        { href: "#", icon: <FaFacebookF /> },
        { href: "#", icon: <FaLinkedinIn /> },
        { href: "#", icon: <FaTwitter /> },
        { href: "#", icon: <FaInstagram /> },
];

export default function ComingSoonPage() {
        return (
                <section className="min-h-screen flex items-center justify-center bg-white text-center p-4">
                        <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col items-center gap-4"
                        >
                                {/* ✨ Icon thay thế cho hình ảnh */}
                                <motion.div variants={itemVariants} className="p-6 bg-brand-yellowlight rounded-full">
                                        <Rocket size={48} className="text-brand-purple" strokeWidth={1.5} />
                                </motion.div>

                                <motion.h1
                                        variants={itemVariants}
                                        className="text-4xl md:text-6xl font-bold font-roboto-serif text-brand-black mt-4"
                                >
                                        Coming Soon
                                </motion.h1>

                                <motion.p variants={itemVariants} className="max-w-md text-brand-grey">
                                        Are you Ready to get something new from us? Then subscribe the news latter to
                                        get latest updates?
                                </motion.p>

                                {/* ✨ Social Media Links */}
                                <motion.div variants={itemVariants} className="mt-6 flex items-center gap-4">
                                        {socials.map((social, index) => (
                                                <Link
                                                        key={index}
                                                        href={social.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 flex items-center justify-center rounded-md bg-brand-purple text-white hover:bg-brand-purple/80 transition-colors"
                                                >
                                                        {social.icon}
                                                </Link>
                                        ))}
                                </motion.div>
                        </motion.div>
                </section>
        );
}
