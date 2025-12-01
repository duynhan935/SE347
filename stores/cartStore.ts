import { StaticImageData } from "next/image";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartApi } from "@/lib/api/cartApi";
import toast from "react-hot-toast";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string | StaticImageData;
    quantity: number;
    restaurantId: string;
    restaurantName: string;
    sizeId?: string;
    sizeName?: string;
    customizations?: string;
}

interface CartState {
    items: CartItem[];
    userId: string | null;
    isLoading: boolean;

    // Actions
    setUserId: (userId: string | null) => void;
    fetchCart: () => Promise<void>;
    addItem: (itemToAdd: Omit<CartItem, "quantity">, quantity: number) => Promise<void>;
    removeItem: (itemId: string, restaurantId: string) => Promise<void>;
    updateQuantity: (itemId: string, restaurantId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    clearRestaurant: (restaurantId: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            userId: null,
            isLoading: false,

            setUserId: (userId) => {
                set({ userId });
                if (userId) {
                    get().fetchCart();
                }
            },

            fetchCart: async () => {
                const { userId } = get();
                if (!userId) return;

                try {
                    set({ isLoading: true });
                    const cart = await cartApi.getCart(userId);

                    console.log("Fetched cart:", cart);

                    // Transform backend cart structure to store format
                    const items: CartItem[] = [];

                    // Check if cart data exists and has restaurants
                    if (cart.data && cart.data.restaurants && Array.isArray(cart.data.restaurants)) {
                        cart.data.restaurants.forEach((restaurant) => {
                            restaurant.items.forEach((item) => {
                                items.push({
                                    id: item.productId,
                                    name: item.productName,
                                    price: item.price,
                                    quantity: item.quantity,
                                    image: item.imageURL || "",
                                    restaurantId: restaurant.restaurantId,
                                    restaurantName: restaurant.restaurantName,
                                    sizeId: item.sizeId,
                                    sizeName: item.sizeName,
                                    customizations: item.customizations,
                                });
                            });
                        });
                    }

                    set({ items });
                } catch (error) {
                    console.error("Failed to fetch cart:", error);
                    toast.error("Failed to load cart");
                } finally {
                    set({ isLoading: false });
                }
            },

            addItem: async (itemToAdd, quantity) => {
                const { userId } = get();
                if (!userId) {
                    toast.error("Please login to add items to cart");
                    return;
                }

                try {
                    await cartApi.addItemToCart(userId, {
                        restaurant: {
                            restaurantId: itemToAdd.restaurantId,
                            restaurantName: itemToAdd.restaurantName,
                        },
                        item: {
                            productId: itemToAdd.id,
                            productName: itemToAdd.name,
                            price: itemToAdd.price,
                            quantity,
                            sizeId: itemToAdd.sizeId,
                            sizeName: itemToAdd.sizeName,
                            customizations: itemToAdd.customizations,
                            imageURL: typeof itemToAdd.image === "string" ? itemToAdd.image : undefined,
                        },
                    });

                    await get().fetchCart();
                    toast.success("Item added to cart");
                } catch (error) {
                    console.error("Failed to add item:", error);
                    toast.error("Failed to add item to cart");
                }
            },

            removeItem: async (itemId, restaurantId) => {
                const { userId } = get();
                if (!userId) return;

                try {
                    await cartApi.removeItemFromCart(userId, restaurantId, itemId);
                    await get().fetchCart();
                    toast.success("Item removed from cart");
                } catch (error) {
                    console.error("Failed to remove item:", error);
                    toast.error("Failed to remove item");
                }
            },

            updateQuantity: async (itemId, restaurantId, quantity) => {
                const { userId } = get();
                if (!userId) return;

                try {
                    if (quantity <= 0) {
                        await get().removeItem(itemId, restaurantId);
                    } else {
                        await cartApi.updateItemQuantity(userId, restaurantId, itemId, quantity);
                        await get().fetchCart();
                    }
                } catch (error) {
                    console.error("Failed to update quantity:", error);
                    toast.error("Failed to update quantity");
                }
            },

            clearCart: async () => {
                const { userId } = get();
                if (!userId) return;

                try {
                    await cartApi.clearCart(userId);
                    set({ items: [] });
                    toast.success("Cart cleared");
                } catch (error) {
                    console.error("Failed to clear cart:", error);
                    toast.error("Failed to clear cart");
                }
            },

            clearRestaurant: async (restaurantId) => {
                const { userId } = get();
                if (!userId) return;

                try {
                    await cartApi.clearRestaurant(userId, restaurantId);
                    await get().fetchCart();
                    toast.success("Restaurant items removed");
                } catch (error) {
                    console.error("Failed to clear restaurant:", error);
                    toast.error("Failed to remove restaurant items");
                }
            },
        }),
        {
            name: "cart-storage",
            partialize: (state) => ({ userId: state.userId }),
        }
    )
);
