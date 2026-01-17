"use client";

import { authApi } from "@/lib/api/authApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";

interface LocationCoordinates {
    latitude: number;
    longitude: number;
}

interface UseLocationResult {
    coordinates: LocationCoordinates | null;
    loading: boolean;
    error: string | null;
}

// Default location: Ho Chi Minh City
const DEFAULT_LOCATION: LocationCoordinates = {
    latitude: 10.7626,
    longitude: 106.6825,
};

/**
 * Hook to get user location with fallback strategy:
 * 1. Try to get from browser geolocation API
 * 2. If failed, get from user's saved addresses (first address)
 * 3. If no addresses, use default location (HCM)
 */
export function useLocationWithFallback(): UseLocationResult {
    const { user, isAuthenticated } = useAuthStore();
    const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const getLocation = async () => {
            setLoading(true);
            setError(null);

            // Strategy 1: Try browser geolocation API
            if ("geolocation" in navigator) {
                try {
                    const geolocationPromise = new Promise<LocationCoordinates>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                resolve({
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude,
                                });
                            },
                            (err) => {
                                reject(err);
                            },
                            {
                                enableHighAccuracy: true,
                                timeout: 10000,
                                maximumAge: 300000, // Cache for 5 minutes
                            }
                        );
                    });

                    const coords = await geolocationPromise;
                    if (isMounted) {
                        setCoordinates(coords);
                        setLoading(false);
                        return;
                    }
                } catch (geoError) {
                    // Geolocation failed, continue to next strategy
                    console.log("Geolocation not available or denied, trying user address...");
                }
            }

            // Strategy 2: Try to get from user's saved addresses
            if (isAuthenticated && user?.id) {
                try {
                    const addresses = await authApi.getUserAddresses(user.id);
                    if (Array.isArray(addresses) && addresses.length > 0) {
                        const firstAddress = addresses[0];
                        if (firstAddress.latitude && firstAddress.longitude) {
                            if (isMounted) {
                                setCoordinates({
                                    latitude: firstAddress.latitude,
                                    longitude: firstAddress.longitude,
                                });
                                setLoading(false);
                                return;
                            }
                        }
                    }
                } catch (addressError) {
                    console.log("Failed to fetch user addresses, using default location...");
                }
            }

            // Strategy 3: Use default location (Ho Chi Minh City)
            if (isMounted) {
                setCoordinates(DEFAULT_LOCATION);
                setLoading(false);
            }
        };

        getLocation();

        return () => {
            isMounted = false;
        };
    }, [user?.id, isAuthenticated]);

    return { coordinates, loading, error };
}

