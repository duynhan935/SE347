"use client";

import { useEffect, useState } from "react";
import LogoComponent from "./Logo";
import MobileMenu from "./MobileMenu";
import NavActions from "./NavActions";
import NavigationLinks from "./NavigationLinks";
import SearchBar from "./SearchBar";

export default function Header() {
        const [isScrolled, setIsScrolled] = useState(false);

        useEffect(() => {
                const handleScroll = () => {
                        setIsScrolled(window.scrollY > 10);
                };

                window.addEventListener("scroll", handleScroll);
                return () => window.removeEventListener("scroll", handleScroll);
        }, []);

        return (
                <header
                        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                                isScrolled ? "bg-brand-yellow shadow-md" : "bg-brand-yellow"
                        }`}
                >
                        <div className="custom-container">
                                <div className="flex items-center justify-between h-20 px-4 lg:px-6 gap-4 lg:gap-6">
                                        {/* Left: Logo */}
                                        <div className="flex-shrink-0">
                                                <LogoComponent />
                                        </div>

                                        {/* Center: Search Bar */}
                                        <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                                                <SearchBar />
                                        </div>

                                        {/* Right: Navigation Links + Cart + User */}
                                        <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
                                                <NavigationLinks />
                                                {/* Desktop: Show NavActions (icons + user dropdown) */}
                                                <div className="hidden lg:flex items-center gap-3 lg:gap-4">
                                                        <NavActions />
                                                </div>
                                                {/* Mobile: Show MobileMenu (icons + hamburger menu) */}
                                                <MobileMenu />
                                        </div>
                                </div>
                        </div>
                </header>
        );
}
