"use client";

import OrdersPageContainer, { type OrdersPageOrder } from "@/components/client/Orders/OrdersPageContainer";
import { orderApi } from "@/lib/api/orderApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const OrdersPage = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const authLoading = useAuthStore((state) => state.loading);
    const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
    const fetchProfile = useAuthStore((state) => state.fetchProfile);

    const [orders, setOrders] = useState<OrdersPageOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState<string>("recent");
    const userId = user?.id;
    const pathname = usePathname();
    const { markAllAsRead, markOrderNotificationsAsRead, notifications } = useNotificationStore();

    const profileRequestedRef = useRef(false);
    const redirectRef = useRef(false);
    const hasMarkedAsReadRef = useRef(false);

    const mapOrders = useCallback((apiOrders: unknown[]): OrdersPageOrder[] => {
        return apiOrders.map((order, orderIndex) => {
            if (!order || typeof order !== "object") {
                return {
                    id: `order-${orderIndex + 1}`,
                    createdAt: new Date().toISOString(),
                    totalAmount: 0,
                    items: [],
                };
            }

            const typedOrder = order as {
                orderId?: string | number;
                slug?: string;
                id?: string | number;
                _id?: string | number;
                createdAt?: string;
                updatedAt?: string;
                finalAmount?: number;
                totalAmount?: number;
                status?: string;
                paymentStatus?: string;
                items?: Array<{
                    productId?: string | number;
                    productName?: string;
                    price?: number;
                    quantity?: number;
                    customizations?: string;
                }>;
                restaurant?: { name?: string };
                restaurantName?: string;
            };

            const orderId =
                typedOrder.orderId?.toString() ||
                typedOrder.slug?.toString() ||
                typedOrder.id?.toString() ||
                typedOrder._id?.toString() ||
                `order-${orderIndex + 1}`;

            const restaurantName = typedOrder.restaurant?.name || typedOrder.restaurantName || "Restaurant";
            const restaurantId =
                (typedOrder.restaurant as { id?: string })?.id ||
                (typedOrder as { restaurantId?: string }).restaurantId ||
                undefined;

            const items = Array.isArray(typedOrder.items)
                ? typedOrder.items.map((item, itemIndex) => {
                      const fallbackId = `${orderId}-item-${itemIndex + 1}`;
                      return {
                          id: fallbackId,
                          productId: (item.productId ?? fallbackId).toString(),
                          productName: item.productName || "Unknown item",
                          restaurantId,
                          restaurantName,
                          price: typeof item.price === "number" ? item.price : 0,
                          quantity: typeof item.quantity === "number" ? item.quantity : 0,
                          customizations: item.customizations || undefined,
                          imageURL: (item as { imageURL?: string | null }).imageURL || undefined,
                      };
                  })
                : [];

            const totalAmount = (() => {
                if (typeof typedOrder.finalAmount === "number") return typedOrder.finalAmount;
                if (typeof typedOrder.totalAmount === "number") return typedOrder.totalAmount;
                return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            })();

            return {
                id: orderId,
                slug: typedOrder.slug || undefined, // Include slug if available
                createdAt: typedOrder.createdAt || typedOrder.updatedAt || new Date().toISOString(),
                totalAmount,
                items,
                status: typedOrder.status as OrdersPageOrder["status"],
                paymentStatus: typedOrder.paymentStatus,
            };
        });
    }, []);

    const fetchOrders = useCallback(async () => {
        if (!userId) {
            return;
        }

        setIsLoading(true);
        try {
            const { orders: apiOrders } = await orderApi.getOrdersByUser(userId);
            const normalized = mapOrders(apiOrders ?? []);
            setOrders(normalized);
        } catch (error) {
            console.error("Failed to load orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    }, [mapOrders, userId]);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (isAuthenticated && !userId) {
            if (!profileRequestedRef.current) {
                profileRequestedRef.current = true;
                fetchProfile().catch((error) => {
                    console.error("Failed to fetch profile before loading orders:", error);
                });
            }
            return;
        }

        if (!isAuthenticated && !userId) {
            if (!redirectRef.current) {
                redirectRef.current = true;
                setIsLoading(false);
                // Don't show toast if user is logging out (to avoid duplicate toasts)
                if (!isLoggingOut) {
                    toast.error("Please login to view your orders");
                }
                router.push("/login");
            }
            return;
        }

        if (userId) {
            // Fetch orders immediately
            fetchOrders();

            // If coming from payment page, also retry after a delay to ensure new orders are loaded
            // This handles cases where order creation is still in progress
            const isFromPayment = typeof window !== "undefined" && document.referrer.includes("/payment");
            if (isFromPayment) {
                // Retry fetching orders after a short delay to ensure backend has persisted the order
                const retryTimer = setTimeout(() => {
                    fetchOrders();
                }, 1500);
                return () => clearTimeout(retryTimer);
            }
        }
    }, [authLoading, isAuthenticated, userId, isLoggingOut, fetchOrders, router, fetchProfile]);

    // Mark order notifications as read when user views orders page
    useEffect(() => {
        if (!isLoading && !hasMarkedAsReadRef.current) {
            // Mark all order notifications as read when page loads
            const timer = setTimeout(() => {
                markAllAsRead();
                hasMarkedAsReadRef.current = true;
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isLoading, markAllAsRead]);

    // Auto-mark order notifications as read when user is on orders page and receives new notifications
    useEffect(() => {
        if (pathname === "/orders" && !isLoading) {
            // Mark all unread order notifications as read when user is on orders page
            const unreadOrderNotifications = notifications.filter(
                (notif) => !notif.read && (notif.type === "ORDER_ACCEPTED" || notif.type === "ORDER_REJECTED"),
            );
            if (unreadOrderNotifications.length > 0) {
                markOrderNotificationsAsRead();
            }
        }
    }, [notifications, pathname, isLoading, markOrderNotificationsAsRead]);

    // Reset hasMarkedAsReadRef when user changes
    useEffect(() => {
        hasMarkedAsReadRef.current = false;
    }, [userId]);

    // Listen for order status updates via websocket and update orders list
    useOrderSocket({
        userId: userId || null,
        onOrderStatusUpdate: (notification) => {
            // Backend emits orderId and status at root level, useOrderSocket transforms to data
            const orderId = notification.data?.orderId || notification.orderId;
            const newStatus = (notification.data?.status || notification.status) as OrdersPageOrder["status"];

            if (!orderId || !newStatus) return;

            // Update the order in the local state
            setOrders((prevOrders) => {
                const orderIndex = prevOrders.findIndex((o) => o.id === orderId);
                if (orderIndex === -1) {
                    // Order not found in current list, might be a new order or need to refresh
                    // Optionally refresh to get the updated order
                    setTimeout(() => {
                        fetchOrders().catch(() => {
                            // Ignore errors
                        });
                    }, 500);
                    return prevOrders;
                }

                // Update the order's status
                const updatedOrders = [...prevOrders];
                updatedOrders[orderIndex] = {
                    ...updatedOrders[orderIndex],
                    status: newStatus,
                };

                return updatedOrders;
            });
        },
    });

    const handleRetry = useCallback(() => {
        if (!userId) {
            toast.error("Please login to view your orders");
            router.push("/login");
            return;
        }
        fetchOrders();
    }, [fetchOrders, router, userId]);

    const handleSortChange = useCallback(
        (sortValue: string) => {
            setSortBy(sortValue);
            const sorted = [...orders].sort((a, b) => {
                switch (sortValue) {
                    case "recent":
                        const getTime = (value: string) => {
                            const timestamp = new Date(value).getTime();
                            return Number.isFinite(timestamp) ? timestamp : 0;
                        };
                        return getTime(b.createdAt) - getTime(a.createdAt);
                    case "oldest":
                        const getTimeOldest = (value: string) => {
                            const timestamp = new Date(value).getTime();
                            return Number.isFinite(timestamp) ? timestamp : 0;
                        };
                        return getTimeOldest(a.createdAt) - getTimeOldest(b.createdAt);
                    case "amount-high":
                        return b.totalAmount - a.totalAmount;
                    case "amount-low":
                        return a.totalAmount - b.totalAmount;
                    case "status":
                        const statusOrder: Record<string, number> = {
                            PENDING: 1,
                            CONFIRMED: 2,
                            PREPARING: 3,
                            READY: 4,
                            COMPLETED: 5,
                            CANCELLED: 6,
                        };
                        const aStatus = a.status || "";
                        const bStatus = b.status || "";
                        return (statusOrder[aStatus] || 99) - (statusOrder[bStatus] || 99);
                    default:
                        return 0;
                }
            });
            setOrders(sorted);
        },
        [orders],
    );

    return (
        <section>
            <OrdersPageContainer
                orders={orders}
                isLoading={isLoading}
                onRetry={handleRetry}
                onSortChange={handleSortChange}
            />
        </section>
    );
};

export default OrdersPage;
