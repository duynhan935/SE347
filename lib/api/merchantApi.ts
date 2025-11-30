import api from "../axios";
import { Merchant, User } from "@/types";

export interface MerchantStats {
	totalRestaurants: number;
	totalRevenue: number;
	totalOrders: number;
	activeRestaurants: number;
}

export const merchantApi = {
	// Get all merchants (Admin only)
	getAllMerchants: async () => {
		// TODO: Replace with real API when available
		// const response = await api.get<Merchant[]>("/merchants");
		// return response.data;

		// Mock data for now
		return Promise.resolve([
			{
				id: "1",
				username: "merchant1",
				email: "merchant1@example.com",
				phone: "0901234567",
				role: "MERCHANT" as const,
				enabled: true,
				status: "PENDING" as const,
				businessName: "Công ty ABC",
				taxCode: "0123456789",
				totalRestaurants: 0,
				totalRevenue: 0,
				createdAt: "2024-01-15T10:00:00.000Z",
			},
			{
				id: "2",
				username: "merchant2",
				email: "merchant2@example.com",
				phone: "0901234568",
				role: "MERCHANT" as const,
				enabled: true,
				status: "APPROVED" as const,
				businessName: "Công ty XYZ",
				taxCode: "0987654321",
				totalRestaurants: 3,
				totalRevenue: 50000000,
				createdAt: "2024-01-10T10:00:00.000Z",
				approvedAt: "2024-01-11T10:00:00.000Z",
			},
		] as Merchant[]);
	},

	// Get merchant by ID
	getMerchantById: async (merchantId: string) => {
		// TODO: Replace with real API
		// const response = await api.get<Merchant>(`/merchants/${merchantId}`);
		// return response.data;

		const merchants = await merchantApi.getAllMerchants();
		return merchants.find((m) => m.id === merchantId);
	},

	// Approve merchant (Admin only)
	approveMerchant: async (merchantId: string) => {
		const response = await api.post(`/merchants/${merchantId}/approve`);
		return response.data;
	},

	// Reject merchant (Admin only)
	rejectMerchant: async (merchantId: string, reason: string) => {
		const response = await api.post(`/merchants/${merchantId}/reject`, { reason });
		return response.data;
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
