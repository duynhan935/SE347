"use client";

import { authApi } from "@/lib/api/authApi";
import { Menu, Moon, Sun, Search } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { AdminNotificationBell } from "./AdminNotificationBell";
import { MerchantNotificationBell } from "../merchant/MerchantNotificationBell";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
    sidebarOpen?: boolean;
    setSidebarOpen?: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
    const { theme, toggleTheme } = useTheme();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
            <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-sm md:px-6 2xl:px-11">
                {/* Left side */}
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen?.(!sidebarOpen)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* Search bar */}
                <div className="hidden sm:block flex-1 max-w-md">
                    <div className="relative">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        />
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {/* Dark mode toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"
                    >
                        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
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
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            <div className="w-9 h-9 rounded-full bg-brand-yellow flex items-center justify-center text-white font-semibold">
                                {user?.username?.charAt(0).toUpperCase() || "A"}
                            </div>
                            <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white">
                                {user?.username || "Admin"}
                            </span>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                <Link
                                    href="/admin/profile"
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/admin/settings"
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Settings
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
        </header>
    );
}
