import { StaticImageData } from "next/image";

export enum UserRole {
	USER = "USER",
	ADMIN = "ADMIN",
	MERCHANT = "MERCHANT",
	MANAGER = "MANAGER",
}

export interface User {
	id: string;
	username: string;
	email: string;
	enabled: boolean;
	role: "ADMIN" | "MERCHANT" | "USER" | "MANAGER";
	phone?: string | null;
	avatar?: string | StaticImageData;
	createdAt?: string;
	updatedAt?: string;
}

export interface Admin extends User {
	role: "ADMIN";
}

export interface Merchant extends User {
	role: "MERCHANT";
	status: "PENDING" | "APPROVED" | "REJECTED";
	businessName?: string;
	taxCode?: string;
	totalRestaurants: number;
	totalRevenue: number;
	approvedAt?: string;
	rejectedAt?: string;
	rejectedReason?: string;
}

export interface Manager extends User {
	role: "MANAGER";
	restaurantId: string;
	merchantId: string;
	assignedAt: string;
}

export interface UserStats {
	totalUsers: number;
	activeUsers: number;
	newUsersThisMonth: number;
	totalMerchants: number;
	pendingMerchants: number;
	totalManagers: number;
}

export interface Address {
	id: string;
	location: string;
	longitude: number;
	latitude: number;
}

export interface AddressRequest {
	location: string;
	longitude: number;
	latitude: number;
}

export interface UserUpdateAfterLogin {
	phone: string;
	defaultAddress: string;
	longitude: number;
	latitude: number;
}