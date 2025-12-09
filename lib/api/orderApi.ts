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
    // 1. Create new order (Hàm bị thiếu gây lỗi)
    createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
        try {
            const response = await api.post<
                Order | { success: boolean; data: Order } | { status: string; data: { order: Order } }
            >("/orders", orderData);

            const responseData = response.data;
            let order: Order | null = null;

            // Xử lý các cấu trúc response khác nhau
            if (responseData && typeof responseData === "object" && "data" in responseData) {
                const data = (responseData as { data: Order | { order: Order } }).data;
                if (data && typeof data === "object" && "order" in data) {
                    order = (data as { order: Order }).order;
                } else {
                    order = data as Order;
                }
            } else {
                order = responseData as Order;
            }

            // Đảm bảo có ID
            if (order && typeof order === "object") {
                const orderWithId = order as Order & { orderId?: string };
                if (!orderWithId.id && orderWithId.orderId) {
                    orderWithId.id = orderWithId.orderId;
                }
            }

            return order as Order;
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Failed to create order";

            // Xử lý lỗi nhà hàng đóng cửa
            if (errorMessage.includes("Restaurant is currently closed") || errorMessage.includes("currently closed")) {
                const restaurantMatch = errorMessage.match(/Restaurant is currently closed: (.+)/);
                const restaurantName = restaurantMatch ? restaurantMatch[1] : orderData.restaurantName;
                throw new Error(`Nhà hàng "${restaurantName}" hiện đang đóng cửa. Vui lòng thử lại sau.`);
            }

            throw error;
        }
    },

    // 2. Get all orders (Admin)
    getAllOrders: async (): Promise<Order[]> => {
        const response = await api.get<{ status: string; message: string; data: { orders: Order[] } }>("/orders");
        return response.data.data.orders;
    },

    // 3. Get orders by User
    getOrdersByUser: async (userId: string): Promise<{ orders: Order[]; pagination?: unknown }> => {
        const response = await api.get<{ success: boolean; data: Order[]; pagination?: unknown }>(
            `/orders/user/${userId}`
        );
        return {
            orders: response.data.data,
            pagination: response.data.pagination,
        };
    },

    // 4. Get Orders By Merchant (Logic sửa lỗi ID & Data)
    getOrdersByMerchant: async (merchantId: string): Promise<Order[]> => {
        try {
            // Bước 1: Lấy danh sách nhà hàng
            const restaurantsResponse = await restaurantApi.getRestaurantByMerchantId(merchantId);

            // Xử lý response linh hoạt (mảng trực tiếp hoặc bọc trong data)
            const restaurants = Array.isArray(restaurantsResponse.data)
                ? restaurantsResponse.data
                : (restaurantsResponse.data as any)?.data || [];

            if (!restaurants || restaurants.length === 0) {
                return [];
            }

            // Bước 2: Lặp qua từng nhà hàng để lấy đơn
            const ordersPromises = restaurants
                .filter((r: any) => r && r.id) // Chỉ lấy nhà hàng có ID hợp lệ
                .map((restaurant: any) => {
                    const resId = restaurant.id;
                    // Gọi API lấy đơn của từng quán
                    return orderApi.getOrdersByRestaurant(resId, merchantId).catch((error) => {
                        console.error(`Lỗi lấy đơn của quán ${resId}:`, error);
                        return []; // Trả về mảng rỗng nếu lỗi
                    });
                });

            const ordersResults = await Promise.all(ordersPromises);

            // Bước 3: Gộp và làm sạch dữ liệu
            const allOrders: Order[] = ordersResults.flat();

            // Lọc trùng lặp dựa trên orderId (để chắc chắn)
            const uniqueOrders = Array.from(new Map(allOrders.map((o) => [o.orderId, o])).values());

            // Sắp xếp: Mới nhất lên đầu
            return uniqueOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error("Lỗi getOrdersByMerchant:", error);
            return [];
        }
    },

    // 5. Get orders by Restaurant (Dùng cho hàm bên trên)
    getOrdersByRestaurant: async (restaurantId: string, merchantId?: string): Promise<Order[]> => {
        try {
            const params = new URLSearchParams();
            if (merchantId) params.append("merchantId", merchantId);

            const response = await api.get<{ success: boolean; data: Order[] | { orders: Order[] } }>(
                `/merchant/orders/restaurants/${restaurantId}/orders?${params.toString()}`
            );

            // Xử lý data trả về linh hoạt
            const rawData = response.data;
            if (Array.isArray(rawData)) return rawData;
            if (Array.isArray(rawData.data)) return rawData.data;
            if (rawData.data && "orders" in rawData.data && Array.isArray((rawData.data as any).orders)) {
                return (rawData.data as any).orders;
            }

            return [];
        } catch (error) {
            console.error(`Failed to get orders for restaurant ${restaurantId}:`, error);
            throw error;
        }
    },

    // 6. Update Status (Fix lỗi Backend dùng slug nhưng query orderId)
    updateOrderStatus: async (orderId: string, status: string) => {
        // Truyền orderId vào vị trí slug trên URL
        const response = await api.patch(`/orders/${orderId}/status`, { status });
        return response.data;
    },

    // 7. Cancel Order (Fix lỗi Backend query orderId)
    cancelOrder: async (orderId: string, reason: string, userId: string) => {
        // Truyền orderId vào vị trí slug trên URL, userId vào body
        const response = await api.patch(`/orders/${orderId}/cancel`, { reason, userId });
        return response.data;
    },

    // 8. Merchant Accept Order
    acceptOrder: async (orderId: string): Promise<Order> => {
        try {
            // Thử gọi route chuẩn
            const response = await api.post(`/merchant/orders/${orderId}/accept`);
            return response.data?.data || response.data;
        } catch (e) {
            // Fallback: Gọi update status
            console.warn("API accept failed, using update status fallback");
            const response = await api.patch(`/orders/${orderId}/status`, { status: "confirmed" });
            return response.data?.data || response.data;
        }
    },

    // 9. Merchant Reject Order
    rejectOrder: async (orderId: string, reason: string): Promise<Order> => {
        try {
            const response = await api.post(`/merchant/orders/${orderId}/reject`, { reason });
            return response.data?.data || response.data;
        } catch (e) {
            // Fallback: Gọi cancel
            const response = await api.patch(`/orders/${orderId}/cancel`, {
                reason,
                userId: "merchant_action", // Dummy userID vì merchant hủy
            });
            return response.data?.data || response.data;
        }
    },

    // 10. Get Restaurant Orders with pagination
    getRestaurantOrders: async (
        restaurantId: string,
        filters?: { status?: string; page?: number; limit?: number }
    ): Promise<{ orders: Order[]; pagination?: unknown }> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());

        const response = await api.get<{ success: boolean; data: Order[]; pagination?: unknown }>(
            `/merchant/orders/restaurants/${restaurantId}/orders${params.toString() ? `?${params.toString()}` : ""}`
        );
        return {
            orders: response.data.data,
            pagination: response.data.pagination,
        };
    },
};
