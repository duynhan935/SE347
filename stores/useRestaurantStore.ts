/* eslint-disable @typescript-eslint/no-explicit-any */
import { restaurantApi } from "@/lib/api/restaurantApi";
import type { Category, Product, Restaurant, RestaurantData } from "@/types";
import { create } from "zustand";

interface RestaurantState {
        restaurant: Restaurant | null;
        restaurants: Restaurant[];
        products: Product[];
        categories: Category[];
        loading: boolean;
        error: string | null;
        fetchRestaurantById: (id: string) => Promise<void>;
        getRestaurantByMerchantId: (merchantId: string) => Promise<void>;
        getAllRestaurants: (params: URLSearchParams) => Promise<void>;
        clearRestaurant: () => void;
        getAllCategories: () => Promise<void>;
        createNewRestaurant: (restaurantData: RestaurantData, imageFile?: File) => Promise<void>;
        updateRestaurant: (restaurantId: string, restaurantData: RestaurantData, imageFile?: File) => Promise<void>;
        updateRestaurantStatus: (restaurantId: string) => Promise<void>;
        deleteRestaurant: (restaurantId: string) => Promise<void>;
        deleteRestaurantImage: (restaurantId: string) => Promise<void>;
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

                        set({
                                restaurants: data,
                                restaurant: data[0] || null,
                                products: data[0].products || [],
                                categories: data[0].cate || [],
                                loading: false,
                        });
                } catch (err: any) {
                        set({
                                error: err.message || "Không thể tải dữ liệu nhà hàng",
                                loading: false,
                        });
                } finally {
                        set({ loading: false });
                }
        },

        getAllRestaurants: async (params: URLSearchParams) => {
                set({ loading: true, error: null });
                try {
                        const res = await restaurantApi.getAllRestaurants(params);
                        set({ restaurants: res.data, loading: false });
                } catch (err: any) {
                        set({
                                error: err.message || "Không thể tải dữ liệu nhà hàng",
                                loading: false,
                        });
                } finally {
                        set({ loading: false });
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
                } finally {
                        set({ loading: false });
                }
        },
        updateRestaurant: async (restaurantId: string, restaurantData: RestaurantData, imageFile?: File) => {
                try {
                        set({ loading: true, error: null });
                        const response = await restaurantApi.updateRestaurant(restaurantId, restaurantData, imageFile);
                        set({ restaurant: response.data, loading: false, error: null });
                } catch (error: any) {
                        set({
                                error: error.message || "Failed to update restaurant",
                                loading: false,
                        });
                } finally {
                        set({ loading: false });
                }
        },

        updateRestaurantStatus: async (restaurantId: string) => {
                try {
                        set({ loading: true });
                        await restaurantApi.updateRestaurantStatus(restaurantId);
                        set((state) => ({
                                restaurants: state.restaurants.map((res) =>
                                        res.id === restaurantId ? { ...res, enabled: !res.enabled } : res
                                ),
                                loading: false,
                                error: null,
                        }));
                } catch (error: any) {
                        set({
                                error: error.message || "Failed to update restaurant status",
                                loading: false,
                        });
                } finally {
                        set({ loading: false });
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
        getAllCategories: async () => {
                try {
                        set({ loading: true });
                        const response = await restaurantApi.getAllCategories();
                        set({ categories: response.data });
                } catch (error: any) {
                        set({
                                error: error.message || "Failed to get all categories",
                                loading: false,
                        });
                } finally {
                        set({ loading: false });
                }
        },
}));
