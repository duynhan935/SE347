import { cartApi } from "@/lib/api/cartApi";
import { getImageUrl } from "@/lib/utils";
import { StaticImageData } from "next/image";
import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
    id: string; // Unique cart item id used by backend routes (productId)
    baseProductId: string; // Original product id
    name: string;
    price: number;
    image: string | StaticImageData;
    quantity: number;
    restaurantId: string;
    restaurantName: string;
    categoryId?: string;
    categoryName?: string;
    sizeId?: string;
    sizeName?: string;
    customizations?: string;
}

export interface AddToCartItem {
    id: string; // base product id
    name: string;
    price: number;
    image: string | StaticImageData;
    restaurantId: string;
    restaurantName: string;
    categoryId?: string;
    categoryName?: string;
    sizeId?: string;
    sizeName?: string;
    customizations?: string;
}

interface CartState {
    items: CartItem[];
    userId: string | null;
    isLoading: boolean;
    isAddingItem: boolean;
    pendingAdds: Record<string, number>; // itemKey -> timestamp (ms)

    // Actions
    setUserId: (userId: string | null) => void;
    fetchCart: (options?: { forceUpdate?: boolean }) => Promise<void>;
    addItem: (itemToAdd: AddToCartItem, quantity: number) => Promise<void>;
    removeItem: (itemId: string, restaurantId: string, options?: { silent?: boolean }) => Promise<void>;
    updateQuantity: (itemId: string, restaurantId: string, quantity: number) => Promise<void>;
    clearCart: (options?: { silent?: boolean }) => Promise<void>;
    clearRestaurant: (restaurantId: string, options?: { silent?: boolean }) => Promise<void>;
}

const getItemKey = (itemId: string, restaurantId: string): string => `${restaurantId}::${itemId}`;

const mergeWithPendingAdds = (
    backendItems: CartItem[],
    currentItems: CartItem[],
    pendingAdds: Record<string, number>
) => {
    const now = Date.now();
    const ttlMs = 30000;

    const backendKeys = new Set(backendItems.map((it) => getItemKey(it.id, it.restaurantId)));
    const merged = [...backendItems];

    for (const localItem of currentItems) {
        const key = getItemKey(localItem.id, localItem.restaurantId);
        const pendingAt = pendingAdds[key];
        if (!pendingAt) continue;
        if (now - pendingAt > ttlMs) continue;
        if (backendKeys.has(key)) continue;
        merged.push(localItem);
    }

    merged.sort((a, b) => a.restaurantName.localeCompare(b.restaurantName));
    return merged;
};

type CartItemOptions = {
    categoryId?: string;
    categoryName?: string;
    sizeId?: string;
    sizeName?: string;
    customizations?: string;
    imageURL?: string;
};

const base64UrlEncode = (input: string): string => {
    const hasBtoa =
        typeof globalThis !== "undefined" && typeof (globalThis as unknown as { btoa?: unknown }).btoa === "function";
    const hasBuffer =
        typeof globalThis !== "undefined" &&
        typeof (globalThis as unknown as { Buffer?: unknown }).Buffer !== "undefined";

    if (!hasBtoa && hasBuffer) {
        const base64 = (
            globalThis as unknown as {
                Buffer: { from: (s: string, enc: string) => { toString: (enc: string) => string } };
            }
        ).Buffer.from(input, "utf8").toString("base64");
        return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }

    const bytes = new TextEncoder().encode(input);
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const base64UrlDecode = (input: string): string => {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const hasAtob =
        typeof globalThis !== "undefined" && typeof (globalThis as unknown as { atob?: unknown }).atob === "function";
    const hasBuffer =
        typeof globalThis !== "undefined" &&
        typeof (globalThis as unknown as { Buffer?: unknown }).Buffer !== "undefined";

    if (!hasAtob && hasBuffer) {
        return (
            globalThis as unknown as {
                Buffer: { from: (s: string, enc: string) => { toString: (enc: string) => string } };
            }
        ).Buffer.from(padded, "base64").toString("utf8");
    }

    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
};

const normalizeOptions = (options: CartItemOptions): CartItemOptions => {
    const normalized: CartItemOptions = {};

    const entries = Object.entries(options) as Array<[keyof CartItemOptions, CartItemOptions[keyof CartItemOptions]]>;
    for (const [key, value] of entries) {
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed.length > 0) {
                normalized[key] = trimmed as never;
            }
        }
    }

    return normalized;
};

