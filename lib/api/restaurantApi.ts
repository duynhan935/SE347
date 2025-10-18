import type { Category, Restaurant, RestaurantData } from "@/types";
import api from "../axios";

export const restaurantApi = {
    getByRestaurantId: (restaurantId: string) => api.get<Restaurant>(`restaurant/${restaurantId}`),
    getRestaurantByMerchantId: (merchantId: string) => api.get<Restaurant[]>(`/restaurant/merchant/${merchantId}`),
    getAllRestaurants: () => api.get<Restaurant[]>("/restaurant"),
    createRestaurant: (restaurantData: RestaurantData, imageFile?: File) => {
        const formData = new FormData();
        formData.append("restaurant", JSON.stringify(restaurantData));
        if (imageFile) formData.append("image", imageFile);

                return api.post<Restaurant>("/restaurant", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                });
        },
        updateRestaurant: (restaurantId: string, restaurantData: RestaurantData, imageFile?: File) => {
                const formData = new FormData();
                formData.append("restaurant", JSON.stringify(restaurantData));
                if (imageFile) formData.append("image", imageFile);

                return api.put<Restaurant>(`/restaurant/${restaurantId}`, formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                });
        },
        updateRestaurantStatus: (restaurantId: string) =>
                api.patch<Restaurant>(`api/restaurant/enable/${restaurantId}`),
        deleteRestaurant: (restaurantId: string) => api.delete(`/restaurant/${restaurantId}`),
        deleteRestaurantImage: (restaurantId: string) => api.delete(`/restaurant/image/${restaurantId}`),
        getAllCategories: () => api.get<Category[]>(`/category`),
};
