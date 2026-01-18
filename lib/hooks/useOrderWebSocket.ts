"use client";

import { Client, IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { ORDER_WS_BASE_URL } from "../config/publicRuntime";

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
        // Create SockJS connection to Order WebSocket (port 8082)
        const socket = new SockJS(`${ORDER_WS_BASE_URL}/ws-order`);
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 20000,
            heartbeatOutgoing: 25000,
            onConnect: () => {
                setIsConnected(true);

                if (clientRef.current && clientRef.current.connected) {
                    // Subscribe to user-specific order updates
                    if (userId) {
                        const userDestination = `/topic/orders/user/${userId}`;
                        clientRef.current.subscribe(userDestination, (message: IMessage) => {
                            try {
                                const update: OrderStatusUpdate = JSON.parse(message.body);
                                onOrderStatusUpdate(update);
                            } catch (error) {
                                console.error("❌ [OrderWebSocket] Error parsing user message:", error);
                            }
                        });
                    }

                    // Subscribe to restaurant-specific order updates
                    if (restaurantId) {
                        const restaurantDestination = `/topic/orders/restaurant/${restaurantId}`;
                        clientRef.current.subscribe(restaurantDestination, (message: IMessage) => {
                            try {
                                const update: OrderStatusUpdate = JSON.parse(message.body);
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
                setIsConnected(false);
            },
            onDisconnect: () => {
                setIsConnected(false);
            },
        });

        clientRef.current = client;
        client.activate();
    }, [userId, restaurantId, onOrderStatusUpdate, onError]);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
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
