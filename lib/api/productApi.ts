import type { Product, ProductCreateData, Review } from "@/types";
import api from "../axios";

export const productApi = {
        getAllProducts: (params: URLSearchParams) => api.get<Product[]>("/products", { params: params }),
        getProductsByRestaurantId: (restaurantId: string) => api.get<Product[]>(`/products/restaurant/${restaurantId}`),
        getProductBySlug: (slug: string) => {
                // Decode slug multiple times until no more %25 (encoded %)
                // This handles cases where slug is double or triple encoded
                let cleanSlug = slug;
                const maxAttempts = 5;
                let attempts = 0;

                // Keep decoding while slug contains %25 (which indicates double encoding)
                while (cleanSlug.includes("%25") && attempts < maxAttempts) {
                        try {
                                const decoded = decodeURIComponent(cleanSlug);
                                // If decode doesn't change anything, we're done
                                if (decoded === cleanSlug) {
                                        break;
                                }
                                cleanSlug = decoded;
                                attempts++;
                        } catch {
                                // Decode failed, stop trying
                                break;
                        }
                }

                // If slug still contains % but not %25, try one more decode
                if (cleanSlug.includes("%") && !cleanSlug.includes("%25")) {
                        try {
                                const decoded = decodeURIComponent(cleanSlug);
                                if (decoded !== cleanSlug) {
                                        cleanSlug = decoded;
                                }
                        } catch {
                                // Ignore decode errors
                        }
                }

                // Now encode it once for the API call
                const encodedSlug = encodeURIComponent(cleanSlug);
                return api.get<Product>(`/products/${encodedSlug}`);
        },
        getProductById: (productId: string) => api.get<Product>(`/products/admin/${productId}`),
        createProduct: (productData: ProductCreateData, imageFile?: File) => {
                const formData = new FormData();
                formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));
                if (imageFile) formData.append("image", imageFile);

                return api.post<Product>("/products", formData);
        },
        updateProduct: (productId: string, productData: ProductCreateData, imageFile?: File) => {
                const formData = new FormData();
                formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));
                if (imageFile) formData.append("image", imageFile);

                return api.put<Product>(`/products/${productId}`, formData);
        },
        updateProductStatus: (productId: string) => api.put<Product>(`/products/availability/${productId}`),
        deleteProduct: (productId: string) => api.delete(`/products/${productId}`),
        deleteProductImage: (productId: string) => api.delete(`/products/image/${productId}`),
        getAllReviews: (productId: string) => api.get<Review[]>(`/review?productId=${productId}`),
};
