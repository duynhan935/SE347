type PublicEnvValue = string | undefined;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getEnv = (value: PublicEnvValue): string | undefined => {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    return undefined;
};

/**
 * Base URL for REST API calls.
 * Expected format: http(s)://host:port/api
 */
export const API_URL = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_API_URL) ||
        getEnv(process.env.NEXT_PUBLIC_API_BASE_URL) ||
        "http://localhost:8080/api",
);

/**
 * Origin for backend/gateway (no trailing slash).
 * Used for SSE and OAuth2 redirect targets.
 *
 * If not explicitly provided, it is derived from API_URL by stripping a trailing "/api".
 */
export const BACKEND_ORIGIN = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_BACKEND_ORIGIN) ||
        getEnv(process.env.NEXT_PUBLIC_API_ORIGIN) ||
        API_URL.replace(/\/+api\/?$/, ""),
);

/**
 * SockJS/STOMP base URL (HTTP origin).
 * Expected format: http(s)://host:port
 */
export const WS_BASE_URL = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_WS_BASE_URL) || BACKEND_ORIGIN || "http://localhost:8080",
);

/**
 * socket.io base URL for order notifications.
 */
export const ORDER_SOCKET_URL = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_ORDER_SOCKET_URL) || "http://localhost:8080",
);

/**
 * SockJS/STOMP base URL for the order WebSocket service.
 */
export const ORDER_WS_BASE_URL = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_ORDER_WS_BASE_URL) ||
        getEnv(process.env.NEXT_PUBLIC_ORDER_SOCKET_URL) ||
        "http://localhost:8082",
);

/**
 * Convert an http(s) base URL to ws(s).
 */
export const toWebSocketOrigin = (httpOrigin: string) => httpOrigin.replace(/^http/i, "ws");
