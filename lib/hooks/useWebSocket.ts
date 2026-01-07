"use client";

import { authApi } from "@/lib/api/authApi";
import { MessageDTO } from "@/types";
import { Client, IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebSocketOptions {
        roomId: string | null;
        userId: string;
        onMessageReceived: (message: MessageDTO) => void;
        onError?: (error: Event) => void; // Reserved for future error handling
}

export function useWebSocket({ roomId, userId, onMessageReceived, onError }: UseWebSocketOptions) {
        const [isConnected, setIsConnected] = useState(false);
        const [messages, setMessages] = useState<MessageDTO[]>([]);
        const clientRef = useRef<Client | null>(null);
        const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
        const isConnectingRef = useRef<boolean>(false);
        const currentRoomIdRef = useRef<string | null>(null);

        const connect = useCallback(async () => {
                if (!roomId) return;

                // Tránh gọi lại nếu đang kết nối hoặc đã kết nối với cùng roomId
                if (isConnectingRef.current || (clientRef.current?.connected && currentRoomIdRef.current === roomId)) {
                        console.log("Already connecting or connected to this room, skipping...");
                        return;
                }

                // Set flag NGAY LẬP TỨC để tránh race condition
                isConnectingRef.current = true;
                currentRoomIdRef.current = roomId;

                // Disconnect existing connection first nếu roomId khác
                if (clientRef.current && currentRoomIdRef.current !== roomId) {
                        console.log("Disconnecting from previous room:", currentRoomIdRef.current);
                        clientRef.current.deactivate();
                        clientRef.current = null;
                }

                try {
                        // Get one-time-token for WebSocket authentication
                        console.log("Getting one-time-token for WebSocket...");
                        const oneTimeToken = await authApi.getOneTimeToken();
                        console.log("One-time-token received");

                        // Dùng native WebSocket thay vì SockJS để tránh /ws/info endpoint
                        // Backend Spring WebSocket hỗ trợ cả SockJS và native WebSocket
                        const wsUrl = `ws://localhost:8080/ws?token=${encodeURIComponent(oneTimeToken)}`;
                        console.log("Connecting to WebSocket:", wsUrl);
                        
                        const client = new Client({
                                // Dùng native WebSocket, không dùng SockJS
                                webSocketFactory: () => {
                                        return new WebSocket(wsUrl);
                                },
                                reconnectDelay: 5000,
                                heartbeatIncoming: 4000,
                                heartbeatOutgoing: 4000,
                                onConnect: () => {
                                        console.log("WebSocket connected");
                                        setIsConnected(true);
                                        isConnectingRef.current = false;

                                        // Subscribe to room messages - use clientRef.current (already set)
                                        if (clientRef.current && clientRef.current.connected) {
                                                const destination = `/topic/room/${roomId}`;
                                                console.log("Subscribing to:", destination);
                                                const subscription = clientRef.current.subscribe(destination, (message: IMessage) => {
                                                        try {
                                                                console.log("✅ Raw STOMP message received:", {
                                                                        destination: message.headers.destination,
                                                                        body: message.body,
                                                                        headers: message.headers,
                                                                });
                                                                const messageData: MessageDTO = JSON.parse(message.body);
                                                                console.log("✅ Parsed message data:", messageData);
                                                                onMessageReceived(messageData);
                                                                setMessages((prev) => [...prev, messageData]);
                                                        } catch (error) {
                                                                console.error("❌ Error parsing message:", error);
                                                        }
                                                });
                                                console.log("✅ Subscription created for:", destination, subscription);
                                                
                                                // Test subscription by logging any incoming messages
                                                console.log("Waiting for messages on:", destination);
                                        }
                                },
                        onStompError: (frame) => {
                                console.error("STOMP error:", frame);
                                setIsConnected(false);
                                isConnectingRef.current = false;
                                onError?.(new Event("STOMP_ERROR"));
                        },
                        onWebSocketClose: () => {
                                console.log("WebSocket closed");
                                setIsConnected(false);
                                isConnectingRef.current = false;
                        },
                        onDisconnect: () => {
                                console.log("WebSocket disconnected");
                                setIsConnected(false);
                                isConnectingRef.current = false;
                        },
                        });

                        // Set clientRef before activating to ensure it's available in onConnect
                        clientRef.current = client;
                        client.activate();
                } catch (error) {
                        console.error("Failed to get one-time-token or connect WebSocket:", error);
                        setIsConnected(false);
                        isConnectingRef.current = false;
                        onError?.(new Event("CONNECTION_ERROR"));
                }
        }, [roomId, onMessageReceived, onError]);

        const disconnect = useCallback(() => {
                if (clientRef.current) {
                        clientRef.current.deactivate();
                        clientRef.current = null;
                }
                if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                        reconnectTimeoutRef.current = null;
                }
                isConnectingRef.current = false;
                currentRoomIdRef.current = null;
                setIsConnected(false);
        }, []);

        const sendMessage = useCallback(
                (content: string, receiverId: string) => {
                        if (!clientRef.current || !clientRef.current.connected || !roomId) {
                                console.error("WebSocket not connected");
                                return;
                        }

                        const message: MessageDTO = {
                                roomId,
                                senderId: userId,
                                receiverId,
                                content,
                        };

                        console.log("Sending message via WebSocket:", {
                                destination: "/app/chat.sendMessage",
                                message,
                        });

                        try {
                                clientRef.current.publish({
                                        destination: "/app/chat.sendMessage",
                                        body: JSON.stringify(message),
                                });
                                console.log("Message sent successfully");
                        } catch (error) {
                                console.error("Error sending message:", error);
                        }
                },
                [roomId, userId]
        );

        useEffect(() => {
                if (!roomId) return;

                // Tạo một flag để track xem effect này đã chạy chưa
                let isMounted = true;

                // Gọi connect trong một timeout nhỏ để tránh React Strict Mode double invoke
                const timeoutId = setTimeout(() => {
                        if (isMounted) {
                                connect();
                        }
                }, 0);

                return () => {
                        isMounted = false;
                        clearTimeout(timeoutId);
                        disconnect();
                };
                // Chỉ phụ thuộc vào roomId, không phụ thuộc vào connect/disconnect để tránh gọi lại nhiều lần
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [roomId]);

        return {
                isConnected,
                sendMessage,
                messages,
                disconnect,
                connect,
        };
}
