"use client";

import { restaurantApi } from "@/lib/api/restaurantApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import type { RestaurantData } from "@/types";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export function useMerchantRestaurant() {
    const { user } = useAuthStore();
    const { restaurants, getRestaurantByMerchantId } = useRestaurantStore();

    const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(false);
    const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false);

    const currentRestaurant = useMemo(() => restaurants[0] || null, [restaurants]);

    useEffect(() => {
        if (!user?.id || user.role !== "MERCHANT" || isLoadingRestaurant || isCreatingRestaurant) return;

        setIsLoadingRestaurant(true);

        const loadOrCreateRestaurant = async () => {
            try {
                const response = await restaurantApi.getRestaurantByMerchantId(user.id);
                const restaurantList = response.data || [];

                if (restaurantList.length === 0) {
                    setIsCreatingRestaurant(true);

                    const defaultRestaurantData: RestaurantData = {
                        resName: user.username || "My Restaurant",
                        address: "Not updated",
                        longitude: 106.809883,
                        latitude: 10.841228,
                        openingTime: "09:00:00",
                        closingTime: "22:00:00",
                        phone: user.phone || "",
                        merchantId: user.id,
                    };

                    await restaurantApi.createRestaurant(defaultRestaurantData);
                    toast.success("Restaurant created automatically");

                    await getRestaurantByMerchantId(user.id);
                    setIsCreatingRestaurant(false);
                } else {
                    await getRestaurantByMerchantId(user.id);
                }
            } catch (error) {
                console.error("Failed to load/create restaurant:", error);
                toast.error("Unable to load restaurant info");
                setIsCreatingRestaurant(false);
            } finally {
                setIsLoadingRestaurant(false);
            }
        };

        loadOrCreateRestaurant();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.role]);

    return {
        currentRestaurant,
        isLoadingRestaurant,
        isCreatingRestaurant,
    };
}
