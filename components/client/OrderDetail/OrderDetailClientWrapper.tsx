"use client";

import { orderApi } from "@/lib/api/orderApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, OrderStatus } from "@/types/order.type";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import OrderDetailClient from "./OrderDetailClient";

interface OrderDetailClientWrapperProps {
    initialOrder: Order;
}

export default function OrderDetailClientWrapper({ initialOrder }: OrderDetailClientWrapperProps) {
    const { user } = useAuthStore();
    const [order, setOrder] = useState<Order>(initialOrder);

    // Listen for order status updates via WebSocket
    useOrderSocket({
        userId: user?.id || null,
        onOrderStatusUpdate: (notification) => {
            // Backend emits orderId and status at root level, not in data
            const orderId = notification.orderId || notification.data?.orderId;
            const newStatus = notification.status || notification.data?.status;

            // Only update if this is the order we're viewing
            if (!orderId || orderId !== order.orderId) {
                return;
            }

            if (!newStatus) return;

            console.log("[Order Detail] Order status updated via websocket:", orderId, newStatus);

            // Show toast notification
            const statusMessages: Record<string, string> = {
                confirmed: "Order confirmed! Restaurant is preparing your order.",
                preparing: "Restaurant is preparing your order.",
                ready: "Your order is ready! Delivery is on the way.",
                completed: "Order completed! Thank you for your order.",
                cancelled: "Order has been cancelled.",
            };

            const message = statusMessages[newStatus.toLowerCase()] || `Order status updated: ${newStatus}`;
            toast.success(message, { duration: 5000 });

            // Fetch updated order data
            orderApi
                .getOrderBySlug(order.slug)
                .then((updatedOrder) => {
                    setOrder(updatedOrder);
                })
                .catch((error) => {
                    console.error("Failed to fetch updated order:", error);
                    // Still update status from socket data
                    setOrder((prev) => ({
                        ...prev,
                        status: newStatus as OrderStatus,
                    }));
                });
        },
    });

    // Poll for order updates as fallback (every 10 seconds)
    useEffect(() => {
        if (!order.slug) return;

        const intervalId = setInterval(() => {
            orderApi
                .getOrderBySlug(order.slug)
                .then((updatedOrder) => {
                    // Only update if status changed
                    if (updatedOrder.status !== order.status) {
                        setOrder(updatedOrder);
                    }
                })
                .catch((error) => {
                    // Silently fail - socket will handle updates
                    console.debug("Polling order update failed:", error);
                });
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(intervalId);
    }, [order.slug, order.status]);

    return <OrderDetailClient order={order} />;
}

