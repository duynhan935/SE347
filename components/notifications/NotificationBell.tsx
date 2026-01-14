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
import { useCallback, useEffect, useRef } from "react";

export function NotificationBell() {
        const { user, isAuthenticated } = useAuthStore();
        const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
        const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
                                        title: "Order rejected",
                                        message: `Order ${orderId} was rejected. ${
                                                notification.data.reason ? `Reason: ${notification.data.reason}` : ""
                                        }`,
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
                                        if (
                                                previousStatus === "pending" &&
                                                currentStatus === "confirmed"
                                        ) {
                                                useNotificationStore.getState().addNotification({
                                                        type: "ORDER_ACCEPTED",
                                                        title: "Order accepted",
                                                        message: `Order ${orderId} was accepted and is being prepared.`,
                                                        orderId,
                                                        restaurantName: order.restaurant?.name,
                                                });
                                        } else if (
                                                previousStatus === "pending" &&
                                                currentStatus === "cancelled"
                                        ) {
                                                useNotificationStore.getState().addNotification({
                                                        type: "ORDER_REJECTED",
                                                        title: "Order rejected",
                                                        message: `Order ${orderId} was rejected.`,
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

                // Initial check
                checkOrderStatus();

                // Poll every 5 seconds for faster updates
                checkIntervalRef.current = setInterval(checkOrderStatus, 5000);

                return () => {
                        if (checkIntervalRef.current) {
                                clearInterval(checkIntervalRef.current);
                        }
                };
        }, [isAuthenticated, user?.id, checkOrderStatus]);

        if (!isAuthenticated) return null;

        const unread = unreadCount();

        return (
                <DropdownMenu>
                        <DropdownMenuTrigger className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <Bell className="h-5 w-5 text-brand-black dark:text-white" />
                                {unread > 0 && (
                                        <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                                {unread > 9 ? "9+" : unread}
                                        </span>
                                )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                                <div className="flex items-center justify-between p-3 border-b">
                                        <h3 className="font-semibold text-sm">Notifications</h3>
                                        {unread > 0 && (
                                                <button
                                                        onClick={markAllAsRead}
                                                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                                >
                                                        Mark all as read
                                                </button>
                                        )}
                                </div>

                                {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No notifications.
                                        </div>
                                ) : (
                                        <>
                                                {notifications.map((notif) => (
                                                        <DropdownMenuItem
                                                                key={notif.id}
                                                                className={`flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                                        !notif.read
                                                                                ? "bg-blue-50 dark:bg-blue-900/20"
                                                                                : ""
                                                                }`}
                                                                onClick={() => {
                                                                        markAsRead(notif.id);
                                                                        if (notif.orderId) {
                                                                                // Navigate to order page
                                                                        }
                                                                }}
                                                        >
                                                                <div className="flex items-start justify-between w-full">
                                                                        <div className="flex-1">
                                                                                <p
                                                                                        className={`text-sm font-medium ${
                                                                                                !notif.read
                                                                                                        ? "font-bold"
                                                                                                        : ""
                                                                                        }`}
                                                                                >
                                                                                        {notif.title}
                                                                                </p>
                                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                                        {notif.message}
                                                                                </p>
                                                                                {notif.restaurantName && (
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                                                                Restaurant:{" "}
                                                                                                {notif.restaurantName}
                                                                                        </p>
                                                                                )}
                                                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                                        {new Date(
                                                                                                notif.createdAt
                                                                                        ).toLocaleString("en-US")}
                                                                                </p>
                                                                        </div>
                                                                        {!notif.read && (
                                                                                <div className="h-2 w-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                                                                        )}
                                                                </div>
                                                                {notif.orderId && (
                                                                        <Link
                                                                                href={`/orders/${notif.orderId}`}
                                                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-2"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                                View order details →
                                                                        </Link>
                                                                )}
                                                        </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuSeparator />
                                                <Link
                                                        href="/account/orders"
                                                        className="p-3 text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                                >
                                                        View all orders
                                                </Link>
                                        </>
                                )}
                        </DropdownMenuContent>
                </DropdownMenu>
        );
}
