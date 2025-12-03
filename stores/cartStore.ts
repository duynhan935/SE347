import { cartApi } from "@/lib/api/cartApi";
import { StaticImageData } from "next/image";
import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
        removeItem: (itemId: string, restaurantId: string, options?: { silent?: boolean }) => Promise<void>;
        updateQuantity: (itemId: string, restaurantId: string, quantity: number) => Promise<void>;
        clearCart: (options?: { silent?: boolean }) => Promise<void>;
        clearRestaurant: (restaurantId: string, options?: { silent?: boolean }) => Promise<void>;
}

const mapCartToItems = (cart: unknown): CartItem[] | null => {
        if (!cart || typeof cart !== "object") {
                return null;
        }

        const cartRecord = cart as Record<string, unknown>;
        const potentialData = cartRecord["data"];
        const cartPayload =
                potentialData && typeof potentialData === "object"
                        ? (potentialData as Record<string, unknown>)
                        : cartRecord;
        const restaurants = cartPayload["restaurants"];
        if (!Array.isArray(restaurants)) {
                return null;
        }

        const items: CartItem[] = [];
        restaurants.forEach((restaurant) => {
                if (!restaurant || typeof restaurant !== "object") {
                        return;
                }

                const restaurantRecord = restaurant as Record<string, unknown>;
                const restaurantId =
                        typeof restaurantRecord["restaurantId"] === "string" ? restaurantRecord["restaurantId"] : "";
                const restaurantName =
                        typeof restaurantRecord["restaurantName"] === "string"
                                ? restaurantRecord["restaurantName"]
                                : "";
                const restaurantItems = restaurantRecord["items"];

                if (!Array.isArray(restaurantItems)) {
                        return;
                }

                restaurantItems.forEach((item) => {
                        if (!item || typeof item !== "object") {
                                return;
                        }

                        const itemRecord = item as Record<string, unknown>;
                        const productId =
                                typeof itemRecord["productId"] === "string" ? itemRecord["productId"] : undefined;
                        const productName =
                                typeof itemRecord["productName"] === "string" ? itemRecord["productName"] : undefined;
                        const price = typeof itemRecord["price"] === "number" ? itemRecord["price"] : undefined;
                        const quantity =
                                typeof itemRecord["quantity"] === "number" ? itemRecord["quantity"] : undefined;

                        if (!productId || !productName || price === undefined || quantity === undefined) {
                                return;
                        }

                        const image = typeof itemRecord["imageURL"] === "string" ? itemRecord["imageURL"] : "";
                        const sizeId = typeof itemRecord["sizeId"] === "string" ? itemRecord["sizeId"] : undefined;
                        const sizeName =
                                typeof itemRecord["sizeName"] === "string" ? itemRecord["sizeName"] : undefined;
                        const rawCustomizations = itemRecord["customizations"];
                        const customizations =
                                typeof rawCustomizations === "string" && rawCustomizations.trim().length > 0
                                        ? rawCustomizations
                                        : undefined;

                        items.push({
                                id: productId,
                                name: productName,
                                price,
                                quantity,
                                image,
                                restaurantId,
                                restaurantName,
                                sizeId,
                                sizeName,
                                customizations,
                        });
                });
        });

        return items;
};

export const useCartStore = create<CartState>()(
        persist(
                (set, get) => {
                        const updateItemsFromResponse = (cartResponse: unknown): boolean => {
                                const parsedItems = mapCartToItems(cartResponse);
                                if (parsedItems === null) {
                                        return false;
                                }

                                set({ items: parsedItems });
                                return true;
                        };

                        return {
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
                                                if (!updateItemsFromResponse(cart)) {
                                                        set({ items: [] });
                                                }
                                        } catch (error) {
                                                // Check if it's a timeout error
                                                const isTimeout =
                                                        (error as { code?: string; message?: string })?.code ===
                                                                "ECONNABORTED" ||
                                                        (error as { message?: string })?.message?.includes("timeout");

                                                // Only log and show toast for non-timeout errors
                                                if (!isTimeout) {
                                                        console.error("Failed to fetch cart:", error);
                                                        toast.error("Failed to load cart");
                                                }
                                                // For timeout, silently fail - might just be slow network
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
                                                const cart = await cartApi.addItemToCart(userId, {
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
                                                                imageURL:
                                                                        typeof itemToAdd.image === "string"
                                                                                ? itemToAdd.image
                                                                                : undefined,
                                                        },
                                                });

                                                if (!updateItemsFromResponse(cart)) {
                                                        await get().fetchCart();
                                                }
                                                toast.success("Đã thêm vào giỏ hàng!");
                                        } catch (error) {
                                                console.error("Failed to add item:", error);
                                                toast.error("Failed to add item to cart");
                                        }
                                },

                                removeItem: async (itemId, restaurantId, options) => {
                                        const { userId } = get();
                                        if (!userId) return;

                                        try {
                                                const cart = await cartApi.removeItemFromCart(
                                                        userId,
                                                        restaurantId,
                                                        itemId
                                                );
                                                if (!updateItemsFromResponse(cart)) {
                                                        await get().fetchCart();
                                                }
                                                if (!options?.silent) {
                                                        toast.success("Item removed from cart");
                                                }
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
                                                        await get().removeItem(itemId, restaurantId, { silent: true });
                                                } else {
                                                        const cart = await cartApi.updateItemQuantity(
                                                                userId,
                                                                restaurantId,
                                                                itemId,
                                                                quantity
                                                        );
                                                        if (!updateItemsFromResponse(cart)) {
                                                                await get().fetchCart();
                                                        }
                                                }
                                        } catch (error) {
                                                console.error("Failed to update quantity:", error);
                                                toast.error("Failed to update quantity");
                                        }
                                },

                                clearCart: async (options) => {
                                        const { userId } = get();
                                        if (!userId) return;

                                        try {
                                                const cart = await cartApi.clearCart(userId);
                                                if (!updateItemsFromResponse(cart)) {
                                                        set({ items: [] });
                                                }
                                                if (!options?.silent) {
                                                        toast.success("Cart cleared");
                                                }
                                        } catch (error) {
                                                console.error("Failed to clear cart:", error);
                                                toast.error("Failed to clear cart");
                                        }
                                },

                                clearRestaurant: async (restaurantId, options) => {
                                        const { userId } = get();
                                        if (!userId) return;

                                        try {
                                                const cart = await cartApi.clearRestaurant(userId, restaurantId);
                                                if (!updateItemsFromResponse(cart)) {
                                                        await get().fetchCart();
                                                }
                                                if (!options?.silent) {
                                                        toast.success("Restaurant items removed");
                                                }
                                        } catch (error) {
                                                console.error("Failed to clear restaurant:", error);
                                                toast.error("Failed to remove restaurant items");
                                        }
                                },
                        };
                },
                {
                        name: "cart-storage",
                        partialize: (state) => ({ userId: state.userId }),
                }
        )
);
