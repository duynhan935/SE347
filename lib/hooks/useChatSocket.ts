"use client";

import { authApi } from "@/lib/api/authApi";
import { MessageDTO } from "@/types";
import { Client, IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseChatSocketOptions {
        userId: string | null;
        isAuthenticated: boolean;
}

interface Subscription {
        roomId: string;
        unsubscribe: () => void;
}

/**
 * Global WebSocket connection hook
 * - Connect when user logs in
 * - Disconnect when user logs out
 * - Manage room subscriptions separately
 */
export function useChatSocket({ userId, isAuthenticated }: UseChatSocketOptions) {
        const [isConnected, setIsConnected] = useState(false);
        const clientRef = useRef<Client | null>(null);
        const subscriptionsRef = useRef<Map<string, Subscription>>(new Map());
        const isConnectingRef = useRef<boolean>(false);
        const messageHandlersRef = useRef<Map<string, (message: MessageDTO) => void>>(new Map());
        const heartbeatMonitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
        const heartbeatServerIntervalRef = useRef<NodeJS.Timeout | null>(null);
        const heartbeatClientIntervalRef = useRef<NodeJS.Timeout | null>(null);
        const lastHeartbeatLogRef = useRef<number>(0);

        // Connect WebSocket when user is authenticated
        const connect = useCallback(async () => {
                if (!userId || !isAuthenticated || isConnectingRef.current) {
                        return;
                }

                // Don't reconnect if already connected
                if (clientRef.current?.connected) {
                        setIsConnected(true);
                        return;
                }

                isConnectingRef.current = true;

                try {
                        const oneTimeToken = await authApi.getOneTimeToken();
                        const wsUrl = `ws://localhost:8080/ws?token=${encodeURIComponent(oneTimeToken)}`;

                        const client = new Client({
                                webSocketFactory: () => {
                                        return new WebSocket(wsUrl);
                                },
                                reconnectDelay: 5000,
                                // Server sends heartbeat every 20s, expects client response within 30s
                                // Client will automatically send heartbeat every 25s to keep connection alive
                                heartbeatIncoming: 20000, // Expect heartbeat from server every 20s
                                heartbeatOutgoing: 25000, // Send heartbeat to server every 25s (automatic)
                                // Disable automatic reconnect on error (we handle it manually)
                                // But keep it for network issues
                                connectionTimeout: 5000,
                                onConnect: () => {
                                        console.log("✅ WebSocket connected - Heartbeat active (T=0s)");
                                        console.log("💓 Heartbeat config: Server sends every 20s, Client sends every 25s");
                                        setIsConnected(true);
                                        isConnectingRef.current = false;
                                        lastHeartbeatLogRef.current = Date.now();
                                        
                                        // Start heartbeat timing logs (estimated - based on configured intervals)
                                        // Clear existing intervals first
                                        if (heartbeatServerIntervalRef.current) {
                                                clearInterval(heartbeatServerIntervalRef.current);
                                        }
                                        if (heartbeatClientIntervalRef.current) {
                                                clearInterval(heartbeatClientIntervalRef.current);
                                        }
                                        
                                        // Log estimated server heartbeat (every 20s)
                                        heartbeatServerIntervalRef.current = setInterval(() => {
                                                if (clientRef.current?.connected) {
                                                        const elapsed = Math.floor((Date.now() - lastHeartbeatLogRef.current) / 1000);
                                                        console.log(`💓 Server → Client heartbeat (estimated, every 20s) - ${elapsed}s since connect`);
                                                } else {
                                                        if (heartbeatServerIntervalRef.current) {
                                                                clearInterval(heartbeatServerIntervalRef.current);
                                                                heartbeatServerIntervalRef.current = null;
                                                        }
                                                }
                                        }, 20000); // Every 20 seconds
                                        
                                        // Log estimated client heartbeat (every 25s)
                                        heartbeatClientIntervalRef.current = setInterval(() => {
                                                if (clientRef.current?.connected) {
                                                        const elapsed = Math.floor((Date.now() - lastHeartbeatLogRef.current) / 1000);
                                                        console.log(`💓 Client → Server heartbeat (estimated, every 25s) - ${elapsed}s since connect`);
                                                } else {
                                                        if (heartbeatClientIntervalRef.current) {
                                                                clearInterval(heartbeatClientIntervalRef.current);
                                                                heartbeatClientIntervalRef.current = null;
                                                        }
                                                }
                                        }, 25000); // Every 25 seconds

                                        // Re-subscribe to all rooms that were subscribed before
                                        const roomsToResubscribe = Array.from(subscriptionsRef.current.keys());
                                        roomsToResubscribe.forEach((roomId) => {
                                                if (!clientRef.current?.connected) return;

                                                const destination = `/topic/room/${roomId}`;

                                                const handler = messageHandlersRef.current.get(roomId);
                                                if (handler) {
                                                        try {
                                                                const newSub = clientRef.current.subscribe(
                                                                        destination,
                                                                        (message: IMessage) => {
                                                                                try {
                                                                                        const messageData: MessageDTO = JSON.parse(message.body);
                                                                                        handler(messageData);
                                                                                } catch {
                                                                                        // Silent error handling
                                                                                }
                                                                        }
                                                                );
                                                                subscriptionsRef.current.set(roomId, {
                                                                        roomId,
                                                                        unsubscribe: newSub.unsubscribe,
                                                                });
                                                        } catch {
                                                                // Silent error handling
                                                        }
                                                }
                                        });
                                },
                                onStompError: (frame) => {
                                        console.error("❌ STOMP error:", frame);
                                        setIsConnected(false);
                                        isConnectingRef.current = false;
                                },
                                onWebSocketClose: (event) => {
                                        console.log("🔌 WebSocket closed:", event.code, event.reason);
                                        setIsConnected(false);
                                        isConnectingRef.current = false;
                                },
                                onDisconnect: () => {
                                        console.log("🔌 WebSocket disconnected");
                                        setIsConnected(false);
                                        isConnectingRef.current = false;
                                },
                                // Handle heartbeat events (optional - for debugging)
                                beforeConnect: () => {
                                        console.log("🔄 Attempting WebSocket connection...");
                                },
                        });

                        clientRef.current = client;
                        client.activate();
                } catch {
                        setIsConnected(false);
                        isConnectingRef.current = false;
                }
        }, [userId, isAuthenticated]);

        // Disconnect WebSocket when user logs out
        const disconnect = useCallback(() => {
                setIsConnected(false); // Set to false immediately
                isConnectingRef.current = false;
                
                // Clear heartbeat monitor and timing logs
                if (heartbeatMonitorIntervalRef.current) {
                        clearInterval(heartbeatMonitorIntervalRef.current);
                        heartbeatMonitorIntervalRef.current = null;
                }
                if (heartbeatServerIntervalRef.current) {
                        clearInterval(heartbeatServerIntervalRef.current);
                        heartbeatServerIntervalRef.current = null;
                }
                if (heartbeatClientIntervalRef.current) {
                        clearInterval(heartbeatClientIntervalRef.current);
                        heartbeatClientIntervalRef.current = null;
                }
                
                if (clientRef.current) {
                        // Unsubscribe from all rooms first
                        subscriptionsRef.current.forEach((sub) => {
                                try {
                                        sub.unsubscribe();
                                } catch {
                                        // Silent error handling
                                }
                        });
                        subscriptionsRef.current.clear();
                        messageHandlersRef.current.clear();

                        // Disconnect client
                        try {
                                clientRef.current.deactivate();
                        } catch {
                                // Silent error handling
                        }
                        clientRef.current = null;
                }
        }, []);

        // Subscribe to a specific room
        const subscribeRoom = useCallback(
                (roomId: string, onMessageReceived: (message: MessageDTO) => void) => {
                        if (!roomId) {
                                return () => {}; // Return empty unsubscribe function
                        }

                        // If already subscribed, just update handler
                        if (subscriptionsRef.current.has(roomId)) {
                                messageHandlersRef.current.set(roomId, onMessageReceived);
                                return subscriptionsRef.current.get(roomId)!.unsubscribe;
                        }

                        // If not connected yet, store handler and subscribe when connected
                        messageHandlersRef.current.set(roomId, onMessageReceived);

                        if (!clientRef.current?.connected) {
                                return () => {
                                        subscriptionsRef.current.delete(roomId);
                                        messageHandlersRef.current.delete(roomId);
                                };
                        }

                        const destination = `/topic/room/${roomId}`;

                        try {
                                const subscription = clientRef.current.subscribe(destination, (message: IMessage) => {
                                        try {
                                                const messageData: MessageDTO = JSON.parse(message.body);
                                                console.log("📬 Received message:", messageData.content);
                                                
                                                // Call the stored handler for this room
                                                const storedHandler = messageHandlersRef.current.get(roomId);
                                                if (storedHandler) {
                                                        storedHandler(messageData);
                                                } else {
                                                        // Fallback: call the passed handler if stored handler not found
                                                        onMessageReceived(messageData);
                                                }
                                        } catch {
                                                // Silent error handling
                                        }
                                });

                                subscriptionsRef.current.set(roomId, {
                                        roomId,
                                        unsubscribe: subscription.unsubscribe,
                                });

                                return subscription.unsubscribe;
                        } catch {
                                return () => {};
                        }
                },
                []
        );

        // Unsubscribe from a specific room
        const unsubscribeRoom = useCallback((roomId: string) => {
                const subscription = subscriptionsRef.current.get(roomId);
                if (subscription) {
                        try {
                                subscription.unsubscribe();
                                subscriptionsRef.current.delete(roomId);
                                messageHandlersRef.current.delete(roomId);
                        } catch {
                                // Silent error handling
                        }
                }
        }, []);

        // Send message to a room
        const sendMessage = useCallback(
                (roomId: string, content: string, receiverId: string) => {
                        if (!clientRef.current?.connected || !userId) {
                                return;
                        }

                        const message: MessageDTO = {
                                roomId,
                                senderId: userId,
                                receiverId,
                                content,
                        };

                        try {
                                clientRef.current.publish({
                                        destination: "/app/chat.sendMessage",
                                        body: JSON.stringify(message),
                                });
                                console.log("📤 Sent message:", content);
                        } catch {
                                // Silent error handling
                        }
                },
                [userId]
        );

        // Monitor heartbeat status - log every 30s to confirm connection is alive
        useEffect(() => {
                if (!isConnected || !clientRef.current?.connected) {
                        if (heartbeatMonitorIntervalRef.current) {
                                clearInterval(heartbeatMonitorIntervalRef.current);
                                heartbeatMonitorIntervalRef.current = null;
                        }
                        return;
                }

                // Start heartbeat monitor interval (log every 30s to confirm connection is alive)
                heartbeatMonitorIntervalRef.current = setInterval(() => {
                        if (clientRef.current?.connected) {
                                const now = Date.now();
                                const elapsed = Math.floor((now - lastHeartbeatLogRef.current) / 1000);
                                console.log(`💓 Heartbeat monitor: Connection still active ✅ (${elapsed}s since connect)`);
                        } else {
                                console.log("💓 Heartbeat monitor: Connection lost ❌");
                                if (heartbeatMonitorIntervalRef.current) {
                                        clearInterval(heartbeatMonitorIntervalRef.current);
                                        heartbeatMonitorIntervalRef.current = null;
                                }
                        }
                }, 30000); // Log every 30 seconds to monitor connection health

                return () => {
                        if (heartbeatMonitorIntervalRef.current) {
                                clearInterval(heartbeatMonitorIntervalRef.current);
                                heartbeatMonitorIntervalRef.current = null;
                        }
                };
        }, [isConnected]);

        // Connect when user is authenticated, disconnect when logged out
        useEffect(() => {
                if (isAuthenticated && userId) {
                        connect();
                } else {
                        // Immediately set to false if not authenticated
                        setIsConnected(false);
                        disconnect();
                }

                return () => {
                        // Cleanup on unmount - only disconnect if not authenticated
                        if (!isAuthenticated) {
                                setIsConnected(false);
                                disconnect();
                        }
                };
                // Only depend on isAuthenticated and userId, not on connect/disconnect functions
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isAuthenticated, userId]);

        return {
                isConnected,
                subscribeRoom,
                unsubscribeRoom,
                sendMessage,
                connect,
                disconnect,
        };
}

