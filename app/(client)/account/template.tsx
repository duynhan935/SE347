// File: app/account/template.tsx
"use client";

import { motion } from "framer-motion";

// Định nghĩa các biến thể animation cho hiệu ứng
const variants = {
        hidden: { opacity: 0, x: 20, y: 0 }, // Trạng thái ban đầu: mờ, lệch sang phải 20px
        enter: { opacity: 1, x: 0, y: 0 }, // Trạng thái kết thúc: rõ, ở vị trí 0
};

export default function Template({ children }: { children: React.ReactNode }) {
        return (
                <motion.main
                        variants={variants}
                        initial="hidden" // Bắt đầu với trạng thái 'hidden'
                        animate="enter" // Animate đến trạng thái 'enter'
                        transition={{ type: "spring", duration: 1.2 }} // Tùy chỉnh tốc độ và kiểu animation
                >
                        {children}
                </motion.main>
        );
}
