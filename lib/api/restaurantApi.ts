import type { Category, Restaurant, RestaurantData } from "@/types";
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
        getByRestaurantId: (restaurantId: string) => api.get<Restaurant>(`restaurant/${restaurantId}`),
        getRestaurantByMerchantId: (merchantId: string) => api.get<Restaurant[]>(`/restaurant/merchant/${merchantId}`),
        getAllRestaurants: () => api.get<Restaurant[]>("/restaurant"),
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
        deleteRestaurant: (restaurantId: string) => api.delete(`/restaurant/${restaurantId}`),
        deleteRestaurantImage: (restaurantId: string) => api.delete(`/restaurant/image/${restaurantId}`),
        getAllCategories: () => api.get<Category[]>(`/category`),
};
