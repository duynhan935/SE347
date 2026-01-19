"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orderApi } from "@/lib/api/orderApi";
import { useMerchantRestaurant } from "@/lib/hooks/useMerchantRestaurant";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMerchantOrderStore } from "@/stores/useMerchantOrderStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { OrderStatus } from "@/types/order.type";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function MerchantNotificationBell() {
    const { user, isAuthenticated } = useAuthStore();
    const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
    const { incrementPendingOrdersCount, setPendingOrdersCount } = useMerchantOrderStore();
    const { currentRestaurant } = useMerchantRestaurant();
    const [isOpen, setIsOpen] = useState(false);
    const initializedRef = useRef(false);
    const pendingCountInitializedRef = useRef(false);

    // Get restaurant ID from current restaurant
    const restaurantId = currentRestaurant?.id || null;

    // Listen for new orders via socket
    useOrderSocket({
        restaurantId,
        userId: user?.id || null,
        onNewOrder: async (notification) => {
            const data = notification.data;
            if (!data) return;

            const orderId = data.orderId;
            const totalAmount = data.totalAmount;
            const itemCount = data.itemCount;

            // Add notification
            useNotificationStore.getState().addNotification({
                type: "MERCHANT_NEW_ORDER",
                title: "New Order",
                message: `You have a new order #${orderId} with ${itemCount} item(s), total: $${totalAmount?.toLocaleString(
                    "en-US",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    },
                )}`,
                orderId,
                restaurantName: data.restaurantName,
            });

            // Fetch latest orders and update pending count accurately
            if (restaurantId && user?.id) {
                try {
                    const { orders } = await orderApi.getOrdersByRestaurant(restaurantId, user.id);
                    const pendingCount = orders.filter((o) => o.status === OrderStatus.PENDING).length;
                    setPendingOrdersCount(pendingCount);
                } catch (error) {
                    console.error("Failed to refresh pending orders count:", error);
                    // Fallback: increment count if fetch fails
                    incrementPendingOrdersCount();
                }
            } else {
                // Fallback: increment count if restaurantId or user.id is not available
                incrementPendingOrdersCount();
            }
        },
    });

    // Initialize notifications and pending orders count from order history
    useEffect(() => {
        if (!isAuthenticated || !user?.id || !restaurantId || initializedRef.current) return;

        orderApi
            .getOrdersByRestaurant(restaurantId, user.id)
            .then(({ orders }) => {
                // Update pending orders count for sidebar badge
                if (!pendingCountInitializedRef.current) {
                    const pendingCount = orders.filter((o) => o.status === OrderStatus.PENDING).length;
                    setPendingOrdersCount(pendingCount);
                    pendingCountInitializedRef.current = true;
                }

                // Create notifications for pending/new orders
                const pendingOrders = orders.filter((o) => o.status === "pending");
                pendingOrders.forEach((order) => {
                    useNotificationStore.getState().addNotification({
                        type: "MERCHANT_NEW_ORDER",
                        title: "New Order",
                        message: `Order #${order.orderId} is pending`,
                        orderId: order.orderId,
                        restaurantName: order.restaurant?.name,
                    });
                });
                initializedRef.current = true;
            })
            .catch((error) => {
                console.error("Failed to initialize merchant notifications:", error);
            });
    }, [isAuthenticated, user?.id, restaurantId, setPendingOrdersCount]);

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
                    <h3 className="font-semibold text-sm">Order Notifications</h3>
                    {unread > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {merchantNotifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No notifications</div>
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
                                            {new Date(notif.createdAt).toLocaleString("en-US")}
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
                                        View Order →
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
                            View All Orders
                        </Link>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
