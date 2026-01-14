"use client";

import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";

/**
 * Hook to sync cart with user authentication state
 * Automatically fetches cart when user logs in
 */
export function useCartSync() {
    const { user, isAuthenticated, accessToken, loading, isLoggingOut } = useAuthStore();
    const { setUserId, fetchCart } = useCartStore();

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            // Keep cart scoped to the logged-in user.
            setUserId(user.id);

            // Ensure cart is hydrated from backend after refresh.
            fetchCart().catch(() => {
                // Cart may not exist yet or service may be unavailable.
            });
            return;
        }

        // IMPORTANT: Do not clear cart while auth is still bootstrapping.
        // On refresh we may have a token but no user profile yet.
        const hasToken = !!accessToken;
        if (isLoggingOut || (!isAuthenticated && !hasToken && !loading)) {
            setUserId(null);
        }
    }, [isAuthenticated, user?.id, accessToken, loading, isLoggingOut, fetchCart, setUserId]);
}
