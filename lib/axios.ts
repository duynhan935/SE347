import { useAuthStore } from "@/stores/useAuthStore";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authApi } from "./api/authApi";
import { API_URL } from "./config/publicRuntime";

// Create Axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    // Required so the browser sends/receives refresh-token cookies from the API gateway.
    withCredentials: true,
    // Do not auto-follow redirects (prevents redirects to Docker hostnames)
    maxRedirects: 0,
    // Throw for 4xx/5xx so auth refresh + callers can handle properly.
    // Keep redirects (3xx) as non-throw since maxRedirects=0 is used to prevent following Docker hostname redirects.
    validateStatus: (status) => status < 400,
});

const normalizeToken = (value: string | null): string | null => {
    if (!value) return null;
    const v = value.trim();
    if (!v || v === "null" || v === "undefined") return null;
    return v;
};

let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = []; // Queue for failed requests during refresh
let isRefreshing = false; // Flag to prevent multiple refresh attempts

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request Interceptor: Add Authorization header
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from Zustand store
        const accessTokenFromStore = normalizeToken(useAuthStore.getState().accessToken);
        const accessTokenFromStorage =
            typeof window !== "undefined" ? normalizeToken(localStorage.getItem("accessToken")) : null;
        const accessToken = accessTokenFromStore || accessTokenFromStorage;
        if (accessToken && config.headers) {
            // Only add if the request isn't for refreshing the token itself
            if (!config.url?.includes("/users/refreshtoken")) {
                config.headers["Authorization"] = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Global response interceptor with automatic token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        const status = error.response?.status;

        // Handle 401 Unauthorized - token expired
        // Skip token refresh for refresh token endpoint itself to avoid infinite loop
        if (status === 401 && !originalRequest._retry) {
            // Guest mode: if we didn't send a token, don't attempt refresh.
            // This prevents noisy 400s from /users/refreshtoken when the user is not logged in.
            const accessTokenFromStore = normalizeToken(useAuthStore.getState().accessToken);
            const accessTokenFromStorage =
                typeof window !== "undefined" ? normalizeToken(localStorage.getItem("accessToken")) : null;
            const hasAccessToken = !!(accessTokenFromStore || accessTokenFromStorage);
            if (!hasAccessToken) {
                return Promise.reject(error);
            }

            // If the 401 comes from the "who am I" endpoint, treat it as "invalid/expired session"
            // and DON'T try to refresh. Just logout and treat as guest.
            if (originalRequest.url?.includes("/users/accesstoken")) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            // If this is the refresh token endpoint itself, just logout
            if (originalRequest.url?.includes("/users/refreshtoken")) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // Refresh token is stored as an HttpOnly cookie by the backend.
            // We do not rely on localStorage refresh tokens (can be missing/invalid).

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        const accessToken = useAuthStore.getState().accessToken;
                        if (originalRequest.headers) {
                            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                        }
                        // Ensure baseURL is correct (prevent redirects to Docker hostnames)
                        originalRequest.baseURL = API_URL;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;

            try {
                // Try to refresh the token
                const newAccessToken = await authApi.refreshAccessToken();

                // Update the store with new access token
                useAuthStore.getState().setTokens(newAccessToken, null);

                // Process queued requests
                processQueue(null, newAccessToken);

                // Refresh finished successfully
                isRefreshing = false;

                // Retry original request with new token
                // Ensure we use the correct baseURL and don't follow redirects to wrong URLs
                if (originalRequest.headers) {
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                }
                // Ensure baseURL is correct (prevent redirects to Docker hostnames)
                originalRequest.baseURL = API_URL;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails (401 or other error), logout and reject
                isRefreshing = false;
                processQueue(refreshError as AxiosError, null);
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }

        const data = error.response?.data;
        const errorCode = data && typeof data === "object" && "errorCode" in data ? data.errorCode : null;

        // Skip logging for INACTIVATED_ACCOUNT (403) - it's handled by login page
        if (status === 403 && errorCode === "INACTIVATED_ACCOUNT") {
            // Just reject without logging - login page will handle it
            return Promise.reject(error);
        }

        // Skip logging for 404 on chat rooms endpoint - user may not have rooms yet (normal case)
        // Backend returns 404 instead of empty array when user has no rooms
        if (
            status === 404 &&
            error.config?.url?.includes("/chat/rooms/") &&
            !error.config?.url?.includes("/messages") &&
            !error.config?.url?.includes("/unreadCount")
        ) {
            // Just reject without logging - chat page will handle it gracefully
            return Promise.reject(error);
        }

        // Skip logging for merchant dashboard "no restaurant yet" state.
        // Backend returns 404 when the merchant has not created a restaurant.
        if (
            status === 404 &&
            error.config?.url?.includes("/dashboard/merchant/") &&
            error.config?.url?.includes("/restaurant")
        ) {
            return Promise.reject(error);
        }

        // Skip logging for timeout errors on certain endpoints - handled gracefully in stores
        if (error.code === "ECONNABORTED") {
            const url = error.config?.url || "";
            // Skip logging for endpoints that handle timeout gracefully
            if (url.includes("/users/accesstoken") || url.includes("/cart/")) {
                // Just reject without logging - stores will handle it gracefully
                return Promise.reject(error);
            }
        }

        // Keep error logging concise and production-safe.
        console.error("API request failed", {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            status: status ?? "Unknown",
            errorCode: errorCode ?? undefined,
            message:
                data && typeof data === "object" && "message" in data
                    ? (data as { message?: unknown }).message
                    : error.message,
        });

        // Optional: status-specific logging
        switch (status) {
            case 400:
                console.error("Bad Request – Check the request payload");
                break;
            case 403:
                console.error("Forbidden – Insufficient permissions");
                break;
            case 404:
                console.error("Not Found – Resource does not exist");
                break;
            case 500:
                console.error("Internal Server Error – Server-side failure");
                break;
            default:
                console.error("Unknown Error –", error.message);
        }

        return Promise.reject(error);
    },
);

export default api;
