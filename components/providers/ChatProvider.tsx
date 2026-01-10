"use client";

import { authApi } from "@/lib/api/authApi";
import { chatApi } from "@/lib/api/chatApi";
import { useChatSocket } from "@/lib/hooks/useChatSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { ChatRoom, MessageDTO } from "@/types";
import { ReactNode, createContext, useContext, useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface ChatSocketContextType {
        isConnected: boolean;
        subscribeRoom: (roomId: string, onMessageReceived: (message: MessageDTO) => void) => () => void;
        unsubscribeRoom: (roomId: string) => void;
        sendMessage: (roomId: string, content: string, receiverId: string) => void;
        connect: () => Promise<void>;
        disconnect: () => void;
        // Event emitter for real-time message updates
        onMessage?: (message: MessageDTO) => void;
}

const ChatSocketContext = createContext<ChatSocketContextType | null>(null);

export function useChatSocketContext() {
        const context = useContext(ChatSocketContext);
        if (!context) {
                throw new Error("useChatSocketContext must be used within ChatProvider");
        }
        return context;
}

interface ChatProviderProps {
        children: ReactNode;
}

export default function ChatProvider({ children }: ChatProviderProps) {
        const { user, isAuthenticated } = useAuthStore();
        const chatSocket = useChatSocket({
                userId: user?.id || null,
                isAuthenticated,
        });
        const { subscribeRoom, isConnected } = chatSocket;
        const { setRooms, updateRoomLastMessage, incrementUnreadCount, setLastMessage, updateUnreadCount } = useChatStore();
        const subscribedRoomsRef = useRef<Set<string>>(new Set());
        const roomsLoadedRef = useRef(false);
        const reloadingRoomsRef = useRef(false); // Prevent multiple simultaneous reloads
        // Track processed messages to prevent duplicates from WebSocket (shared across all rooms)
        const processedMessagesRef = useRef<Set<string>>(new Set());

        // Load rooms and subscribe to all when user is authenticated and connected
        useEffect(() => {
                if (!user?.id || !isAuthenticated || !isConnected || roomsLoadedRef.current) {
                        return;
                }

                const loadRoomsAndSubscribe = async () => {
                        try {
                                console.log("📥 Loading all rooms for user:", user.id);
                                const response = await chatApi.getAllRoomsByUserId(user.id);
                                const rooms: ChatRoom[] = response.data?.content || [];
                                setRooms(rooms);
                                roomsLoadedRef.current = true;

                                // Fetch unread count for each room from backend
                                await Promise.all(
                                        rooms.map(async (room) => {
                                                try {
                                                        const unreadResponse = await chatApi.getUnreadCountByRoom(room.id, user.id);
                                                        const unreadCount = unreadResponse.data?.data || 0;
                                                        if (unreadCount > 0) {
                                                                updateUnreadCount(room.id, unreadCount);
                                                        }
                                                } catch (error) {
                                                        console.error(`Error fetching unread count for room ${room.id}:`, error);
                                                }
                                        })
                                );

                                // Message handler for all rooms
                                // This handler is called when a message is received from WebSocket for any subscribed room
                                const handleRoomMessage = async (message: MessageDTO) => {
                                        // Create a unique key for this message to prevent duplicates
                                        const messageKey = `${message.roomId}-${message.content}-${message.senderId}-${message.receiverId}-${message.timestamp ? Math.floor(new Date(message.timestamp).getTime() / 1000) : Date.now()}`;
                                        
                                        // Check if this message was already processed (from WebSocket duplicate or previous processing)
                                        if (processedMessagesRef.current.has(messageKey)) {
                                                console.log("⚠️ Duplicate message detected in ChatProvider (already processed), ignoring:", message);
                                                return;
                                        }
                                        
                                        // Mark this message as processed IMMEDIATELY to prevent duplicates
                                        processedMessagesRef.current.add(messageKey);
                                        
                                        // Clean up old processed messages (keep only last 200 keys to prevent memory leak)
                                        if (processedMessagesRef.current.size > 200) {
                                                const keysArray = Array.from(processedMessagesRef.current);
                                                const recentKeys = keysArray.slice(-100); // Keep last 100 keys
                                                processedMessagesRef.current = new Set(recentKeys);
                                        }
                                        
                                        console.log("📨 Message received from room (global subscription):", message.roomId, message);
                                        
                                        // Check if room exists in current rooms list
                                        const currentRooms = useChatStore.getState().rooms;
                                        const roomExists = currentRooms.some((r) => r.id === message.roomId);
                                        
                                        // If room doesn't exist (new room created by another user), reload rooms from backend
                                        // Backend filters rooms with lastMessage IS NOT NULL, so new room will appear after first message
                                        if (!roomExists && !reloadingRoomsRef.current) {
                                                console.log("🆕 New room detected (not in list), reloading rooms from backend:", message.roomId);
                                                reloadingRoomsRef.current = true;
                                                try {
                                                        const response = await chatApi.getAllRoomsByUserId(user.id);
                                                        const updatedRooms: ChatRoom[] = response.data?.content || [];
                                                        setRooms(updatedRooms);
                                                        
                                                        // Subscribe to the new room if not already subscribed
                                                        const newRoom = updatedRooms.find((r) => r.id === message.roomId);
                                                        if (newRoom && !subscribedRoomsRef.current.has(message.roomId)) {
                                                                console.log("📡 Subscribing to new room:", message.roomId);
                                                                subscribedRoomsRef.current.add(message.roomId);
                                                                subscribeRoom(message.roomId, handleRoomMessage);
                                                        }
                                                } catch (error) {
                                                        console.error("Error reloading rooms for new room:", error);
                                                } finally {
                                                        reloadingRoomsRef.current = false;
                                                }
                                        }
                                        
                                        // Update last message in room (if room exists or was just added) - THIS TRIGGERS UI UPDATE
                                        // This will automatically sort rooms by lastMessageTime, so room with latest message moves to top
                                        updateRoomLastMessage(
                                                message.roomId,
                                                message.content,
                                                message.timestamp || new Date().toISOString()
                                        );
                                        
                                        // Store last message
                                        setLastMessage(message.roomId, message);
                                        
                                        // Trigger a custom event so ChatClient can listen and update messages in ChatWindow
                                        // This ensures real-time updates for the selected room without duplicate subscriptions
                                        // This is critical for real-time message updates - messages will appear immediately without refresh
                                        if (typeof window !== "undefined") {
                                                console.log("📤 Dispatching chat-message-received event for room:", message.roomId, "Message:", message);
                                                window.dispatchEvent(
                                                        new CustomEvent("chat-message-received", { detail: message })
                                                );
                                        } else {
                                                console.warn("⚠️ Window is undefined, cannot dispatch chat-message-received event");
                                        }
                                        
                                        // Increment unread count if message is for current user
                                        if (message.receiverId === user.id) {
                                                incrementUnreadCount(message.roomId);
                                                
                                                // Get sender name for notification
                                                const getSenderName = async () => {
                                                        try {
                                                                const sender = await authApi.getUserById(message.senderId);
                                                                return sender.username || message.senderId;
                                                        } catch {
                                                                return message.senderId;
                                                        }
                                                };
                                                
                                                // Show toast notification with sender name
                                                getSenderName().then((senderName) => {
                                                        toast.success(`Tin nhắn mới từ ${senderName}`, {
                                                                duration: 4000,
                                                                icon: "💬",
                                                        });
                                                });
                                        }
                                };

                                // Subscribe to all rooms to receive messages
                                rooms.forEach((room) => {
                                        if (!subscribedRoomsRef.current.has(room.id)) {
                                                console.log("📡 Subscribing to all rooms - room:", room.id);
                                                subscribedRoomsRef.current.add(room.id);
                                                subscribeRoom(room.id, handleRoomMessage);
                                        }
                                });
                        } catch (error) {
                                console.error("Error loading rooms:", error);
                        }
                };

                loadRoomsAndSubscribe();
        }, [user?.id, isAuthenticated, isConnected, subscribeRoom, setRooms, updateRoomLastMessage, incrementUnreadCount, setLastMessage, updateUnreadCount]);

        // Reset when user logs out
        useEffect(() => {
                if (!isAuthenticated) {
                        subscribedRoomsRef.current.clear();
                        roomsLoadedRef.current = false;
                        processedMessagesRef.current.clear(); // Clear processed messages on logout
                }
        }, [isAuthenticated]);

        return <ChatSocketContext.Provider value={chatSocket}>{children}</ChatSocketContext.Provider>;
}

