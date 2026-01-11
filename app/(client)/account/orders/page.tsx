"use client";

import { orderApi } from "@/lib/api/orderApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, OrderStatus } from "@/types/order.type";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface OrderDisplay {
    id: string;
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

    // Get status badge color classes
    const getStatusBadgeClass = (status: string): string => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes("completed")) {
            return "bg-green-100 text-green-800";
        }
        if (statusLower.includes("cancelled")) {
            return "bg-red-100 text-red-800";
        }
        if (statusLower.includes("pending")) {
            return "bg-yellow-100 text-yellow-800";
        }
        if (statusLower.includes("preparing") || statusLower.includes("ready")) {
            return "bg-blue-100 text-blue-800";
        }
        if (statusLower.includes("confirmed")) {
            return "bg-indigo-100 text-indigo-800";
        }
        return "bg-gray-100 text-gray-800";
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

                return {
                    id: order.orderId,
                    uniqueKey,
                    displayId: order.orderId || `#${index + 1}`,
                    date: orderDate,
                    total: `$${Number(order.finalAmount || 0).toFixed(2)}`,
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

    if (!mounted || authLoading || isLoading) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Order History</h1>
                <p className="text-gray-500">View all your past orders</p>
            </div>

                        {orders.length === 0 ? (
                                <div className="text-center py-12">
                                        <p className="text-gray-500 text-lg mb-4">No orders found</p>
                                        <Link
                                                href="/restaurants"
                                                className="text-sm font-semibold text-brand-purple hover:underline"
                                        >
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
                                                        <div className="flex items-center gap-4">
                                                                <span
                                                                        className={`px-3 py-1 text-xs font-semibold rounded-full ${order.statusClass}`}
                                                                >
                                                                        {order.status}
                                                                </span>
                                                                <Link
                                                                        href={`/orders/${order.id}`}
                                                                        className="text-sm font-semibold text-brand-purple hover:underline"
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
