"use client";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/constants";
import { useAuthStore } from "@/stores/useAuthStore";
import { ChevronDown, LogOut, Menu, Store, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Header() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { isAuthenticated, user, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        // Prevent multiple clicks
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        // Close dropdown menu immediately for better UX
        setOpen(false);

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

            // Navigate to home page
            router.replace("/");
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
        <header className="bg-brand-yellowlight px-6 py-4">
            <div className="custom-container">
                <div className="max-w-7xl mx-auto flex items-center justify-between relative">
                    {/* Logo */}
                    <Link href="/" prefetch={true} className="flex items-center">
                        <Image src={Logo} alt="FoodEats Logo" width={120} height={40} className="h-8 w-auto" priority />
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/app"
                            prefetch={true}
                            className="text-brand-black text-p2 font-manrope hover:text-brand-purpledark"
                        >
                            Get the app
                        </Link>
                        <Link
                            href="/about"
                            prefetch={true}
                            className="text-brand-black text-p2 font-manrope hover:text-brand-purpledark"
                        >
                            About
                        </Link>
                        {(!mounted || !isAuthenticated || (user?.role !== "MERCHANT" && user?.role !== "ADMIN")) && (
                            <Link
                                href={mounted && isAuthenticated ? "/merchant/register" : "/register"}
                                className="text-brand-black text-p2 font-manrope hover:text-brand-purpledark flex items-center gap-1"
                            >
                                <Store className="h-4 w-4" />
                                Become a merchant
                            </Link>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center text-brand-black cursor-pointer text-p2 font-manrope">
                                Page
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="border border-brand-grey shadow-lg !max-h-[500px] overflow-y-auto">
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/restaurants" prefetch={true}>
                                        Restaurants
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/cart" prefetch={true}>
                                        Cart
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/payment" prefetch={true}>
                                        Payment
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/contact" prefetch={true}>
                                        Contact
                                    </Link>
                                </DropdownMenuItem>
                                {mounted && isAuthenticated && user?.role !== "MERCHANT" && user?.role !== "ADMIN" && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/merchant/register" className="flex items-center cursor-pointer">
                                            <Store className="mr-2 h-4 w-4" />
                                            Become a merchant
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {user?.role === "ADMIN" && (
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Link href="/admin" prefetch={true}>
                                            Admin
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {user?.role === "MERCHANT" && (
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Link href={`/merchant`} prefetch={true}>
                                            Merchant
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-3">
                        {mounted && isAuthenticated && user && <NotificationBell />}
                        {mounted && isAuthenticated && user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center space-x-2 cursor-pointer">
                                    <div className="w-8 h-8 bg-brand-purple rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-brand-black">
                                            {user?.username || "User"}
                                        </p>
                                        <p className="text-xs text-gray-600">{user?.role}</p>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem>
                                        <Link href="/account" prefetch={true} className="flex items-center w-full">
                                            <User className="mr-2 h-4 w-4" />
                                            My Account
                                        </Link>
                                    </DropdownMenuItem>
                                    {user?.role === "ADMIN" && (
                                        <DropdownMenuItem>
                                            <Link href="/admin" prefetch={true} className="flex items-center w-full">
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {user?.role === "MERCHANT" && (
                                        <DropdownMenuItem>
                                            <Link
                                                href={`/merchant`}
                                                prefetch={true}
                                                className="flex items-center w-full"
                                            >
                                                Merchant Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {mounted &&
                                        isAuthenticated &&
                                        user?.role !== "MERCHANT" &&
                                        user?.role !== "ADMIN" && (
                                            <DropdownMenuItem
                                                onClick={() => router.push("/merchant/register")}
                                                className="cursor-pointer"
                                            >
                                                <Store className="mr-2 h-4 w-4" />
                                                Become a merchant
                                            </DropdownMenuItem>
                                        )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : mounted && !isAuthenticated ? (
                            <>
                                <Link href="/login" prefetch={true}>
                                    <Button
                                        variant="ghost"
                                        className="hover:text-brand-purpledark cursor-pointer font-semibold font-manrope text-button2"
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register" prefetch={true}>
                                    <Button className="bg-brand-black hover:bg-brand-purpledark px-6 cursor-pointer font-semibold font-manrope text-button2 text-brand-white">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <div className="w-20 h-10" />
                        )}
                    </div>

                    {/* Menu button */}
                    <button
                        className="md:hidden p-2 rounded focus:outline-none cursor-pointer"
                        onClick={() => setOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="w-7 h-7 text-brand-black" />
                    </button>

                    {/* Mobile menu */}
                    <div
                        className={`fixed top-0 right-0 h-full w-72 bg-brand-yellowlight shadow-lg z-[100] transform transition-transform duration-300 ${
                            open ? "translate-x-0" : "translate-x-full"
                        }`}
                    >
                        <div className="flex justify-end p-4">
                            <button
                                className="p-2 rounded focus:outline-none cursor-pointer"
                                onClick={() => setOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6 text-brand-black" />
                            </button>
                        </div>
                        <nav className="flex flex-col items-start px-6 py-4 space-y-4">
                            <Link
                                href="/app"
                                prefetch={true}
                                className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                            >
                                Get the app
                            </Link>
                            <Link
                                href="/about"
                                prefetch={true}
                                className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                            >
                                About
                            </Link>
                            {(!mounted ||
                                !isAuthenticated ||
                                (user?.role !== "MERCHANT" && user?.role !== "ADMIN")) && (
                                <Link
                                    href={mounted && isAuthenticated ? "/merchant/register" : "/register"}
                                    onClick={() => setOpen(false)}
                                    className="text-brand-black text-p2 font-manrope w-full py-2 text-left hover:text-brand-purpledark flex items-center gap-2"
                                >
                                    <Store className="h-4 w-4" />
                                    Become a merchant
                                </Link>
                            )}
                            <Link
                                href="/restaurants"
                                prefetch={true}
                                className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                            >
                                Restaurants
                            </Link>
                            {mounted && isAuthenticated && user && (
                                <>
                                    <Link
                                        href="/cart"
                                        prefetch={true}
                                        className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                    >
                                        Cart
                                    </Link>
                                    <Link
                                        href="/account"
                                        prefetch={true}
                                        className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                    >
                                        My Account
                                    </Link>
                                    {user?.role === "ADMIN" && (
                                        <Link
                                            href="/admin"
                                            prefetch={true}
                                            className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                        >
                                            Admin Panel
                                        </Link>
                                    )}
                                    {user?.role === "MERCHANT" && (
                                        <Link
                                            href={`/merchant`}
                                            prefetch={true}
                                            className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                        >
                                            Merchant Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="text-red-600 text-p2 font-manrope w-full py-2 text-left hover:text-red-700"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                            {mounted && !isAuthenticated && (
                                <>
                                    <Link href="/login" prefetch={true} className="w-full">
                                        <Button
                                            variant="ghost"
                                            className="w-full text-left hover:text-brand-purpledark cursor-pointer font-semibold font-manrope text-button2"
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/register" prefetch={true} className="w-full">
                                        <Button className="w-full text-left bg-brand-black hover:bg-brand-purpledark px-6 cursor-pointer font-semibold font-manrope text-button2 text-brand-white">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>

                    {/* Overlay when menu is open */}
                    {open && <div className="fixed inset-0 bg-black/30 z-[99]" onClick={() => setOpen(false)} />}
                </div>
            </div>

        </header>
    );
}
