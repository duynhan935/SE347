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
    cartItemImage?: string;
}

export interface Restaurant {
    restaurantId: string;
    restaurantName: string;
}

export interface RestaurantCart {
    restaurantId: string;
    restaurantName: string;
    restaurantSlug?: string;
    restaurantImage?: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    totalAmount: number;
    notes?: string;
    deliveryAddress?: string;
}

export interface Cart {
    userId: string;
    restaurants: RestaurantCart[];
    createdAt: string;
    updatedAt: string;
}

export interface CartResponse {
    status: "success" | "error";
    message: string;
    data: Cart | null;
}

export interface AddItemToCartRequest {
    restaurant: Restaurant;
    item: Omit<CartItem, "subtotal"> & {
        cartItemImage?: string;
        image?: string;
    };
}

export const cartApi = {
    // Get user's cart
    getCart: async (userId: string) => {
        const response = await api.get<CartResponse>(`/cart/${userId}`);
        return response.data;
    },

    // Add item to cart
    addItemToCart: async (userId: string, data: AddItemToCartRequest) => {
        const response = await api.post<CartResponse>(`/cart/${userId}`, data);
        return response.data;
    },

    // Update item quantity
    updateItemQuantity: async (userId: string, restaurantId: string, productId: string, quantity: number) => {
        const response = await api.patch<CartResponse>(`/cart/${userId}/restaurant/${restaurantId}/item/${productId}`, {
            quantity,
        });
        return response.data;
    },

    // Remove item from cart
    removeItemFromCart: async (userId: string, restaurantId: string, productId: string) => {
        const response = await api.delete<CartResponse>(`/cart/${userId}/restaurant/${restaurantId}/item/${productId}`);
        return response.data;
    },

    // Clear restaurant from cart
    clearRestaurant: async (userId: string, restaurantId: string) => {
        const response = await api.delete<CartResponse>(`/cart/${userId}/restaurant/${restaurantId}`);
        return response.data;
    },

    // Clear entire cart
    clearCart: async (userId: string) => {
        const response = await api.delete<CartResponse>(`/cart/${userId}`);
        return response.data;
    },
};
