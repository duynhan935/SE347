/* eslint-disable @typescript-eslint/no-explicit-any */
import { productApi } from "@/lib/api/productApi";
import type { Product, ProductCreateData, Review } from "@/types";
import { create } from "zustand";
interface ProductState {
    products: Product[];
    product: Product | null;
    reviews: Review[];
    loading: boolean;
    error: string | null;
    fetchProductsByRestaurantId: (restaurantId: string) => Promise<void>;
    fetchProductByProductId: (productId: string) => Promise<void>;
    fetchAllProducts: (params: URLSearchParams) => Promise<void>;
    createNewProduct: (productData: ProductCreateData, imageFile?: File) => Promise<void>;
    updateProduct: (ProductId: string, ProductData: ProductCreateData, imageFile?: File) => Promise<void>;
    updateProductStatus: (ProductId: string) => Promise<void>;
    deleteProduct: (ProductId: string) => Promise<void>;
    deleteProductImage: (ProductId: string) => Promise<void>;
    getAllReviews: (productId: string) => Promise<void>;
    clearProducts: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [],
    product: null,
    reviews: [],
    loading: false,
    error: null,

    fetchAllProducts: async (params: URLSearchParams) => {
        set({ loading: true, error: null });
        try {
            const res = await productApi.getAllProducts(params);
            // Handle Page response structure: { content: Product[], ... } or direct array
            const data = res.data;
            const productsArray = Array.isArray(data) 
                ? data 
                : (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content))
                    ? data.content
                    : [];
            set({ products: productsArray, loading: false });
        } catch (err: any) {
            set({ error: err.message || "Failed to load products.", loading: false });
        }
    },

    fetchProductsByRestaurantId: async (restaurantId) => {
        set({ loading: true, error: null });
        try {
            const res = await productApi.getProductsByRestaurantId(restaurantId);
            set({ products: res.data || [], loading: false });
        } catch (err: any) {
            set({ error: err.message || "Failed to load products.", loading: false });
        }
    },

    fetchProductByProductId: async (productId: string) => {
        set({ loading: true, error: null, product: null });
        try {
            const res = await productApi.getProductById(productId);
            set({ product: res.data || null, loading: false });
        } catch (err: any) {
            set({ error: err.message || "Failed to load product.", loading: false });
        }
    },

    createNewProduct: async (productData: ProductCreateData, imageFile?: File) => {
        set({ loading: true, error: null });
        try {
            console.log(productData, imageFile);
            const res = await productApi.createProduct(productData, imageFile);
            console.log(res);
            set((state) => ({
                products: [...state.products, res.data],
                loading: false,
                error: null,
            }));
        } catch (error: any) {
            set({
                error: error.message || "Failed to create product",
                loading: false,
            });
            throw error;
        }
    },

    updateProduct: async (ProductId: string, ProductData: ProductCreateData, imageFile?: File) => {
        try {
            set({ loading: true });
            const response = await productApi.updateProduct(ProductId, ProductData, imageFile);
            set((state) => ({
                product: response.data,
                products: state.products.map((res) => (res.id === ProductId ? response.data : res)),
                loading: false,
                error: null,
            }));
        } catch (error: any) {
            set({
                error: error.message || "Failed to update Product",
                loading: false,
            });
        }
    },

    updateProductStatus: async (ProductId: string) => {
        try {
            set({ loading: true });
            await productApi.updateProductStatus(ProductId);
        } catch (error: any) {
            set({
                error: error.message || "Failed to update Product status",
                loading: false,
            });
        }
    },

    deleteProduct: async (ProductId: string) => {
        try {
            set({ loading: true });
            console.log(ProductId);
            await productApi.deleteProduct(ProductId);
            set((state) => ({
                products: state.products.filter((res) => res.id !== ProductId),
                loading: false,
                error: null,
            }));
        } catch (error: any) {
            set({
                error: error.message || "Failed to delete Product",
                loading: false,
            });
        }
    },

    deleteProductImage: async (ProductId: string) => {
        try {
            set({ loading: true });
            await productApi.deleteProductImage(ProductId);
            set((state) => ({
                products: state.products.map((res) => (res.id === ProductId ? { ...res, image: null } : res)),
                loading: false,
                error: null,
            }));
        } catch (error: any) {
            set({
                error: error.message || "Failed to delete Product image",
                loading: false,
            });
        }
    },

    getAllReviews: async (productId: string) => {
        set({ loading: true, error: null });
        try {
            const res = await productApi.getAllReviews(productId);
            set({ reviews: res.data || [], loading: false });
        } catch (err: any) {
            set({ error: err.message || "Failed to load reviews.", loading: false });
        }
    },
    clearProducts: () => set({ products: [], product: null }),
}));
