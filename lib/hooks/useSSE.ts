"use client";

import { useNotificationStore } from "@/stores/useNotificationStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BACKEND_ORIGIN } from "../config/publicRuntime";

// Use API gateway URL (SSE is routed through API gateway)
const NOTIFICATION_URL = BACKEND_ORIGIN;

interface UseSSEOptions {
    userId: string | null;
    isAuthenticated: boolean;
}

/**
 * Hook to connect to SSE endpoint for order notifications
 * - Connects when user is authenticated
 * - Disconnects when user logs out
 * - Handles order accepted/rejected notifications
 */
export function useSSE({ userId, isAuthenticated }: UseSSEOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { addNotification } = useNotificationStore();

    const connect = () => {
        if (!userId || !isAuthenticated) {
            return;
        }

        // Don't reconnect if already connected
        if (eventSourceRef.current?.readyState === EventSource.OPEN) {
            setIsConnected(true);
            return;
        }

        // Close existing connection if any
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        try {
            const sseUrl = `${NOTIFICATION_URL}/api/sse/subcribe/${encodeURIComponent(userId)}`;

            const eventSource = new EventSource(sseUrl);

            eventSource.onopen = () => {
                setIsConnected(true);

                // Clear any pending reconnect
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            eventSource.onerror = (error) => {
                console.error("❌ SSE error:", error);
                setIsConnected(false);

                // Close connection
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;
                }

                // Reconnect after 5 seconds if still authenticated
                if (isAuthenticated && userId) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, 5000);
                }
            };

            // Handle INIT event (connection confirmation)
            eventSource.addEventListener("INIT", (event) => {
                void event;
            });

            // Handle PING event (heartbeat)
            eventSource.addEventListener("PING", () => {
                // Silent heartbeat - no need to log
            });

            // Handle Order Successfully event (order accepted)
            eventSource.addEventListener("Order Successfully", (event) => {
                const message = event.data || "Your order has been accepted";

                // Extract restaurant name from message
                const restaurantName = message.replace("accepted your order", "").trim();

                addNotification({
                    type: "ORDER_ACCEPTED",
                    title: "Order accepted",
                    message: restaurantName ? `${restaurantName} accepted your order.` : message,
                    restaurantName,
                });

                toast.success(restaurantName ? `${restaurantName} accepted your order.` : "Order accepted", {
                    icon: "✅",
                    duration: 5000,
                });
            });

            // Handle Order Failed event (order rejected)
            eventSource.addEventListener("Order Failed", (event) => {
                const message = event.data || "Your order has been rejected";

                // Extract restaurant name from message
                const restaurantName = message.replace("rejected your order", "").trim();

                addNotification({
                    type: "ORDER_REJECTED",
                    title: "Order rejected",
                    message: restaurantName ? `${restaurantName} rejected your order.` : message,
                    restaurantName,
                });

                toast.error(restaurantName ? `${restaurantName} rejected your order.` : "Order rejected", {
                    icon: "❌",
                    duration: 5000,
                });
            });

            eventSourceRef.current = eventSource;
        } catch (error) {
            console.error("Failed to create SSE connection:", error);
            setIsConnected(false);
        }
    };

    const disconnect = () => {
        setIsConnected(false);

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    };

    // Connect when user is authenticated, disconnect when logged out
    useEffect(() => {
        if (isAuthenticated && userId) {
            connect();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, userId]);

    return {
        isConnected,
        connect,
        disconnect,
    };
}
