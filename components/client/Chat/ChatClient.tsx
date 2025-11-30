"use client";

import { authApi } from "@/lib/api/authApi";
import { chatApi } from "@/lib/api/chatApi";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { ChatRoom, Message, MessageDTO } from "@/types";
import { useCallback, useEffect, useState } from "react";
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

        // WebSocket hook
        const { isConnected, sendMessage } = useWebSocket({
                roomId: selectedRoomId,
                userId: currentUserId,
                onMessageReceived: (message: MessageDTO) => {
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
                                const exists = prev.some(
                                        (m) =>
                                                m.id === newMessage.id ||
                                                (m.senderId === newMessage.senderId &&
                                                        m.content === newMessage.content &&
                                                        Math.abs(
                                                                new Date(m.timestamp).getTime() -
                                                                        new Date(newMessage.timestamp).getTime()
                                                        ) < 1000)
                                );
                                if (exists) return prev;
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

        // Load messages when room is selected
        useEffect(() => {
                const loadMessages = async () => {
                        if (!selectedRoomId) {
                                setMessages([]);
                                return;
                        }

                        setIsLoadingMessages(true);
                        try {
                                const response = await chatApi.getMessagesByRoomId(selectedRoomId, 0);
                                const loadedMessages = response.data;
                                // Reverse to show oldest first
                                setMessages(loadedMessages.reverse());

                                // Get partner ID
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
                                }

                                // Mark messages as read
                                await chatApi.markMessagesAsRead(selectedRoomId, currentUserId);
                        } catch (error) {
                                console.error("Error loading messages:", error);
                                toast.error("Failed to load messages");
                        } finally {
                                setIsLoadingMessages(false);
                        }
                };

                loadMessages();
        }, [selectedRoomId, rooms, currentUserId, getPartnerInfo]);

        // Handle send message
        const handleSendMessage = useCallback(
                (content: string, receiverId: string) => {
                        if (!selectedRoomId || !isConnected) {
                                toast.error("Not connected to chat");
                                return;
                        }

                        sendMessage(content, receiverId);
                },
                [selectedRoomId, isConnected, sendMessage]
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
