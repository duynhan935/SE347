"use client";

import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

interface OrderNotification {
        type: string;
        data: {
                orderId: string;
                totalAmount?: number;
                itemCount?: number;
                customerNote?: string;
                createdAt?: string;
                status?: string;
                restaurantName?: string;
                reason?: string;
        };
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

        useEffect(() => {
                // Connect to order service socket (port 8082 from backend)
                const socket = io("http://localhost:8082", {
                        transports: ["websocket", "polling"],
                        reconnection: true,
                        reconnectionDelay: 1000,
                        reconnectionAttempts: 5,
                });

                socketRef.current = socket;

                socket.on("connect", () => {
                        console.log("[Order Socket] Connected");
                        setIsConnected(true);

                        // Join restaurant room if merchant
                        if (restaurantId) {
                                socket.emit("join-restaurant", restaurantId);
                                console.log(`[Order Socket] Joined restaurant room: ${restaurantId}`);
                        }
                });

                socket.on("disconnect", () => {
                        console.log("[Order Socket] Disconnected");
                        setIsConnected(false);
                });

                socket.on("connect_error", (error) => {
                        console.error("[Order Socket] Connection error:", error);
                        setIsConnected(false);
                });

                // Listen for new orders (merchant)
                socket.on("new-order", (notification: OrderNotification) => {
                        console.log("[Order Socket] New order received:", notification);
                        onNewOrder?.(notification);
                });

                // Listen for order status updates (user)
                socket.on("order-status-updated", (notification: OrderNotification) => {
                        console.log("[Order Socket] Order status updated:", notification);
                        onOrderStatusUpdate?.(notification);
                });

                return () => {
                        socket.disconnect();
                        socketRef.current = null;
                };
        }, [restaurantId, userId, onNewOrder, onOrderStatusUpdate]);

        return {
                isConnected,
                socket: socketRef.current,
        };
}
