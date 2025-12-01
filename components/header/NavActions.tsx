"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CartDropdown from "./CartDropdown";
import FloatingDropdown from "./FloatingDropdown";

export default function NavActions() {
    const [mounted, setMounted] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { isAuthenticated, user, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        const loadingToast = toast.loading("Logging out...");

        try {
            logout();
            await new Promise((resolve) => setTimeout(resolve, 100));
            toast.dismiss(loadingToast);
            toast.success("Logged out successfully! See you soon 👋", { duration: 3000 });
            router.replace("/");
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Failed to logout. Please try again.", { duration: 3000 });
            console.error("Logout error:", error);
        } finally {
            setTimeout(() => setIsLoggingOut(false), 500);
        }
    };

    return (
        <div className="hidden lg:flex items-center gap-6">
            {/* Cart Dropdown */}
            <CartDropdown />

            {/* User Avatar / Auth Buttons */}
            {mounted && isAuthenticated ? (
                <FloatingDropdown
                    align="right"
                    className="w-56"
                    trigger={
                        <button
                            aria-label="User menu"
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-purple hover:bg-brand-purpledark transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                        >
                            <User className="w-5 h-5 text-white" />
                        </button>
                    }
                >
                    <div className="bg-brand-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-brand-black font-manrope">
                                {user?.username || "User"}
                            </p>
                            <p className="text-xs text-brand-grey font-manrope mt-0.5">{user?.role}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            <Link
                                href="/account"
                                prefetch={true}
                                className="flex items-center px-4 py-2.5 text-brand-black font-manrope text-p2 hover:bg-brand-yellowlight transition-colors"
                            >
                                <User className="mr-3 h-4 w-4 text-brand-grey" />
                                My Account
                            </Link>

                            {user?.role === "ADMIN" && (
                                <Link
                                    href="/admin"
                                    prefetch={true}
                                    className="flex items-center px-4 py-2.5 text-brand-black font-manrope text-p2 hover:bg-brand-yellowlight transition-colors"
                                >
                                    <span className="mr-3 h-4 w-4" />
                                    Admin Panel
                                </Link>
                            )}

                            {user?.role === "MERCHANT" && (
                                <Link
                                    href="/merchant"
                                    prefetch={true}
                                    className="flex items-center px-4 py-2.5 text-brand-black font-manrope text-p2 hover:bg-brand-yellowlight transition-colors"
                                >
                                    <span className="mr-3 h-4 w-4" />
                                    Merchant Dashboard
                                </Link>
                            )}

                            <div className="border-t border-gray-100 my-1" />

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-4 py-2.5 text-red-600 font-manrope text-p2 hover:bg-red-50 transition-colors text-left"
                            >
                                <LogOut className="mr-3 h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </FloatingDropdown>
            ) : mounted && !isAuthenticated ? (
                <>
                    <Link href="/login" prefetch={true}>
                        <button className="text-brand-black hover:text-brand-orange transition-colors font-manrope text-p2 font-medium">
                            Sign In
                        </button>
                    </Link>
                    <Link href="/register" prefetch={true}>
                        <button className="px-5 py-2.5 bg-brand-black hover:bg-brand-purpledark text-brand-white font-manrope text-p2 font-medium rounded-full transition-colors">
                            Sign Up
                        </button>
                    </Link>
                </>
            ) : (
                <div className="w-20 h-10" />
            )}
        </div>
    );
}
