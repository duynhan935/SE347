import { PaymentMethod, PaymentStatus } from "./payment.type";

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";

export interface OrderItem {
	productId: string;
	productName: string;
	quantity: number;
	price: number;
	customizations?: string;
}

export interface DeliveryAddress {
	street: string;
	city: string;
	state: string;
	zipCode: string;
}

export interface RestaurantInfo {
	id: string;
	name: string;
}

export interface Order {
	orderId: string;
	slug: string;
	userId: string;
	restaurant: RestaurantInfo;
	items: OrderItem[];
	totalAmount: number;
	discount: number;
	deliveryFee: number;
	tax: number;
	finalAmount: number;
	status: OrderStatus;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	deliveryAddress: DeliveryAddress;
	estimatedDeliveryTime?: string;
	actualDeliveryTime?: string;
	orderNote?: string;
	cancellationReason?: string;
	rating?: number;
	review?: string;
	createdAt: string;
	updatedAt: string;
}
