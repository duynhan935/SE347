"use client";

import { orderApi } from "@/lib/api/orderApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, OrderStatus } from "@/types/order.type";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import OrderTrackingTimeline from "../Orders/OrderTrackingTimeline";
import { OrderStatusSidebar } from "./OrderStatusSidebar";

// Helper function to parse productId and extract imageURL from encoded options
const parseProductIdForImage = (productId: string): string | null => {
    try {
        const separatorIndex = productId.indexOf("--");
        if (separatorIndex === -1) {
            return null;
        }
        
        const encoded = productId.slice(separatorIndex + 2);
        // Base64 URL decode
        const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "===".slice((base64.length + 3) % 4);
        const binary = atob(padded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const json = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(json);
        
        if (parsed && typeof parsed === "object" && parsed.imageURL) {
            return parsed.imageURL;
        }
    } catch (error) {
        console.debug("[Delivery] Failed to parse productId for image:", error);
    }
    return null;
};

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
    imageURL?: string | null;
};

interface DeliveryStatusPageClientWrapperProps {
    initialOrder: Order;
}

export default function DeliveryStatusPageClientWrapper({ initialOrder }: DeliveryStatusPageClientWrapperProps) {
    const { user } = useAuthStore();
    const { items: cartItems } = useCartStore();
    // Normalize initialOrder status right away to ensure consistency
    const normalizedInitialOrder: Order = {
        ...initialOrder,
        status: (initialOrder.status || "").toLowerCase() as OrderStatus,
    };
    const [order, setOrder] = useState<Order>(normalizedInitialOrder);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    
    // Use ref to store current order to avoid stale closure in websocket callback
    const orderRef = useRef<Order>(normalizedInitialOrder);

    // Update ref when order changes
    useEffect(() => {
        orderRef.current = order;
    }, [order]);

    // Fetch latest order data on mount to ensure we have the most up-to-date status
    // This fixes the issue where completed orders don't show correct status when clicking "Track Order"
    useEffect(() => {
        if (!initialOrder.slug || !isInitialLoad) return;

        setIsInitialLoad(false);
        
        // Always fetch latest order data immediately to ensure we have the most up-to-date status
        // This is critical for completed orders that may have been updated after page cache
        // Use cacheBust: true to force fetch fresh data from server
        orderApi
            .getOrderById(initialOrder.orderId, { cacheBust: true })
            .then((latestOrder) => {
                console.log("[DeliveryStatusPage] Fetched latest order on mount:", latestOrder);
                console.log("[DeliveryStatusPage] Latest order status:", latestOrder.status);
                // Normalize status to ensure consistency
                const normalizedOrder = {
                    ...latestOrder,
                    status: (latestOrder.status || "").toLowerCase() as OrderStatus,
                };
                console.log("[DeliveryStatusPage] Normalized order status:", normalizedOrder.status);
                setOrder(normalizedOrder);
            })
            .catch((error) => {
                console.error("[DeliveryStatusPage] Failed to fetch latest order on mount:", error);
                // Status already normalized in normalizedInitialOrder
            });
    }, [initialOrder.slug, isInitialLoad]);

    // Listen for order status updates via WebSocket
    useOrderSocket({
        userId: user?.id || null,
        onOrderStatusUpdate: (notification) => {
            console.log("[DeliveryStatusPage] Received order status update notification:", notification);
            console.log("[DeliveryStatusPage] Full notification object:", JSON.stringify(notification, null, 2));
            
            // Backend emits orderId and status at root level, not in data
            const notificationOrderId = notification.orderId || notification.data?.orderId;
            const newStatus = notification.status || notification.data?.status;

            // Get current order from ref (always latest)
            const currentOrder = orderRef.current;
            const currentOrderId = currentOrder.orderId;
            const currentSlug = currentOrder.slug;

            console.log("[DeliveryStatusPage] Notification orderId:", notificationOrderId, "Current orderId:", currentOrderId);
            console.log("[DeliveryStatusPage] Notification status:", newStatus, "Current status:", currentOrder.status);

            // Only update if this is the order we're viewing
            if (!notificationOrderId || notificationOrderId !== currentOrderId) {
                console.log("[DeliveryStatusPage] Order ID mismatch, ignoring update. Expected:", currentOrderId, "Got:", notificationOrderId);
                return;
            }

            if (!newStatus) {
                console.log("[DeliveryStatusPage] No status in notification, ignoring");
                return;
            }

            // Normalize status to lowercase to match OrderStatus enum
            const normalizedNewStatus = (newStatus || "").toLowerCase() as OrderStatus;
            const normalizedCurrentStatus = (currentOrder.status || "").toLowerCase();
            
            // Skip if status hasn't actually changed
            if (normalizedNewStatus === normalizedCurrentStatus) {
                console.log("[DeliveryStatusPage] Status unchanged, skipping update:", normalizedNewStatus);
                return;
            }

            console.log("[DeliveryStatusPage] Updating order status from socket:", normalizedCurrentStatus, "->", normalizedNewStatus);

            // Show toast notification
            const statusMessages: Record<string, string> = {
                confirmed: "Order confirmed! Restaurant is preparing your order.",
                preparing: "Restaurant is preparing your order.",
                ready: "Your order is ready! Delivery is on the way.",
                completed: "Order completed! Thank you for your order.",
                cancelled: "Order has been cancelled.",
            };

            const message = statusMessages[normalizedNewStatus] || `Order status updated: ${normalizedNewStatus}`;
            toast.success(message, { duration: 5000 });

            // Update order status immediately from socket data (optimistic update)
            // This ensures UI updates immediately, including OrderTrackingTimeline
            setOrder((prevOrder) => {
                console.log("[DeliveryStatusPage] Setting order status to:", normalizedNewStatus);
                return {
                    ...prevOrder,
                    status: normalizedNewStatus,
                };
            });

            // Fetch updated order data to get all latest information (estimatedDeliveryTime, etc.)
            // Use cacheBust: true to force fetch fresh data
            setIsUpdating(true);
            orderApi
                .getOrderById(currentOrderId, { cacheBust: true })
                .then((fetchedOrder) => {
                    console.log("[DeliveryStatusPage] Fetched updated order after socket update:", fetchedOrder);
                    console.log("[DeliveryStatusPage] Fetched order status:", fetchedOrder.status);
                    // Normalize status to ensure consistency
                    const normalizedOrder = {
                        ...fetchedOrder,
                        status: (fetchedOrder.status || "").toLowerCase() as OrderStatus,
                    };
                    console.log("[DeliveryStatusPage] Setting order with normalized status:", normalizedOrder.status);
                    setOrder(normalizedOrder);
                })
                .catch((error) => {
                    console.error("[DeliveryStatusPage] Failed to fetch updated order:", error);
                    // Status already updated from socket data above, so UI is already updated
                    // Still update status from socket data as fallback to ensure consistency
                    setOrder((prev) => ({
                        ...prev,
                        status: normalizedNewStatus,
                    }));
                })
                .finally(() => {
                    setIsUpdating(false);
                });
        },
    });

    // Poll for order updates as fallback (every 5 seconds for faster sync)
    // This ensures we catch status updates even if socket fails
    useEffect(() => {
        if (!order.orderId) return;

        // Don't poll if order is completed or cancelled (no more updates expected)
        const normalizedStatus = (order.status || "").toLowerCase();
        if (normalizedStatus === OrderStatus.COMPLETED || normalizedStatus === OrderStatus.CANCELLED) {
            return;
        }

        const intervalId = setInterval(() => {
            console.log("[DeliveryStatusPage] Polling for order updates...");
            orderApi
                .getOrderById(order.orderId, { cacheBust: true })
                .then((updatedOrder) => {
                    // Normalize status for comparison
                    const normalizedUpdatedStatus = (updatedOrder.status || "").toLowerCase();
                    const normalizedCurrentStatus = (order.status || "").toLowerCase();
                    
                    console.log("[DeliveryStatusPage] Polling result - Current:", normalizedCurrentStatus, "Fetched:", normalizedUpdatedStatus);
                    
                    // Update if status changed or estimated time might have changed
                    if (
                        normalizedUpdatedStatus !== normalizedCurrentStatus ||
                        updatedOrder.estimatedDeliveryTime !== order.estimatedDeliveryTime
                    ) {
                        console.log("[DeliveryStatusPage] Polling detected change! Updating order status:", normalizedCurrentStatus, "->", normalizedUpdatedStatus);
                        const normalizedOrder = {
                            ...updatedOrder,
                            status: normalizedUpdatedStatus as OrderStatus,
                        };
                        setOrder(normalizedOrder);
                        
                        // Show toast if status changed
                        if (normalizedUpdatedStatus !== normalizedCurrentStatus) {
                            const statusMessages: Record<string, string> = {
                                confirmed: "Order confirmed! Restaurant is preparing your order.",
                                preparing: "Restaurant is preparing your order.",
                                ready: "Your order is ready! Delivery is on the way.",
                                completed: "Order completed! Thank you for your order.",
                                cancelled: "Order has been cancelled.",
                            };
                            const message = statusMessages[normalizedUpdatedStatus] || `Order status updated: ${normalizedUpdatedStatus}`;
                            toast.success(message, { duration: 5000 });
                        }
                    }
                })
                .catch((error) => {
                    // Silently fail - socket will handle updates
                    console.debug("[DeliveryStatusPage] Polling order update failed:", error);
                });
        }, 5000); // Poll every 5 seconds for faster sync

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

    const displayItems: DisplayOrderItem[] = order.items.map((item, index) => {
        // Priority: cartItemImage > imageURL > productId encoded options > cart store > null
        let imageURL: string | null = null;
        
        // Helper function to check if image URL is valid
        const isValidImageUrl = (url: string | null | undefined): boolean => {
            if (!url || typeof url !== "string") return false;
            const trimmed = url.trim();
            return trimmed !== "" && trimmed !== "/placeholder.png";
        };
        
        // 1. Check cartItemImage first (vì cart chỉ có cartItemImage)
        if (isValidImageUrl(item.cartItemImage)) {
            imageURL = item.cartItemImage!.trim();
        }
        // 2. Fallback to imageURL if cartItemImage is not available
        else if (isValidImageUrl(item.imageURL)) {
            imageURL = item.imageURL!.trim();
        }
        // 3. Try to extract imageURL from productId encoded options
        else {
            const imageFromProductId = parseProductIdForImage(item.productId);
            if (isValidImageUrl(imageFromProductId)) {
                imageURL = imageFromProductId!.trim();
            }
        }
        
        // 4. If still no image, try to find it from cart store by productId
        if (!imageURL) {
            const cartItem = cartItems.find(
                (cartItem) => cartItem.baseProductId === item.productId || cartItem.id === item.productId
            );
            if (cartItem) {
                const cartImageUrl = getImageUrl(cartItem.image);
                if (isValidImageUrl(cartImageUrl)) {
                    imageURL = cartImageUrl;
                }
            }
        }
        
        return {
            id: `${order.orderId}-${item.productId}-${index}`,
            name: item.productName,
            shopName: order.restaurant?.name || "Restaurant",
            price: item.price,
            quantity: item.quantity,
            note: item.customizations,
            imageURL: imageURL,
        };
    });

    const totalItems = displayItems.reduce((sum, item) => sum + item.quantity, 0);

    const status: DisplayOrderStatus = (() => {
        // Normalize status to handle case-insensitive comparisons
        const normalizedStatus = (order.status || "").toLowerCase() as OrderStatus;
        
        console.log("[DeliveryStatusPage] Current order status:", order.status, "Normalized:", normalizedStatus);
        
        const isCancelled = normalizedStatus === OrderStatus.CANCELLED;
        // Order Received: Success if status is not pending
        const isReceived = normalizedStatus !== OrderStatus.PENDING;
        // Restaurant Status: Success if status is confirmed, preparing, ready, or completed
        // This matches timeline step 1 (Preparing) which includes CONFIRMED and PREPARING
        const isRestaurantDone =
            normalizedStatus === OrderStatus.CONFIRMED ||
            normalizedStatus === OrderStatus.PREPARING ||
            normalizedStatus === OrderStatus.READY ||
            normalizedStatus === OrderStatus.COMPLETED;
        // Delivery Status: Success only if order is completed
        // This matches timeline step 3 (Completed)
        const isDelivering = normalizedStatus === OrderStatus.COMPLETED;

        const estimatedTime = (() => {
            // Don't calculate estimated time if order is completed or cancelled
            if (normalizedStatus === OrderStatus.COMPLETED || normalizedStatus === OrderStatus.CANCELLED) {
                return 0;
            }
            
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

    const canCancel = (order.status || "").toLowerCase() === OrderStatus.PENDING;

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
                    <OrderTrackingTimeline status={(order.status || "").toLowerCase() as OrderStatus} />

                    <div className="space-y-8">
                        {Object.entries(groupedItems).map(([shopName, items]) => (
                            <div key={shopName}>
                                <h2 className="text-lg font-semibold mb-2">{shopName}</h2>
                                <div className="space-y-4 border-t">
                                    {items.map((item) => {
                                        const imageUrl = getImageUrl(item.imageURL || null);
                                        const finalImageUrl = imageUrl || "/placeholder.png";
                                        const hasImage = finalImageUrl && finalImageUrl !== "/placeholder.png";
                                        
                                        return (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-4 pt-4 border-b pb-2 last:border-b-0"
                                        >
                                            {/* Product image */}
                                            {hasImage ? (
                                                <div className="relative w-[64px] h-[64px] rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <Image
                                                        src={finalImageUrl}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                        unoptimized={finalImageUrl.startsWith("http")}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-[64px] h-[64px] rounded-md bg-gray-200 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="flex-grow">
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-gray-500">{item.note}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column: Order status information */}
                <div className="lg:col-span-1">
                    <OrderStatusSidebar 
                        status={status} 
                        orderId={order.orderId} 
                        canCancel={canCancel}
                        orderStatus={order.status}
                        order={order}
                        onOrderUpdate={async () => {
                            // Refresh order data after payment
                            try {
                                const updatedOrder = await orderApi.getOrderById(order.orderId, { cacheBust: true });
                                const normalizedOrder = {
                                    ...updatedOrder,
                                    status: (updatedOrder.status || "").toLowerCase() as OrderStatus,
                                };
                                setOrder(normalizedOrder);
                            } catch (error) {
                                console.error("[DeliveryStatusPage] Failed to refresh order after payment:", error);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
