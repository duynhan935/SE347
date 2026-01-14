"use client";

import { useChatSocketContext } from "@/components/providers/ChatProvider";
import { authApi } from "@/lib/api/authApi";
import { chatApi } from "@/lib/api/chatApi";
import { useChatStore } from "@/stores/useChatStore";
import { ChatRoom, Message, MessageDTO } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

interface ChatClientProps {
        initialRooms: ChatRoom[];
        currentUserId: string;
    initialRoomId?: string | null;
}

export default function ChatClient({ initialRooms, currentUserId, initialRoomId }: ChatClientProps) {
        const rooms = useChatStore((state) => state.rooms);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId || null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [partnerName, setPartnerName] = useState<string>("User");
    const [showChatWindow, setShowChatWindow] = useState(false); // For mobile: show chat window or list
        
        // Initialize store with initialRooms if store is empty
        useEffect(() => {
                const storeRooms = useChatStore.getState().rooms;
                if (storeRooms.length === 0 && initialRooms.length > 0) {
                        useChatStore.getState().setRooms(initialRooms);
                }
        }, [initialRooms]);

    // Cache partner info
        const partnerInfoCacheRef = useRef<Record<string, { name: string; fetched: boolean }>>({});
    const fetchingPartnerRef = useRef<Set<string>>(new Set());

        const getPartnerInfo = useCallback(async (partnerId: string) => {
                if (partnerInfoCacheRef.current[partnerId]?.fetched) {
                        return partnerInfoCacheRef.current[partnerId];
                }

                if (fetchingPartnerRef.current.has(partnerId)) {
                        await new Promise((resolve) => setTimeout(resolve, 100));
                        if (partnerInfoCacheRef.current[partnerId]?.fetched) {
                                return partnerInfoCacheRef.current[partnerId];
                        }
                }

                fetchingPartnerRef.current.add(partnerId);

                try {
                        const user = await authApi.getUserById(partnerId);
                        const info = { name: user.username || `User ${partnerId.slice(0, 8)}`, fetched: true };
                        partnerInfoCacheRef.current[partnerId] = info;
                        return info;
                } catch {
                        const info = { name: `User ${partnerId.slice(0, 8)}`, fetched: true };
                        partnerInfoCacheRef.current[partnerId] = info;
                        return info;
                } finally {
                        fetchingPartnerRef.current.delete(partnerId);
                }
        }, []);

        const partnerInitializedRef = useRef(false);

        useEffect(() => {
                if (initialRoomId && !partnerId && !partnerInitializedRef.current) {
                        const roomIdParts = initialRoomId.split("_");
                        if (roomIdParts.length === 2) {
                const partner = roomIdParts[0] === currentUserId ? roomIdParts[1] : roomIdParts[0];
                                setPartnerId(partner);
                                partnerInitializedRef.current = true;
                                getPartnerInfo(partner).then((info) => setPartnerName(info.name));
                        }
                }
        }, [initialRoomId, currentUserId, partnerId, getPartnerInfo]);

        const roomsReloadedRef = useRef(false);

        useEffect(() => {
                const reloadRoomsIfNeeded = async () => {
            if (initialRoomId && !roomsReloadedRef.current && !rooms.find((r) => r.id === initialRoomId)) {
                                roomsReloadedRef.current = true;
                                try {
                                        const response = await chatApi.getAllRoomsByUserId(currentUserId);
                                        const updatedRooms = response.data?.content || [];
                    useChatStore.getState().setRooms(updatedRooms);

                                        if (!updatedRooms.find((r) => r.id === initialRoomId)) {
                                                const roomIdParts = initialRoomId.split("_");
                                                if (roomIdParts.length === 2) {
                            const partner = roomIdParts[0] === currentUserId ? roomIdParts[1] : roomIdParts[0];
                                                        if (partner !== partnerId) {
                                                        setPartnerId(partner);
                                                        const info = await getPartnerInfo(partner);
                                                        setPartnerName(info.name);
                                                        }
                                                }
                                        }
                                } catch {
                                        if (initialRoomId && !partnerId) {
                                                const roomIdParts = initialRoomId.split("_");
                                                if (roomIdParts.length === 2) {
                            const partner = roomIdParts[0] === currentUserId ? roomIdParts[1] : roomIdParts[0];
                                                        setPartnerId(partner);
                            getPartnerInfo(partner).then((info) => setPartnerName(info.name));
                                                }
                                        }
                                }
                        }
                };

                reloadRoomsIfNeeded();
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [initialRoomId, currentUserId]);

        const { isConnected, sendMessage: sendMessageToSocket } = useChatSocketContext();

        const selectedRoomIdRef = useRef<string | null>(selectedRoomId);
        useEffect(() => {
                selectedRoomIdRef.current = selectedRoomId;
        }, [selectedRoomId]);

        const processedMessagesRef = useRef<Set<string>>(new Set());
        const processedMessagesPerRoomRef = useRef<Map<string, Set<string>>>(new Map());

        const handleMessageReceived = useCallback(
                (message: MessageDTO) => {
                        if (message.roomId !== selectedRoomIdRef.current) {
                                return;
                        }

            const messageKey = `${message.roomId}-${message.content}-${message.senderId}-${message.receiverId}-${
                message.timestamp ? Math.floor(new Date(message.timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000)
            }`;
                        
                        if (processedMessagesRef.current.has(messageKey)) {
                                return;
                        }

                        processedMessagesRef.current.add(messageKey);
                        
                        if (processedMessagesRef.current.size > 200) {
                                const keysArray = Array.from(processedMessagesRef.current);
                const recentKeys = keysArray.slice(-100);
                                processedMessagesRef.current = new Set(recentKeys);
                        }

                        setMessages((prev) => {
                                const messageTimestamp = message.timestamp || new Date().toISOString();
                                const messageTime = new Date(messageTimestamp).getTime();

                                const existingMessage = prev.find((m) => {
                                        const mTime = new Date(m.timestamp).getTime();
                                        const timeDiff = Math.abs(mTime - messageTime);
                                        return (
                                                m.senderId === message.senderId &&
                                                m.receiverId === message.receiverId &&
                                                m.content === message.content &&
                        timeDiff < 1000
                                        );
                                });

                                if (existingMessage) {
                                        return prev;
                                }

                                if (message.senderId === currentUserId) {
                                        const optimisticIndex = prev.findIndex(
                                                (m) =>
                                                        m.id.startsWith("temp-") &&
                                                        m.senderId === message.senderId &&
                                                        m.receiverId === message.receiverId &&
                                                        m.content === message.content
                                        );

                                        if (optimisticIndex >= 0) {
                                                const updated = [...prev];
                                                updated[optimisticIndex] = {
                                                        ...updated[optimisticIndex],
                                                        timestamp: messageTimestamp,
                                                };
                                                return updated.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                                        }
                                }

                                const newMessage: Message = {
                                        id: `temp-${Date.now()}`,
                                        roomId: message.roomId,
                                        senderId: message.senderId,
                                        receiverId: message.receiverId,
                                        content: message.content,
                                        timestamp: messageTimestamp,
                                        read: false,
                                };

                                const updated = [...prev, newMessage];
                                return updated.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                        });
                },
        [currentUserId]
        );

        useEffect(() => {
                if (!selectedRoomId) {
                        return;
                }

                const handleGlobalMessage = (event: CustomEvent<MessageDTO>) => {
                        const message = event.detail;
                        
                        if (message.roomId !== selectedRoomIdRef.current) {
                                return;
                        }

            const messageKey = `${message.content}-${message.senderId}-${message.receiverId}-${
                message.timestamp ? Math.floor(new Date(message.timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000)
            }`;
                        
                        if (!processedMessagesPerRoomRef.current.has(message.roomId)) {
                                processedMessagesPerRoomRef.current.set(message.roomId, new Set());
                        }
                        const processedSet = processedMessagesPerRoomRef.current.get(message.roomId)!;
                        
                        if (processedSet.has(messageKey)) {
                                return;
                        }

                        processedSet.add(messageKey);
                        
                        if (processedSet.size > 50) {
                                const keysArray = Array.from(processedSet);
                const recentKeys = keysArray.slice(-25);
                                processedMessagesPerRoomRef.current.set(message.roomId, new Set(recentKeys));
                        }

                        handleMessageReceived(message);
                        
                        if (message.roomId === selectedRoomIdRef.current && message.receiverId === currentUserId) {
                                (async () => {
                                        try {
                                                await chatApi.markMessagesAsRead(message.roomId, currentUserId);
                        useChatStore.getState().resetUnreadCount(message.roomId);
                                        } catch {
                        // Silent error handling
                                        }
                                })();
                        }
                };

                window.addEventListener("chat-message-received", handleGlobalMessage as EventListener);

                return () => {
                        window.removeEventListener("chat-message-received", handleGlobalMessage as EventListener);
                };
        }, [selectedRoomId, handleMessageReceived, currentUserId]);

        const lastLoadedRoomIdRef = useRef<string | null>(null);

        useEffect(() => {
                const loadMessages = async () => {
                        if (!selectedRoomId) {
                                setMessages([]);
                                lastLoadedRoomIdRef.current = null;
                processedMessagesRef.current.clear();
                                return;
                        }

                        if (lastLoadedRoomIdRef.current === selectedRoomId) {
                                return;
                        }

                        lastLoadedRoomIdRef.current = selectedRoomId;
            processedMessagesRef.current.clear();
                        processedMessagesPerRoomRef.current.delete(selectedRoomId);
                        setIsLoadingMessages(true);
                        try {
                                const response = await chatApi.getMessagesByRoomId(selectedRoomId, 0);
                                const loadedMessages = response.data?.content || [];
                                
                                const mappedMessages: Message[] = loadedMessages.map((msg) => ({
                                        id: msg.id,
                                        roomId: msg.roomId || msg.room?.id || selectedRoomId,
                                        senderId: msg.senderId,
                                        receiverId: msg.receiverId,
                                        content: msg.content,
                                        timestamp: msg.timestamp,
                                        read: msg.read,
                                }));

                                const sortedMessages = mappedMessages.reverse();
                                
                                sortedMessages.forEach((msg) => {
                    const messageKey = `${msg.roomId}-${msg.content}-${msg.senderId}-${msg.receiverId}-${Math.floor(
                        new Date(msg.timestamp).getTime() / 1000
                    )}`;
                                        processedMessagesRef.current.add(messageKey);
                                });
                                
                                setMessages(sortedMessages);

                                const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
                                if (selectedRoom) {
                    const partner = selectedRoom.user1Id === currentUserId ? selectedRoom.user2Id : selectedRoom.user1Id;
                                        
                                        if (partner !== partnerId) {
                                        setPartnerId(partner);
                                        }

                                        const cachedInfo = partnerInfoCacheRef.current[partner];
                                        if (cachedInfo?.fetched) {
                                                setPartnerName(cachedInfo.name);
                                        } else {
                                        const info = await getPartnerInfo(partner);
                                        setPartnerName(info.name);
                                        }
                                } else if (selectedRoomId) {
                                        const roomIdParts = selectedRoomId.split("_");
                                        if (roomIdParts.length === 2) {
                        const partner = roomIdParts[0] === currentUserId ? roomIdParts[1] : roomIdParts[0];
                                                setPartnerId(partner);
                                                const info = await getPartnerInfo(partner);
                                                setPartnerName(info.name);
                                        }
                                }

                                try {
                                        await chatApi.markMessagesAsRead(selectedRoomId, currentUserId);
                    useChatStore.getState().resetUnreadCount(selectedRoomId);
                                } catch {
                    // Silent error handling
                                }
                        } catch {
                                toast.error("Failed to load messages");
                                lastLoadedRoomIdRef.current = null;
                        } finally {
                                setIsLoadingMessages(false);
                        }
                };

                loadMessages();
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [selectedRoomId, currentUserId]);

        const lastUpdatedPartnerRef = useRef<string | null>(null);
        const lastSelectedRoomIdRef = useRef<string | null>(null);

        useEffect(() => {
                if (selectedRoomId !== lastSelectedRoomIdRef.current) {
                        lastSelectedRoomIdRef.current = selectedRoomId;
                        lastUpdatedPartnerRef.current = null;
                }

                if (selectedRoomId) {
                        const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
                        if (selectedRoom) {
                const partner = selectedRoom.user1Id === currentUserId ? selectedRoom.user2Id : selectedRoom.user1Id;
                                if (partner !== partnerId && partner !== lastUpdatedPartnerRef.current) {
                                        lastUpdatedPartnerRef.current = partner;
                                        setPartnerId(partner);
                                        
                                        const cachedInfo = partnerInfoCacheRef.current[partner];
                                        if (cachedInfo?.fetched) {
                                                setPartnerName(cachedInfo.name);
                                        } else {
                                                getPartnerInfo(partner).then((info) => setPartnerName(info.name));
                                        }
                                }
                        }
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [selectedRoomId, currentUserId, getPartnerInfo]);

        const handleMarkAsRead = useCallback(async () => {
                if (!selectedRoomId) return;

                try {
                        await chatApi.markMessagesAsRead(selectedRoomId, currentUserId);
            useChatStore.getState().resetUnreadCount(selectedRoomId);
                } catch {
            // Silent error handling
                }
        }, [selectedRoomId, currentUserId]);

        const handleSendMessage = useCallback(
                async (content: string, receiverId: string) => {
                        if (!selectedRoomId || !isConnected) {
                                toast.error("Not connected to chat");
                                return;
                        }

                        let actualRoomId = selectedRoomId;
                        try {
                                const response = await chatApi.getRoomId(currentUserId, receiverId);
                                actualRoomId = response.data.roomId;
                                
                                if (actualRoomId !== selectedRoomId) {
                                        setSelectedRoomId(actualRoomId);
                                }
                        } catch {
                                toast.error("Failed to create chat room. Please try again.");
                return;
                        }

                        const optimisticMessage: Message = {
                id: `temp-${Date.now()}-${currentUserId}`,
                                roomId: actualRoomId,
                                senderId: currentUserId,
                                receiverId,
                                content,
                                timestamp: new Date().toISOString(),
                                read: false,
                        };
                        setMessages((prev) => {
                                const exists = prev.some(
                                        (m) =>
                                                m.content === optimisticMessage.content &&
                                                m.senderId === optimisticMessage.senderId &&
                                                m.receiverId === optimisticMessage.receiverId &&
                                                m.id.startsWith("temp-") &&
                                                Math.abs(new Date(m.timestamp).getTime() - new Date(optimisticMessage.timestamp).getTime()) < 1000
                                );
                                if (exists) {
                                        return prev;
                                }
                                const updated = [...prev, optimisticMessage];
                                return updated.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                        });

            useChatStore.getState().updateRoomLastMessage(actualRoomId, content, new Date().toISOString());

                        if (actualRoomId !== selectedRoomId) {
                                setSelectedRoomId(actualRoomId);
                        }

                        sendMessageToSocket(actualRoomId, content, receiverId);
                },
                [selectedRoomId, isConnected, sendMessageToSocket, currentUserId]
        );

    const handleSelectRoom = useCallback(
        (roomId: string) => {
                setSelectedRoomId(roomId);
            // On mobile, show chat window when room is selected
            if (window.innerWidth < 1024) {
                setShowChatWindow(true);
            }
        },
        []
    );

    const handleBack = useCallback(() => {
        setShowChatWindow(false);
        }, []);

        if (!currentUserId) {
                return (
                        <div className="flex items-center justify-center h-screen">
                                <p className="text-gray-500">Please log in to use chat</p>
                        </div>
                );
        }

        return (
        <div className="h-[calc(100vh-200px)] max-h-[800px] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
            {/* Desktop Layout: 2 Columns */}
            <div className="hidden lg:flex h-full">
                {/* Sidebar - 30% */}
                <div className="w-[30%] border-r border-gray-200 flex-shrink-0">
                                <ChatList
                                        rooms={rooms}
                                        currentUserId={currentUserId}
                                        selectedRoomId={selectedRoomId}
                                        onSelectRoom={handleSelectRoom}
                                        onGetPartnerInfo={getPartnerInfo}
                                />
                        </div>

                {/* Chat Window - 70% */}
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
                                                onMarkAsRead={handleMarkAsRead}
                                        />
                                ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50">
                                                <div className="text-center">
                                {/* Empty State Illustration */}
                                <div className="mb-6">
                                    <svg
                                        width="200"
                                        height="200"
                                        viewBox="0 0 200 200"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mx-auto text-gray-300"
                                    >
                                        <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.1" />
                                        <path
                                            d="M60 80C60 75.5817 63.5817 72 68 72H132C136.418 72 140 75.5817 140 80V120C140 124.418 136.418 128 132 128H68C63.5817 128 60 124.418 60 120V80Z"
                                            fill="currentColor"
                                            opacity="0.2"
                                        />
                                        <circle cx="80" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                        <circle cx="100" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                        <circle cx="120" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                        <path
                                            d="M70 130C70 128.343 71.3431 127 73 127H127C128.657 127 130 128.343 130 130C130 131.657 128.657 133 127 133H73C71.3431 133 70 131.657 70 130Z"
                                            fill="currentColor"
                                            opacity="0.3"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a conversation</h3>
                                <p className="text-sm text-gray-500">Choose a chat from the list to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Layout: Toggle between List and Chat */}
            <div className="lg:hidden h-full">
                {!showChatWindow ? (
                    <ChatList
                        rooms={rooms}
                        currentUserId={currentUserId}
                        selectedRoomId={selectedRoomId}
                        onSelectRoom={handleSelectRoom}
                        onGetPartnerInfo={getPartnerInfo}
                    />
                ) : selectedRoomId && partnerId ? (
                    <ChatWindow
                        messages={messages}
                        currentUserId={currentUserId}
                        partnerId={partnerId}
                        partnerName={partnerName}
                        onSendMessage={handleSendMessage}
                        isConnected={isConnected}
                        isLoading={isLoadingMessages}
                        onMarkAsRead={handleMarkAsRead}
                        onBack={handleBack}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center">
                            <div className="mb-6">
                                <svg
                                    width="200"
                                    height="200"
                                    viewBox="0 0 200 200"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mx-auto text-gray-300"
                                >
                                    <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.1" />
                                    <path
                                        d="M60 80C60 75.5817 63.5817 72 68 72H132C136.418 72 140 75.5817 140 80V120C140 124.418 136.418 128 132 128H68C63.5817 128 60 124.418 60 120V80Z"
                                        fill="currentColor"
                                        opacity="0.2"
                                    />
                                    <circle cx="80" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                    <circle cx="100" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                    <circle cx="120" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                    <path
                                        d="M70 130C70 128.343 71.3431 127 73 127H127C128.657 127 130 128.343 130 130C130 131.657 128.657 133 127 133H73C71.3431 133 70 131.657 70 130Z"
                                        fill="currentColor"
                                        opacity="0.3"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a conversation</h3>
                            <p className="text-sm text-gray-500">Choose a chat from the list to start messaging</p>
                                                </div>
                                        </div>
                                )}
                        </div>
                </div>
        );
}
