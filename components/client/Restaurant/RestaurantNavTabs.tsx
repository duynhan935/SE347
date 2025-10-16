// File: app/_components/client/Restaurant/RestaurantNavTabs.tsx
"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navLinks = [
        { name: "Menu", href: "#menu" },
        { name: "About", href: "#about" },
        { name: "Reviews", href: "#reviews" },
];

export default function RestaurantNavTabs() {
        const [isSticky, setSticky] = useState(false);

        useEffect(() => {
                const handleScroll = () => {
                        const heroHeight = 400;
                        if (window.scrollY > heroHeight) setSticky(true);
                        else setSticky(false);
                };
                window.addEventListener("scroll", handleScroll);
                return () => window.removeEventListener("scroll", handleScroll);
        }, []);

        return (
                <div
                        className={cn(
                                "bg-white transition-all duration-300 z-30",
                                isSticky ? "sticky top-0 shadow-md" : "relative"
                        )}
                >
                        <div className="custom-container">
                                <nav className="flex items-center gap-x-8 -mb-px">
                                        {navLinks.map((link) => (
                                                <a
                                                        key={link.name}
                                                        href={link.href}
                                                        className="py-4 text-sm font-semibold text-gray-500 hover:text-brand-purple border-b-2 border-transparent hover:border-brand-purple"
                                                >
                                                        {link.name}
                                                </a>
                                        ))}
                                </nav>
                        </div>
                </div>
        );
}
