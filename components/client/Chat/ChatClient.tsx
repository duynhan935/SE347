"use client";

import { authApi } from "@/lib/api/authApi";
import { chatApi } from "@/lib/api/chatApi";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { ChatRoom, Message, MessageDTO } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

interface ChatClientProps {
        initialRooms: ChatRoom[];
        currentUserId: string;
        initialRoomId?: string | null; // Optional: to start with a specific room selected
}

export default function ChatClient({ initialRooms, currentUserId, initialRoomId }: ChatClientProps) {
        const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms);
        const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId || null);
        const [messages, setMessages] = useState<Message[]>([]);
        const [isLoadingMessages, setIsLoadingMessages] = useState(false);
        const [partnerId, setPartnerId] = useState<string | null>(null);
        const [partnerName, setPartnerName] = useState<string>("User");

        // Get partner info function
        const getPartnerInfo = useCallback(async (partnerId: string) => {
                try {
                        const user = await authApi.getUserById(partnerId);
                        return { name: user.username || `User ${partnerId.slice(0, 8)}` };
                } catch (error) {
                        console.error("Error fetching partner info:", error);
                        return { name: `User ${partnerId.slice(0, 8)}` };
                }
        }, []);

        // Track if partner info has been initialized
        const partnerInitializedRef = useRef(false);

        // Initialize partner info when initialRoomId is provided (only once)
        useEffect(() => {
                if (initialRoomId && !partnerId && !partnerInitializedRef.current) {
                        const roomIdParts = initialRoomId.split("_");
                        if (roomIdParts.length === 2) {
                                const partner =
                                        roomIdParts[0] === currentUserId
                                                ? roomIdParts[1]
                                                : roomIdParts[0];
                                setPartnerId(partner);
                                partnerInitializedRef.current = true;
                                getPartnerInfo(partner).then((info) => setPartnerName(info.name));
                        }
                }
        }, [initialRoomId, currentUserId, partnerId, getPartnerInfo]);

        // Track if rooms have been reloaded for initialRoomId
        const roomsReloadedRef = useRef(false);

        // Reload rooms if initialRoomId is provided but not in the list (only once)
        useEffect(() => {
                const reloadRoomsIfNeeded = async () => {
                        // Only reload once, and only if initialRoomId exists and room is not in list
                        if (
                                initialRoomId &&
                                !roomsReloadedRef.current &&
                                !rooms.find((r) => r.id === initialRoomId)
                        ) {
                                roomsReloadedRef.current = true;
                                try {
                                        const response = await chatApi.getAllRoomsByUserId(currentUserId);
                                        // Backend returns Page<ChatRoom>, extract content array
                                        const updatedRooms = response.data?.content || [];
                                        setRooms(updatedRooms);

                                        // If the room still doesn't exist, it might be very new
                                        // Extract partner ID from roomId format: userId1_userId2
                                        if (!updatedRooms.find((r) => r.id === initialRoomId)) {
                                                const roomIdParts = initialRoomId.split("_");
                                                if (roomIdParts.length === 2) {
                                                        const partner =
                                                                roomIdParts[0] === currentUserId
                                                                        ? roomIdParts[1]
                                                                        : roomIdParts[0];
                                                        if (partner !== partnerId) {
                                                                setPartnerId(partner);
                                                                const info = await getPartnerInfo(partner);
                                                                setPartnerName(info.name);
                                                        }
                                                }
                                        }
                                } catch (error) {
                                        console.error("Error reloading rooms:", error);
                                        // Try to extract partner ID from roomId as fallback
                                        if (initialRoomId && !partnerId) {
                                                const roomIdParts = initialRoomId.split("_");
                                                if (roomIdParts.length === 2) {
                                                        const partner =
                                                                roomIdParts[0] === currentUserId
                                                                        ? roomIdParts[1]
                                                                        : roomIdParts[0];
                                                        setPartnerId(partner);
                                                        getPartnerInfo(partner).then((info) =>
                                                                setPartnerName(info.name)
                                                        );
                                                }
                                        }
                                }
                        }
                };

                reloadRoomsIfNeeded();
                // Only depend on initialRoomId and currentUserId - not rooms
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [initialRoomId, currentUserId]);

        // WebSocket hook
        const { isConnected, sendMessage } = useWebSocket({
                roomId: selectedRoomId,
                userId: currentUserId,
                onMessageReceived: (message: MessageDTO) => {
                        console.log("✅ Message received from WebSocket:", message);
                        // Convert MessageDTO to Message format
                        const newMessage: Message = {
                                id: `temp-${Date.now()}`,
                                roomId: message.roomId,
                                senderId: message.senderId,
                                receiverId: message.receiverId,
                                content: message.content,
                                timestamp: message.timestamp || new Date().toISOString(),
                                read: false,
                        };
                        setMessages((prev) => {
                                // Check if message already exists (avoid duplicates)
                                // Also check for optimistic messages with same content and sender
                                const messageTime = new Date(newMessage.timestamp).getTime();
                                const existingIndex = prev.findIndex(
                                        (m) =>
                                                // Exact match by id
                                                m.id === newMessage.id ||
                                                // Match optimistic message (temp id) with same content, sender, and similar timestamp
                                                (m.id.startsWith("temp-") &&
                                                        m.senderId === newMessage.senderId &&
                                                        m.content === newMessage.content &&
                                                        Math.abs(new Date(m.timestamp).getTime() - messageTime) < 5000)
                                );
                                
                                if (existingIndex >= 0) {
                                        console.log("Replacing optimistic message with WebSocket message");
                                        // Replace optimistic message with real message from WebSocket
                                        const updated = [...prev];
                                        updated[existingIndex] = newMessage;
                                        return updated;
                                }
                                
                                console.log("Adding new message from WebSocket");
                                // If no match found, add as new message
                                return [...prev, newMessage];
                        });

                        // Update room's last message
                        setRooms((prevRooms) =>
                                prevRooms.map((room) =>
                                        room.id === message.roomId
                                                ? {
                                                          ...room,
                                                          lastMessage: message.content,
                                                          lastMessageTime:
                                                                  message.timestamp || new Date().toISOString(),
                                                  }
                                                : room
                                )
                        );
                },
        });

        // Track last loaded roomId to prevent duplicate loads
        const lastLoadedRoomIdRef = useRef<string | null>(null);

        // Load messages when room is selected
        useEffect(() => {
                const loadMessages = async () => {
                        if (!selectedRoomId) {
                                setMessages([]);
                                lastLoadedRoomIdRef.current = null;
                                return;
                        }

                        // Prevent duplicate loads for the same room
                        if (lastLoadedRoomIdRef.current === selectedRoomId) {
                                return;
                        }

                        lastLoadedRoomIdRef.current = selectedRoomId;
                        setIsLoadingMessages(true);
                        try {
                                const response = await chatApi.getMessagesByRoomId(selectedRoomId, 0);
                                // Backend returns Page<MessageFromBackend>, extract content array
                                const loadedMessages = response.data?.content || [];
                                // Map messages to ensure roomId is always set (extract from room object if needed)
                                const mappedMessages: Message[] = loadedMessages.map((msg) => ({
                                        id: msg.id,
                                        roomId: msg.roomId || msg.room?.id || selectedRoomId,
                                        senderId: msg.senderId,
                                        receiverId: msg.receiverId,
                                        content: msg.content,
                                        timestamp: msg.timestamp,
                                        read: msg.read,
                                }));
                                // Reverse to show oldest first (backend returns newest first)
                                setMessages(mappedMessages.reverse());

                                // Get partner ID - use current rooms state but don't depend on it
                                const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
                                if (selectedRoom) {
                                        const partner =
                                                selectedRoom.user1Id === currentUserId
                                                        ? selectedRoom.user2Id
                                                        : selectedRoom.user1Id;
                                        setPartnerId(partner);

                                        // Get partner name
                                        const info = await getPartnerInfo(partner);
                                        setPartnerName(info.name);
                                } else if (selectedRoomId) {
                                        // Room not in list yet (might be newly created)
                                        // Extract partner ID from roomId format: userId1_userId2
                                        const roomIdParts = selectedRoomId.split("_");
                                        if (roomIdParts.length === 2) {
                                                const partner =
                                                        roomIdParts[0] === currentUserId
                                                                ? roomIdParts[1]
                                                                : roomIdParts[0];
                                                setPartnerId(partner);
                                                const info = await getPartnerInfo(partner);
                                                setPartnerName(info.name);
                                        }
                                }

                                // Mark messages as read (only if there are messages)
                                // Silently fail if no messages exist
                                if (loadedMessages && loadedMessages.length > 0) {
                                        try {
                                                await chatApi.markMessagesAsRead(selectedRoomId, currentUserId);
                                        } catch (readError) {
                                                // Log but don't show error to user - not critical
                                                console.warn("Failed to mark messages as read:", readError);
                                        }
                                }
                        } catch (error) {
                                console.error("Error loading messages:", error);
                                toast.error("Failed to load messages");
                                // Reset ref on error so we can retry
                                lastLoadedRoomIdRef.current = null;
                        } finally {
                                setIsLoadingMessages(false);
                        }
                };

                loadMessages();
                // Only depend on selectedRoomId and currentUserId - not rooms or getPartnerInfo
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [selectedRoomId, currentUserId]);

        // Track last updated partner per room to prevent infinite loops
        const lastUpdatedPartnerRef = useRef<string | null>(null);
        const lastSelectedRoomIdRef = useRef<string | null>(null);

        // Update partner info when rooms change (but don't reload messages)
        useEffect(() => {
                // Reset ref when selectedRoomId changes
                if (selectedRoomId !== lastSelectedRoomIdRef.current) {
                        lastSelectedRoomIdRef.current = selectedRoomId;
                        lastUpdatedPartnerRef.current = null;
                }

                if (selectedRoomId) {
                        const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
                        if (selectedRoom) {
                                const partner =
                                        selectedRoom.user1Id === currentUserId
                                                ? selectedRoom.user2Id
                                                : selectedRoom.user1Id;
                                // Only update if partner changed and we haven't updated for this room yet
                                if (partner !== partnerId && partner !== lastUpdatedPartnerRef.current) {
                                        lastUpdatedPartnerRef.current = partner;
                                        setPartnerId(partner);
                                        getPartnerInfo(partner).then((info) => setPartnerName(info.name));
                                }
                        }
                }
                // Only depend on rooms and selectedRoomId - not partnerId to avoid loops
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [rooms, selectedRoomId, currentUserId, getPartnerInfo]);

        // Reload messages function
        const reloadMessages = useCallback(async () => {
                if (!selectedRoomId) return;

                try {
                        console.log("🔄 Reloading messages for room:", selectedRoomId);
                        const response = await chatApi.getMessagesByRoomId(selectedRoomId, 0);
                        const loadedMessages = response.data?.content || [];
                        console.log("📥 Loaded messages from DB:", loadedMessages.length, loadedMessages);
                        const mappedMessages: Message[] = loadedMessages.map((msg) => ({
                                id: msg.id,
                                roomId: msg.roomId || msg.room?.id || selectedRoomId,
                                senderId: msg.senderId,
                                receiverId: msg.receiverId,
                                content: msg.content,
                                timestamp: msg.timestamp,
                                read: msg.read,
                        }));
                        // Reverse to show oldest first (backend returns newest first)
                        // Keep optimistic messages that haven't been saved yet (temp ids)
                        setMessages((prev) => {
                                const tempMessages = prev.filter((m) => m.id.startsWith("temp-"));
                                const savedMessages = mappedMessages.reverse();
                                console.log("💾 Saved messages:", savedMessages.length, "Temp messages:", tempMessages.length);
                                // Merge: keep temp messages that don't exist in saved messages
                                const merged = [...savedMessages];
                                tempMessages.forEach((tempMsg) => {
                                        const exists = savedMessages.some(
                                                (saved) =>
                                                        saved.senderId === tempMsg.senderId &&
                                                        saved.content === tempMsg.content &&
                                                        Math.abs(
                                                                new Date(saved.timestamp).getTime() -
                                                                        new Date(tempMsg.timestamp).getTime()
                                                        ) < 5000
                                        );
                                        if (!exists) {
                                                console.log("⚠️ Keeping temp message (not saved yet):", tempMsg);
                                                merged.push(tempMsg);
                                        }
                                });
                                console.log("✅ Final merged messages:", merged.length);
                                return merged;
                        });
                } catch (error) {
                        console.error("❌ Error reloading messages:", error);
                }
        }, [selectedRoomId]);

        // Handle send message
        const handleSendMessage = useCallback(
                async (content: string, receiverId: string) => {
                        if (!selectedRoomId || !isConnected) {
                                toast.error("Not connected to chat");
                                return;
                        }

                        // Ensure room exists before sending message and get the correct roomId
                        let actualRoomId = selectedRoomId;
                        try {
                                // Get roomId - this will create room if it doesn't exist
                                // Backend returns roomId in correct format (sorted userIds)
                                const response = await chatApi.getRoomId(currentUserId, receiverId);
                                actualRoomId = response.data.roomId;
                                console.log("✅ Room ID confirmed:", actualRoomId, "Selected:", selectedRoomId);
                                
                                // Update selectedRoomId if it's different (shouldn't happen, but just in case)
                                if (actualRoomId !== selectedRoomId) {
                                        console.warn("⚠️ RoomId mismatch! Using:", actualRoomId);
                                        setSelectedRoomId(actualRoomId);
                                }
                        } catch (error) {
                                console.error("❌ Error ensuring room exists:", error);
                                toast.error("Failed to create chat room. Please try again.");
                                return; // Don't send message if room creation fails
                        }

                        // Optimistic update: Add message to UI immediately
                        const optimisticMessage: Message = {
                                id: `temp-${Date.now()}`,
                                roomId: actualRoomId,
                                senderId: currentUserId,
                                receiverId,
                                content,
                                timestamp: new Date().toISOString(),
                                read: false,
                        };
                        setMessages((prev) => [...prev, optimisticMessage]);

                        // Update room's last message
                        setRooms((prevRooms) =>
                                prevRooms.map((room) =>
                                        room.id === actualRoomId
                                                ? {
                                                          ...room,
                                                          lastMessage: content,
                                                          lastMessageTime: new Date().toISOString(),
                                                  }
                                                : room
                                )
                        );

                        // Update selectedRoomId if different to ensure WebSocket uses correct roomId
                        if (actualRoomId !== selectedRoomId) {
                                setSelectedRoomId(actualRoomId);
                                // Wait a bit for state to update, then send message
                                setTimeout(() => {
                                        console.log("📤 Sending message via WebSocket:", { content, receiverId, roomId: actualRoomId });
                                        sendMessage(content, receiverId);
                                }, 100);
                        } else {
                                // Send via WebSocket with correct roomId
                                console.log("📤 Sending message via WebSocket:", { content, receiverId, roomId: actualRoomId });
                                sendMessage(content, receiverId);
                        }

                        // Reload messages after sending to ensure message is saved and displayed
                        // Try multiple times to handle potential delays in saving to DB
                        setTimeout(() => {
                                console.log("Reloading messages after 300ms...");
                                reloadMessages();
                        }, 300);
                        
                        // Also reload after a longer delay to ensure message is definitely saved
                        setTimeout(() => {
                                console.log("Reloading messages after 1500ms...");
                                reloadMessages();
                        }, 1500);
                },
                [selectedRoomId, isConnected, sendMessage, currentUserId, reloadMessages]
        );

        // Handle room selection
        const handleSelectRoom = useCallback((roomId: string) => {
                setSelectedRoomId(roomId);
        }, []);

        if (!currentUserId) {
                return (
                        <div className="flex items-center justify-center h-screen">
                                <p className="text-gray-500">Please log in to use chat</p>
                        </div>
                );
        }

        return (
                <div className="flex h-[calc(100vh-200px)] max-h-[800px] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
                        {/* Chat List */}
                        <div className="w-1/3 min-w-[300px] border-r border-gray-200">
                                <ChatList
                                        rooms={rooms}
                                        currentUserId={currentUserId}
                                        selectedRoomId={selectedRoomId}
                                        onSelectRoom={handleSelectRoom}
                                        onGetPartnerInfo={getPartnerInfo}
                                />
                        </div>

                        {/* Chat Window */}
                        <div className="flex-1">
                                {selectedRoomId && partnerId ? (
                                        <ChatWindow
                                                messages={messages}
                                                currentUserId={currentUserId}
                                                partnerId={partnerId}
                                                partnerName={partnerName}
                                                onSendMessage={handleSendMessage}
                                                isConnected={isConnected}
                                                isLoading={isLoadingMessages}
                                        />
                                ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                                <div className="text-center">
                                                        <p className="text-lg mb-2">Select a conversation</p>
                                                        <p className="text-sm">
                                                                Choose a chat from the list to start messaging
                                                        </p>
                                                </div>
                                        </div>
                                )}
                        </div>
                </div>
        );
}
