"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";

type ScrollRevealProps = {
        children: React.ReactNode;
        delay?: number;
        className?: string;
        // ✨ 1. Thêm prop 'variants' để có thể tùy chỉnh animation
        variants?: Variants;
};

// ✨ 2. Tạo một bộ variant mặc định
const defaultVariants: Variants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
};

export default function ScrollReveal({
        children,
        delay = 0,
        className,
        variants = defaultVariants, // Sử dụng variant mặc định nếu không có tùy chỉnh
}: ScrollRevealProps) {
        const ref = useRef(null);
        const isInView = useInView(ref, { once: true, amount: 0.2 });

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
