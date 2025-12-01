"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/cartStore";

/**
 * Hook to sync cart with user authentication state
 * Automatically fetches cart when user logs in
 */
export function useCartSync() {
    const { user, isAuthenticated } = useAuthStore();
    const { setUserId, fetchCart } = useCartStore();

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            // Set userId in cart store
            setUserId(user.id);
            // Fetch cart from backend
            fetchCart();
        } else {
            // Clear cart when user logs out
            setUserId(null);
        }
    }, [isAuthenticated, user?.id, setUserId, fetchCart]);
}
