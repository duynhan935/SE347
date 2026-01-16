import type { Category, Restaurant, RestaurantData } from "@/types";
import { Review } from "@/types/review.type";
import api from "../axios";

// Helper to build FormData in the exact format the backend expects
function buildRestaurantFormData(restaurantData: RestaurantData, imageFile?: File): FormData {
    const formData = new FormData();

    // Important:
    // 1) Create a JSON Blob
    // 2) Mark it as 'application/json'
    const jsonBlob = new Blob([JSON.stringify(restaurantData)], { type: "application/json" });

    // 3) Append the JSON Blob under the 'restaurant' key.
    // The server can now parse that part as JSON.
    formData.append("restaurant", jsonBlob);

    // Add image file if provided (browser will set its content type)
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
        // Use new helper function
        const formData = buildRestaurantFormData(restaurantData, imageFile);

        // Still REMOVE header! Axios will automatically add Content-Type + boundary
        return api.post<Restaurant>("/restaurant", formData);
    },
    updateRestaurant: (restaurantId: string, restaurantData: RestaurantData, imageFile?: File) => {
        // Use new helper function
        const formData = buildRestaurantFormData(restaurantData, imageFile);

        // Still REMOVE header!
        return api.put<Restaurant>(`/restaurant/${restaurantId}`, formData);
    },
    updateRestaurantStatus: (restaurantId: string) => api.put<Restaurant>(`/restaurant/enable/${restaurantId}`),
    createManagerForRestaurant: (
        restaurantId: string,
        payload: { username: string; email: string; password: string; confirmPassword: string }
    ) => api.post<void>(`/restaurant/manager/${restaurantId}`, payload),
    deleteRestaurant: (restaurantId: string) => api.delete(`/restaurant/${restaurantId}`),
    deleteRestaurantImage: (restaurantId: string) => api.delete(`/restaurant/image/${restaurantId}`),
    getAllCategories: () => api.get<Category[]>(`/category`),
    getAllReviews: (restaurantId: string) => api.get<Review[]>(`/review?resId=${restaurantId}`),
};
