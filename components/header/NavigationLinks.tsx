"use client";

import { MerchantRequestForm } from "@/components/auth/MerchantRequestForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { ChevronDown, Store, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FloatingDropdown from "./FloatingDropdown";

export default function NavigationLinks() {
        const [mounted, setMounted] = useState(false);
        const [showMerchantForm, setShowMerchantForm] = useState(false);
        const { user, isAuthenticated } = useAuthStore();

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
                                                        href="/payment"
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
                                                {mounted &&
                                                        isAuthenticated &&
                                                        user?.role !== "MERCHANT" &&
                                                        user?.role !== "ADMIN" && (
                                                                <button
                                                                        onClick={() => setShowMerchantForm(true)}
                                                                        className="w-full text-left px-4 py-2.5 text-brand-black font-manrope text-p2 hover:bg-brand-yellowlight transition-colors flex items-center gap-2"
                                                                >
                                                                        <Store className="h-4 w-4" />
                                                                        Đăng ký Merchant
                                                                </button>
                                                        )}
                                                {mounted && user?.role === "MERCHANT" && (
                                                        <Link
                                                                href="/merchant"
                                                                prefetch={true}
                                                                className="block px-4 py-2.5 text-brand-black font-manrope text-p2 hover:bg-brand-yellowlight transition-colors"
                                                        >
                                                                Merchant
                                                        </Link>
                                                )}
                                        </div>
                                </div>
                        </FloatingDropdown>

                        {/* Merchant Request Form Dialog */}
                        {showMerchantForm && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                        <div
                                                className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
                                                onClick={(e) => e.stopPropagation()}
                                        >
                                                <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-xl font-bold text-gray-900">
                                                                Yêu cầu trở thành Merchant
                                                        </h3>
                                                        <button
                                                                onClick={() => setShowMerchantForm(false)}
                                                                className="text-gray-400 hover:text-gray-600"
                                                                aria-label="Close merchant registration form"
                                                                title="Close"
                                                        >
                                                                <X className="w-5 h-5" />
                                                        </button>
                                                </div>
                                                <MerchantRequestForm
                                                        initialEmail={user?.email || ""}
                                                        initialUsername={user?.username || ""}
                                                        onSuccess={() => {
                                                                setShowMerchantForm(false);
                                                                toast.success(
                                                                        "Yêu cầu đã được gửi! Vui lòng kiểm tra email để xác nhận tài khoản và chờ admin phê duyệt."
                                                                );
                                                        }}
                                                        onCancel={() => setShowMerchantForm(false)}
                                                />
                                        </div>
                                </div>
                        )}
                </nav>
        );
}
