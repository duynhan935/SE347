import api from "../axios";
import type { Product, ProductData, ProductCreateData } from "@/types";

export const productApi = {
    getAllProducts: () => api.get<Product[]>("/products"),
    getProductsByRestaurantId: (restaurantId: string) => api.get<Product[]>(`/products/restaurant/${restaurantId}`),
    getProductById: (productId: string) => api.get<Product>(`/products/${productId}`),
    createProduct: (productData: ProductCreateData, imageFile?: File) => {
        const formData = new FormData();
        formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));
        if (imageFile) formData.append("image", imageFile);

        return api.post<Product>("/products", formData);
    },
    updateProduct: (productId: string, productData: ProductData, imageFile?: File) => {
        const formData = new FormData();
        formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));
        if (imageFile) formData.append("image", imageFile);

        return api.put<Product>(`/product/${productId}`, formData);
    },
    updateProductStatus: (productId: string) => api.patch<Product>(`/product/enable/${productId}`),
    deleteProduct: (productId: string) => api.delete(`/product/${productId}`),
    deleteProductImage: (productId: string) => api.delete(`/product/image/${productId}`),
};
