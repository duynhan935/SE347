"use client";

import Button from "@/components/client/Button";
import { motion } from "framer-motion";
import Link from "next/link";

// Define animation variants
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

export default function NotFoundPage() {
        return (
                <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight text-center p-4">
                        <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col items-center gap-4"
                        >
                                {/* ✨ Effect for each digit "404" */}
                                <h1 className="text-8xl md:text-9xl font-bold font-roboto-serif text-brand-black flex gap-x-2 md:gap-x-4">
                                        <motion.span variants={itemVariants}>4</motion.span>
                                        <motion.span
                                                variants={itemVariants}
                                                className="text-brand-purple"
                                                whileHover={{ rotate: 360 }}
                                                transition={{ duration: 0.5 }}
                                        >
                                                0
                                        </motion.span>
                                        <motion.span variants={itemVariants}>4</motion.span>
                                </h1>

                                <motion.h2
                                        variants={itemVariants}
                                        className="text-2xl md:text-3xl font-semibold font-roboto-serif mt-2"
                                >
                                        Page Not Found
                                </motion.h2>

                                <motion.p variants={itemVariants} className="max-w-md text-brand-grey">
                                        Sorry, the page you&apos;re looking for doesn&apos;t exist. If you think
                                        something is broken, report a problem.
                                </motion.p>

                                <motion.div variants={itemVariants}>
                                        <Link href="/">
                                                <Button className="cursor-pointer mt-6 bg-brand-purple text-white hover:bg-brand-purple/90">
                                                        Go To Home
                                                </Button>
                                        </Link>
                                </motion.div>
                        </motion.div>
                </section>
        );
}
