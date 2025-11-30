import api from "../axios";
import { Order, OrderStatus } from "@/types/order.type";

export const orderApi = {
	// Get all orders (Admin only)
	getAllOrders: async (): Promise<Order[]> => {
		// TODO: Replace with real API
		// const response = await api.get<Order[]>("/orders");
		// return response.data;

		return Promise.resolve([
			{
				id: "ord1",
				orderCode: "ORD001",
				customerId: "user1",
				customerName: "Nguyễn Văn A",
				customerPhone: "0901234567",
				restaurantId: "rest1",
				restaurantName: "Nhà hàng A",
				merchantId: "mer1",
				items: [
					{
						id: "item1",
						productId: "prod1",
						productName: "Phở bò",
						quantity: 2,
						price: 50000,
					},
				],
				subtotal: 100000,
				deliveryFee: 20000,
				discount: 0,
				totalPrice: 120000,
				status: OrderStatus.DELIVERED,
				paymentMethod: "COD",
				paymentStatus: "PAID",
				deliveryAddress: "123 Đường ABC, Quận 1, TP.HCM",
				createdAt: "2024-01-15T10:00:00.000Z",
				deliveredAt: "2024-01-15T11:30:00.000Z",
			},
		]);
	},

	// Get orders by restaurant (Manager/Merchant)
	getOrdersByRestaurant: async (restaurantId: string): Promise<Order[]> => {
		// TODO: Replace with real API
		// const response = await api.get<Order[]>(`/restaurants/${restaurantId}/orders`);
		// return response.data;

		const allOrders = await orderApi.getAllOrders();
		return allOrders.filter((order) => order.restaurantId === restaurantId);
	},

	// Get orders by merchant
	getOrdersByMerchant: async (merchantId: string): Promise<Order[]> => {
		// TODO: Replace with real API
		// const response = await api.get<Order[]>(`/merchants/${merchantId}/orders`);
		// return response.data;

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
		const response = await api.post(`/orders/${orderId}/cancel`, { reason });
		return response.data;
	},
};
