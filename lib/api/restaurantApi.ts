import type { Category, Restaurant, RestaurantData } from "@/types";
import { Review } from "@/types/review.type";
import api from "../axios";

// Hàm helper để tạo FormData CHUẨN
function buildRestaurantFormData(restaurantData: RestaurantData, imageFile?: File): FormData {
    const formData = new FormData();

    // --- THAY ĐỔI QUAN TRỌNG ---
    // 1. Tạo một "cục" dữ liệu (Blob) từ chuỗi JSON
    // 2. "Dán nhãn" (type) cho nó là 'application/json'
    const jsonBlob = new Blob([JSON.stringify(restaurantData)], { type: "application/json" });

    // 3. Append cái Blob đó vào formData.
    // Giờ đây server sẽ biết part 'restaurant' là JSON.
    formData.append("restaurant", jsonBlob);
    // --- HẾT THAY ĐỔI ---

    // Thêm file ảnh nếu có (cái này trình duyệt tự biết type)
    if (imageFile) {
        formData.append("image", imageFile);
    }

    return formData;
}

export const restaurantApi = {
    getByRestaurantSlug: (slug: string) => {
        // Next.js params.slug might still be encoded or partially encoded
        // Decode it first to ensure we have the clean slug
        let cleanSlug = slug;

        // Check if slug contains encoded characters (%XX pattern)
        if (slug.includes("%")) {
            try {
                // Try to decode - this handles cases where slug is still encoded
                const decoded = decodeURIComponent(slug);
                // Only use decoded if it's different (meaning it was encoded)
                if (decoded !== slug) {
                    cleanSlug = decoded;
                }
            } catch {
                // Decode failed, slug might be malformed, use as is
                cleanSlug = slug;
            }
        }

        // Now encode it once for the API call
        const encodedSlug = encodeURIComponent(cleanSlug);
        return api.get<Restaurant>(`/restaurant/${encodedSlug}`);
    },
    getByRestaurantId: (restaurantId: string) => api.get<Restaurant>(`/restaurant/admin/${restaurantId}`),
    getRestaurantByMerchantId: (merchantId: string) => api.get<Restaurant[]>(`/restaurant/merchant/${merchantId}`),
    getAllRestaurants: (params: URLSearchParams) => api.get<Restaurant[]>("/restaurant", { params: params }),
    createRestaurant: (restaurantData: RestaurantData, imageFile?: File) => {
        // Sử dụng hàm helper mới
        const formData = buildRestaurantFormData(restaurantData, imageFile);

        // Vẫn XÓA header đi! Axios sẽ tự động thêm Content-Type + boundary
        return api.post<Restaurant>("/restaurant", formData);
    },
    updateRestaurant: (restaurantId: string, restaurantData: RestaurantData, imageFile?: File) => {
        // Sử dụng hàm helper mới
        const formData = buildRestaurantFormData(restaurantData, imageFile);

        // Vẫn XÓA header đi!
        return api.put<Restaurant>(`/restaurant/${restaurantId}`, formData);
    },
    updateRestaurantStatus: (restaurantId: string) => api.put<Restaurant>(`/restaurant/enable/${restaurantId}`),
    createManagerForRestaurant: (restaurantId: string, payload: { username: string; email: string; password: string; confirmPassword: string }) =>
        api.post<void>(`/restaurant/manager/${restaurantId}`, payload),
    deleteRestaurant: (restaurantId: string) => api.delete(`/restaurant/${restaurantId}`),
    deleteRestaurantImage: (restaurantId: string) => api.delete(`/restaurant/image/${restaurantId}`),
    getAllCategories: () => api.get<Category[]>(`/category`),
    getAllReviews: (restaurantId: string) => api.get<Review[]>(`/review?resId=${restaurantId}`),
};
