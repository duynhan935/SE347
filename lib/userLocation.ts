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
                        setError("Trình duyệt không hỗ trợ Geolocation API");
                        setLoading(false);
                        return;
                }

                const options: PositionOptions = {
                        enableHighAccuracy: true, // dùng GPS nếu có thể
                        timeout: 10000, // 10s timeout
                        maximumAge: 0, // không dùng vị trí cũ cache
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
                                                setError("Người dùng từ chối quyền truy cập vị trí.");
                                                break;
                                        case err.POSITION_UNAVAILABLE:
                                                setError("Không thể xác định vị trí hiện tại.");
                                                break;
                                        case err.TIMEOUT:
                                                setError("Lấy vị trí quá thời gian cho phép.");
                                                break;
                                        default:
                                                setError("Lỗi không xác định khi lấy vị trí.");
                                }
                                setLoading(false);
                        },
                        options
                );
        }, []);

        return { coords, error, loading };
}
