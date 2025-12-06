"use client";

import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";

/**
 * Hook to sync cart with user authentication state
 * Automatically fetches cart when user logs in
 */
export function useCartSync() {
        const { user, isAuthenticated } = useAuthStore();
        const { setUserId, fetchCart } = useCartStore();

        useEffect(() => {
                if (isAuthenticated && user?.id) {
                        // Set userId in cart store (this will automatically fetch cart)
                        setUserId(user.id);
                        // Note: fetchCart is called automatically by setUserId, no need to call it again
                } else {
                        // Clear cart when user logs out
                        setUserId(null);
                }
        }, [isAuthenticated, user?.id, setUserId]);
}
