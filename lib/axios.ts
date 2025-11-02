import { useAuthStore } from "@/stores/useAuthStore";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authApi } from "./api/authApi";

// Tạo instance
const api = axios.create({
        baseURL: "http://localhost:8080/api", // backend của bạn
        timeout: 10000,
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
                const accessToken = useAuthStore.getState().accessToken;
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

// // Interceptor xử lý response lỗi chung (option)
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             console.log("Token hết hạn hoặc không hợp lệ");
//             // Có thể logout user hoặc redirect login
//         }
//         return Promise.reject(error);
//     }
// );

// 🧩 Interceptor xử lý lỗi toàn cục với auto refresh token
api.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

                // Handle 401 Unauthorized - token expired
                if (error.response?.status === 401 && !originalRequest._retry) {
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
                                                        originalRequest.headers[
                                                                "Authorization"
                                                        ] = `Bearer ${accessToken}`;
                                                }
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
                                if (originalRequest.headers) {
                                        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                                }
                                return api(originalRequest);
                        } catch (refreshError) {
                                // If refresh fails, logout and reject
                                processQueue(refreshError as AxiosError, null);
                                useAuthStore.getState().logout();
                                return Promise.reject(refreshError);
                        } finally {
                                isRefreshing = false;
                        }
                }

                const status = error.response?.status;
                const data = error.response?.data;

                console.group("%c⚠️ API Error", "color:red; font-weight:bold;");
                console.log("➡️ URL:", error.config?.url);
                console.log("➡️ Method:", error.config?.method?.toUpperCase());
                console.log("➡️ Status:", status ?? "Unknown");

                // Nếu backend có trả về errorCode/message
                if (data && typeof data === "object" && ("errorCode" in data || "message" in data)) {
                        console.log("➡️ Error Code:", "errorCode" in data ? data.errorCode : "N/A");
                        console.log("➡️ Message:", "message" in data ? data.message : "N/A");
                } else {
                        console.log("➡️ Raw Error:", error.message);
                }

                console.groupEnd();

                // ⚡ Tùy chỉnh thêm theo mã lỗi HTTP
                switch (status) {
                        case 400:
                                console.error("Bad Request – Kiểm tra dữ liệu gửi đi");
                                break;
                        case 404:
                                console.error("Not Found – Không tìm thấy tài nguyên");
                                break;
                        case 500:
                                console.error("Internal Server Error – Lỗi máy chủ");
                                break;
                        default:
                                console.error("Unknown Error –", error.message);
                }

                return Promise.reject(error);
        }
);

export default api;
