import { get } from "http";
import api from "../axios";

export const productApi = {
    getProductsByRestaurantId: (restaurantId: string) => {
        return api.get(`/products/restaurant/${restaurantId}`);
    },
    getProductById: (productId: string) => {
        return api.get(`/products/${productId}`);
    },
};
