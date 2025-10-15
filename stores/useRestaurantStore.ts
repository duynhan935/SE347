/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { restaurantApi } from "@/lib/api/restaurantApi";
import type { Restaurant, Product, Category, RestaurantData } from "@/types";

interface RestaurantState {
    restaurant: Restaurant | null;
    restaurants: Restaurant[];
    products: Product[];
    categories: Category[];
    loading: boolean;
    error: string | null;
    fetchRestaurantById: (id: string) => Promise<void>;
    getRestaurantByMerchantId: (merchantId: string) => Promise<void>;
    getAllRestaurants: () => Promise<void>;
    clearRestaurant: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
    restaurant: null,
    restaurants: [],
    products: [],
    categories: [],
    loading: false,
    error: null,

    fetchRestaurantById: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await restaurantApi.getByRestaurantId(id);
            const data = res.data;
            console.log(data);

            set({
                restaurant: data,
                products: data.products || [],
                categories: data.cate || [],
                loading: false,
            });
        } catch (err: any) {
            set({
                error: err.message || "Không thể tải dữ liệu nhà hàng",
                loading: false,
            });
        }
    },

    getRestaurantByMerchantId: async (merchantId) => {
        set({ loading: true, error: null });
        try {
            const res = await restaurantApi.getRestaurantByMerchantId(merchantId);
            const data = res.data;
            console.log(data);

            set({
                restaurant: data,
                products: data.products || [],
                categories: data.cate || [],
                loading: false,
            });
        } catch (err: any) {
            set({
                error: err.message || "Không thể tải dữ liệu nhà hàng",
                loading: false,
            });
        }
    },

    getAllRestaurants: async () => {
        set({ loading: true, error: null });
        try {
            const res = await restaurantApi.getAllRestaurants();
            set({ restaurants: res.data, loading: false });
        } catch (err: any) {
            set({
                error: err.message || "Không thể tải dữ liệu nhà hàng",
                loading: false,
            });
        }
    },

    createNewRestaurant: async (restaurantData: RestaurantData, imageFile?: File) => {
        try {
            set({ loading: true });
            const response = await restaurantApi.createRestaurant(restaurantData, imageFile);
            set((state) => ({
                restaurants: [...state.restaurants, response.data],
                loading: false,
                error: null,
            }));
        } catch (error: any) {
            set({
                error: error.message || "Failed to create restaurant",
                loading: false,
            });
        }
    },

    updateRestaurant: async (restaurantId: string, restaurantData: RestaurantData, imageFile?: File) => {
        try {
            set({ loading: true });
            const response = await restaurantApi.updateRestaurant(restaurantId, restaurantData, imageFile);
            set((state) => ({
                restaurant: response.data,
                restaurants: state.restaurants.map((res) => (res.id === restaurantId ? response.data : res)),
                loading: false,
                error: null,
            }));
        } catch (error: any) {
            set({
                error: error.message || "Failed to update restaurant",
                loading: false,
            });
        }
    },

    updateRestaurantStatus: async (restaurantId: string) => {
        try {
            set({ loading: true });
            await restaurantApi.updateRestaurantStatus(restaurantId);
        } catch (error: any) {
            set({
                error: error.message || "Failed to update restaurant status",
                loading: false,
            });
        }
    },

    deleteRestaurant: async (restaurantId: string) => {
        try {
            set({ loading: true });
            await restaurantApi.deleteRestaurant(restaurantId);
            set((state) => ({
                restaurants: state.restaurants.filter((res) => res.id !== restaurantId),
                loading: false,
                error: null,
            }));
        } catch (error: any) {
            set({
                error: error.message || "Failed to delete restaurant",
                loading: false,
            });
        }
    },

    deleteRestaurantImage: async (restaurantId: string) => {
        try {
            set({ loading: true });
            await restaurantApi.deleteRestaurantImage(restaurantId);
            set((state) => ({
                restaurants: state.restaurants.map((res) =>
                    res.id === restaurantId ? { ...res, image: null } : res
                ),
                loading: false,
                error: null,
            }));
        } catch (error: any) {
            set({
                error: error.message || "Failed to delete restaurant image",
                loading: false,
            });
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
