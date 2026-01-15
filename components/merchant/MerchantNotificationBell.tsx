"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orderApi } from "@/lib/api/orderApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export function MerchantNotificationBell() {
    const { user, isAuthenticated } = useAuthStore();
    const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const initializedRef = useRef(false);

    // Get restaurant ID from user (assuming merchant has restaurantId)
    const restaurantId = user?.restaurantId || null;

    // Listen for new orders via socket
    useOrderSocket({
        restaurantId,
        userId: user?.id || null,
        onNewOrder: (notification) => {
            const orderId = notification.data.orderId;
            const totalAmount = notification.data.totalAmount;
            const itemCount = notification.data.itemCount;

            useNotificationStore.getState().addNotification({
                type: "MERCHANT_NEW_ORDER",
                title: "Đơn hàng mới",
                message: `Bạn có đơn hàng mới #${orderId} với ${itemCount} món, tổng tiền: ${totalAmount?.toLocaleString("vi-VN")}₫`,
                orderId,
                restaurantName: user?.restaurantName,
            });
        },
    });

    // Initialize notifications from order history
    useEffect(() => {
        if (!isAuthenticated || !user?.id || !restaurantId || initializedRef.current) return;

        orderApi
            .getOrdersByRestaurant(restaurantId, user.id)
            .then(({ orders }) => {
                // Create notifications for pending/new orders
                const pendingOrders = orders.filter((o) => o.status === "pending");
                pendingOrders.forEach((order) => {
                    useNotificationStore.getState().addNotification({
                        type: "MERCHANT_NEW_ORDER",
                        title: "Đơn hàng mới",
                        message: `Đơn hàng #${order.orderId} đang chờ xử lý`,
                        orderId: order.orderId,
                        restaurantName: order.restaurantName,
                    });
                });
                initializedRef.current = true;
            })
            .catch((error) => {
                console.error("Failed to initialize merchant notifications:", error);
            });
    }, [isAuthenticated, user?.id, restaurantId]);

    if (!isAuthenticated || !restaurantId) return null;

    const unread = unreadCount();
    const merchantNotifications = notifications.filter((n) => n.type === "MERCHANT_NEW_ORDER");

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
                    <h3 className="font-semibold text-sm">Thông báo đơn hàng</h3>
                    {unread > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 font-medium"
                        >
                            Đánh dấu đã đọc
                        </button>
                    )}
                </div>

                {merchantNotifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Không có thông báo nào
                    </div>
                ) : (
                    <>
                        {merchantNotifications.map((notif) => (
                            <DropdownMenuItem
                                key={notif.id}
                                className={`flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                    !notif.read ? "bg-orange-50 dark:bg-orange-900/20" : ""
                                }`}
                                onClick={() => {
                                    markAsRead(notif.id);
                                    setIsOpen(false);
                                    if (notif.orderId) {
                                        window.location.href = `/merchant/orders`;
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
                                {notif.orderId && (
                                    <Link
                                        href="/merchant/orders"
                                        className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 mt-2 font-medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notif.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        Xem đơn hàng →
                                    </Link>
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <Link
                            href="/merchant/orders"
                            className="p-3 text-center text-sm text-[#EE4D2D] hover:text-[#EE4D2D]/80 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            Xem tất cả đơn hàng
                        </Link>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

