"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut, MapPin, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const navLinks = [
    { name: "My Profile", href: "/account", icon: User },
    { name: "My Orders", href: "/orders", icon: ShoppingBag },
    { name: "Address Book", href: "/account/addresses", icon: MapPin },
];

export default function OrderHistorySidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        try {
            await logout();
            toast.success("Logged out successfully");
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to logout");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Account Menu</h3>
            <nav className="space-y-2">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href === "/orders" && pathname.startsWith("/orders"));
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-[#EE4D2D] text-white"
                                    : "text-gray-700 hover:bg-gray-100"
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
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
}

