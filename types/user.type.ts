import { StaticImageData } from "next/image";

export enum UserRole {
	USER = "USER",
	ADMIN = "ADMIN",
	MERCHANT = "MERCHANT",
}

export interface User {
	id: string;
	username: string;
	email: string;
	enabled: boolean;
	role: "ADMIN" | "MERCHANT" | "USER";
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

export interface UserStats {
	totalUsers: number;
	activeUsers: number;
	newUsersThisMonth: number;
	totalMerchants: number;
	pendingMerchants: number;
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