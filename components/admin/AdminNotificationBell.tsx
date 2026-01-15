"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/api/authApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function AdminNotificationBell() {
    const { user, isAuthenticated } = useAuthStore();
    const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const initializedRef = useRef(false);

    // Check for new merchant requests
    const checkMerchantRequests = async () => {
        if (!isAuthenticated || user?.role !== "ADMIN") return;

        try {
            const response = await authApi.getAllUsers();
            const users = response?.content || [];
            const pendingMerchants = users.filter((u) => u.role === "MERCHANT" && u.enabled === false);

            // Create notifications for new merchant requests
            const existingNotifications = notifications.filter((n) => n.type === "ADMIN_MERCHANT_REQUEST");
            const existingMerchantIds = new Set(existingNotifications.map((n) => n.merchantId));

            pendingMerchants.forEach((merchant) => {
                if (!existingMerchantIds.has(merchant.id)) {
                    useNotificationStore.getState().addNotification({
                        type: "ADMIN_MERCHANT_REQUEST",
                        title: "Yêu cầu đăng ký merchant mới",
                        message: `${merchant.username} (${merchant.email}) đã đăng ký trở thành merchant`,
                        merchantId: merchant.id,
                        merchantName: merchant.username,
                    });
                }
            });
        } catch (error) {
            console.error("Failed to check merchant requests:", error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "ADMIN") return;

        // Initial check
        if (!initializedRef.current) {
            checkMerchantRequests();
            initializedRef.current = true;
        }

        // Poll every 30 seconds
        checkIntervalRef.current = setInterval(checkMerchantRequests, 30000);

        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, [isAuthenticated, user?.role]);

    if (!isAuthenticated || user?.role !== "ADMIN") return null;

    const unread = unreadCount();
    const adminNotifications = notifications.filter((n) => n.type === "ADMIN_MERCHANT_REQUEST");

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <Bell className="h-5 w-5 text-brand-black dark:text-white" />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#EE4D2D] text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold text-sm">Thông báo merchant</h3>
                    {unread > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 font-medium"
                        >
                            Đánh dấu đã đọc
                        </button>
                    )}
                </div>

                {adminNotifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Không có thông báo nào
                    </div>
                ) : (
                    <>
                        {adminNotifications.map((notif) => (
                            <DropdownMenuItem
                                key={notif.id}
                                className={`flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                    !notif.read ? "bg-orange-50 dark:bg-orange-900/20" : ""
                                }`}
                                onClick={() => {
                                    markAsRead(notif.id);
                                    setIsOpen(false);
                                    if (notif.merchantId) {
                                        window.location.href = `/admin/merchant-requests`;
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${!notif.read ? "font-bold" : ""}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {new Date(notif.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                    {!notif.read && (
                                        <div className="h-2 w-2 bg-[#EE4D2D] rounded-full ml-2 mt-1 flex-shrink-0" />
                                    )}
                                </div>
                                {notif.merchantId && (
                                    <Link
                                        href="/admin/merchant-requests"
                                        className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 mt-2 font-medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notif.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        Xem yêu cầu →
                                    </Link>
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <Link
                            href="/admin/merchant-requests"
                            className="p-3 text-center text-sm text-[#EE4D2D] hover:text-[#EE4D2D]/80 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            Xem tất cả yêu cầu
                        </Link>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

