import api from "../axios";
import { Order, OrderStatus } from "@/types/order.type";

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
        const response = await api.post<Order>("/orders", orderData);
        return response.data;
    },

    // Get all orders (Admin only)
    getAllOrders: async (): Promise<Order[]> => {
        const response = await api.get<{ status: string; message: string; data: { orders: Order[] } }>("/orders");
        return response.data.data.orders;
    },

    // Get orders by restaurant (Manager/Merchant)
    getOrdersByRestaurant: async (restaurantId: string): Promise<Order[]> => {
        const response = await api.get<{ success: boolean; data: Order[] }>(`/orders/restaurant/${restaurantId}`);
        return response.data.data;
    },

    // Get orders by merchant
    getOrdersByMerchant: async (merchantId: string): Promise<Order[]> => {
        // Note: Backend doesn't have direct merchant endpoint yet
        // This will filter on frontend for now
        const allOrders = await orderApi.getAllOrders();
        return allOrders.filter((order) => order.merchantId === merchantId);
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
