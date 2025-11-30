export enum OrderStatus {
	PENDING = "PENDING",
	CONFIRMED = "CONFIRMED",
	PREPARING = "PREPARING",
	READY = "READY",
	DELIVERING = "DELIVERING",
	DELIVERED = "DELIVERED",
	CANCELLED = "CANCELLED",
}

export interface OrderItem {
	id: string;
	productId: string;
	productName: string;
	quantity: number;
	price: number;
	size?: string;
	note?: string;
}

export interface Order {
	id: string;
	orderCode: string;
	customerId: string;
	customerName: string;
	customerPhone: string;
	restaurantId: string;
	restaurantName: string;
	merchantId: string;
	items: OrderItem[];
	subtotal: number;
	deliveryFee: number;
	discount: number;
	totalPrice: number;
	status: OrderStatus;
	paymentMethod: string;
	paymentStatus: "PENDING" | "PAID" | "FAILED";
	deliveryAddress: string;
	note?: string;
	createdAt: string;
	updatedAt?: string;
	deliveredAt?: string;
	cancelledAt?: string;
	cancelReason?: string;
}
