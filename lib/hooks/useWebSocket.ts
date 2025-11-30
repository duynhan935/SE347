"use client";

import { MessageDTO } from "@/types";
import { Client, IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

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

        const connect = useCallback(() => {
                if (!roomId) return;

                // Disconnect existing connection first
                if (clientRef.current) {
                        clientRef.current.deactivate();
                }

                // Tạo SockJS connection
                const socket = new SockJS("http://localhost:8080/ws");
                const client = new Client({
                        webSocketFactory: () => socket,
                        reconnectDelay: 5000,
                        heartbeatIncoming: 4000,
                        heartbeatOutgoing: 4000,
                        onConnect: () => {
                                console.log("WebSocket connected");
                                setIsConnected(true);

                                // Subscribe to room messages
                                if (clientRef.current && clientRef.current.connected) {
                                        const destination = `/topic/room/${roomId}`;
                                        clientRef.current.subscribe(destination, (message: IMessage) => {
                                                try {
                                                        const messageData: MessageDTO = JSON.parse(message.body);
                                                        onMessageReceived(messageData);
                                                        setMessages((prev) => [...prev, messageData]);
                                                } catch (error) {
                                                        console.error("Error parsing message:", error);
                                                }
                                        });
                                }
                        },
                        onStompError: (frame) => {
                                console.error("STOMP error:", frame);
                                setIsConnected(false);
                                onError?.(new Event("STOMP_ERROR"));
                        },
                        onWebSocketClose: () => {
                                console.log("WebSocket closed");
                                setIsConnected(false);
                        },
                        onDisconnect: () => {
                                console.log("WebSocket disconnected");
                                setIsConnected(false);
                        },
                });

                clientRef.current = client;
                client.activate();
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

                        clientRef.current.publish({
                                destination: "/app/chat.sendMessage",
                                body: JSON.stringify(message),
                        });
                },
                [roomId, userId]
        );

        useEffect(() => {
                if (roomId) {
                        connect();
                }

                return () => {
                        disconnect();
                };
        }, [roomId, connect, disconnect]);

        return {
                isConnected,
                sendMessage,
                messages,
                disconnect,
                connect,
        };
}
