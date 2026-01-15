"use client";

import { orderApi } from "@/lib/api/orderApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMerchantOrderStore } from "@/stores/useMerchantOrderStore";
import { Order, OrderStatus } from "@/types/order.type";
import { CheckCircle, Package, RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function MerchantOrdersPage() {
    const { user } = useAuthStore();
    const { setPendingOrdersCount } = useMerchantOrderStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState<{ [orderId: string]: string }>({});
    const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);

    const knownOrderIdsRef = useRef<Set<string>>(new Set());

    const audioContextRef = useRef<AudioContext | null>(null);
    const soundEnabledRef = useRef(false);

    useEffect(() => {
        const enableSound = async () => {
            try {
                const AudioCtx =
                    window.AudioContext ||
                    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                if (!AudioCtx) return;
                if (!audioContextRef.current) {
                    audioContextRef.current = new AudioCtx();
                }
                if (audioContextRef.current.state === "suspended") {
                    await audioContextRef.current.resume();
                }
                soundEnabledRef.current = true;
            } catch {
                // Ignore
            }
        };

        const handler = () => {
            void enableSound();
            window.removeEventListener("pointerdown", handler);
            window.removeEventListener("keydown", handler);
        };

        window.addEventListener("pointerdown", handler, { once: true });
        window.addEventListener("keydown", handler, { once: true });

        return () => {
            window.removeEventListener("pointerdown", handler);
            window.removeEventListener("keydown", handler);
        };
    }, []);

    const playNotificationBeep = useCallback(() => {
        try {
            if (!soundEnabledRef.current) {
                return;
            }

            const audioContext = audioContextRef.current;
            if (!audioContext) return;

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.08;

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.12);
        } catch {
            // Audio may be blocked until a user gesture; ignore.
        }
    }, []);

    // Business rule: 1 merchant = 1 restaurant
    useEffect(() => {
        const fetchRestaurantId = async () => {
            if (!user?.id) return;
            try {
                const response = await restaurantApi.getRestaurantByMerchantId(user.id);
                const data = response.data;
                const restaurants = Array.isArray(data) ? data : data ? [data] : [];

                const first = restaurants[0] as { id?: string; _id?: string } | undefined;
                const id = first?.id || first?._id || null;
                setRestaurantId(id);
            } catch (error) {
                console.error("Failed to fetch restaurants:", error);
                setRestaurantId(null);
            }
        };
        fetchRestaurantId();
    }, [user?.id]);

    const fetchOrders = useCallback(
        async (options?: { background?: boolean }) => {
            if (!user?.id || !restaurantId) return;

            try {
                if (!options?.background) {
                    setLoading(true);
                }
                const { orders: restaurantOrders } = await orderApi.getOrdersByRestaurant(restaurantId, user.id);
                // Keep a snapshot of order ids for background change detection.
                knownOrderIdsRef.current = new Set(restaurantOrders.map((o) => o.orderId));
                setOrders(restaurantOrders);
                
                // Update pending orders count
                const pendingCount = restaurantOrders.filter((o) => o.status === OrderStatus.PENDING).length;
                setPendingOrdersCount(pendingCount);
                
                return restaurantOrders;
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                if (!options?.background) {
                    toast.error("Unable to load orders.");
                    setOrders([]);
                }
                return;
            } finally {
                if (!options?.background) {
                    setLoading(false);
                }
            }
        },
        [restaurantId, user?.id]
    );

    const normalizeSocketOrder = useCallback(
        (raw: unknown): Order | null => {
            if (!raw || typeof raw !== "object") return null;

            const record = raw as Record<string, unknown>;
            const orderId = typeof record.orderId === "string" ? record.orderId : undefined;
            if (!orderId) return null;

            const createdAt = typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString();
            const updatedAt = typeof record.updatedAt === "string" ? record.updatedAt : createdAt;

            const status = typeof record.status === "string" ? (record.status as OrderStatus) : OrderStatus.PENDING;
            const paymentStatus =
                typeof record.paymentStatus === "string" ? (record.paymentStatus as Order["paymentStatus"]) : "pending";

            const rawItems = record.items;
            const items = Array.isArray(rawItems)
                ? (rawItems
                      .map((it) => {
                          if (!it || typeof it !== "object") return null;
                          const item = it as Record<string, unknown>;
                          const productId = typeof item.productId === "string" ? item.productId : "";
                          const productName =
                              typeof item.productName === "string"
                                  ? item.productName
                                  : typeof item.name === "string"
                                  ? item.name
                                  : "";
                          const quantity = typeof item.quantity === "number" ? item.quantity : 0;
                          const price = typeof item.price === "number" ? item.price : 0;
                          if (!productName || quantity <= 0) return null;
                          return { productId, productName, quantity, price };
                      })
                      .filter(Boolean) as Order["items"])
                : [];

            const restaurantName = typeof record.restaurantName === "string" ? record.restaurantName : "";
            const restaurantRef = (() => {
                const rawRestaurant = record.restaurant;
                if (rawRestaurant && typeof rawRestaurant === "object") {
                    const rr = rawRestaurant as Record<string, unknown>;
                    const id =
                        typeof rr.id === "string" ? rr.id : typeof rr.restaurantId === "string" ? rr.restaurantId : "";
                    const name = typeof rr.name === "string" ? rr.name : restaurantName;
                    if (id || name) return { id: id || restaurantId || "", name: name || restaurantName };
                }
                return { id: restaurantId || "", name: restaurantName };
            })();

            const finalAmount =
                typeof record.finalAmount === "number"
                    ? record.finalAmount
                    : typeof record.totalAmount === "number"
                    ? record.totalAmount
                    : 0;
            const paymentMethod =
                typeof record.paymentMethod === "string" ? (record.paymentMethod as Order["paymentMethod"]) : "cash";

            const deliveryAddress = (() => {
                const raw = record.deliveryAddress;
                if (!raw || typeof raw !== "object") {
                    return { street: "", city: "", state: "", zipCode: "" };
                }
                const addr = raw as Record<string, unknown>;
                return {
                    street: typeof addr.street === "string" ? addr.street : "",
                    city: typeof addr.city === "string" ? addr.city : "",
                    state: typeof addr.state === "string" ? addr.state : "",
                    zipCode: typeof addr.zipCode === "string" ? addr.zipCode : "",
                };
            })();

            return {
                orderId,
                slug: typeof record.slug === "string" ? record.slug : orderId,
                userId: typeof record.userId === "string" ? record.userId : "",
                restaurant: restaurantRef,
                restaurantId: typeof record.restaurantId === "string" ? record.restaurantId : restaurantRef.id,
                merchantId: typeof record.merchantId === "string" ? record.merchantId : undefined,
                items,
                deliveryAddress,
                totalAmount: typeof record.totalAmount === "number" ? record.totalAmount : finalAmount,
                discount: typeof record.discount === "number" ? record.discount : 0,
                deliveryFee: typeof record.deliveryFee === "number" ? record.deliveryFee : 0,
                tax: typeof record.tax === "number" ? record.tax : 0,
                finalAmount,
                paymentMethod,
                status,
                paymentStatus,
                estimatedDeliveryTime:
                    typeof record.estimatedDeliveryTime === "string" ? record.estimatedDeliveryTime : undefined,
                actualDeliveryTime: typeof record.actualDeliveryTime === "string" ? record.actualDeliveryTime : null,
                orderNote: typeof record.orderNote === "string" ? record.orderNote : undefined,
                rating: null,
                review: "",
                createdAt,
                updatedAt,
            };
        },
        [restaurantId]
    );

    // Connect to socket (single restaurant room)
    const { isConnected: isOrderSocketConnected } = useOrderSocket({
        restaurantId,
        userId: user?.id || null,
        onNewOrder: (notification) => {
            const incoming = normalizeSocketOrder(notification?.data);

            toast.success("New order received!", {
                icon: "🔔",
            });
            playNotificationBeep();

            if (!incoming) {
                fetchOrders({ background: true }).catch(() => {
                    // Ignore background refresh failures
                });
                return;
            }

            setOrders((prev) => {
                if (prev.some((o) => o.orderId === incoming.orderId)) {
                    return prev;
                }
                const next = [incoming, ...prev];
                next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                
                // Update pending orders count
                const pendingCount = next.filter((o) => o.status === OrderStatus.PENDING).length;
                setPendingOrdersCount(pendingCount);
                
                return next;
            });
            knownOrderIdsRef.current.add(incoming.orderId);
        },
    });

    // Poll as a fallback if sockets are unavailable.
    useEffect(() => {
        if (!user?.id || !restaurantId) return;
        if (isOrderSocketConnected) return;

        const intervalId = window.setInterval(async () => {
            try {
                const previousIds = new Set(knownOrderIdsRef.current);
                const { orders: latest } = await orderApi.getOrdersByRestaurant(restaurantId, user.id);
                const newOnes = latest.filter((o) => !previousIds.has(o.orderId));
                if (newOnes.length > 0) {
                    toast.success(`${newOnes.length} new order(s) received!`, { icon: "🔔" });
                    playNotificationBeep();
                    // Ensure newest first
                    setOrders((prev) => {
                        const existing = new Set(prev.map((o) => o.orderId));
                        const merged = [...newOnes.filter((o) => !existing.has(o.orderId)), ...prev];
                        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                        
                        // Update pending orders count
                        const pendingCount = merged.filter((o) => o.status === OrderStatus.PENDING).length;
                        setPendingOrdersCount(pendingCount);
                        
                        return merged;
                    });
                }
                knownOrderIdsRef.current = new Set(latest.map((o) => o.orderId));
            } catch {
                // Ignore polling failures
            }
        }, 15000);

        return () => window.clearInterval(intervalId);
    }, [fetchOrders, isOrderSocketConnected, playNotificationBeep, restaurantId, user?.id]);

    useEffect(() => {
        if (user?.id && restaurantId) {
            fetchOrders();
        }
    }, [user?.id, restaurantId, fetchOrders]);

    const handleAcceptOrder = async (order: Order) => {
        const orderId = (order as Order & { orderId?: string }).orderId || order.orderId;
        try {
            await orderApi.acceptOrder(orderId);
            toast.success("Order accepted successfully.");
            // Refresh orders immediately
            await fetchOrders();
            // Also refresh after a short delay to ensure backend has processed
            setTimeout(() => {
                fetchOrders();
            }, 1000);
        } catch (error: unknown) {
            console.error("Failed to accept order:", error);
            const errorMessage =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast.error(errorMessage || "Unable to accept the order.");
        }
    };

    const handleRejectOrder = async (order: Order) => {
        const orderId = (order as Order & { orderId?: string }).orderId || order.orderId;
        const reason = rejectReason[orderId]?.trim();
        if (!reason) {
            toast.error("Please provide a rejection reason.");
            return;
        }

        try {
            await orderApi.rejectOrder(orderId, reason);
            toast.success("Order rejected.");
            setShowRejectDialog(null);
            setRejectReason((prev) => {
                const next = { ...prev };
                delete next[orderId];
                return next;
            });
            // Refresh orders immediately
            await fetchOrders();
            // Also refresh after a short delay to ensure backend has processed
            setTimeout(() => {
                fetchOrders();
            }, 1000);
        } catch (error: unknown) {
            console.error("Failed to reject order:", error);
            const errorMessage =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast.error(errorMessage || "Unable to reject the order.");
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await orderApi.updateOrderStatus(orderId, newStatus);
            toast.success("Order status updated.");
            fetchOrders({ background: true }).catch(() => {
                // Ignore background refresh failures
            });
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast.error("Unable to update order status.");
        }
    };

    // Backend already uses lowercase statuses that match our enum values
    const normalizeStatus = (status: string): OrderStatus => status as OrderStatus;

    const filteredOrders =
        filterStatus === "ALL" ? orders : orders.filter((order) => normalizeStatus(order.status) === filterStatus);

    const getStatusColor = (status: string) => {
        const normalizedStatus = normalizeStatus(status);
        switch (normalizedStatus) {
            case OrderStatus.PENDING:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case OrderStatus.CONFIRMED:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case OrderStatus.PREPARING:
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            case OrderStatus.READY:
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case OrderStatus.COMPLETED:
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
            case OrderStatus.CANCELLED:
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    const getStatusLabel = (status: string) => {
        const normalizedStatus = normalizeStatus(status);
        const labels: Record<OrderStatus, string> = {
            [OrderStatus.PENDING]: "Pending",
            [OrderStatus.CONFIRMED]: "Confirmed",
            [OrderStatus.PREPARING]: "Preparing",
            [OrderStatus.READY]: "Ready",
            [OrderStatus.COMPLETED]: "Completed",
            [OrderStatus.CANCELLED]: "Cancelled",
        };
        return labels[normalizedStatus] || status;
    };

    const getNextStatus = (currentStatus: string): OrderStatus | null => {
        const normalizedStatus = normalizeStatus(currentStatus);
        switch (normalizedStatus) {
            case OrderStatus.PENDING:
                return OrderStatus.CONFIRMED;
            case OrderStatus.CONFIRMED:
                return OrderStatus.PREPARING;
            case OrderStatus.PREPARING:
                return OrderStatus.READY;
            case OrderStatus.READY:
                return OrderStatus.COMPLETED;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track your restaurant orders</p>
                </div>
                <button
                    onClick={() => {
                        fetchOrders().catch(() => {
                            // Errors are handled inside fetchOrders
                        });
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                    key="total-orders"
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total orders</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orders.length}</p>
                </div>
                <div
                    key="pending-orders"
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                        {orders.filter((o) => o.status === OrderStatus.PENDING).length}
                    </p>
                </div>
                <div
                    key="preparing-orders"
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400">Preparing</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {orders.filter((o) => o.status === OrderStatus.PREPARING).length}
                    </p>
                </div>
                <div
                    key="delivered-orders"
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {orders.filter((o) => o.status === OrderStatus.COMPLETED).length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
                    {(["ALL", ...Object.values(OrderStatus)] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterStatus === status
                                    ? "bg-brand-yellow text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            }`}
                        >
                            {status === "ALL" ? "All" : getStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400 mt-2">No orders yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredOrders.map((order) => {
                                    const normalizedStatus = normalizeStatus(order.status);
                                    const nextStatus = getNextStatus(order.status);
                                    return (
                                        <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {order.orderId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {order.userId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {order.items.length} item(s)
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {order.items
                                                        .slice(0, 2)
                                                        .map((item) => item.productName)
                                                        .join(", ")}
                                                    {order.items.length > 2 && "..."}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    ${Number(order.finalAmount).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                        normalizedStatus
                                                    )}`}
                                                >
                                                    {getStatusLabel(normalizedStatus)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        order.paymentStatus === "paid" ||
                                                        order.paymentStatus === "completed"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                            : order.paymentStatus === "failed"
                                                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                    }`}
                                                >
                                                    {order.paymentStatus === "paid" ||
                                                    order.paymentStatus === "completed"
                                                        ? "Paid"
                                                        : order.paymentStatus === "failed"
                                                        ? "Failed"
                                                        : "Pending"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(order.createdAt).toLocaleString("en-US")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {normalizeStatus(order.status) === OrderStatus.PENDING ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleAcceptOrder(order)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-xs font-medium"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const orderId =
                                                                    (
                                                                        order as Order & {
                                                                            orderId?: string;
                                                                        }
                                                                    ).orderId || order.orderId;
                                                                setShowRejectDialog(orderId);
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs font-medium"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : nextStatus ? (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.orderId, nextStatus)}
                                                        className="text-brand-yellow hover:text-brand-yellow/80"
                                                    >
                                                        Update
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reject Dialog */}
            {showRejectDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reject Order</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Please enter the reason for rejecting this order:
                        </p>
                        <textarea
                            value={rejectReason[showRejectDialog] || ""}
                            onChange={(e) =>
                                setRejectReason((prev) => ({
                                    ...prev,
                                    [showRejectDialog]: e.target.value,
                                }))
                            }
                            placeholder="Example: out of stock, restaurant closed..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow mb-4"
                            rows={4}
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowRejectDialog(null);
                                    setRejectReason((prev) => {
                                        const next = { ...prev };
                                        delete next[showRejectDialog];
                                        return next;
                                    });
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const order = orders.find((o) => {
                                        const oId =
                                            (
                                                o as Order & {
                                                    orderId?: string;
                                                }
                                            ).orderId || o.orderId;
                                        return oId === showRejectDialog;
                                    });
                                    if (order) {
                                        handleRejectOrder(order);
                                    }
                                }}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Confirm rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
