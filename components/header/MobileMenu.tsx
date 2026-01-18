"use client";

import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { BookOpen, Menu, MessageCircle, Package, ShoppingCart, User, UtensilsCrossed, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MobileMenu() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { isAuthenticated, user, logout, loading } = useAuthStore();
    const { items: cartItems } = useCartStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        setOpen(false);
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
        <>
            {/* Mobile Cart & Menu Button */}
            <div className="flex lg:hidden items-center gap-3">
                {/* Browse foods icon */}
                <Link
                    href="/search"
                    prefetch={true}
                    className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
                    aria-label="Explore foods"
                >
                    <UtensilsCrossed
                        className={`w-5 h-5 ${pathname === "/search" ? "text-brand-orange" : "text-brand-grey"}`}
                    />
                </Link>

                {/* Cart Icon */}
                {isAuthenticated && user && !loading && (
                    <Link href="/cart" prefetch={true} className="relative group">
                        <div className="relative p-2 rounded-full hover:bg-gray-50 transition-colors duration-200">
                            <ShoppingCart className="w-5 h-5 text-brand-grey group-hover:text-brand-black transition-colors" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                                    {cartItemCount > 9 ? "9+" : cartItemCount}
                                </span>
                            )}
                        </div>
                    </Link>
                )}

                {/* Hamburger Menu Button */}
                <button
                    className="p-2 rounded-full hover:bg-gray-50 transition-colors focus:outline-none"
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6 text-brand-black" />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[99] lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile Menu Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-brand-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out lg:hidden ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-h5 font-roboto-serif text-brand-black">Menu</h2>
                    <button
                        className="p-2 rounded-full hover:bg-gray-50 transition-colors focus:outline-none"
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                    >
                        <X className="w-6 h-6 text-brand-black" />
                    </button>
                </div>

                <nav className="flex flex-col p-4 space-y-1">
                    {/* Main actions - authenticated only */}
                    {mounted && isAuthenticated && user && (
                        <>
                            <Link
                                href="/orders"
                                prefetch={true}
                                onClick={() => setOpen(false)}
                                className="text-brand-black text-p2 font-manrope font-medium py-3 px-4 rounded-lg hover:bg-brand-yellowlight hover:text-brand-orange transition-colors flex items-center gap-2"
                            >
                                <Package className="w-5 h-5" />
                                My orders
                            </Link>
                            <Link
                                href="/chat"
                                prefetch={true}
                                onClick={() => setOpen(false)}
                                className="text-brand-black text-p2 font-manrope font-medium py-3 px-4 rounded-lg hover:bg-brand-yellowlight hover:text-brand-orange transition-colors flex items-center gap-2"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Messages
                            </Link>
                            <Link
                                href="/blog"
                                prefetch={true}
                                onClick={() => setOpen(false)}
                                className="text-brand-black text-p2 font-manrope font-medium py-3 px-4 rounded-lg hover:bg-brand-yellowlight hover:text-brand-orange transition-colors flex items-center gap-2"
                            >
                                <BookOpen className="w-5 h-5" />
                                Blog
                            </Link>
                        </>
                    )}

                    {/* Settings Section */}
                    {mounted && isAuthenticated && user && (
                        <>
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                                    <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-brand-black font-manrope">
                                            {user?.username || "User"}
                                        </p>
                                        <p className="text-xs text-brand-grey font-manrope">{user?.email}</p>
                                    </div>
                                </div>
                                <Link
                                    href="/account"
                                    prefetch={true}
                                    onClick={() => setOpen(false)}
                                    className="text-brand-black text-p2 font-manrope font-medium py-3 px-4 rounded-lg hover:bg-brand-yellowlight hover:text-brand-orange transition-colors block"
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/account/addresses"
                                    prefetch={true}
                                    onClick={() => setOpen(false)}
                                    className="text-brand-black text-p2 font-manrope font-medium py-3 px-4 rounded-lg hover:bg-brand-yellowlight hover:text-brand-orange transition-colors block"
                                >
                                    Delivery addresses
                                </Link>
                                {user?.role === "ADMIN" && (
                                    <Link
                                        href="/admin"
                                        prefetch={true}
                                        onClick={() => setOpen(false)}
                                        className="text-brand-black text-p2 font-manrope font-medium py-3 px-4 rounded-lg hover:bg-brand-yellowlight hover:text-brand-orange transition-colors block"
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                {user?.role === "MERCHANT" && (
                                    <Link
                                        href="/merchant"
                                        prefetch={true}
                                        onClick={() => setOpen(false)}
                                        className="text-brand-black text-p2 font-manrope font-medium py-3 px-4 rounded-lg hover:bg-brand-yellowlight hover:text-brand-orange transition-colors block"
                                    >
                                        Merchant Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left text-red-600 text-p2 font-manrope font-medium py-3 px-4 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Log out
                                </button>
                            </div>
                        </>
                    )}

                    {/* Not Authenticated */}
                    {mounted && !isAuthenticated && (
                        <>
                            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                                <Link
                                    href="/login"
                                    prefetch={true}
                                    onClick={() => setOpen(false)}
                                    className="block text-center text-brand-black hover:text-brand-orange transition-colors font-manrope text-p2 font-medium py-3 px-4 rounded-lg hover:bg-gray-50"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    prefetch={true}
                                    onClick={() => setOpen(false)}
                                    className="block text-center px-5 py-2.5 bg-brand-black hover:bg-brand-purpledark text-brand-white font-manrope text-p2 font-medium rounded-full transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </>
                    )}
                </nav>
            </div>
        </>
    );
}
