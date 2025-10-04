// File: app/_components/animations/ScrollReveal.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type ScrollRevealProps = {
        children: React.ReactNode;
        delay?: number;
        className?: string;
};

export default function ScrollReveal({ children, delay = 0, className }: ScrollRevealProps) {
        const ref = useRef(null);
        // useInView sẽ trả về true khi component lọt vào màn hình
        const isInView = useInView(ref, {
                once: true, // Chỉ animate một lần
                amount: 0.2, // Animate khi 20% component được nhìn thấy
        });

        const variants = {
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
        };

        return (
                <motion.div
                        ref={ref}
                        variants={variants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        transition={{ duration: 0.6, delay }}
                        className={className}
                >
                        {children}
                </motion.div>
        );
}
