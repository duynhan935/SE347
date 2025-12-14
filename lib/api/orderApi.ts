/* eslint-disable @typescript-eslint/no-explicit-any */
import { Order } from "@/types/order.type";
import api from "../axios";
import { restaurantApi } from "./restaurantApi";

// Interface cho việc tạo đơn hàng
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
    // 1. Tạo đơn hàng mới
    createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
        try {
            const response = await api.post("/orders", orderData);

            // Xử lý response linh hoạt do cấu trúc backend có thể trả về khác nhau
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const responseData = response.data as any;

            if (responseData?.data?.order) return responseData.data.order;
            if (responseData?.data) return responseData.data;
            return responseData;
        } catch (error: any) {
            // Xử lý lỗi nhà hàng đóng cửa để hiển thị thông báo rõ ràng
            const errorMessage = error.response?.data?.message || error.message || "Tạo đơn thất bại";
            if (errorMessage.includes("closed")) {
                throw new Error(errorMessage); // Ném lỗi để UI bắt và hiển thị
            }
            throw error;
        }
    },

    // 2. Lấy tất cả đơn hàng (Dành cho Admin)
    getAllOrders: async (): Promise<Order[]> => {
        const response = await api.get("/orders");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = response.data as any;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.data)) return raw.data;
        if (Array.isArray(raw?.data?.orders)) return raw.data.orders;
        return [];
    },

    // 3. Lấy đơn hàng của người dùng (User History)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getOrdersByUser: async (userId: string): Promise<{ orders: Order[]; pagination?: any }> => {
        const response = await api.get(`/orders/user/${userId}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return {
            orders: (response.data as any)?.data || [],
            pagination: (response.data as any)?.pagination,
        };
    },

    // 4. Lấy đơn hàng cho Merchant (Logic gộp đơn từ nhiều nhà hàng)
    getOrdersByMerchant: async (merchantId: string): Promise<Order[]> => {
        try {
            // Bước 1: Lấy danh sách nhà hàng của Merchant
            const restaurantsResponse = await restaurantApi.getRestaurantByMerchantId(merchantId);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const restaurants = Array.isArray(restaurantsResponse.data)
                ? restaurantsResponse.data
                : (restaurantsResponse.data as any)?.data || [];

            if (!restaurants || restaurants.length === 0) return [];

            // Bước 2: Gọi API lấy đơn cho từng nhà hàng song song
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ordersPromises = restaurants
                .filter((r: any) => r && r.id)
                .map((restaurant: any) => {
                    return orderApi.getOrdersByRestaurant(restaurant.id, merchantId).catch((err) => {
                        console.warn(`Không lấy được đơn của quán ${restaurant.id}`, err);
                        return [];
                    });
                });

            const ordersResults = await Promise.all(ordersPromises);

            // Bước 3: Gộp mảng và lọc trùng lặp
            const allOrders: Order[] = ordersResults.flat();
            const uniqueOrders = Array.from(new Map(allOrders.map((o) => [o.orderId, o])).values());

            // Bước 4: Sắp xếp mới nhất lên đầu
            return uniqueOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error("Lỗi getOrdersByMerchant:", error);
            return [];
        }
    },

    // 5. Lấy đơn hàng của một nhà hàng cụ thể (Helper cho hàm trên)
    getOrdersByRestaurant: async (restaurantId: string, merchantId?: string): Promise<Order[]> => {
        try {
            const params = new URLSearchParams();
            if (merchantId) params.append("merchantId", merchantId);

            const response = await api.get(`/merchant/orders/restaurants/${restaurantId}/orders?${params.toString()}`);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawData = response.data as any;

            // Xử lý các format trả về khác nhau
            if (Array.isArray(rawData)) return rawData;
            if (Array.isArray(rawData.data)) return rawData.data;
            if (rawData.data?.orders && Array.isArray(rawData.data.orders)) return rawData.data.orders;

            return [];
        } catch (error) {
            // console.error(`Lỗi lấy đơn quán ${restaurantId}`, error);
            throw error;
        }
    },

    // --- CÁC API TƯƠNG TÁC TRẠNG THÁI (ACTION) ---

    // 6. Merchant nhận đơn (Pending -> Confirmed)
    acceptOrder: async (orderId: string): Promise<Order> => {
        const response = await api.post(`/merchant/orders/${orderId}/accept`);
        return response.data?.data || response.data;
    },

    // 7. Merchant từ chối đơn (Pending -> Cancelled)
    rejectOrder: async (orderId: string, reason: string): Promise<Order> => {
        const response = await api.post(`/merchant/orders/${orderId}/reject`, { reason });
        return response.data?.data || response.data;
    },

    // 8. Cập nhật trạng thái quy trình (Confirmed -> Preparing -> Ready -> Completed)
    updateOrderStatus: async (orderId: string, status: string) => {
        // Lưu ý: Backend route là /api/orders/:orderId/status
        const response = await api.patch(`/orders/${orderId}/status`, { status });
        return response.data?.data || response.data;
    },

    // 9. Merchant hủy đơn đã nhận (Confirmed/Preparing -> Cancelled)
    cancelAcceptedOrder: async (orderId: string, reason: string) => {
        const response = await api.post(`/merchant/orders/${orderId}/cancel`, { reason });
        return response.data?.data || response.data;
    },

    // 10. User hủy đơn (Pending -> Cancelled)
    cancelOrder: async (orderId: string, reason: string, userId: string) => {
        const response = await api.patch(`/orders/${orderId}/cancel`, { reason, userId });
        return response.data?.data || response.data;
    },

    // 11. Thanh toán hàng loạt từ giỏ hàng (Checkout)
    checkoutCart: async (userId: string, paymentMethod: string) => {
        const response = await api.post("/orders/checkout/cart", { userId, paymentMethod });
        return response.data;
    },
};
