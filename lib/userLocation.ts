"use client";

import { useEffect, useState } from "react";

interface Coordinates {
    latitude: number;
    longitude: number;
}

interface GeolocationResult {
    coords: Coordinates | null;
    error: string | null;
    loading: boolean;
}

// Fallback to a default coordinate (e.g. Ho Chi Minh City) when user denies or location fails
const FALLBACK_COORDS: Coordinates = {
    latitude: 10.841228,
    longitude: 106.809883,
};

export function useGeolocation(): GeolocationResult {
    const [coords, setCoords] = useState<Coordinates | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            // Browser doesn't support geolocation → use fallback so app still works
            setCoords(FALLBACK_COORDS);
            setError("This browser does not support the Geolocation API. Using default location.");
            setLoading(false);
            return;
        }

        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        };

        navigator.geolocation.getCurrentPosition(
            (pos: GeolocationPosition) => {
                const { latitude, longitude } = pos.coords;
                setCoords({ latitude, longitude });
                setLoading(false);
            },
            (err: GeolocationPositionError) => {
                // On any error (including user deny), fall back to default coords so flows like checkout
                // still have a valid lat/lon instead of breaking.
                setCoords(FALLBACK_COORDS);

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError("Location permission was denied. Using default location.");
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError("Unable to determine your current location. Using default location.");
                        break;
                    case err.TIMEOUT:
                        setError("Location request timed out. Using default location.");
                        break;
                    default:
                        setError("An unknown error occurred while fetching location. Using default location.");
                }
                setLoading(false);
            },
            options,
        );
    }, []);

    return { coords, error, loading };
}
