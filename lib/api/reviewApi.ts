import api from "../axios";
import { Review } from "@/types";

export interface ReviewData {
    userId: string;
    reviewId: string; // restaurantId or productId
    reviewType: "RESTAURANT" | "PRODUCT";
    title: string;
    content: string;
    rating: number;
}

export const reviewApi = {
    // Get reviews by restaurant
    getReviewsByRestaurant: async (restaurantId: string) => {
        const response = await api.get<Review[]>(`/review?resId=${restaurantId}`);
        return response.data;
    },

    // Get reviews by product
    getReviewsByProduct: async (productId: string) => {
        const response = await api.get<Review[]>(`/review?productId=${productId}`);
        return response.data;
    },

    // Get review by ID
    getReviewById: async (reviewId: string) => {
        const response = await api.get<Review>(`/review/${reviewId}`);
        return response.data;
    },

    // Create review
    createReview: async (reviewData: ReviewData) => {
        const response = await api.post<Review>("/review", reviewData);
        return response.data;
    },

    // Delete review
    deleteReview: async (reviewId: string) => {
        const response = await api.delete(`/review/${reviewId}`);
        return response.data;
    },
};
