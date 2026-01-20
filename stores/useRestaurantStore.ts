/* eslint-disable @typescript-eslint/no-explicit-any */
import { restaurantApi } from "@/lib/api/restaurantApi";
import type { Category, Product, Restaurant, RestaurantData } from "@/types";
import { Review } from "@/types/review.type";
import { create } from "zustand";

interface RestaurantState {
    restaurant: Restaurant | null;
    restaurants: Restaurant[];
    products: Product[];
    categories: Category[];
    reviews: Review[];
    loading: boolean;
    error: string | null;
    selectedRestaurantId: string | null;
    fetchRestaurantById: (id: string) => Promise<void>;
    fetchRestaurantBySlug: (slug: string) => Promise<void>;
    getRestaurantByMerchantId: (merchantId: string) => Promise<void>;
    getAllRestaurants: (params?: URLSearchParams) => Promise<void>;
    setSelectedRestaurantId: (id: string | null) => void;
    clearRestaurant: () => void;
    getAllCategories: () => Promise<void>;
    createNewRestaurant: (restaurantData: RestaurantData, imageFile?: File) => Promise<void>;
    updateRestaurant: (restaurantId: string, restaurantData: RestaurantData, imageFile?: File) => Promise<void>;
    updateRestaurantStatus: (restaurantId: string) => Promise<void>;
    deleteRestaurant: (restaurantId: string) => Promise<void>;
    deleteRestaurantImage: (restaurantId: string) => Promise<void>;
    getAllReviews: (restaurantId: string) => Promise<void>;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
    restaurant: null,
    restaurants: [],
    products: [],
    categories: [],
    reviews: [],
    loading: false,
    error: null,
    selectedRestaurantId: null,

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

            if (data) {
                get().getAllReviews(data.id);
            }
        } catch (err: any) {
            set({
                error: err.message || "Failed to load restaurant data.",
                loading: false,
            });
        }
    },

    fetchRestaurantBySlug: async (slug) => {
        set({ loading: true, error: null });
        try {
            const res = await restaurantApi.getByRestaurantSlug(slug);
            const data = res.data;

            set({
                restaurant: data,
                products: data.products || [],
                categories: data.cate || [],
                loading: false,
            });

            if (data) {
                get().getAllReviews(data.id);
            }
        } catch (err: any) {
            set({
                error: err.message || "Failed to load restaurant data.",
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
                products: data?.[0]?.products || [],
                categories: data?.[0]?.cate || [],
                loading: false,
            });
        } catch (err: any) {
            set({
                error: err.message || "Failed to load restaurant data.",
                loading: false,
            });
        } finally {
            set({ loading: false });
        }
    },

    getAllRestaurants: async (params?: URLSearchParams) => {
        set({ loading: true, error: null });
        try {
            const defaultParams = new URLSearchParams({ lat: "10.762622", lon: "106.660172" }); // Default: HCM
            const finalParams = params ?? defaultParams;
            // Ensure lat/lon are present
            if (!finalParams.has("lat")) finalParams.set("lat", "10.762622");
            if (!finalParams.has("lon")) finalParams.set("lon", "106.660172");
            const res = await restaurantApi.getAllRestaurants(finalParams);
            // Handle Page response structure: { content: Restaurant[], ... } or direct array
            const data = res.data;
            const restaurantsArray = Array.isArray(data)
                ? data
                : data && typeof data === "object" && "content" in data && Array.isArray(data.content)
                  ? data.content
                  : [];
            set({ restaurants: restaurantsArray, loading: false });
        } catch (err: any) {
            set({
                error: err.message || "Failed to load restaurant data.",
                loading: false,
            });
        } finally {
            set({ loading: false });
        }
    },
    setSelectedRestaurantId: (id: string | null) => {
        set({ selectedRestaurantId: id, restaurant: null, products: [], categories: [], reviews: [] });
        if (id) {
            const selectedRestBrief = get().restaurants.find((r) => r.id === id);
            set({ restaurant: selectedRestBrief || null });
            get().fetchRestaurantById(id);
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
                    res.id === restaurantId ? { ...res, enabled: !res.enabled } : res,
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
                restaurants: state.restaurants.map((res) => (res.id === restaurantId ? { ...res, image: null } : res)),
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
    getAllReviews: async (restaurantId: string) => {
        try {
            set({ loading: true });
            const response = await restaurantApi.getAllReviews(restaurantId);
            set({ reviews: response.data, loading: false });
        } catch (error: any) {
            set({
                error: error.message || "Failed to get all reviews",
                loading: false,
            });
        } finally {
            set({ loading: false });
        }
    },
}));
