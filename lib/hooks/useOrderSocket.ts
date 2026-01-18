"use client";

import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { ORDER_SOCKET_URL } from "../config/publicRuntime";

interface OrderNotification {
    type: string;
    // For new-order event
    data?: {
        orderId: string;
        totalAmount?: number;
        itemCount?: number;
        customerNote?: string;
        createdAt?: string;
        status?: string;
        restaurantName?: string;
        reason?: string;
    };
    // For order-status-updated event (fields at root level)
    orderId?: string;
    status?: string;
    previousStatus?: string;
    paymentStatus?: string;
    cancellationReason?: string;
    timestamp: Date;
    sound?: string;
}

interface UseOrderSocketOptions {
    restaurantId?: string | null;
    userId?: string | null;
    onNewOrder?: (notification: OrderNotification) => void;
    onOrderStatusUpdate?: (notification: OrderNotification) => void;
}

export function useOrderSocket({ restaurantId, userId, onNewOrder, onOrderStatusUpdate }: UseOrderSocketOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const onNewOrderRef = useRef<UseOrderSocketOptions["onNewOrder"]>(onNewOrder);
    const onOrderStatusUpdateRef = useRef<UseOrderSocketOptions["onOrderStatusUpdate"]>(onOrderStatusUpdate);

    useEffect(() => {
        onNewOrderRef.current = onNewOrder;
    }, [onNewOrder]);

    useEffect(() => {
        onOrderStatusUpdateRef.current = onOrderStatusUpdate;
    }, [onOrderStatusUpdate]);

    useEffect(() => {
        // Connect to order service socket (port 8082 from backend)
        const socket = io(ORDER_SOCKET_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);

            // Join restaurant room if merchant
            if (restaurantId) {
                socket.emit("join-restaurant", restaurantId);
            }

            // Join user room if user (for receiving order status updates)
            // Backend uses 'join-user-orders' event, not 'join-user'
            if (userId) {
                socket.emit("join-user-orders", userId);
            }
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("connect_error", (error) => {
            console.error("[Order Socket] Connection error:", error);
            setIsConnected(false);
        });

        // Listen for new orders (merchant)
        socket.on("new-order", (notification: OrderNotification) => {
            onNewOrderRef.current?.(notification);
        });

        // Listen for order status updates (user)
        // Backend emits order-status-updated with orderId, status at root level
        socket.on("order-status-updated", (notification: OrderNotification) => {
            // Transform notification to match expected format
            const transformedNotification: OrderNotification = {
                ...notification,
                data: {
                    orderId: notification.orderId || notification.data?.orderId || "",
                    status: notification.status || notification.data?.status,
                },
            };
            onOrderStatusUpdateRef.current?.(transformedNotification);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [restaurantId, userId]);

    return {
        isConnected,
        socket: socketRef.current,
    };
}
