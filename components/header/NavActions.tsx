"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getImageUrl } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { LogOut, MessageCircle, Package, Settings, Store, User, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CartDropdown from "./CartDropdown";

export default function NavActions() {
    const { user, isAuthenticated, loading, logout } = useAuthStore();
    // Subscribe to unread count map to trigger re-render when it changes
    const unreadCountMap = useChatStore((state) => state.unreadCountMap);
    const orderUnreadCount = useNotificationStore((state) => state.orderUnreadCount());
    const [mounted, setMounted] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Calculate total unread chat messages count
    const chatUnreadCount = Object.values(unreadCountMap).reduce((sum, count) => sum + count, 0);

    // Fix hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            const loadingToast = toast.loading("Logging out...");
            logout();
            await new Promise((resolve) => setTimeout(resolve, 100));
            toast.dismiss(loadingToast);
            toast.success("Logged out successfully. See you soon!", { duration: 3000 });
            router.replace("/");
        } catch (error) {
            toast.error("Logout failed. Please try again.");
            console.error("Logout error:", error);
        } finally {
            setTimeout(() => setIsLoggingOut(false), 500);
        }
    };

    // Get user avatar or initials
    const getAvatarContent = () => {
        if (user?.avatar) {
            const avatarUrl = typeof user.avatar === "string" ? getImageUrl(user.avatar) : user.avatar;
            return (
                <Image
                    src={avatarUrl}
                    alt={user.username || "User"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    unoptimized={typeof avatarUrl === "string" && avatarUrl.startsWith("http")}
                />
            );
        }
        // Fallback: Use first letter of username
        const initial = user?.username?.charAt(0).toUpperCase() || "U";
        return (
            <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white font-semibold text-sm">
                {initial}
            </div>
        );
    };

    // Show loading skeleton only during initial mount to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 lg:gap-4">
            {/* Browse foods (main action) */}
            <Link
                href="/?type=foods"
                className={`relative p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    pathname === "/" ? "text-[#EE4D2D]" : "text-gray-600"
                }`}
                aria-label="Khám phá món ăn"
                title="Khám phá món ăn"
            >
                <UtensilsCrossed className="w-5 h-5" />
                {pathname === "/" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EE4D2D] rounded-full" />
                )}
            </Link>

            {/* Orders - Show if authenticated */}
            {isAuthenticated && user && !loading && (
                <Link
                    href="/orders"
                    className={`relative p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                        pathname === "/orders" ? "text-[#EE4D2D]" : "text-gray-600"
                    }`}
                    aria-label="My orders"
                    title="My orders"
                >
                    <Package className="w-5 h-5" />
                    {orderUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#EE4D2D] text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                            {orderUnreadCount > 99 ? "99+" : orderUnreadCount}
                        </span>
                    )}
                    {pathname === "/orders" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EE4D2D] rounded-full" />
                    )}
                </Link>
            )}

            {/* Chat Messages - Show if authenticated */}
            {isAuthenticated && user && !loading && (
                <Link
                    href="/chat"
                    className={`relative p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                        pathname === "/chat" ? "text-[#EE4D2D]" : "text-gray-600"
                    }`}
                    aria-label="Messages"
                    title="Messages"
                >
                    <MessageCircle className="w-5 h-5" />
                    {chatUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#EE4D2D] text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                            {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                        </span>
                    )}
                    {pathname === "/chat" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EE4D2D] rounded-full" />
                    )}
                </Link>
            )}

            {/* Cart - Show if authenticated and not loading */}
            {isAuthenticated && user && !loading && <CartDropdown />}

            {/* User Actions */}
            {isAuthenticated && user && !loading ? (
                // Authenticated: Show user dropdown with groups
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild className="focus:outline-none">
                        <button className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity outline-none">
                            {getAvatarContent()}
                            <span className="hidden lg:inline text-sm font-medium text-brand-black">
                                {user.username || "User"}
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        alignOffset={0}
                        sideOffset={8}
                        className="w-56 min-w-[14rem] max-w-[14rem] shadow-lg border border-gray-200"
                    >
                        {/* User Info */}
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.username || "User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Group 1: Main Actions */}
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/orders"
                                    className="flex items-center justify-between cursor-pointer w-full py-2.5 px-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm">My orders</span>
                                    </div>
                                    {orderUnreadCount > 0 && (
                                        <span className="ml-2 h-5 min-w-[20px] px-1.5 bg-[#EE4D2D] text-white text-xs rounded-full flex items-center justify-center font-bold">
                                            {orderUnreadCount > 99 ? "99+" : orderUnreadCount}
                                        </span>
                                    )}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/chat"
                                    className="flex items-center justify-between cursor-pointer w-full py-2.5 px-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm">Messages</span>
                                    </div>
                                    {chatUnreadCount > 0 && (
                                        <span className="ml-2 h-5 min-w-[20px] px-1.5 bg-[#EE4D2D] text-white text-xs rounded-full flex items-center justify-center font-bold">
                                            {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                                        </span>
                                    )}
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        {/* Group 2: Settings */}
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href="/account" className="flex items-center gap-2 py-2.5 px-3 hover:bg-gray-50 transition-colors cursor-pointer">
                                    <User className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm">Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/account/addresses" className="flex items-center gap-2 py-2.5 px-3 hover:bg-gray-50 transition-colors cursor-pointer">
                                    <Settings className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm">Delivery addresses</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        {/* Group 3: Merchant & Contact */}
                        <DropdownMenuGroup>
                            {user?.role !== "MERCHANT" && user?.role !== "ADMIN" && (
                                <DropdownMenuItem
                                    onClick={() => router.push("/merchant/register")}
                                    className="flex items-center gap-2 py-2.5 px-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <Store className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm">Become a merchant</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                                <Link href="/contact" className="flex items-center gap-2 py-2.5 px-3 hover:bg-gray-50 transition-colors cursor-pointer">
                                    <MessageCircle className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm">Contact</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        {/* Admin/Merchant Links */}
                        {user?.role === "ADMIN" && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/admin" className="flex items-center gap-2 py-2.5 px-3 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <Settings className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm">Admin Panel</span>
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}
                        {user?.role === "MERCHANT" && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/merchant" className="flex items-center gap-2 py-2.5 px-3 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <Store className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm">Merchant Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}

                        <DropdownMenuSeparator />

                        {/* Logout */}
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex items-center gap-2 py-2.5 px-3 hover:bg-red-50 transition-colors cursor-pointer text-red-600 focus:text-red-600"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm">Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                // Not authenticated OR loading: Always show login/register buttons
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/register"
                        className="px-4 py-2 text-sm font-medium bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90 transition-colors"
                    >
                        Sign up
                    </Link>
                </div>
            )}
        </div>
    );
}
