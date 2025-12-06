import { cartApi } from "@/lib/api/cartApi";
import { getImageUrl } from "@/lib/utils";
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

                        const imageURL = itemRecord["imageURL"];
                        console.log("[CartStore] Parsing item imageURL:", {
                                productId,
                                productName,
                                imageURL,
                                imageURLType: typeof imageURL,
                                imageURLValue: imageURL,
                        });
                        // Use imageURL if it exists and is not empty, otherwise use placeholder
                        // Always ensure we have a valid image URL string
                        let image = "/placeholder.png";
                        if (
                                imageURL !== undefined &&
                                imageURL !== null &&
                                typeof imageURL === "string" &&
                                imageURL.trim() !== ""
                        ) {
                                image = imageURL.trim();
                        }
                        console.log("[CartStore] Final image value:", image);
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
                                        const currentUserId = get().userId;
                                        // Only update if userId changed
                                        if (currentUserId !== userId) {
                                                set({ userId });
                                                if (userId) {
                                                        // Fetch cart asynchronously (don't await to avoid blocking)
                                                        // This ensures cart is loaded when user navigates to cart/payment pages
                                                        // If cart doesn't exist yet (404), it will be silently handled
                                                        get()
                                                                .fetchCart()
                                                                .catch((error) => {
                                                                        // Silently handle errors - cart might not exist yet (normal for new users)
                                                                        // Cart will be created automatically when first item is added
                                                                        const isNotFound =
                                                                                (
                                                                                        error as {
                                                                                                response?: {
                                                                                                        status?: number;
                                                                                                };
                                                                                        }
                                                                                )?.response?.status === 404;
                                                                        if (!isNotFound) {
                                                                                console.warn(
                                                                                        "Failed to fetch cart after setUserId:",
                                                                                        error
                                                                                );
                                                                        }
                                                                });
                                                } else {
                                                        // Clear items when userId is null
                                                        set({ items: [] });
                                                }
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

                                                // Check if cart doesn't exist yet (404 or similar)
                                                const isNotFound =
                                                        (error as { response?: { status?: number } })?.response
                                                                ?.status === 404 ||
                                                        (error as { message?: string })?.message?.includes(
                                                                "not found"
                                                        ) ||
                                                        (error as { message?: string })?.message?.includes("Not found");

                                                // Silently handle not found errors (cart will be created when adding first item)
                                                // This is normal for new users who haven't added anything to cart yet
                                                if (isNotFound) {
                                                        set({ items: [] });
                                                        return; // Don't show error for new users - cart will be created on first add
                                                }

                                                // Only log and show toast for non-timeout errors
                                                if (!isTimeout) {
                                                        console.error("Failed to fetch cart:", error);
                                                        // Don't show toast for initial fetch (might be called automatically)
                                                        // Only show toast if user explicitly tries to view cart
                                                }
                                                // For timeout, silently fail - might just be slow network
                                        } finally {
                                                set({ isLoading: false });
                                        }
                                },

                                addItem: async (itemToAdd, quantity) => {
                                        let { userId } = get();

                                        // If userId is not set, try to get it from auth store
                                        if (!userId) {
                                                try {
                                                        // Dynamic import to avoid circular dependency
                                                        const { useAuthStore: authStore } = await import(
                                                                "@/stores/useAuthStore"
                                                        );
                                                        const authState = authStore.getState();
                                                        if (authState.user?.id) {
                                                                userId = authState.user.id;
                                                                set({ userId });
                                                                // Fetch cart first to ensure it exists (setUserId already calls fetchCart, but we call it explicitly here to ensure it completes)
                                                                try {
                                                                        await get().fetchCart();
                                                                } catch (fetchError) {
                                                                        // If fetch fails, continue anyway - backend will create cart if needed
                                                                        console.warn(
                                                                                "Failed to fetch cart before adding item, continuing anyway:",
                                                                                fetchError
                                                                        );
                                                                }
                                                        } else {
                                                                toast.error("Please login to add items to cart");
                                                                return;
                                                        }
                                                } catch (error) {
                                                        console.error("Failed to get user from auth store:", error);
                                                        toast.error("Please login to add items to cart");
                                                        return;
                                                }
                                        }

                                        try {
                                                // Get image URL - itemToAdd.image should already be processed from FoodCard/MenuItemCard
                                                // but we'll process it again to handle both string and StaticImageData cases
                                                const imageUrlToSend = getImageUrl(itemToAdd.image);
                                                // Always send imageURL to backend, even if it's a placeholder
                                                // Backend will handle empty/placeholder values, but we need to send it
                                                // This ensures the cart uses the same image as displayed on the card
                                                const finalImageURL =
                                                        imageUrlToSend && imageUrlToSend.trim() !== ""
                                                                ? imageUrlToSend.trim()
                                                                : "/placeholder.png";

                                                console.log("[CartStore] Adding item to cart:", {
                                                        productId: itemToAdd.id,
                                                        productName: itemToAdd.name,
                                                        originalImage: itemToAdd.image,
                                                        imageUrlToSend,
                                                        finalImageURL,
                                                });

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
                                                                imageURL: finalImageURL,
                                                        },
                                                });

                                                console.log(
                                                        "[CartStore] Cart response:",
                                                        JSON.stringify(cart, null, 2)
                                                );

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
