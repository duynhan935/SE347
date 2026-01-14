"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut, MapPin, Settings, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const navLinks = [
        { name: "My Profile", href: "/account", icon: User },
        { name: "Order History", href: "/account/orders", icon: ShoppingBag },
        { name: "Addresses", href: "/account/addresses", icon: MapPin },
        { name: "Settings", href: "/account/settings", icon: Settings },
];

export default function AccountSidebar() {
        const pathname = usePathname();
        const router = useRouter();
        const { logout } = useAuthStore();
        const [isLoggingOut, setIsLoggingOut] = useState(false);

        const handleLogout = async () => {
                // Prevent multiple clicks
                if (isLoggingOut) return;

                setIsLoggingOut(true);

                // Show loading toast
                const loadingToast = toast.loading("Logging out...");

                try {
                        // Clear auth state
                        logout();

                        // Small delay to ensure state is cleared before navigation
                        await new Promise((resolve) => setTimeout(resolve, 100));

                        // Dismiss loading and show success
                        toast.dismiss(loadingToast);
                        toast.success("Logged out successfully! See you soon 👋", { duration: 3000 });

                        // Navigate to login page
                        router.replace("/login");
                } catch (error) {
                        // Handle any logout errors
                        toast.dismiss(loadingToast);
                        toast.error("Failed to logout. Please try again.", { duration: 3000 });
                        console.error("Logout error:", error);
                } finally {
                        // Reset logging out state after navigation
                        setTimeout(() => setIsLoggingOut(false), 500);
                }
        };

        return (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Account Menu</h3>
                        <nav className="space-y-2">
                                {navLinks.map((link) => {
                                        const isActive = pathname === link.href;
                                        return (
                                                <Link
                                                        key={link.name}
                                                        href={link.href}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                                                isActive
                                                                        ? "bg-[#EE4D2D] text-white"
                                                                        : "text-gray-600 hover:bg-orange-50 hover:text-[#EE4D2D]"
                                                        }`}
                                                >
                                                        <link.icon className="w-5 h-5" />
                                                        <span>{link.name}</span>
                                                </Link>
                                        );
                                })}
                                <hr className="my-4" />
                                <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                        <LogOut className="w-5 h-5" />
                                        <span>Log Out</span>
                                </button>
                        </nav>
                </div>
        );
}
