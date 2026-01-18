"use client";

import { orderApi } from "@/lib/api/orderApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, OrderStatus } from "@/types/order.type";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import OrderTrackingTimeline from "../Orders/OrderTrackingTimeline";
import { OrderStatusSidebar } from "./OrderStatusSidebar";

type StatusType = "Pending" | "Success" | "Cancel";

type DisplayOrderStatus = {
    orderValidate: StatusType;
    orderReceived: StatusType;
    restaurantStatus: StatusType;
    deliveryStatus: StatusType;
    estimatedTime: number;
};

type DisplayOrderItem = {
    id: string;
    name: string;
    shopName: string;
    price: number;
    quantity: number;
    note?: string;
};

interface DeliveryStatusPageClientWrapperProps {
    initialOrder: Order;
}

export default function DeliveryStatusPageClientWrapper({ initialOrder }: DeliveryStatusPageClientWrapperProps) {
    const { user } = useAuthStore();
    const [order, setOrder] = useState<Order>(initialOrder);
    const [isUpdating, setIsUpdating] = useState(false);

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
            setIsUpdating(true);
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
                })
                .finally(() => {
                    setIsUpdating(false);
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
                    // Update if status changed or estimated time might have changed
                    if (
                        updatedOrder.status !== order.status ||
                        updatedOrder.estimatedDeliveryTime !== order.estimatedDeliveryTime
                    ) {
                        setOrder(updatedOrder);
                    }
                })
                .catch((error) => {
                    // Silently fail - socket will handle updates
                    console.debug("Polling order update failed:", error);
                });
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(intervalId);
    }, [order.slug, order.status, order.estimatedDeliveryTime]);

    // Update estimated time every minute for real-time countdown
    useEffect(() => {
        if (
            !order.orderId ||
            !order.estimatedDeliveryTime ||
            order.status === OrderStatus.COMPLETED ||
            order.status === OrderStatus.CANCELLED
        ) {
            return;
        }

        const intervalId = setInterval(() => {
            // Force re-render to update estimated time countdown
            setOrder((prevOrder) => ({ ...prevOrder }));
        }, 60000); // Update every minute

        return () => clearInterval(intervalId);
    }, [order.orderId, order.estimatedDeliveryTime, order.status]);

    const displayItems: DisplayOrderItem[] = order.items.map((item, index) => ({
        id: `${order.orderId}-${item.productId}-${index}`,
        name: item.productName,
        shopName: order.restaurant?.name || "Restaurant",
        price: item.price,
        quantity: item.quantity,
        note: item.customizations,
    }));

    const totalItems = displayItems.reduce((sum, item) => sum + item.quantity, 0);

    const status: DisplayOrderStatus = (() => {
        const isCancelled = order.status === OrderStatus.CANCELLED;
        // Order Received: Success if status is not pending
        const isReceived = order.status !== OrderStatus.PENDING;
        // Restaurant Status: Success if status is confirmed, preparing, ready, or completed
        // This matches timeline step 1 (Preparing) which includes CONFIRMED and PREPARING
        const isRestaurantDone =
            order.status === OrderStatus.CONFIRMED ||
            order.status === OrderStatus.PREPARING ||
            order.status === OrderStatus.READY ||
            order.status === OrderStatus.COMPLETED;
        // Delivery Status: Success only if order is completed
        // This matches timeline step 3 (Completed)
        const isDelivering = order.status === OrderStatus.COMPLETED;

        const estimatedTime = (() => {
            if (!order.estimatedDeliveryTime) return 60; // Default to 1 hour if no estimated time
            try {
                // Handle different date formats from backend
                const eta = new Date(order.estimatedDeliveryTime).getTime();
                if (Number.isNaN(eta)) return 60; // Default to 1 hour if invalid date

                const now = Date.now();
                const diffMs = eta - now;
                const diffMinutes = Math.round(diffMs / 60000);

                // Cap at maximum 60 minutes (1 hour)
                // If estimated time is in the past, negative, or exceeds 60 minutes, default to 60 minutes
                if (diffMinutes < 0 || diffMinutes > 60) {
                    return 60; // Default to 1 hour
                }

                // Return calculated time (0-60 minutes)
                return diffMinutes;
            } catch (error) {
                console.error("Error calculating estimated time:", error, order.estimatedDeliveryTime);
                return 60; // Default to 1 hour on error
            }
        })();

        return {
            orderValidate: "Success",
            orderReceived: isCancelled ? "Cancel" : isReceived ? "Success" : "Pending",
            restaurantStatus: isCancelled ? "Cancel" : isRestaurantDone ? "Success" : "Pending",
            deliveryStatus: isCancelled ? "Cancel" : isDelivering ? "Success" : "Pending",
            estimatedTime,
        };
    })();

    const canCancel = order.status === OrderStatus.PENDING;

    const groupedItems = displayItems.reduce(
        (acc, item) => {
            const { shopName } = item;
            if (!acc[shopName]) {
                acc[shopName] = [];
            }
            acc[shopName].push(item);
            return acc;
        },
        {} as Record<string, DisplayOrderItem[]>,
    );

    if (!order) {
        notFound();
    }

    return (
        <div className="custom-container py-12">
            {isUpdating && (
                <div className="fixed top-20 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Updating order status...</span>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                {/* Left column: Order details */}
                <div className="lg:col-span-2 space-y-6 p-3 sm:p-1 md:p-12">
                    <h1 className="text-3xl font-bold">
                        Order Tracking ({totalItems} {totalItems > 1 ? "items" : "item"})
                    </h1>

                    {/* Order Status Timeline */}
                    <OrderTrackingTimeline status={order.status} />

                    <div className="space-y-8">
                        {Object.entries(groupedItems).map(([shopName, items]) => (
                            <div key={shopName}>
                                <h2 className="text-lg font-semibold mb-2">{shopName}</h2>
                                <div className="space-y-4 border-t">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-4 pt-4 border-b pb-2 last:border-b-0"
                                        >
                                            <div className="w-[64px] h-[64px] rounded-md bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                                No Image
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-gray-500">{item.note}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column: Order status information */}
                <div className="lg:col-span-1">
                    <OrderStatusSidebar status={status} orderId={order.orderId} canCancel={canCancel} />
                </div>
            </div>
        </div>
    );
}
