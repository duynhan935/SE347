import { Order, OrderStatus } from "@/types/order.type";
import api from "../axios";
import { restaurantApi } from "./restaurantApi";

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
        paymentMethod: "cash" | "card" | "wallet";
        orderNote?: string;
        discount?: number;
        deliveryFee?: number;
        userLat: number;
        userLon: number;
}

export const orderApi = {
        // Create new order
        createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
                try {
                        const response = await api.post<
                                Order | { success: boolean; data: Order } | { status: string; data: { order: Order } }
                        >("/orders", orderData);

                        // Handle different response structures
                        const responseData = response.data;
                        let order: Order | null = null;

                        // If response is wrapped in data object
                        if (responseData && typeof responseData === "object" && "data" in responseData) {
                                const data = (responseData as { data: Order | { order: Order } }).data;
                                // If data contains order object
                                if (data && typeof data === "object" && "order" in data) {
                                        order = (data as { order: Order }).order;
                                } else {
                                        // If data is the order itself
                                        order = data as Order;
                                }
                        } else {
                                // If response is the order directly
                                order = responseData as Order;
                        }

                        return order as Order;
                } catch (error: unknown) {
                        // Re-throw error with better message for restaurant closed errors
                        const errorMessage =
                                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                                (error as { message?: string })?.message ||
                                "Failed to create order";

                        // Enhance error message for restaurant closed
                        if (
                                errorMessage.includes("Restaurant is currently closed") ||
                                errorMessage.includes("currently closed")
                        ) {
                                const restaurantMatch = errorMessage.match(/Restaurant is currently closed: (.+)/);
                                const restaurantName = restaurantMatch ? restaurantMatch[1] : orderData.restaurantName;
                                throw new Error(
                                        `Nhà hàng "${restaurantName}" hiện đang đóng cửa. Vui lòng kiểm tra lại thời gian hoạt động trong phần quản lý nhà hàng hoặc thử lại sau.`
                                );
                        }

                        // Re-throw original error
                        throw error;
                }
        },

        // Get all orders (Admin only)
        getAllOrders: async (): Promise<Order[]> => {
                const response = await api.get<{ status: string; message: string; data: { orders: Order[] } }>(
                        "/orders"
                );
                return response.data.data.orders;
        },

        // Get orders by restaurant (Manager/Merchant)
        getOrdersByRestaurant: async (restaurantId: string, merchantId?: string): Promise<Order[]> => {
                if (!merchantId) {
                        throw new Error("merchantId is required to get restaurant orders");
                }
                const params = new URLSearchParams();
                params.append("merchantId", merchantId);
                const queryString = params.toString();
                try {
                        const response = await api.get<{ success: boolean; data: Order[] }>(
                                `/merchant/orders/restaurants/${restaurantId}/orders?${queryString}`
                        );
                        return response.data.data;
                } catch (error: unknown) {
                        console.error(`Failed to get orders for restaurant ${restaurantId}:`, error);
                        // Re-throw để caller có thể handle
                        throw error;
                }
        },

        // Get orders by user
        getOrdersByUser: async (userId: string): Promise<{ orders: Order[]; pagination?: unknown }> => {
                const response = await api.get<{ success: boolean; data: Order[]; pagination?: unknown }>(
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
                        // Get all restaurants of this merchant
                        const restaurantsResponse = await restaurantApi.getRestaurantByMerchantId(merchantId);
                        const restaurants = restaurantsResponse.data || [];

                        if (!restaurants || restaurants.length === 0) {
                                return [];
                        }

                        // Get orders for each restaurant and combine them
                        // Use Promise.allSettled to handle partial failures
                        const ordersPromises = restaurants.map((restaurant: { id?: string; _id?: string }) =>
                                orderApi
                                        .getOrdersByRestaurant(restaurant.id || restaurant._id || "", merchantId)
                                        .catch((error) => {
                                                console.error(
                                                        `Failed to get orders for restaurant ${
                                                                restaurant.id || restaurant._id
                                                        }:`,
                                                        error
                                                );
                                                return []; // Return empty array on error
                                        })
                        );

                        const ordersResults = await Promise.all(ordersPromises);
                        const allOrders: Order[] = ordersResults.flat();

                        // Remove duplicates and sort by createdAt (newest first)
                        const uniqueOrders = Array.from(
                                new Map(
                                        allOrders.map((order: Order) => [
                                                order.orderId,
                                                order,
                                        ])
                                ).values()
                        ) as Order[];

                        return uniqueOrders.sort((a: Order, b: Order) => {
                                const dateA = new Date(a.createdAt).getTime();
                                const dateB = new Date(b.createdAt).getTime();
                                return dateB - dateA;
                        });
                } catch (error) {
                        console.error("Failed to get orders by merchant:", error);
                        // Fallback: cannot filter by merchantId as Order type doesn't include it
                        // Return empty array to avoid returning orders from other merchants
                        return [];
                }
        },

        // Update order status
        updateOrderStatus: async (orderId: string, status: OrderStatus) => {
                const response = await api.patch(`/orders/${orderId}/status`, { status });
                return response.data;
        },

        // Cancel order
        cancelOrder: async (orderId: string, reason: string) => {
                const response = await api.patch(`/orders/${orderId}/cancel`, { reason });
                return response.data;
        },

        // Merchant: Accept order
        acceptOrder: async (orderId: string): Promise<Order> => {
                const response = await api.post<{ success: boolean; data: Order }>(
                        `/merchant/orders/${orderId}/accept`
                );
                return response.data.data;
        },

        // Merchant: Reject order
        rejectOrder: async (orderId: string, reason: string): Promise<Order> => {
                const response = await api.post<{ success: boolean; data: Order }>(
                        `/merchant/orders/${orderId}/reject`,
                        { reason }
                );
                return response.data.data;
        },

        // Merchant: Get restaurant orders
        getRestaurantOrders: async (
                restaurantId: string,
                filters?: { status?: string; page?: number; limit?: number }
        ): Promise<{ orders: Order[]; pagination?: unknown }> => {
                const params = new URLSearchParams();
                if (filters?.status) params.append("status", filters.status);
                if (filters?.page) params.append("page", filters.page.toString());
                if (filters?.limit) params.append("limit", filters.limit.toString());

                const response = await api.get<{ success: boolean; data: Order[]; pagination?: unknown }>(
                        `/merchant/orders/restaurants/${restaurantId}/orders${
                                params.toString() ? `?${params.toString()}` : ""
                        }`
                );
                return {
                        orders: response.data.data,
                        pagination: response.data.pagination,
                };
        },
};
