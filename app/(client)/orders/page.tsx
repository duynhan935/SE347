"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import OrdersPageContainer, { type OrdersPageOrder } from "@/components/client/Orders/OrdersPageContainer";
import { orderApi } from "@/lib/api/orderApi";
import { useAuthStore } from "@/stores/useAuthStore";

const OrdersPage = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const authLoading = useAuthStore((state) => state.loading);
    const fetchProfile = useAuthStore((state) => state.fetchProfile);

    const [orders, setOrders] = useState<OrdersPageOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const userId = user?.id;

    const profileRequestedRef = useRef(false);
    const redirectRef = useRef(false);

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

            const items = Array.isArray(typedOrder.items)
                ? typedOrder.items.map((item, itemIndex) => {
                      const fallbackId = `${orderId}-item-${itemIndex + 1}`;
                      return {
                          id: fallbackId,
                          productId: (item.productId ?? fallbackId).toString(),
                          productName: item.productName || "Unknown item",
                          restaurantName,
                          price: typeof item.price === "number" ? item.price : 0,
                          quantity: typeof item.quantity === "number" ? item.quantity : 0,
                          customizations: item.customizations || undefined,
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
                createdAt: typedOrder.createdAt || typedOrder.updatedAt || new Date().toISOString(),
                totalAmount,
                items,
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
            const sorted = [...normalized].sort((a, b) => {
                const getTime = (value: string) => {
                    const timestamp = new Date(value).getTime();
                    return Number.isFinite(timestamp) ? timestamp : 0;
                };
                return getTime(b.createdAt) - getTime(a.createdAt);
            });
            setOrders(sorted);
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
                toast.error("Please login to view your orders");
                router.push("/login");
            }
            return;
        }

        if (userId) {
            fetchOrders();
        }
    }, [authLoading, isAuthenticated, userId, fetchOrders, router, fetchProfile]);

    const handleRetry = useCallback(() => {
        if (!userId) {
            toast.error("Please login to view your orders");
            router.push("/login");
            return;
        }
        fetchOrders();
    }, [fetchOrders, router, userId]);

    return (
        <section>
            <OrdersPageContainer orders={orders} isLoading={isLoading} onRetry={handleRetry} />
        </section>
    );
};

export default OrdersPage;
