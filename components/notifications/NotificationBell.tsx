"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orderApi } from "@/lib/api/orderApi";
import { formatDateTime } from "@/lib/formatters";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useWalletNotifications } from "@/lib/hooks/useWalletNotifications";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { OrderStatus } from "@/types/order.type";
import { formatDateTime } from "@/lib/formatters";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export function NotificationBell() {
    const { user, isAuthenticated } = useAuthStore();
    const { notifications, markAsRead, markAllAsRead, unreadCount, initializeFromOrders } = useNotificationStore();
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const initializedRef = useRef(false);

    // Enable wallet notifications for all users (admin gets payout requests, merchants get approvals/rejections)
    useWalletNotifications({
        userId: user?.id || null,
        userRole: user?.role,
        isAuthenticated,
    });
        isAuthenticated,
    });

    // Listen for order status updates via socket
    useOrderSocket({
        userId: user?.id || null,
        onOrderStatusUpdate: (notification) => {
            const data = notification.data;
            if (!data) return;

            const orderId = data.orderId || notification.orderId;
            const status = (data.status || notification.status || "").toLowerCase();

            if (!orderId || !status) return;

            // Handle all order status updates
            switch (status) {
                case "confirmed":
                    useNotificationStore.getState().addNotification({
                        type: "ORDER_ACCEPTED",
                        title: "Order Confirmed",
                        message: `Order ${orderId} was confirmed and is being prepared.`,
                        orderId,
                        restaurantName: data.restaurantName,
                    });
                    break;
                case "preparing":
                    useNotificationStore.getState().addNotification({
                        type: "ORDER_CONFIRMED",
                        title: "Order Being Prepared",
                        message: `Order ${orderId} is being prepared by the restaurant.`,
                        orderId,
                        restaurantName: data.restaurantName,
                    });
                    break;
                case "ready":
                    useNotificationStore.getState().addNotification({
                        type: "ORDER_CONFIRMED",
                        title: "Order Ready",
                        message: `Order ${orderId} is ready! Delivery is on the way.`,
                        orderId,
                        restaurantName: data.restaurantName,
                    });
                    break;
                case "completed":
                    useNotificationStore.getState().addNotification({
                        type: "ORDER_COMPLETED",
                        title: "Order Completed",
                        message: `Order ${orderId} has been delivered successfully.`,
                        orderId,
                        restaurantName: data.restaurantName,
                    });
                    break;
                case "cancelled":
                    useNotificationStore.getState().addNotification({
                        type: "ORDER_REJECTED",
                        title: "Order Cancelled",
                        message: `Order ${orderId} has been cancelled. ${notification.cancellationReason || data.reason ? `Reason: ${notification.cancellationReason || data.reason}` : ""}`,
                        orderId,
                        restaurantName: data.restaurantName,
                    });
                    break;
                default:
                    // For any other status updates, still show notification
                    useNotificationStore.getState().addNotification({
                        type: "ORDER_CONFIRMED",
                        title: "Order Status Updated",
                        message: `Order ${orderId} status has been updated to ${status}.`,
                        orderId,
                        restaurantName: data.restaurantName,
                    });
                    break;
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

    // Include payout notifications for display
    const displayNotifications = notifications.filter(
        (n) => n.type !== "MERCHANT_NEW_ORDER" && n.type !== "ADMIN_MERCHANT_REQUEST" && n.type !== "MESSAGE_RECEIVED",
    );
    const unread = displayNotifications.filter((n) => !n.read).length;

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return "";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const getNotificationLink = (notif: (typeof notifications)[0]) => {
        if (notif.orderId) return `/orders/${notif.orderId}`;
        if (notif.type === "PAYOUT_REQUEST" && user?.role === "ADMIN") return "/admin/payouts";
        if (notif.type === "PAYOUT_APPROVED" || notif.type === "PAYOUT_REJECTED") return "/merchant/wallet";
        if (notif.roomId) return "/messages";
        return null;
    };

    const getNotificationIcon = (type: string) => {
        if (type === "PAYOUT_REQUEST" || type === "PAYOUT_APPROVED" || type === "PAYOUT_REJECTED") {
            return <DollarSign className="h-4 w-4 text-green-600" />;
        }
        return null;
    };

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
                    <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No notifications</div>
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
                                            {formatDateTime(notif.createdAt)}
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
                            href={user?.role === "ADMIN" ? "/admin/dashboard" : "/account/orders"}
                            className="block p-3 text-center text-sm text-[#EE4D2D] hover:text-[#EE4D2D]/80 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            {user?.role === "ADMIN" ? "View dashboard" : "View all orders"}
                        </Link>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
