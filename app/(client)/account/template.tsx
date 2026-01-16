// File: app/account/template.tsx
"use client";

import { motion } from "framer-motion";

// Define animation variants for effect
const variants = {
        hidden: { opacity: 0, x: 20, y: 0 }, // Initial state: faded, shifted right 20px
        enter: { opacity: 1, x: 0, y: 0 }, // Final state: clear, at position 0
};

export default function Template({ children }: { children: React.ReactNode }) {
        return (
                <motion.main
                        variants={variants}
                        initial="hidden" // Start with 'hidden' state
                        animate="enter" // Animate to 'enter' state
                        transition={{ type: "spring", duration: 1.2 }} // Customize speed and animation type
                >
                        {children}
                </motion.main>
        );
}
