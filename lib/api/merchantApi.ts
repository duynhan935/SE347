import api from "../axios";
import { Merchant, User } from "@/types";
import { authApi } from "./authApi";

export interface MerchantStats {
	totalRestaurants: number;
	totalRevenue: number;
	totalOrders: number;
	activeRestaurants: number;
}

export const merchantApi = {
	// Get all merchants (Admin only)
	getAllMerchants: async () => {
		const usersPage = await authApi.getAllUsers();
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

	// Get merchant stats
	getMerchantStats: async (merchantId: string): Promise<MerchantStats> => {
		// TODO: Replace with real API
		// const response = await api.get<MerchantStats>(`/merchants/${merchantId}/stats`);
		// return response.data;
		console.log("Fetching stats for merchant:", merchantId);
		
		return Promise.resolve({
			totalRestaurants: 3,
			totalRevenue: 50000000,
			totalOrders: 150,
			activeRestaurants: 3,
		});
	},

	// Create manager for restaurant
	createManager: async (data: {
		email: string;
		username: string;
		password: string;
		restaurantId: string;
		merchantId: string;
	}) => {
		const response = await api.post<User>("/merchants/managers", data);
		return response.data;
	},

	// Get managers by merchant
	getManagersByMerchant: async (merchantId: string) => {
		// TODO: Replace with real API
		// const response = await api.get<Manager[]>(`/merchants/${merchantId}/managers`);
		// return response.data;

		return Promise.resolve([
			{
				id: "mgr1",
				username: "manager1",
				email: "manager1@example.com",
				phone: "0909876543",
				role: "MANAGER" as const,
				enabled: true,
				restaurantId: "rest1",
				merchantId: merchantId,
				assignedAt: "2024-01-20T10:00:00.000Z",
			},
		]);
	},
};
