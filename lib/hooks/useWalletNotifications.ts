"use client";

import { useNotificationStore } from "@/stores/useNotificationStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BACKEND_ORIGIN } from "../config/publicRuntime";

const NOTIFICATION_URL = BACKEND_ORIGIN;

interface UseWalletNotificationsOptions {
    userId: string | null;
    userRole?: string;
    isAuthenticated: boolean;
}

/**
 * Hook to connect to SSE endpoint for wallet/payout notifications
 * Uses same SSE endpoint as orders (/api/sse/subcribe/)
 */
export function useWalletNotifications({ userId, userRole, isAuthenticated }: UseWalletNotificationsOptions) {
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
                console.error("❌ Wallet SSE error:", error);
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

            // Handle INIT event
            eventSource.addEventListener("INIT", (event) => {
                void event;
            });

            // Handle PING event
            eventSource.addEventListener("PING", () => {
                // Silent heartbeat
            });

            // Handle Payout Request event (for admin)
            eventSource.addEventListener("Payout Request", (event) => {
                if (userRole !== "ADMIN") return;

                const message = event.data || "New withdrawal request";

                addNotification({
                    type: "PAYOUT_REQUEST",
                    title: "New Withdrawal Request",
                    message,
                });

                toast.success(message, {
                    icon: "💰",
                    duration: 5000,
                });
            });

            // Handle Payout Approved event (for merchant)
            eventSource.addEventListener("Payout Approved", (event) => {
                const message = event.data || "Your withdrawal has been approved";

                addNotification({
                    type: "PAYOUT_APPROVED",
                    title: "Withdrawal Approved",
                    message,
                });

                toast.success(message, {
                    icon: "✅",
                    duration: 5000,
                });
            });

            // Handle Payout Rejected event (for merchant)
            eventSource.addEventListener("Payout Rejected", (event) => {
                const message = event.data || "Your withdrawal was rejected";

                addNotification({
                    type: "PAYOUT_REJECTED",
                    title: "Withdrawal Rejected",
                    message,
                });

                toast.error(message, {
                    icon: "❌",
                    duration: 5000,
                });
            });

            eventSourceRef.current = eventSource;
        } catch (error) {
            console.error("Failed to create wallet SSE connection:", error);
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
    }, [isAuthenticated, userId, userRole]);

    return {
        isConnected,
        connect,
        disconnect,
    };
}
