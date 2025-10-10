"use client";

import { useEffect, useState } from "react";

const navLinks = [
        { id: "menu", label: "Menu" },
        { id: "about", label: "About" },
        { id: "reviews", label: "Reviews" },
];

export default function RestaurantNavTabs() {
        const [activeTab, setActiveTab] = useState("menu");

        useEffect(() => {
                const handleScroll = () => {
                        const scrollPosition = window.scrollY;
                        const currentSection = navLinks.find((link) => {
                                const el = document.getElementById(link.id);
                                if (!el) return false;
                                const offsetTop = el.offsetTop - 150;
                                const offsetHeight = el.offsetHeight;
                                return scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight;
                        });

                        if (currentSection) {
                                setActiveTab((prev) => (prev !== currentSection.id ? currentSection.id : prev));
                        }
                };

                window.addEventListener("scroll", handleScroll, { passive: true });
                handleScroll(); // set initial active tab on mount
                return () => window.removeEventListener("scroll", handleScroll);
        }, []);

        const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
                e.preventDefault();
                const section = document.getElementById(sectionId);
                if (section) {
                        const topPos = section.getBoundingClientRect().top + window.pageYOffset - 100;

                        window.scrollTo({
                                top: topPos,
                                behavior: "smooth",
                        });
                }
        };

        return (
                <nav className="sticky top-0 bg-white shadow-sm z-20 p-3  md:p-0">
                        <div className="custom-container">
                                <div className="max-w-4xl mx-auto">
                                        <div className="flex items-center gap-8 border-b">
                                                {navLinks.map((link) => (
                                                        <a
                                                                key={link.id}
                                                                href={`#${link.id}`}
                                                                onClick={(e) => handleTabClick(e, link.id)}
                                                                className={`font-semibold py-4 border-b-2 transition-colors duration-200 
                                    ${
                                            activeTab === link.id
                                                    ? "border-black text-black"
                                                    : "border-transparent text-gray-500 hover:text-black"
                                    }`}
                                                        >
                                                                {link.label}
                                                        </a>
                                                ))}
                                        </div>
                                </div>
                        </div>
                </nav>
        );
}
