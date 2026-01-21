import { Order, OrderStatus } from "@/types/order.type";
import api from "../axios";
import { restaurantApi } from "./restaurantApi";

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CreateOrderRequest {
    userId: string;
    restaurantId: string;
    restaurantName: string;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    items: {
        productId: string;
        productName: string;
        quantity: number;
        price: number;
        customizations?: string;
    }[];
    paymentMethod: "card";
    orderNote?: string;
    discount?: number;
    deliveryFee?: number;
    userLat: number;
    userLon: number;
}

export const orderApi = {
    // Public: Get an order by ID
    getOrderById: async (orderId: string, options?: { cacheBust?: boolean }): Promise<Order> => {
        const cacheBust = options?.cacheBust !== false; // Default to true
        const url = cacheBust ? `/orders/${orderId}?t=${Date.now()}` : `/orders/${orderId}`;
        const response = await api.get<{ success: boolean; data: Order }>(url);
        return response.data.data;
    },

    // Public: Get an order by slug
    getOrderBySlug: async (slug: string, options?: { cacheBust?: boolean }): Promise<Order> => {
        // Add cache-busting query param to force fetch fresh data.
        // Avoid sending custom cache-control headers here because they trigger
        // a CORS preflight and the backend does not allow them in Access-Control-Allow-Headers.
        const cacheBust = options?.cacheBust !== false; // Default to true
        const url = cacheBust ? `/orders/slug/${slug}?t=${Date.now()}` : `/orders/slug/${slug}`;

        const response = await api.get<{ success: boolean; data: Order }>(url);
        return response.data.data;
    },

    // Create new order
    createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
        try {
            const response = await api.post<{ success: boolean; message: string; data: Order }>("/orders", orderData);
            return response.data.data;
        } catch (error: unknown) {
            // Re-throw error with better message for restaurant closed errors
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Failed to create order";

            // Enhance error message for restaurant closed
            if (errorMessage.includes("Restaurant is currently closed") || errorMessage.includes("currently closed")) {
                const restaurantMatch = errorMessage.match(/Restaurant is currently closed: (.+)/);
                const restaurantName = restaurantMatch ? restaurantMatch[1] : orderData.restaurantName;
                throw new Error(
                    `Restaurant "${restaurantName}" is currently closed. Please check its operating hours and try again later.`
                );
            }

            // Re-throw original error
            throw error;
        }
    },

    // Get all orders (Admin only)
    getAllOrders: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{ orders: Order[]; pagination?: Pagination }> => {
        const search = new URLSearchParams();
        if (params?.page) search.append("page", params.page.toString());
        if (params?.limit) search.append("limit", params.limit.toString());
        if (params?.status) search.append("status", params.status);

        const response = await api.get<{
            status: string;
            message: string;
            data: { orders: Order[]; pagination?: Pagination };
        }>(`/orders${search.toString() ? `?${search.toString()}` : ""}`);

        return {
            orders: response.data.data.orders,
            pagination: response.data.data.pagination,
        };
    },

    // Get orders by restaurant (Manager/Merchant)
    getOrdersByRestaurant: async (
        restaurantId: string,
        merchantId?: string,
        filters?: { status?: string; page?: number; limit?: number }
    ): Promise<{ orders: Order[]; pagination?: Pagination }> => {
        const params = new URLSearchParams();
        if (merchantId) params.append("merchantId", merchantId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());

        try {
            const response = await api.get<{ success: boolean; data: Order[]; pagination?: Pagination }>(
                `/merchant/orders/restaurants/${restaurantId}/orders${params.toString() ? `?${params.toString()}` : ""}`
            );
            return { orders: response.data.data, pagination: response.data.pagination };
        } catch (error: unknown) {
            console.error(`Failed to get orders for restaurant ${restaurantId}:`, error);
            // Re-throw so the caller can handle it
            throw error;
        }
    },

    // Get orders by user
    getOrdersByUser: async (userId: string): Promise<{ orders: Order[]; pagination?: unknown }> => {
        const response = await api.get<{ success: boolean; data: Order[]; pagination?: Pagination }>(
            `/orders/user/${userId}`
        );
        return {
            orders: response.data.data,
            pagination: response.data.pagination,
        };
    },

    // Get orders by merchant
    getOrdersByMerchant: async (merchantId: string): Promise<Order[]> => {
        try {
            // Business rule: 1 merchant = 1 restaurant
            const restaurantsResponse = await restaurantApi.getRestaurantByMerchantId(merchantId);
            const data = restaurantsResponse.data;
            const restaurants = Array.isArray(data) ? data : data ? [data] : [];

            const firstRestaurant = restaurants[0] as { id?: string; _id?: string } | undefined;
            const restaurantId = firstRestaurant?.id || firstRestaurant?._id;

            if (!restaurantId) return [];

            const { orders } = await orderApi.getOrdersByRestaurant(restaurantId, merchantId);

            return orders.sort((a: Order, b: Order) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });
        } catch (error) {
            console.error("Failed to get orders by merchant:", error);
            return [];
        }
    },

    // Update order status
    updateOrderStatus: async (
        orderId: string,
        status: OrderStatus,
        options?: {
            cancellationReason?: string;
        }
    ) => {
        const payload: { status: OrderStatus; cancellationReason?: string } = { status };

        if (status === OrderStatus.CANCELLED) {
            if (!options?.cancellationReason?.trim()) {
                throw new Error("cancellationReason is required when status is cancelled");
            }
            payload.cancellationReason = options.cancellationReason.trim();
        }

        const response = await api.patch(`/orders/${orderId}/status`, payload);
        return response.data;
    },

    // Cancel order - uses dedicated /cancel endpoint
    cancelOrder: async (orderId: string, reason: string) => {
        if (!reason?.trim()) {
            throw new Error("Cancellation reason is required");
        }
        const response = await api.patch<{ success: boolean; message: string; data: Order }>(
            `/orders/${orderId}/cancel`,
            { reason: reason.trim() }
        );
        return response.data.data;
    },

    // Merchant: Accept order
    acceptOrder: async (orderId: string): Promise<Order> => {
        const response = await api.post<{ success: boolean; data: Order }>(`/merchant/orders/${orderId}/accept`);
        return response.data.data;
    },

    // Merchant: Reject order
    rejectOrder: async (orderId: string, reason: string): Promise<Order> => {
        const response = await api.post<{ success: boolean; data: Order }>(`/merchant/orders/${orderId}/reject`, {
            reason,
        });
        return response.data.data;
    },

    // Merchant: Get restaurant orders
    getRestaurantOrders: async (
        restaurantId: string,
        filters?: { status?: string; page?: number; limit?: number }
    ): Promise<{ orders: Order[]; pagination?: Pagination }> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());

        const response = await api.get<{ success: boolean; data: Order[]; pagination?: Pagination }>(
            `/merchant/orders/restaurants/${restaurantId}/orders${params.toString() ? `?${params.toString()}` : ""}`
        );
        return {
            orders: response.data.data,
            pagination: response.data.pagination,
        };
    },
};
