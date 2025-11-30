"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import FloatingDropdown from "./FloatingDropdown";

export default function NavigationLinks() {
        const [mounted, setMounted] = useState(false);
        const { user } = useAuthStore();

        useEffect(() => {
                setMounted(true);
        }, []);

        return (
                <nav className="hidden lg:flex items-center gap-8">
                        <Link
                                href="/"
                                prefetch={true}
                                className="relative text-brand-black text-p2 font-manrope font-medium hover:text-brand-orange transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-orange after:transition-all after:duration-300 hover:after:w-full"
                        >
                                Home
                        </Link>

                        <Link
                                href="/about"
                                prefetch={true}
                                className="relative text-brand-black text-p2 font-manrope font-medium hover:text-brand-orange transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-orange after:transition-all after:duration-300 hover:after:w-full"
                        >
                                About
                        </Link>

                        <FloatingDropdown
                                align="left"
                                className="w-52"
                                trigger={
                                        <button className="flex items-center gap-1 text-brand-black text-p2 font-manrope font-medium hover:text-brand-orange transition-colors">
                                                Menu
                                                <ChevronDown className="w-4 h-4" />
                                        </button>
                                }
                        >
                                <div className="bg-brand-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                        <div className="py-2">
                                                <Link
                                                        href="/restaurants"
                                                        prefetch={true}
                                                        className="block px-4 py-2.5 text-brand-black font-manrope text-p2 hover:bg-brand-yellowlight transition-colors"
                                                >
                                                        Restaurants
                                                </Link>
                                                <Link
                                                        href="/cart"
                                                        prefetch={true}
                                                        className="block px-4 py-2.5 text-brand-black font-manrope text-p2 hover:bg-brand-yellowlight transition-colors"
                                                >
                                                        Cart
                                                </Link>
                                                <Link
                                                        href="/checkout"
                                                        prefetch={true}
                                                        className="block px-4 py-2.5 text-brand-black font-manrope text-p2 hover:bg-brand-yellowlight transition-colors"
                                                >
                                                        Checkout
                                                </Link>
                                                <Link
                                                        href="/contact"
                                                        prefetch={true}
                                                        className="block px-4 py-2.5 text-brand-black font-manrope text-p2 hover:bg-brand-yellowlight transition-colors"
                                                >
                                                        Contact
                                                </Link>
                                                {mounted && user?.role === "ADMIN" && (
                                                        <Link
                                                                href="/admin"
                                                                prefetch={true}
                                                                className="block px-4 py-2.5 text-brand-black font-manrope text-p2 hover:bg-brand-yellowlight transition-colors"
                                                        >
                                                                Admin
                                                        </Link>
                                                )}
                                                {mounted && user?.role === "MERCHANT" && (
                                                        <Link
                                                                href={`/merchant/${user.id}`}
                                                                prefetch={true}
                                                                className="block px-4 py-2.5 text-brand-black font-manrope text-p2 hover:bg-brand-yellowlight transition-colors"
                                                        >
                                                                Merchant
                                                        </Link>
                                                )}
                                        </div>
                                </div>
                        </FloatingDropdown>
                </nav>
        );
}
