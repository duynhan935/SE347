"use client";

import { orderApi } from "@/lib/api/orderApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, OrderStatus } from "@/types/order.type";
import { Loader2, Truck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface OrderDisplay {
    id: string;
    slug?: string; // Order slug for URL routing
    uniqueKey: string; // For React key
    displayId: string; // For display
    date: string;
    total: string;
    status: string;
    statusClass: string;
    orderCode?: string;
}

export default function OrderHistoryPage() {
    const { user, loading: authLoading } = useAuthStore();
    const [orders, setOrders] = useState<OrderDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Format status for display
    const formatStatus = (status: string): string => {
        const statusMap: Record<string, string> = {
            pending: "Pending",
            confirmed: "Confirmed",
            preparing: "Preparing",
            ready: "Ready",
            completed: "Completed",
            cancelled: "Cancelled",
        };
        return statusMap[status.toLowerCase()] || status;
    };

    // Get status badge color classes - Orange for processing, Green for completed, Red for cancelled
    const getStatusBadgeClass = (status: string): string => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes("completed")) {
            return "text-green-600";
        }
        if (statusLower.includes("cancelled")) {
            return "text-red-600";
        }
        // All processing states (pending, confirmed, preparing, ready)
        return "text-[#EE4D2D]";
    };

    const fetchOrders = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { orders: apiOrders } = await orderApi.getOrdersByUser(user.id);

            // Sort orders by createdAt (newest first)
            const sortedOrders = [...apiOrders].sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });

            // Map to display format
            const mappedOrders: OrderDisplay[] = sortedOrders.map((order: Order, index: number) => {
                const orderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                      })
                    : "N/A";

                const status = formatStatus(order.status || OrderStatus.PENDING);
                const orderId = order.orderId || `order-${index}`;
                const uniqueKey = order.createdAt
                    ? `${orderId}-${new Date(order.createdAt).getTime()}`
                    : `${orderId}-${index}`;

                // Format price to USD
                const formatPrice = (priceUSD: number): string => {
                    return priceUSD.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });
                };

                return {
                    id: order.orderId,
                    slug: order.slug || undefined, // Include slug if available
                    uniqueKey,
                    displayId: order.orderId || `#${index + 1}`,
                    date: orderDate,
                    total: `$${formatPrice(Number(order.finalAmount || 0))}`,
                    status,
                    statusClass: getStatusBadgeClass(status),
                    orderCode: order.orderId,
                };
            });

            setOrders(mappedOrders);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Failed to load orders");
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && user?.id && !authLoading) {
            fetchOrders();
        }
    }, [mounted, user?.id, authLoading, fetchOrders]);

    // Listen for order status updates via websocket and update orders list
    useOrderSocket({
        userId: user?.id || null,
        onOrderStatusUpdate: (notification) => {
            // Backend emits orderId and status at root level, useOrderSocket transforms to data
            const orderId = notification.data?.orderId || notification.orderId;
            const newStatus = (notification.data?.status || notification.status || "").toLowerCase();

            if (!orderId || !newStatus) return;

            // Show toast notification for status updates
            const statusMessages: Record<string, string> = {
                confirmed: "Order confirmed! Restaurant is preparing your order.",
                preparing: "Restaurant is preparing your order.",
                ready: "Your order is ready! Delivery is on the way.",
                completed: "Order completed! Thank you for your order.",
                cancelled: "Order has been cancelled.",
            };
            const message = statusMessages[newStatus] || `Order ${orderId} status updated to ${newStatus}`;
            toast.success(message, { duration: 3000 });

            // Update the order in the local state
            setOrders((prevOrders) => {
                const orderIndex = prevOrders.findIndex((o) => o.id === orderId);
                if (orderIndex === -1) {
                    // Order not found in current list, refresh to get the updated order
                    setTimeout(() => {
                        fetchOrders().catch(() => {
                            // Ignore errors
                        });
                    }, 500);
                    return prevOrders;
                }

                // Update the order's status
                const updatedOrders = [...prevOrders];
                const updatedOrder = {
                    ...updatedOrders[orderIndex],
                    status: formatStatus(newStatus),
                    statusClass: getStatusBadgeClass(newStatus),
                };
                updatedOrders[orderIndex] = updatedOrder;

                return updatedOrders;
            });
        },
    });

    // Poll for order status updates as fallback (every 10 seconds)
    // This ensures orders are updated even if websocket fails
    useEffect(() => {
        if (!user?.id || isLoading || !mounted) return;

        const intervalId = setInterval(() => {
            // Silently fetch orders to check for status updates
            orderApi
                .getOrdersByUser(user.id)
                .then(({ orders: apiOrders }) => {
                    // Sort orders by createdAt (newest first)
                    const sortedOrders = [...apiOrders].sort((a, b) => {
                        const dateA = new Date(a.createdAt || 0).getTime();
                        const dateB = new Date(b.createdAt || 0).getTime();
                        return dateB - dateA;
                    });

                    // Map to display format
                    const mappedOrders: OrderDisplay[] = sortedOrders.map((order: Order, index: number) => {
                        const orderDate = order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                              })
                            : "N/A";

                        const status = formatStatus(order.status || OrderStatus.PENDING);
                        const orderId = order.orderId || `order-${index}`;
                        const uniqueKey = order.createdAt
                            ? `${orderId}-${new Date(order.createdAt).getTime()}`
                            : `${orderId}-${index}`;

                        // Format price to USD
                        const formatPrice = (priceUSD: number): string => {
                            return priceUSD.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            });
                        };

                        return {
                            id: order.orderId,
                            uniqueKey,
                            displayId: order.orderId || `#${index + 1}`,
                            date: orderDate,
                            total: `$${formatPrice(Number(order.finalAmount || 0))}`,
                            status,
                            statusClass: getStatusBadgeClass(status),
                            orderCode: order.orderId,
                        };
                    });

                    // Check if any order status has changed
                    setOrders((prevOrders) => {
                        const hasChanges = prevOrders.some((prevOrder, index) => {
                            const newOrder = mappedOrders[index];
                            return newOrder && prevOrder.status !== newOrder.status;
                        });

                        // Only update if there are changes to avoid unnecessary re-renders
                        if (hasChanges || prevOrders.length !== mappedOrders.length) {
                            return mappedOrders;
                        }
                        return prevOrders;
                    });
                })
                .catch((error) => {
                    // Silently fail - websocket will handle updates if available
                    console.debug("[Order History Page] Polling update failed:", error);
                });
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(intervalId);
    }, [user?.id, isLoading, mounted, fetchOrders]);

    if (!mounted || authLoading || isLoading) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D]" />
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Order History</h1>
                <p className="text-gray-500">View all your past orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">No orders found</p>
                    <Link href="/restaurants" className="text-sm font-semibold text-[#EE4D2D] hover:underline">
                        Browse Restaurants →
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.uniqueKey}
                            className="border p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex-1">
                                <p className="font-bold text-lg text-brand-black">{order.displayId}</p>
                                <p className="text-sm text-gray-500">{order.date}</p>
                                <p className="font-semibold text-brand-purple mt-1">{order.total}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-sm font-semibold ${order.statusClass}`}>{order.status}</span>
                                {/* Track Order Button - Below Status */}
                                {order.status && !order.status.toLowerCase().includes("cancelled") && (
                                    <Link
                                        href={`/delivery/${order.slug || order.orderCode || order.id}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
                                    >
                                        <Truck className="w-3 h-3" />
                                        Track Order
                                    </Link>
                                )}
                                <Link
                                    href={`/orders/${order.slug || order.orderCode || order.id}`}
                                    className="text-sm font-semibold text-[#EE4D2D] hover:underline"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
