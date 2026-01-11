"use client";

import { useNotificationStore } from "@/stores/useNotificationStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// Use API gateway URL (SSE is routed through API gateway)
const DEFAULT_API_BASE_URL = "http://localhost:8080";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
const NOTIFICATION_URL = API_BASE_URL.replace(/\/$/, "");

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
                        console.log("🔔 Connecting to SSE:", sseUrl);
                        
                        const eventSource = new EventSource(sseUrl);

                        eventSource.onopen = () => {
                                console.log("✅ SSE connected");
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
                                                console.log("🔄 Reconnecting SSE...");
                                                connect();
                                        }, 5000);
                                }
                        };

                        // Handle INIT event (connection confirmation)
                        eventSource.addEventListener("INIT", (event) => {
                                console.log("🔔 SSE INIT:", event.data);
                        });

                        // Handle PING event (heartbeat)
                        eventSource.addEventListener("PING", () => {
                                // Silent heartbeat - no need to log
                        });

                        // Handle Order Successfully event (order accepted)
                        eventSource.addEventListener("Order Successfully", (event) => {
                                const message = event.data || "Your order has been accepted";
                                console.log("✅ Order accepted:", message);
                                
                                // Extract restaurant name from message
                                const restaurantName = message.replace("accepted your order", "").trim();
                                
                                addNotification({
                                        type: "ORDER_ACCEPTED",
                                        title: "Đơn hàng được chấp nhận",
                                        message: restaurantName ? `${restaurantName} đã chấp nhận đơn hàng của bạn` : message,
                                        restaurantName,
                                });

                                toast.success(restaurantName ? `${restaurantName} đã chấp nhận đơn hàng` : "Đơn hàng được chấp nhận", {
                                        icon: "✅",
                                        duration: 5000,
                                });
                        });

                        // Handle Order Failed event (order rejected)
                        eventSource.addEventListener("Order Failed", (event) => {
                                const message = event.data || "Your order has been rejected";
                                console.log("❌ Order rejected:", message);
                                
                                // Extract restaurant name from message
                                const restaurantName = message.replace("rejected your order", "").trim();
                                
                                addNotification({
                                        type: "ORDER_REJECTED",
                                        title: "Đơn hàng bị từ chối",
                                        message: restaurantName ? `${restaurantName} đã từ chối đơn hàng của bạn` : message,
                                        restaurantName,
                                });

                                toast.error(restaurantName ? `${restaurantName} đã từ chối đơn hàng` : "Đơn hàng bị từ chối", {
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

