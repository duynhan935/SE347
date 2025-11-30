import api from "../axios";

export interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    sizeId?: string;
    sizeName?: string;
    customizations?: string;
    subtotal: number;
    imageURL?: string;
}

export interface Restaurant {
    restaurantId: string;
    restaurantName: string;
}

export interface Cart {
    userId: string;
    restaurants: {
        restaurantId: string;
        restaurantName: string;
        items: CartItem[];
        subtotal: number;
    }[];
    totalItems: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface AddItemToCartRequest {
    restaurant: Restaurant;
    item: Omit<CartItem, "subtotal">;
}

export const cartApi = {
    // Get user's cart
    getCart: async (userId: string) => {
        const response = await api.get<Cart>(`/cart/${userId}`);
        return response.data;
    },

    // Add item to cart
    addItemToCart: async (userId: string, data: AddItemToCartRequest) => {
        const response = await api.post<Cart>(`/cart/${userId}`, data);
        return response.data;
    },

    // Update item quantity
    updateItemQuantity: async (userId: string, restaurantId: string, productId: string, quantity: number) => {
        const response = await api.patch<Cart>(`/cart/${userId}/restaurant/${restaurantId}/item/${productId}`, {
            quantity,
        });
        return response.data;
    },

    // Remove item from cart
    removeItemFromCart: async (userId: string, restaurantId: string, productId: string) => {
        const response = await api.delete<Cart>(`/cart/${userId}/restaurant/${restaurantId}/item/${productId}`);
        return response.data;
    },

    // Clear restaurant from cart
    clearRestaurant: async (userId: string, restaurantId: string) => {
        const response = await api.delete<Cart>(`/cart/${userId}/restaurant/${restaurantId}`);
        return response.data;
    },

    // Clear entire cart
    clearCart: async (userId: string) => {
        const response = await api.delete<Cart>(`/cart/${userId}`);
        return response.data;
    },
};
