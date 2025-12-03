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

                // Normalize order: ensure 'id' field exists (backend may return 'orderId' instead)
                if (order && typeof order === "object") {
                        const orderWithId = order as Order & { orderId?: string };
                        // If order has orderId but no id, use orderId as id
                        if (!orderWithId.id && orderWithId.orderId) {
                                orderWithId.id = orderWithId.orderId;
                        }
                }

                return order as Order;
        },

        // Get all orders (Admin only)
        getAllOrders: async (): Promise<Order[]> => {
                const response = await api.get<{ status: string; message: string; data: { orders: Order[] } }>(
                        "/orders"
                );
                return response.data.data.orders;
        },

        // Get orders by restaurant (Manager/Merchant)
        getOrdersByRestaurant: async (restaurantId: string): Promise<Order[]> => {
                const response = await api.get<{ success: boolean; data: Order[] }>(
                        `/orders/restaurant/${restaurantId}`
                );
                return response.data.data;
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
                        const ordersPromises = restaurants.map((restaurant: { id?: string; _id?: string }) =>
                                orderApi.getOrdersByRestaurant(restaurant.id || restaurant._id || "")
                        );

                        const ordersArrays = await Promise.all(ordersPromises);
                        const allOrders: Order[] = ordersArrays.flat();

                        // Remove duplicates and sort by createdAt (newest first)
                        const uniqueOrders = Array.from(
                                new Map(
                                        allOrders.map((order: Order) => [
                                                order.id || (order as { orderId?: string }).orderId,
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
                        // Fallback: try to get all orders and filter (if user has permission)
                        try {
                                const allOrders = await orderApi.getAllOrders();
                                return allOrders.filter((order) => order.merchantId === merchantId);
                        } catch (fallbackError) {
                                console.error("Fallback also failed:", fallbackError);
                                return [];
                        }
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
};
