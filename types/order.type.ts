export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    READY = "ready",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    customizations?: string;
}

// Type cho Address Object từ Backend
export interface DeliveryAddress {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

export interface Order {
    _id?: string; // MongoDB ID
    orderId: string; // ID đơn hàng (VD: ORD123...)
    userId: string;

    // Thông tin khách hàng (Backend có thể populate hoặc không)
    user?: {
        _id: string;
        fullName?: string;
        username?: string;
        phone?: string;
        phoneNumber?: string;
    };
    customerName?: string; // Fallback
    customerPhone?: string; // Fallback

    restaurantId: string;
    restaurantName: string;
    items: OrderItem[];

    totalAmount: number;
    deliveryFee: number;
    discount: number;
    finalAmount: number; // Tổng tiền cuối cùng

    status: OrderStatus | string;
    paymentMethod: "cash" | "card" | "wallet";
    paymentStatus: "pending" | "processing" | "completed" | "failed" | "refunded";

    // Sửa lại type cho đúng với thực tế backend trả về là Object
    deliveryAddress: DeliveryAddress | string;

    orderNote?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt?: string;
    slug?: string;
}
