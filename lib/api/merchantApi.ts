import { Merchant } from "@/types";
import { authApi } from "./authApi";
import { restaurantApi } from "./restaurantApi";

export const merchantApi = {
	// Get all merchants (Admin only)
	getAllMerchants: async () => {
		const usersPage = await authApi.getAllUsers({ page: 0, size: 1000 });
		const users = Array.isArray(usersPage?.content) ? usersPage.content : [];

		return users
			.filter((u) => u.role === "MERCHANT")
			.map(
				(u): Merchant => ({
					...u,
					role: "MERCHANT",
					status: u.enabled ? "APPROVED" : "PENDING",
					totalRestaurants: 0,
					totalRevenue: 0,
				})
			);
	},

	// Get merchant by ID
	getMerchantById: async (merchantId: string) => {
		const user = await authApi.getUserById(merchantId);
		if (user.role !== "MERCHANT") return undefined;
		return {
			...user,
			role: "MERCHANT",
			status: user.enabled ? "APPROVED" : "PENDING",
			totalRestaurants: 0,
			totalRevenue: 0,
		};
	},

	// Approve merchant (Admin only)
	approveMerchant: async (merchantId: string) => {
		return authApi.approveMerchant(merchantId);
	},

	// Reject merchant (Admin only)
	rejectMerchant: async (merchantId: string, reason: string) => {
		return authApi.rejectMerchant(merchantId, { reason });
	},

	// Create manager for restaurant
	createManager: async (data: {
		email: string;
		username: string;
		password: string;
		restaurantId: string;
		merchantId: string;
	}): Promise<void> => {
		// Backend endpoint lives under restaurant-service.
		// Note: merchantId is kept for backwards compatibility but is not required by the API.
		await restaurantApi.createManagerForRestaurant(data.restaurantId, {
			username: data.username,
			email: data.email,
			password: data.password,
			confirmPassword: data.password,
		});
	},
};
