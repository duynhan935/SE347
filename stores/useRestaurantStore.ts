/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/useRestaurantStore.ts
import { create } from "zustand";
import { restaurantApi } from "@/lib/api/restaurantApi";

interface Size {
    id: string;
    name: string;
}

interface ProductSize {
    id: string;
    size: Size;
    price: number;
}

interface Category {
    id: string;
    cateName: string;
}

interface Product {
    id: string;
    productName: string;
    description: string;
    imageURL: string;
    available: boolean;
    rating: number;
    totalReview: number;
    category: Category;
    productSizes: ProductSize[];
}

interface Restaurant {
    id: string;
    resName: string;
    address: string;
    longitude: number;
    latitude: number;
    rating: number;
    openingTime: string;
    closingTime: string;
    phone: string;
    imageURL: string;
    merchantId: string;
    enabled: boolean;
    totalReview: number;
    distance: number;
    duration: number;
    categories: Category[];
    products: Product[];
}

interface RestaurantState {
    restaurant: Restaurant | null;
    products: Product[];
    categories: Category[];
    loading: boolean;
    error: string | null;
    fetchRestaurantById: (id: string) => Promise<void>;
    clearRestaurant: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
    restaurant: null,
    products: [],
    categories: [],
    loading: false,
    error: null,

    fetchRestaurantById: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await restaurantApi.getRestaurantById(id);
            const data = res.data;
            console.log(data);

            set({
                restaurant: data,
                products: data.products || [],
                categories: data.categories || [],
                loading: false,
            });
        } catch (err: any) {
            set({ error: err.message || "Không thể tải dữ liệu nhà hàng", loading: false });
        }
    },

    clearRestaurant: () => {
        set({
            restaurant: null,
            products: [],
            categories: [],
            loading: false,
            error: null,
        });
    },
}));
