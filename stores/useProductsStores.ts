/* eslint-disable @typescript-eslint/no-explicit-any */
import { productApi } from "@/lib/api/productApi";
import type { Product, ProductCreateData } from "@/types";
import { create } from "zustand";
interface ProductState {
        products: Product[];
        product: Product | null;
        loading: boolean;
        error: string | null;
        fetchProductsByRestaurantId: (restaurantId: string) => Promise<void>;
        fetchProductByProductId: (productId: string) => Promise<void>;
        fetchAllProducts: () => Promise<void>;
        createNewProduct: (productData: ProductCreateData, imageFile?: File) => Promise<void>;
        updateProduct: (ProductId: string, ProductData: ProductCreateData, imageFile?: File) => Promise<void>;
        updateProductStatus: (ProductId: string) => Promise<void>;
        deleteProduct: (ProductId: string) => Promise<void>;
        deleteProductImage: (ProductId: string) => Promise<void>;
        clearProducts: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
        products: [],
        product: null,
        loading: false,
        error: null,

        fetchAllProducts: async () => {
                set({ loading: true, error: null });
                try {
                        const res = await productApi.getAllProducts();
                        set({ products: res.data || [], loading: false });
                } catch (err: any) {
                        set({ error: err.message || "Không thể tải sản phẩm", loading: false });
                }
        },

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

        fetchProductByProductId: async (productId: string) => {
                set({ loading: true, error: null });
                try {
                        const res = await productApi.getProductById(productId);
                        set({ product: res.data || null, loading: false });
                } catch (err: any) {
                        set({ error: err.message || "Không thể tải sản phẩm", loading: false });
                }
        },

        createNewProduct: async (productData: ProductCreateData, imageFile?: File) => {
                set({ loading: true, error: null });
                try {
                        const res = await productApi.createProduct(productData, imageFile);

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
                                products: state.products.map((res) =>
                                        res.id === ProductId ? { ...res, image: null } : res
                                ),
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

        clearProducts: () => set({ products: [], product: null }),
}));
