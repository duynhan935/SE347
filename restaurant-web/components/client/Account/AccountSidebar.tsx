"use client";

import { LogOut, Settings, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
        { name: "My Profile", href: "/account", icon: User },
        { name: "Order History", href: "/account/orders", icon: ShoppingBag },
        { name: "Settings", href: "/account/settings", icon: Settings },
];

export default function AccountSidebar() {
        const pathname = usePathname();

        return (
                <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Account Menu</h3>
                        <nav className="space-y-2">
                                {navLinks.map((link) => {
                                        const isActive = pathname === link.href;
                                        return (
                                                <Link
                                                        key={link.name}
                                                        href={link.href}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                                                                isActive
                                                                        ? "bg-brand-purple text-white"
                                                                        : "text-gray-700 hover:bg-gray-100"
                                                        }`}
                                                >
                                                        <link.icon className="w-5 h-5" />
                                                        <span>{link.name}</span>
                                                </Link>
                                        );
                                })}
                                <hr className="my-4" />
                                <button className="flex w-full items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                        <LogOut className="w-5 h-5" />
                                        <span>Log Out</span>
                                </button>
                        </nav>
                </div>
        );
}
