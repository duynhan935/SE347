"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { Home, Menu, Moon, Search, Sun, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MerchantNotificationBell } from "../merchant/MerchantNotificationBell";
import { AdminNotificationBell } from "./AdminNotificationBell";
import { useTheme } from "./ThemeProvider";

interface HeaderProps {
    sidebarOpen?: boolean;
    setSidebarOpen?: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
    const { theme, toggleTheme } = useTheme();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const settingsHref = user?.role === "MERCHANT" ? "/merchant/manage/settings" : "/admin/settings";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-40 flex w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-grow items-center justify-between px-4 py-3 shadow-sm md:px-6 2xl:px-11">
                {/* Left side */}
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen?.(!sidebarOpen)}
                        className="h-11 w-11 inline-flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        aria-label="Toggle sidebar"
                        aria-expanded={!!sidebarOpen}
                    >
                        <Menu size={24} />
                    </button>
                </div>

                <div></div>

                {/* Right side */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                    {/* Mobile search toggle */}
                    <button
                        onClick={() => setMobileSearchOpen((v) => !v)}
                        className="sm:hidden h-11 w-11 inline-flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        aria-label={mobileSearchOpen ? "Close search" : "Open search"}
                    >
                        {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
                    </button>

                    {/* Notifications */}
                    {user?.role === "ADMIN" ? (
                        <AdminNotificationBell />
                    ) : user?.role === "MERCHANT" ? (
                        <MerchantNotificationBell />
                    ) : null}

                    {/* User dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="h-11 inline-flex items-center gap-3 rounded-lg px-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Open user menu"
                        >
                            <div className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center text-white font-semibold">
                                {user?.username?.charAt(0).toUpperCase() || "A"}
                            </div>
                            <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white">
                                {user?.username || "Admin"}
                            </span>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                <Link
                                    href={settingsHref}
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Settings
                                </Link>
                                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-orange hover:bg-brand-orange/10 dark:hover:bg-brand-orange/20"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <Home size={16} />
                                    Go to Homepage
                                </Link>
                                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                                <button
                                    onClick={() => {
                                        logout();
                                        window.location.href = "/login";
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile search input row */}
            {mobileSearchOpen && (
                <div className="sm:hidden w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
