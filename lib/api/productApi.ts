import api from "../axios";
import type { Product, ProductData } from "@/types";

export const productApi = {
    getAllProducts: () => api.get<Product[]>("/products"),
    getProductsByRestaurantId: (restaurantId: string) => api.get<Product[]>(`/products/restaurant/${restaurantId}`),
    getProductById: (productId: string) => api.get<Product>(`/products/${productId}`),
    createProduct: (productData: ProductData, imageFile?: File) => {
        const formData = new FormData();
        formData.append("product", JSON.stringify(productData));
        if (imageFile) formData.append("image", imageFile);

        return api.post<Product>("/product", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    updateProduct: (productId: string, productData: ProductData, imageFile?: File) => {
        const formData = new FormData();
        formData.append("product", JSON.stringify(productData));
        if (imageFile) formData.append("image", imageFile);

        return api.put<Product>(`/product/${productId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    updateProductStatus: (productId: string) => api.patch<Product>(`api/product/enable/${productId}`),
    deleteProduct: (productId: string) => api.delete(`/product/${productId}`),
    deleteProductImage: (productId: string) => api.delete(`/product/image/${productId}`),
};
