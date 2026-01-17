"use client";

import { Client, IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

// Port 8082 for Order WebSocket
const ORDER_WS_URL = "http://localhost:8082";

interface OrderStatusUpdate {
    orderId: string;
    status: string;
    timestamp: string;
    restaurantId?: string;
    userId?: string;
}

interface UseOrderWebSocketOptions {
    userId?: string;
    restaurantId?: string;
    onOrderStatusUpdate: (update: OrderStatusUpdate) => void;
    onError?: (error: Event) => void;
}

/**
 * Custom hook for Order WebSocket connection (Port 8082)
 * Handles real-time order status updates
 */
export function useOrderWebSocket({ userId, restaurantId, onOrderStatusUpdate, onError }: UseOrderWebSocketOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        // Need either userId or restaurantId to connect
        if (!userId && !restaurantId) {
            console.warn("⚠️ [OrderWebSocket] No userId or restaurantId provided, skipping connection");
            return;
        }

        // Disconnect existing connection first
        if (clientRef.current) {
            clientRef.current.deactivate();
        }

        console.log("🔄 [OrderWebSocket] Connecting to port 8082...");

        // Create SockJS connection to Order WebSocket (port 8082)
        const socket = new SockJS(`${ORDER_WS_URL}/ws-order`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 20000,
            heartbeatOutgoing: 25000,
            debug: (str) => {
                console.log("🔵 [OrderWebSocket Debug]", str);
            },
            onConnect: () => {
                console.log("✅ [OrderWebSocket] Connected to port 8082");
                setIsConnected(true);

                if (clientRef.current && clientRef.current.connected) {
                    // Subscribe to user-specific order updates
                    if (userId) {
                        const userDestination = `/topic/orders/user/${userId}`;
                        console.log(`📡 [OrderWebSocket] Subscribing to ${userDestination}`);
                        clientRef.current.subscribe(userDestination, (message: IMessage) => {
                            try {
                                const update: OrderStatusUpdate = JSON.parse(message.body);
                                console.log("📥 [OrderWebSocket] User order update:", update);
                                onOrderStatusUpdate(update);
                            } catch (error) {
                                console.error("❌ [OrderWebSocket] Error parsing user message:", error);
                            }
                        });
                    }

                    // Subscribe to restaurant-specific order updates
                    if (restaurantId) {
                        const restaurantDestination = `/topic/orders/restaurant/${restaurantId}`;
                        console.log(`📡 [OrderWebSocket] Subscribing to ${restaurantDestination}`);
                        clientRef.current.subscribe(restaurantDestination, (message: IMessage) => {
                            try {
                                const update: OrderStatusUpdate = JSON.parse(message.body);
                                console.log("📥 [OrderWebSocket] Restaurant order update:", update);
                                onOrderStatusUpdate(update);
                            } catch (error) {
                                console.error("❌ [OrderWebSocket] Error parsing restaurant message:", error);
                            }
                        });
                    }
                }
            },
            onStompError: (frame) => {
                console.error("❌ [OrderWebSocket] STOMP error:", frame);
                setIsConnected(false);
                onError?.(new Event("STOMP_ERROR"));
            },
            onWebSocketClose: () => {
                console.log("🔴 [OrderWebSocket] Connection closed");
                setIsConnected(false);
            },
            onDisconnect: () => {
                console.log("🔌 [OrderWebSocket] Disconnected");
                setIsConnected(false);
            },
        });

        clientRef.current = client;
        client.activate();
    }, [userId, restaurantId, onOrderStatusUpdate, onError]);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            console.log("🔌 [OrderWebSocket] Manually disconnecting...");
            clientRef.current.deactivate();
            clientRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        setIsConnected(false);
    }, []);

    // Auto connect/disconnect based on userId/restaurantId
    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        disconnect,
        reconnect: connect,
    };
}
