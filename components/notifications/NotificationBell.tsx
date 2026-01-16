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
import { OrderStatus } from "@/types/order.type";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export function NotificationBell() {
    const { user, isAuthenticated } = useAuthStore();
    const { notifications, markAsRead, markAllAsRead, unreadCount, initializeFromOrders } = useNotificationStore();
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const initializedRef = useRef(false);

    // Listen for order status updates via socket
    useOrderSocket({
        userId: user?.id || null,
        onOrderStatusUpdate: (notification) => {
            const orderId = notification.data.orderId;
            const status = notification.data.status;

            if (status === "confirmed") {
                useNotificationStore.getState().addNotification({
                    type: "ORDER_ACCEPTED",
                    title: "Order accepted",
                    message: `Order ${orderId} was accepted and is being prepared.`,
                    orderId,
                    restaurantName: notification.data.restaurantName,
                });
            } else if (status === "cancelled") {
                useNotificationStore.getState().addNotification({
                    type: "ORDER_REJECTED",
                    title: "Order Cancelled",
                    message: `Order ${orderId} has been cancelled. ${
                        notification.data.reason ? `Reason: ${notification.data.reason}` : ""
                    }`,
                    orderId,
                    restaurantName: notification.data.restaurantName,
                });
            } else if (status === "completed") {
                useNotificationStore.getState().addNotification({
                    type: "ORDER_COMPLETED",
                    title: "Order Completed",
                    message: `Order ${orderId} has been delivered successfully.`,
                    orderId,
                    restaurantName: notification.data.restaurantName,
                });
            }
        },
    });

    // Poll for order status changes (fallback if socket doesn't work)
    // Use ref to access latest lastOrderCheck without causing re-renders
    const lastOrderCheckRef = useRef<Map<string, OrderStatus>>(new Map());

    const checkOrderStatus = useCallback(async () => {
        if (!isAuthenticated || !user?.id) return;

        try {
            const { orders } = await orderApi.getOrdersByUser(user.id);
            const currentStatusMap = new Map<string, OrderStatus>();

            orders.forEach((order) => {
                const orderId = order.orderId;
                const currentStatus = order.status;
                currentStatusMap.set(orderId, currentStatus);

                // Check if status changed using ref
                const previousStatus = lastOrderCheckRef.current.get(orderId);
                if (previousStatus && previousStatus !== currentStatus) {
                    if (previousStatus === "pending" && currentStatus === "confirmed") {
                        useNotificationStore.getState().addNotification({
                            type: "ORDER_ACCEPTED",
                            title: "Order Confirmed",
                            message: `Order ${orderId} has been confirmed and is being prepared.`,
                            orderId,
                            restaurantName: order.restaurant?.name,
                        });
                    } else if (previousStatus === "pending" && currentStatus === "cancelled") {
                        useNotificationStore.getState().addNotification({
                            type: "ORDER_REJECTED",
                            title: "Order Cancelled",
                            message: `Order ${orderId} has been cancelled.`,
                            orderId,
                            restaurantName: order.restaurant?.name,
                        });
                    } else if (previousStatus !== "completed" && currentStatus === "completed") {
                        useNotificationStore.getState().addNotification({
                            type: "ORDER_COMPLETED",
                            title: "Order Completed",
                            message: `Order ${orderId} has been delivered successfully.`,
                            orderId,
                            restaurantName: order.restaurant?.name,
                        });
                    }
                }
            });

            // Update ref instead of state to avoid re-renders
            lastOrderCheckRef.current = currentStatusMap;
        } catch (error) {
            console.error("Failed to check order status:", error);
        }
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        // Initialize notifications from order history on first load
        if (!initializedRef.current) {
            orderApi
                .getOrdersByUser(user.id)
                .then(({ orders }) => {
                    initializeFromOrders(orders);
                    initializedRef.current = true;
                })
                .catch((error) => {
                    console.error("Failed to initialize notifications from orders:", error);
                });
        }

        // Initial check
        checkOrderStatus();

        // Poll every 5 seconds for faster updates
        checkIntervalRef.current = setInterval(checkOrderStatus, 5000);

        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, [isAuthenticated, user?.id, checkOrderStatus, initializeFromOrders]);

    const [isOpen, setIsOpen] = useState(false);

    if (!isAuthenticated) return null;

    // Only count order-related notifications (exclude messages, merchant orders, admin requests)
    const orderNotifications = notifications.filter(
        (n) =>
            n.type !== "MERCHANT_NEW_ORDER" &&
            n.type !== "ADMIN_MERCHANT_REQUEST" &&
            n.type !== "MESSAGE_RECEIVED"
    );
    const unread = orderNotifications.filter((n) => !n.read).length;

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
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unread > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        No notifications
                    </div>
                ) : (
                    <>
                        {orderNotifications.map((notif) => (
                            <DropdownMenuItem
                                key={notif.id}
                                className={`flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                    !notif.read ? "bg-orange-50 dark:bg-orange-900/20" : ""
                                }`}
                                onClick={() => {
                                    markAsRead(notif.id);
                                    setIsOpen(false);
                                    if (notif.orderId) {
                                        window.location.href = `/orders/${notif.orderId}`;
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${!notif.read ? "font-bold" : ""}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                                        {notif.restaurantName && (
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                Restaurant: {notif.restaurantName}
                                            </p>
                                        )}
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
                                        href={`/orders/${notif.orderId}`}
                                        className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 mt-2 font-medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notif.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        View order details →
                                    </Link>
                                )}
                                {notif.roomId && (
                                    <Link
                                        href="/messages"
                                        className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 mt-2 font-medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notif.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        View message →
                                    </Link>
                                )}
                                {notif.roomId && (
                                    <Link
                                        href="/messages"
                                        className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 mt-2 font-medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notif.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        View message →
                                    </Link>
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <Link
                            href="/account/orders"
                            className="p-3 text-center text-sm text-[#EE4D2D] hover:text-[#EE4D2D]/80 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            View all orders
                        </Link>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
