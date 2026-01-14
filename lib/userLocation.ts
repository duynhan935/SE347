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
export function useGeolocation(): GeolocationResult {
    const [coords, setCoords] = useState<Coordinates | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setError("This browser does not support the Geolocation API.");
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
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError("Location permission was denied.");
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError("Unable to determine your current location.");
                        break;
                    case err.TIMEOUT:
                        setError("Location request timed out.");
                        break;
                    default:
                        setError("An unknown error occurred while fetching location.");
                }
                setLoading(false);
            },
            options
        );
    }, []);

    return { coords, error, loading };
}
