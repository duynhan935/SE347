"use client";

import { orderApi } from "@/lib/api/orderApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { OrderStatus } from "@/types/order.type";
import { useCallback, useEffect, useRef } from "react";

/**
 * Hook to track order status changes and create notifications
 * - Listens to order status updates via WebSocket
 * - Polls order status as fallback
 * - Creates notifications for all order status transitions
 */
export function useNotifications() {
    const { user, isAuthenticated } = useAuthStore();
    const { notifications, addNotification } = useNotificationStore();
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastOrderCheckRef = useRef<Map<string, OrderStatus>>(new Map());

    // Listen for order status updates via socket
    useOrderSocket({
        userId: user?.id || null,
        onOrderStatusUpdate: (notification) => {
            const orderId = notification.data.orderId;
            const status = notification.data.status as OrderStatus;
            const restaurantName = notification.data.restaurantName;

            if (!orderId || !status) return;

            // Create notification based on status
            switch (status) {
                case OrderStatus.CONFIRMED:
                    addNotification({
                        type: "ORDER_ACCEPTED",
                        title: "Order Confirmed",
                        message: `Order ${orderId} has been confirmed by the restaurant and is being prepared.`,
                        orderId,
                        restaurantName,
                    });
                    break;

                case OrderStatus.PREPARING:
                    addNotification({
                        type: "ORDER_CONFIRMED",
                        title: "Order Being Prepared",
                        message: `Order ${orderId} is being prepared by the restaurant. Please wait a moment.`,
                        orderId,
                        restaurantName,
                    });
                    break;

                case OrderStatus.READY:
                    addNotification({
                        type: "ORDER_CONFIRMED",
                        title: "Order Ready for Delivery",
                        message: `Order ${orderId} is ready. Driver will pick it up and deliver to you as soon as possible.`,
                        orderId,
                        restaurantName,
                    });
                    break;

                case OrderStatus.COMPLETED:
                    addNotification({
                        type: "ORDER_COMPLETED",
                        title: "Order Delivered Successfully",
                        message: `Order ${orderId} has been delivered. Thank you for using our service!`,
                        orderId,
                        restaurantName,
                    });
                    break;

                case OrderStatus.CANCELLED:
                    addNotification({
                        type: "ORDER_REJECTED",
                        title: "Order Cancelled",
                        message: `Order ${orderId} has been cancelled. ${
                            notification.data.reason ? `Reason: ${notification.data.reason}` : ""
                        }`,
                        orderId,
                        restaurantName,
                    });
                    break;

                default:
                    break;
            }
        },
    });

    // Poll for order status changes (fallback if socket doesn't work)
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
                    const restaurantName = order.restaurant?.name || "Restaurant";

                    // Create notification based on status transition
                    switch (currentStatus) {
                        case OrderStatus.CONFIRMED:
                            if (previousStatus === OrderStatus.PENDING) {
                                addNotification({
                                    type: "ORDER_ACCEPTED",
                                    title: "Order Confirmed",
                                    message: `Order ${orderId} has been confirmed by the restaurant and is being prepared.`,
                                    orderId,
                                    restaurantName,
                                });
                            }
                            break;

                        case OrderStatus.PREPARING:
                            if (previousStatus === OrderStatus.CONFIRMED || previousStatus === OrderStatus.PENDING) {
                                addNotification({
                                    type: "ORDER_CONFIRMED",
                                    title: "Order Being Prepared",
                                    message: `Order ${orderId} is being prepared by the restaurant. Please wait a moment.`,
                                    orderId,
                                    restaurantName,
                                });
                            }
                            break;

                        case OrderStatus.READY:
                            if (
                                previousStatus === OrderStatus.PREPARING ||
                                previousStatus === OrderStatus.CONFIRMED
                            ) {
                                addNotification({
                                    type: "ORDER_CONFIRMED",
                                    title: "Order Ready for Delivery",
                                    message: `Order ${orderId} is ready. Driver will pick it up and deliver to you as soon as possible.`,
                                    orderId,
                                    restaurantName,
                                });
                            }
                            break;

                        case OrderStatus.COMPLETED:
                            if (
                                previousStatus === OrderStatus.READY ||
                                previousStatus === OrderStatus.PREPARING
                            ) {
                                addNotification({
                                    type: "ORDER_COMPLETED",
                                    title: "Order Delivered Successfully",
                                    message: `Order ${orderId} has been delivered. Thank you for using our service!`,
                                    orderId,
                                    restaurantName,
                                });
                            }
                            break;

                        case OrderStatus.CANCELLED:
                            if (previousStatus !== OrderStatus.CANCELLED) {
                                addNotification({
                                    type: "ORDER_REJECTED",
                                    title: "Order Cancelled",
                                    message: `Order ${orderId} has been cancelled.`,
                                    orderId,
                                    restaurantName,
                                });
                            }
                            break;

                        default:
                            break;
                    }
                }
            });

            // Update ref instead of state to avoid re-renders
            lastOrderCheckRef.current = currentStatusMap;
        } catch (error) {
            console.error("Failed to check order status:", error);
        }
    }, [isAuthenticated, user?.id, addNotification]);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        // Initial check
        checkOrderStatus();

        // Poll every 30 seconds for status updates (fallback)
        checkIntervalRef.current = setInterval(checkOrderStatus, 30000);

        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, [isAuthenticated, user?.id, checkOrderStatus]);

    return {
        notifications,
        unreadCount: useNotificationStore((state) => state.unreadCount()),
    };
}

