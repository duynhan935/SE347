"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

interface FloatingDropdownProps {
        children: ReactNode;
        trigger: ReactNode;
        align?: "left" | "right" | "center";
        className?: string;
}

const dropdownVariants: Variants = {
        hidden: {
                opacity: 0,
                y: -10,
                scale: 0.95,
        },
        visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                        duration: 0.2,
                },
        },
        exit: {
                opacity: 0,
                y: -10,
                scale: 0.95,
                transition: {
                        duration: 0.15,
                },
        },
};

export default function FloatingDropdown({ children, trigger, align = "left", className = "" }: FloatingDropdownProps) {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);
        const triggerRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
                const handleClickOutside = (event: MouseEvent) => {
                        if (
                                dropdownRef.current &&
                                !dropdownRef.current.contains(event.target as Node) &&
                                triggerRef.current &&
                                !triggerRef.current.contains(event.target as Node)
                        ) {
                                setIsOpen(false);
                        }
                };

                if (isOpen) {
                        document.addEventListener("mousedown", handleClickOutside);
                }

                return () => {
                        document.removeEventListener("mousedown", handleClickOutside);
                };
        }, [isOpen]);

        const getAlignClasses = () => {
                switch (align) {
                        case "right":
                                return "right-0";
                        case "center":
                                return "left-1/2 -translate-x-1/2";
                        default:
                                return "left-0";
                }
        };

        return (
                <div className="relative">
                        <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
                                {trigger}
                        </div>

                        <AnimatePresence>
                                {isOpen && (
                                        <motion.div
                                                ref={dropdownRef}
                                                variants={dropdownVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className={`absolute top-full mt-2 ${getAlignClasses()} ${className}`}
                                        >
                                                {children}
                                        </motion.div>
                                )}
                        </AnimatePresence>
                </div>
        );
}
