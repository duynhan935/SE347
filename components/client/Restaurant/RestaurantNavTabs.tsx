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

        const [activeTab, setActiveTab] = useState("Menu");

        useEffect(() => {
                const handleHashChange = () => {
                        const hash = window.location.hash.slice(1);
                        if (hash === "menu") setActiveTab("Menu");
                        else if (hash === "about") setActiveTab("About");
                        else if (hash === "reviews") setActiveTab("Reviews");
                };

                handleHashChange();
                window.addEventListener("hashchange", handleHashChange);
                return () => window.removeEventListener("hashchange", handleHashChange);
        }, []);

        return (
                <div
                        className={cn(
                                "bg-white transition-all duration-300 z-30 border-b border-gray-200",
                                isSticky ? "sticky top-0 shadow-lg" : "relative"
                        )}
                >
                        <div className="custom-container">
                                <nav className="flex items-center gap-x-2 md:gap-x-8 -mb-px">
                                        {navLinks.map((link) => {
                                                const isActive = activeTab === link.name;
                                                return (
                                                        <a
                                                                key={link.name}
                                                                href={link.href}
                                                                onClick={() => setActiveTab(link.name)}
                                                                className={cn(
                                                                        "py-4 px-2 md:px-0 text-sm md:text-base font-bold transition-all duration-200 relative",
                                                                        isActive
                                                                                ? "text-[#EE4D2D]"
                                                                                : "text-gray-500 hover:text-[#EE4D2D]"
                                                                )}
                                                        >
                                                                {link.name}
                                                                {isActive && (
                                                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EE4D2D] rounded-full" />
                                                                )}
                                                        </a>
                                                );
                                        })}
                                </nav>
                        </div>
                </div>
        );
}
