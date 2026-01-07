"use client";

import { MerchantRequestForm } from "@/components/auth/MerchantRequestForm";
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
import { LogOut, MessageCircle, Package, Settings, Store, User, UtensilsCrossed, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CartDropdown from "./CartDropdown";

export default function NavActions() {
        const { user, isAuthenticated, loading, logout } = useAuthStore();
        const [mounted, setMounted] = useState(false);
        const [showMerchantForm, setShowMerchantForm] = useState(false);
        const [isLoggingOut, setIsLoggingOut] = useState(false);
        const router = useRouter();
        const pathname = usePathname();

        // Fix hydration mismatch
        useEffect(() => {
                setMounted(true);
        }, []);

        const handleLogout = async () => {
                if (isLoggingOut) return;
                setIsLoggingOut(true);

                try {
                        const loadingToast = toast.loading("Đang đăng xuất...");
                        logout();
                        await new Promise((resolve) => setTimeout(resolve, 100));
                        toast.dismiss(loadingToast);
                        toast.success("Đăng xuất thành công! 👋", { duration: 3000 });
                        router.replace("/");
                } catch (error) {
                        toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
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
                        {/* Đặt đồ ăn - Hiển thị cho tất cả user (phần chính) */}
                        <Link
                                href="/restaurants"
                                className={`relative p-2 rounded-full hover:bg-gray-50 transition-colors ${
                                        pathname === "/restaurants" ? "text-brand-orange" : "text-brand-grey"
                                }`}
                                aria-label="Đặt đồ ăn"
                                title="Đặt đồ ăn"
                        >
                                <UtensilsCrossed className="w-5 h-5" />
                                {pathname === "/restaurants" && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full" />
                                )}
                        </Link>

                        {/* Orders - Show if authenticated */}
                        {isAuthenticated && user && !loading && (
                                <Link
                                        href="/orders"
                                        className={`relative p-2 rounded-full hover:bg-gray-50 transition-colors ${
                                                pathname === "/orders" ? "text-brand-orange" : "text-brand-grey"
                                        }`}
                                        aria-label="Đơn hàng của tôi"
                                        title="Đơn hàng của tôi"
                                >
                                        <Package className="w-5 h-5" />
                                        {pathname === "/orders" && (
                                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full" />
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
                                                className="w-56 min-w-[14rem] max-w-[14rem]"
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
                                                                <Link href="/orders" className="flex items-center cursor-pointer">
                                                                        <Package className="mr-2 h-4 w-4" />
                                                                        <span>Đơn hàng của tôi</span>
                                                                </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                                <Link href="/chat" className="flex items-center cursor-pointer">
                                                                        <MessageCircle className="mr-2 h-4 w-4" />
                                                                        <span>Tin nhắn</span>
                                                                </Link>
                                                        </DropdownMenuItem>
                                                </DropdownMenuGroup>

                                                <DropdownMenuSeparator />

                                                {/* Group 2: Settings */}
                                                <DropdownMenuGroup>
                                                        <DropdownMenuItem asChild>
                                                                <Link href="/account" className="flex items-center cursor-pointer">
                                                                        <User className="mr-2 h-4 w-4" />
                                                                        <span>Hồ sơ cá nhân</span>
                                                                </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                                <Link href="/account/addresses" className="flex items-center cursor-pointer">
                                                                        <Settings className="mr-2 h-4 w-4" />
                                                                        <span>Địa chỉ giao hàng</span>
                                                                </Link>
                                                        </DropdownMenuItem>
                                                </DropdownMenuGroup>

                                                <DropdownMenuSeparator />

                                                {/* Group 3: Merchant & Contact */}
                                                <DropdownMenuGroup>
                                                        {user?.role !== "MERCHANT" && user?.role !== "ADMIN" && (
                                                                <DropdownMenuItem
                                                                        onClick={() => setShowMerchantForm(true)}
                                                                        className="cursor-pointer"
                                                                >
                                                                        <Store className="mr-2 h-4 w-4" />
                                                                        <span>Đăng ký bán hàng</span>
                                                                </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem asChild>
                                                                <Link href="/contact" className="flex items-center cursor-pointer">
                                                                        <MessageCircle className="mr-2 h-4 w-4" />
                                                                        <span>Liên hệ</span>
                                                                </Link>
                                                        </DropdownMenuItem>
                                                </DropdownMenuGroup>

                                                {/* Admin/Merchant Links */}
                                                {user?.role === "ADMIN" && (
                                                        <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem asChild>
                                                                        <Link href="/admin" className="flex items-center cursor-pointer">
                                                                                <Settings className="mr-2 h-4 w-4" />
                                                                                <span>Admin Panel</span>
                                                                        </Link>
                                                                </DropdownMenuItem>
                                                        </>
                                                )}
                                                {user?.role === "MERCHANT" && (
                                                        <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem asChild>
                                                                        <Link href="/merchant" className="flex items-center cursor-pointer">
                                                                                <Store className="mr-2 h-4 w-4" />
                                                                                <span>Merchant Dashboard</span>
                                        </Link>
                                                                </DropdownMenuItem>
                                                        </>
                                                )}

                                                <DropdownMenuSeparator />

                                                {/* Logout */}
                                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                                                        <LogOut className="mr-2 h-4 w-4" />
                                                        <span>Đăng xuất</span>
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
                                                Đăng nhập
                                        </Link>
                                        <Link
                                                href="/register"
                                                className="px-4 py-2 text-sm font-medium bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors"
                                        >
                                                Đăng ký
                                        </Link>
                                </div>
                        )}

                        {/* Merchant Request Form Dialog */}
                        {showMerchantForm && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                        <div
                                                className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
                                                onClick={(e) => e.stopPropagation()}
                                        >
                                                <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-xl font-bold text-gray-900">Yêu cầu trở thành Merchant</h3>
                                                        <button
                                                                onClick={() => setShowMerchantForm(false)}
                                                                className="text-gray-400 hover:text-gray-600"
                                                                aria-label="Close merchant registration form"
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
                </div>
        );
}
