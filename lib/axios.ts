import { useAuthStore } from "@/stores/useAuthStore";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authApi } from "./api/authApi";

const DEFAULT_API_BASE_URL = "http://localhost:8080/api";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

// Create Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    // Do not auto-follow redirects (prevents redirects to Docker hostnames)
    maxRedirects: 0,
    // Throw for 4xx/5xx so auth refresh + callers can handle properly.
    // Keep redirects (3xx) as non-throw since maxRedirects=0 is used to prevent following Docker hostname redirects.
    validateStatus: (status) => status < 400,
});

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
        const accessTokenFromStore = useAuthStore.getState().accessToken;
        const accessTokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
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
    }
);

// // Optional: global 401 handler
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             console.log("Token is expired or invalid");
//             // You can logout the user or redirect to login
//         }
//         return Promise.reject(error);
//     }
// );

// Global response interceptor with automatic token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - token expired
        // Skip token refresh for refresh token endpoint itself to avoid infinite loop
        if (error.response?.status === 401 && !originalRequest._retry) {
            // If this is the refresh token endpoint itself, just logout
            if (originalRequest.url?.includes("/users/refreshtoken")) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            const refreshToken = useAuthStore.getState().refreshToken;

            // If there's no refresh token, logout
            if (!refreshToken) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

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
                        originalRequest.baseURL = API_BASE_URL;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;

            try {
                // Try to refresh the token
                const newAccessToken = await authApi.refreshAccessToken(refreshToken);

                // Update the store with new access token
                useAuthStore.getState().setTokens(newAccessToken, refreshToken);

                // Process queued requests
                processQueue(null, newAccessToken);

                // Retry original request with new token
                // Ensure we use the correct baseURL and don't follow redirects to wrong URLs
                if (originalRequest.headers) {
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                }
                // Ensure baseURL is correct (prevent redirects to Docker hostnames)
                originalRequest.baseURL = API_BASE_URL;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails (401 or other error), logout and reject
                isRefreshing = false;
                processQueue(refreshError as AxiosError, null);
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }

        const status = error.response?.status;
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

        // Skip logging for timeout errors on certain endpoints - handled gracefully in stores
        if (error.code === "ECONNABORTED") {
            const url = error.config?.url || "";
            // Skip logging for endpoints that handle timeout gracefully
            if (url.includes("/users/accesstoken") || url.includes("/cart/")) {
                // Just reject without logging - stores will handle it gracefully
                return Promise.reject(error);
            }
        }

        console.group("%c⚠️ API Error", "color:red; font-weight:bold;");
        console.log("➡️ URL:", error.config?.url);
        console.log("➡️ Method:", error.config?.method?.toUpperCase());
        console.log("➡️ Status:", status ?? "Unknown");

        // If the backend returns an errorCode/message
        if (data && typeof data === "object" && ("errorCode" in data || "message" in data)) {
            console.log("➡️ Error Code:", "errorCode" in data ? data.errorCode : "N/A");
            console.log("➡️ Message:", "message" in data ? data.message : "N/A");
        } else {
            console.log("➡️ Raw Error:", error.message);
        }

        console.groupEnd();

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
    }
);

export default api;