const createCartItemId = (baseProductId: string, options: CartItemOptions): string => {
    const normalized = normalizeOptions(options);
    const json = JSON.stringify(normalized);
    if (json === "{}") {
        return baseProductId;
    }

    return `${baseProductId}--${base64UrlEncode(json)}`;
};

const parseCartItemId = (cartItemId: string): { baseProductId: string; options: CartItemOptions } => {
    const separatorIndex = cartItemId.indexOf("--");
    if (separatorIndex === -1) {
        return { baseProductId: cartItemId, options: {} };
    }

    const baseProductId = cartItemId.slice(0, separatorIndex);
    const encoded = cartItemId.slice(separatorIndex + 2);

    try {
        const json = base64UrlDecode(encoded);
        const parsed = JSON.parse(json);
        if (!parsed || typeof parsed !== "object") {
            return { baseProductId, options: {} };
        }
        return { baseProductId, options: parsed as CartItemOptions };
    } catch {
        return { baseProductId, options: {} };
    }
};

const mapCartToItems = (cart: unknown): CartItem[] | null => {
    if (!cart || typeof cart !== "object") {
        console.warn("[mapCartToItems] Cart is not an object:", cart);
        return null;
    }

    const cartRecord = cart as Record<string, unknown>;
    const potentialData = cartRecord["data"];
    const cartPayload =
        potentialData && typeof potentialData === "object" ? (potentialData as Record<string, unknown>) : cartRecord;
    const restaurants = cartPayload["restaurants"];
    if (!Array.isArray(restaurants)) {
        console.warn("[mapCartToItems] restaurants is not an array:", restaurants, "cartPayload:", cartPayload);
        return null;
    }

    if (restaurants.length === 0) {
        console.log("[mapCartToItems] restaurants array is empty");
        return []; // Return empty array, not null, to distinguish from parse failure
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
            typeof restaurantRecord["restaurantName"] === "string" ? restaurantRecord["restaurantName"] : "";
        const restaurantItems = restaurantRecord["items"];

        if (!Array.isArray(restaurantItems)) {
            return;
        }

        restaurantItems.forEach((item) => {
            if (!item || typeof item !== "object") {
                return;
            }

            const itemRecord = item as Record<string, unknown>;
            const productId = typeof itemRecord["productId"] === "string" ? itemRecord["productId"] : undefined;
            const productName = typeof itemRecord["productName"] === "string" ? itemRecord["productName"] : undefined;
            const price = typeof itemRecord["price"] === "number" ? itemRecord["price"] : undefined;
            const quantity = typeof itemRecord["quantity"] === "number" ? itemRecord["quantity"] : undefined;

            if (!productId || !productName || price === undefined || quantity === undefined) {
                return;
            }

            const { baseProductId, options } = parseCartItemId(productId);

            const rawImageURL = itemRecord["imageURL"];
            const imageFromRecord =
                typeof rawImageURL === "string" && rawImageURL.trim() !== "" ? rawImageURL.trim() : undefined;
            const imageFromOptions =
                typeof options.imageURL === "string" && options.imageURL.trim() !== ""
                    ? options.imageURL.trim()
                    : undefined;
            const image = imageFromOptions || imageFromRecord || "/placeholder.png";

            const sizeId = typeof options.sizeId === "string" ? options.sizeId : undefined;
            const sizeName = typeof options.sizeName === "string" ? options.sizeName : undefined;

            const rawCustomizations = itemRecord["customizations"];
            const customizationsFromRecord =
                typeof rawCustomizations === "string" && rawCustomizations.trim().length > 0
                    ? rawCustomizations.trim()
                    : undefined;
            const customizationsFromOptions =
                typeof options.customizations === "string" && options.customizations.trim().length > 0
                    ? options.customizations.trim()
                    : undefined;
            const customizations = customizationsFromOptions || customizationsFromRecord;

            const categoryId = typeof options.categoryId === "string" ? options.categoryId : undefined;
            const categoryName = typeof options.categoryName === "string" ? options.categoryName : undefined;

            items.push({
                id: productId,
                baseProductId,
                name: productName,
                price,
                quantity,
                image,
                restaurantId,
                restaurantName,
                categoryId,
                categoryName,
                sizeId,
                sizeName,
                customizations,
            });
        });
    });

    console.log(`[mapCartToItems] Parsed ${items.length} items from ${restaurants.length} restaurants`);
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

                const state = get();
                const merged = mergeWithPendingAdds(parsedItems, state.items, state.pendingAdds);

                // Clear pending keys that are now present in backend response.
                const nextPendingAdds: Record<string, number> = { ...state.pendingAdds };
                for (const it of parsedItems) {
                    delete nextPendingAdds[getItemKey(it.id, it.restaurantId)];
                }

                set({ items: merged, pendingAdds: nextPendingAdds });
                return true;
            };

            return {
                items: [],
                userId: null,
                isLoading: false,
                isAddingItem: false,
                pendingAdds: {},

                setUserId: (userId) => {
                    const currentUserId = get().userId;
                    // Only update if userId changed
                    if (currentUserId !== userId) {
                        set({ userId });
                        if (userId) {
                            // Don't auto-fetch cart here - fetch only when needed
                            // Cart will be fetched when:
                            // 1. User navigates to cart/checkout pages
                            // 2. User adds item to cart
                            // This prevents unnecessary API calls on every page load
                        } else {
                            // Clear items when userId is null
                            set({ items: [] });
                        }
                    }
                },

                fetchCart: async (options?: { forceUpdate?: boolean }) => {
                    const { userId } = get();
                    if (!userId) return;

                    try {
                        set({ isLoading: true });
                        const cart = await cartApi.getCart(userId);
                        const parsedItems = mapCartToItems(cart);

                        if (parsedItems && parsedItems.length > 0) {
                            // Backend has items, always update store (source of truth)
                            const state = get();
                            const merged = mergeWithPendingAdds(parsedItems, state.items, state.pendingAdds);

                            const nextPendingAdds: Record<string, number> = { ...state.pendingAdds };
                            for (const it of parsedItems) {
                                delete nextPendingAdds[getItemKey(it.id, it.restaurantId)];
                            }

                            set({ items: merged, pendingAdds: nextPendingAdds });
                            console.log(`[CartStore] Fetched ${parsedItems.length} items from backend`);
                        } else {
                            // Backend returned empty cart
                            const currentItems = get().items;

                            // If forceUpdate is true (e.g., after adding item), always trust backend
                            // Otherwise, keep local items if backend is empty (handles race conditions)
                            if (options?.forceUpdate || currentItems.length === 0) {
                                // Force update or local is also empty, set empty
                                set({ items: [] });
                                console.log("[CartStore] Cart is empty (force update or both empty)");
                            } else {
                                // Local has items but backend doesn't - keep local items
                                // This handles race condition where item was just added and backend hasn't synced yet
                                console.warn(
                                    "[CartStore] Backend cart is empty but local store has items. Keeping local items (may be syncing)."
                                );
                                // Don't overwrite local items - they may be syncing with backend
                            }
                        }
                    } catch (error) {
                        // Check if it's a timeout error
                        const isTimeout =
                            (error as { code?: string; message?: string })?.code === "ECONNABORTED" ||
                            (error as { message?: string })?.message?.includes("timeout");

                        // Check if cart doesn't exist yet (404 or similar)
                        const isNotFound =
                            (error as { response?: { status?: number } })?.response?.status === 404 ||
                            (error as { message?: string })?.message?.includes("not found") ||
                            (error as { message?: string })?.message?.includes("Not found");

                        // Check if service is unavailable (503)
                        const isServiceUnavailable =
                            (error as { response?: { status?: number } })?.response?.status === 503;

                        // Silently handle not found errors (cart will be created when adding first item)
                        // This is normal for new users who haven't added anything to cart yet
                        if (isNotFound) {
                            // Only clear if local is also empty
                            const currentItems = get().items;
                            if (currentItems.length === 0) {
                                set({ items: [] });
                            }
                            return; // Don't show error for new users - cart will be created on first add
                        }

                        // Silently handle service unavailable (503) - service might be down or starting up
                        if (isServiceUnavailable) {
                            // Keep local items if available
                            const currentItems = get().items;
                            if (currentItems.length === 0) {
                                set({ items: [] });
                            }
                            return; // Don't show error - service might be temporarily unavailable
                        }

                        // Only log and show toast for non-timeout, non-503 errors
                        if (!isTimeout) {
                            console.error("Failed to fetch cart:", error);
                            // Don't show toast for initial fetch (might be called automatically)
                            // Only show toast if user explicitly tries to view cart
                        }
                        // For timeout, silently fail - might just be slow network
                        // Keep local items if available
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
                            const { useAuthStore: authStore } = await import("@/stores/useAuthStore");
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

                    // Save current state for potential revert on error
                    const previousItems = [...get().items];
                    let pendingKey: string | null = null;

                    try {
                        set({ isAddingItem: true });
                        // Get image URL - itemToAdd.image should already be processed from FoodCard/MenuItemCard
                        // but we'll process it again to handle both string and StaticImageData cases
                        const imageUrlToSend = getImageUrl(itemToAdd.image);
                        // Always send imageURL to backend, even if it's a placeholder
                        // Backend will handle empty/placeholder values, but we need to send it
                        // This ensures the cart uses the same image as displayed on the card
                        const finalImageURL =
                            imageUrlToSend && imageUrlToSend.trim() !== "" ? imageUrlToSend.trim() : "/placeholder.png";

                        const cartItemId = createCartItemId(itemToAdd.id, {
                            categoryId: itemToAdd.categoryId,
                            categoryName: itemToAdd.categoryName,
                            sizeId: itemToAdd.sizeId,
                            sizeName: itemToAdd.sizeName,
                            customizations: itemToAdd.customizations,
                            imageURL: finalImageURL,
                        });

                        const key = getItemKey(cartItemId, itemToAdd.restaurantId);
                        pendingKey = key;

                        // Mark as pending to prevent stale backend fetches from wiping it.
                        set((state) => ({ pendingAdds: { ...state.pendingAdds, [key]: Date.now() } }));

                        // Optimistic update (fixes "first item invisible" + keeps UI responsive)
                        set((state) => {
                            const existingItemIndex = state.items.findIndex(
                                (item) => item.id === cartItemId && item.restaurantId === itemToAdd.restaurantId
                            );

                            if (existingItemIndex >= 0) {
                                const updatedItems = [...state.items];
                                const existingItem = updatedItems[existingItemIndex];
                                updatedItems[existingItemIndex] = {
                                    ...existingItem,
                                    quantity: existingItem.quantity + quantity,
                                };
                                return { items: updatedItems };
                            }

                            const newItem: CartItem = {
                                id: cartItemId,
                                baseProductId: itemToAdd.id,
                                name: itemToAdd.name,
                                price: itemToAdd.price,
                                image: finalImageURL,
                                quantity,
                                restaurantId: itemToAdd.restaurantId,
                                restaurantName: itemToAdd.restaurantName,
                                categoryId: itemToAdd.categoryId,
                                categoryName: itemToAdd.categoryName,
                                sizeId: itemToAdd.sizeId,
                                sizeName: itemToAdd.sizeName,
                                customizations: itemToAdd.customizations,
                            };

                            return { items: [...state.items, newItem] };
                        });

                        const requestPayload = {
                            restaurant: {
                                restaurantId: itemToAdd.restaurantId,
                                restaurantName: itemToAdd.restaurantName,
                            },
                            item: {
                                productId: cartItemId,
                                productName: itemToAdd.name,
                                price: itemToAdd.price,
                                quantity,
                                customizations: itemToAdd.customizations,
                                imageURL: finalImageURL,
                            },
                        };

                        const cart = await cartApi.addItemToCart(userId, requestPayload);

                        // Log response for debugging
                        console.log("[CartStore] Backend response:", JSON.stringify(cart, null, 2));

                        // Check if response indicates error even though status is success
                        const responseData = (cart as { data?: unknown; status?: string; message?: string }).data;
                        const responseStatus = (cart as { status?: string }).status;

                        if (
                            responseStatus === "error" ||
                            (responseData && typeof responseData === "object" && "error" in responseData)
                        ) {
                            const errorMessage = (cart as { message?: string }).message || "Backend returned error";
                            console.error("[CartStore] Backend returned error:", errorMessage);
                            throw new Error(errorMessage);
                        }

                        // Use the response from addItemToCart directly - it already contains the updated cart
                        // This avoids race conditions from fetching cart separately
                        const parsedItems = mapCartToItems(cart);

                        if (parsedItems !== null && parsedItems.length > 0) {
                            // Backend returned valid cart data with items, use it as source of truth
                            const state = get();
                            const merged = mergeWithPendingAdds(parsedItems, state.items, state.pendingAdds);

                            const nextPendingAdds: Record<string, number> = { ...state.pendingAdds };
                            for (const it of parsedItems) {
                                delete nextPendingAdds[getItemKey(it.id, it.restaurantId)];
                            }

                            set({ items: merged, pendingAdds: nextPendingAdds });
                            console.log(
                                `[CartStore] Cart updated from backend response, items count: ${parsedItems.length}`
                            );
                        } else if (parsedItems !== null && parsedItems.length === 0) {
                            // Backend returned empty cart (shouldn't happen after adding item, but handle it)
                            console.warn("[CartStore] Backend returned empty cart after adding item, fetching cart...");
                            // Fetch cart to ensure we have the latest data
                            try {
                                const fetchedCart = await cartApi.getCart(userId);
                                const fetchedItems = mapCartToItems(fetchedCart);
                                if (fetchedItems !== null) {
                                    const state = get();
                                    const merged = mergeWithPendingAdds(fetchedItems, state.items, state.pendingAdds);

                                    const nextPendingAdds: Record<string, number> = { ...state.pendingAdds };
                                    for (const it of fetchedItems) {
                                        delete nextPendingAdds[getItemKey(it.id, it.restaurantId)];
                                    }

                                    set({ items: merged, pendingAdds: nextPendingAdds });
                                    console.log(
                                        `[CartStore] Cart fetched and updated, items count: ${fetchedItems.length}`
                                    );
                                } else {
                                    // Still empty, use optimistic update
                                    throw new Error("Cart is empty after fetch");
                                }
                            } catch (fetchError) {
                                console.error("[CartStore] Failed to fetch cart after empty response:", fetchError);
                                // Fallback to optimistic update
                                const currentItems = get().items;
                                const existingItemIndex = currentItems.findIndex(
                                    (item) => item.id === cartItemId && item.restaurantId === itemToAdd.restaurantId
                                );

                                let optimisticItems: CartItem[];
                                if (existingItemIndex >= 0) {
                                    const existingItem = currentItems[existingItemIndex];
                                    optimisticItems = [...currentItems];
                                    optimisticItems[existingItemIndex] = {
                                        ...existingItem,
                                        quantity: existingItem.quantity + quantity,
                                    };
                                } else {
                                    const newItem: CartItem = {
                                        id: cartItemId,
                                        baseProductId: itemToAdd.id,
                                        name: itemToAdd.name,
                                        price: itemToAdd.price,
                                        image: finalImageURL,
                                        quantity,
                                        restaurantId: itemToAdd.restaurantId,
                                        restaurantName: itemToAdd.restaurantName,
                                        categoryId: itemToAdd.categoryId,
                                        categoryName: itemToAdd.categoryName,
                                        sizeId: itemToAdd.sizeId,
                                        sizeName: itemToAdd.sizeName,
                                        customizations: itemToAdd.customizations,
                                    };
                                    optimisticItems = [...currentItems, newItem];
                                }
                                set({ items: optimisticItems });
                                console.log("[CartStore] Used optimistic update as fallback");
                            }
                        } else {
                            // Parsing failed completely - log and fetch cart
                            console.error("[CartStore] Failed to parse cart response:", cart);
                            console.log("[CartStore] Response structure:", JSON.stringify(cart, null, 2));

                            // Try to fetch cart from backend as fallback
                            try {
                                const fetchedCart = await cartApi.getCart(userId);
                                const fetchedItems = mapCartToItems(fetchedCart);
                                if (fetchedItems !== null) {
                                    const state = get();
                                    const merged = mergeWithPendingAdds(fetchedItems, state.items, state.pendingAdds);

                                    const nextPendingAdds: Record<string, number> = { ...state.pendingAdds };
                                    for (const it of fetchedItems) {
                                        delete nextPendingAdds[getItemKey(it.id, it.restaurantId)];
                                    }

                                    set({ items: merged, pendingAdds: nextPendingAdds });
                                    console.log(
                                        `[CartStore] Cart fetched after parse failure, items count: ${fetchedItems.length}`
                                    );
                                } else {
                                    // Still can't parse, use optimistic update
                                    throw new Error("Failed to parse fetched cart");
                                }
                            } catch (fetchError) {
                                console.error("[CartStore] Failed to fetch cart after parse failure:", fetchError);
                                // Last resort: optimistic update
                                const currentItems = get().items;
                                const existingItemIndex = currentItems.findIndex(
                                    (item) => item.id === cartItemId && item.restaurantId === itemToAdd.restaurantId
                                );

                                let optimisticItems: CartItem[];
                                if (existingItemIndex >= 0) {
                                    const existingItem = currentItems[existingItemIndex];
                                    optimisticItems = [...currentItems];
                                    optimisticItems[existingItemIndex] = {
                                        ...existingItem,
                                        quantity: existingItem.quantity + quantity,
                                    };
                                } else {
                                    const newItem: CartItem = {
                                        id: cartItemId,
                                        baseProductId: itemToAdd.id,
                                        name: itemToAdd.name,
                                        price: itemToAdd.price,
                                        image: finalImageURL,
                                        quantity,
                                        restaurantId: itemToAdd.restaurantId,
                                        restaurantName: itemToAdd.restaurantName,
                                        categoryId: itemToAdd.categoryId,
                                        categoryName: itemToAdd.categoryName,
                                        sizeId: itemToAdd.sizeId,
                                        sizeName: itemToAdd.sizeName,
                                        customizations: itemToAdd.customizations,
                                    };
                                    optimisticItems = [...currentItems, newItem];
                                }
                                set({ items: optimisticItems });
                                console.log("[CartStore] Used optimistic update as last resort");
                            }
                        }

                        toast.success("Added to cart.");
                    } catch (error) {
                        console.error("Failed to add item:", error);
                        toast.error("Failed to add item to cart");
                        // Revert optimistic update on error - restore previous state
                        set((state) => {
                            const nextPendingAdds = { ...state.pendingAdds };
                            if (pendingKey) {
                                delete nextPendingAdds[pendingKey];
                            }
                            return { items: previousItems, pendingAdds: nextPendingAdds };
                        });
                        console.log("[CartStore] Reverted optimistic update due to error");
                    } finally {
                        set({ isAddingItem: false });
                    }
                },

                removeItem: async (itemId, restaurantId, options) => {
                    const { userId } = get();
                    if (!userId) return;

                    try {
                        const cart = await cartApi.removeItemFromCart(userId, restaurantId, itemId);

                        // Check if cart is null (empty cart after deletion)
                        // Backend returns null when cart is deleted (last item removed)
                        const cartData = (cart as { data?: unknown })?.data ?? cart;
                        if (cartData === null || cartData === undefined) {
                            // Cart is empty, clear items immediately
                            set({ items: [] });
                            console.log("[CartStore] Cart is empty after removing item");
                        } else {
                            // Parse response and update items immediately
                            const parsedItems = mapCartToItems(cart);
                            if (parsedItems !== null) {
                                // Update items from response
                                set({ items: parsedItems });
                                console.log(`[CartStore] Removed item, cart now has ${parsedItems.length} items`);
                            } else {
                                // If parsing fails, check if it's an empty cart response
                                // Backend might return { data: null } or empty structure
                                const responseData = (cart as { data?: unknown })?.data;
                                if (responseData === null || responseData === undefined) {
                                    set({ items: [] });
                                    console.log("[CartStore] Cart is empty (parsed from response)");
                                } else {
                                    // Try fetchCart as fallback only if we're not sure about empty cart
                                    console.warn("[CartStore] Failed to parse removeItem response, fetching cart...");
                                    await get().fetchCart();
                                }
                            }
                        }

                        if (!options?.silent) {
                            toast.success("Item removed from cart");
                        }
                    } catch (error) {
                        console.error("Failed to remove item:", error);
                        // On error, still try to update local state by removing item manually
                        const currentItems = get().items;
                        const updatedItems = currentItems.filter(
                            (item) => !(item.id === itemId && item.restaurantId === restaurantId)
                        );
                        set({ items: updatedItems });

                        if (!options?.silent) {
                            toast.error("Failed to remove item");
                        }
                    }
                },

                updateQuantity: async (itemId, restaurantId, quantity) => {
                    const { userId } = get();
                    if (!userId) return;

                    try {
                        if (quantity <= 0) {
                            await get().removeItem(itemId, restaurantId, { silent: true });
                        } else {
                            const cart = await cartApi.updateItemQuantity(userId, restaurantId, itemId, quantity);
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

                        // clearCart returns { message: 'Cart cleared successfully' } or similar
                        // It doesn't return cart data, so we should always clear items
                        // But check if there's any cart data first
                        const cartData = (cart as { data?: unknown })?.data ?? cart;
                        if (
                            cartData === null ||
                            cartData === undefined ||
                            (typeof cartData === "object" && "message" in cartData && !("restaurants" in cartData)) ||
                            !updateItemsFromResponse(cart)
                        ) {
                            // Cart is cleared, set items to empty array
                            set({ items: [] });
                            console.log("[CartStore] Cart cleared");
                        }

                        if (!options?.silent) {
                            toast.success("Cart cleared");
                        }
                    } catch (error) {
                        console.error("Failed to clear cart:", error);
                        // On error, still clear local state
                        set({ items: [] });

                        if (!options?.silent) {
                            toast.error("Failed to clear cart");
                        }
                    }
                },

                clearRestaurant: async (restaurantId, options) => {
                    const { userId } = get();
                    if (!userId) return;

                    try {
                        const cart = await cartApi.clearRestaurant(userId, restaurantId);

                        // Check if cart is null (empty cart after deletion)
                        // Backend returns null when cart is deleted (last restaurant removed)
                        const cartData = (cart as { data?: unknown })?.data ?? cart;
                        if (cartData === null || cartData === undefined) {
                            // Cart is empty, clear items immediately
                            set({ items: [] });
                            console.log("[CartStore] Cart is empty after clearing restaurant");
                        } else {
                            // Try to update items from response
                            if (!updateItemsFromResponse(cart)) {
                                // If parsing fails, check if it's an empty cart response
                                const responseData = (cart as { data?: unknown })?.data;
                                if (responseData === null || responseData === undefined) {
                                    set({ items: [] });
                                    console.log("[CartStore] Cart is empty (parsed from response)");
                                } else {
                                    // Try fetchCart as fallback only if we're not sure about empty cart
                                    await get().fetchCart();
                                }
                            }
                        }

                        if (!options?.silent) {
                            toast.success("Restaurant items removed");
                        }
                    } catch (error) {
                        console.error("Failed to clear restaurant:", error);
                        // On error, still try to update local state by removing restaurant items manually
                        const currentItems = get().items;
                        const updatedItems = currentItems.filter((item) => item.restaurantId !== restaurantId);
                        set({ items: updatedItems });

                        if (!options?.silent) {
                            toast.error("Failed to remove restaurant items");
                        }
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
