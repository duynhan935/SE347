import { StaticImageData } from "next/image";
import type { Category } from "./category.type";
import type { Product } from "./product.type";

export interface RestaurantData {
        resName: string;
        address: string;
        longitude: number;
        latitude: number;
        rating?: number;
        openingTime: string; // Format: "HH:mm" e.g. "09:00"
        closingTime: string; // Format: "HH:mm" e.g. "22:00"
        phone: string;
        merchantId: string;
}

export interface Restaurant {
	id: string;
	slug: string;
	resName: string;
	address: string;
	longitude: number;
	latitude: number;
	rating: number;
	openingTime: string;
	closingTime: string;
	phone: string;
	imageURL: string | null | StaticImageData;
	merchantId: string;
	managerId?: string;
	enabled: boolean;
	totalReview: number;
	distance: number;
	duration: number;
	products: Product[];
	cate: Category[];
	createdAt?: string;
	updatedAt?: string;
}

export interface RestaurantStats {
	restaurantId: string;
	restaurantName: string;
	totalOrders: number;
	totalRevenue: number;
	averageOrderValue: number;
	pendingOrders: number;
	completedOrders: number;
	cancelledOrders: number;
}

export interface SystemStats {
	totalRestaurants: number;
	activeRestaurants: number;
	pendingRestaurants: number;
	totalRevenue: number;
	totalOrders: number;
}