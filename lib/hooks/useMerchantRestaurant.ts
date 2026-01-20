"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export function useMerchantRestaurant() {
    const { user } = useAuthStore();
    const { restaurants, getRestaurantByMerchantId } = useRestaurantStore();

    const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(false);

    const currentRestaurant = useMemo(() => restaurants[0] || null, [restaurants]);
    const hasRestaurant = useMemo(() => restaurants.length > 0, [restaurants.length]);

    useEffect(() => {
        if (!user?.id || user.role !== "MERCHANT" || isLoadingRestaurant) return;

        setIsLoadingRestaurant(true);

        const loadRestaurant = async () => {
            try {
                await getRestaurantByMerchantId(user.id);
            } catch (error) {
                console.error("Failed to load/create restaurant:", error);
                toast.error("Unable to load restaurant info");
            } finally {
                setIsLoadingRestaurant(false);
            }
        };

        loadRestaurant();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.role]);

    return {
        currentRestaurant,
        isLoadingRestaurant,
        hasRestaurant,
    };
}
