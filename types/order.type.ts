// Mirrors back-end `orderResponseDTO` (order-service)
export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    READY = "ready",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export type PaymentMethod = "cash" | "card" | "wallet";

export type PaymentStatus = "pending" | "paid" | "completed" | "failed" | "refunded";

export interface DeliveryAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface OrderRestaurantRef {
    id: string;
    name: string;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    customizations?: string;
}

export interface Order {
    orderId: string;
    slug: string;
    userId: string;
    restaurant: OrderRestaurantRef;
    items: OrderItem[];
    deliveryAddress: DeliveryAddress;
    totalAmount: number;
    discount: number;
    deliveryFee: number;
    tax: number;
    finalAmount: number;
    paymentMethod: PaymentMethod;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    estimatedDeliveryTime?: string;
    actualDeliveryTime?: string | null;
    orderNote?: string;
    rating?: number | null;
    review?: string;
    createdAt: string;
    updatedAt: string;
}
