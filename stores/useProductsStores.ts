/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { productApi } from "@/lib/api/productApi";

interface ProductSize {
    id: string;
    sizeName: string;
    price: number;
}

interface Product {
    id: string;
    productName: string;
    description: string;
    imageURL: string | null;
    categoryName: string;
    categoryId: string;
    volume: number;
    available: boolean;
    restaurant: string | null;
    totalReview: number;
    rating: number;
    productSizes: ProductSize[];
}

interface ProductState {
    products: Product[];
    product: Product | null;
    loading: boolean;
    error: string | null;

    fetchProductsByRestaurantId: (restaurantId: string) => Promise<void>;
    fetchProductById: (productId: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    product: null,
    loading: false,
    error: null,

    fetchProductsByRestaurantId: async (restaurantId) => {
        set({ loading: true, error: null });
        try {
            const res = await productApi.getProductsByRestaurantId(restaurantId);
            console.log(res.data);
            set({ products: res.data || [], loading: false });
        } catch (err: any) {
            set({ error: err.message || "Không thể tải sản phẩm", loading: false });
        }
    },

    fetchProductById: async (productId: string) => {
        set({ loading: true, error: null });
        try {
            const res = await productApi.getProductById(productId);
            console.log(res.data);
            set({ product: res.data || null, loading: false });
        } catch (err: any) {
            set({ error: err.message || "Không thể tải sản phẩm", loading: false });
        }
    },

    clearProducts: () => set({ products: [], product: null }),
}));
