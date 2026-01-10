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
        initialRoomId?: string | null; // Optional: to start with a specific room selected
}

export default function ChatClient({ initialRooms, currentUserId, initialRoomId }: ChatClientProps) {
        // Use rooms directly from chat store - always in sync
        const rooms = useChatStore((state) => state.rooms);
        
        // Initialize store with initialRooms if store is empty
        useEffect(() => {
                const storeRooms = useChatStore.getState().rooms;
                if (storeRooms.length === 0 && initialRooms.length > 0) {
                        useChatStore.getState().setRooms(initialRooms);
                }
        }, [initialRooms]);
        const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId || null);
        const [messages, setMessages] = useState<Message[]>([]);
        const [isLoadingMessages, setIsLoadingMessages] = useState(false);
        const [partnerId, setPartnerId] = useState<string | null>(null);
        const [partnerName, setPartnerName] = useState<string>("User");

        // Cache partner info to avoid duplicate API calls
        const partnerInfoCacheRef = useRef<Record<string, { name: string; fetched: boolean }>>({});
        const fetchingPartnerRef = useRef<Set<string>>(new Set()); // Track currently fetching partners

        // Get partner info function with caching
        const getPartnerInfo = useCallback(async (partnerId: string) => {
                // Check cache first
                if (partnerInfoCacheRef.current[partnerId]?.fetched) {
                        return partnerInfoCacheRef.current[partnerId];
                }

                // If already fetching this partner, wait for existing request
                if (fetchingPartnerRef.current.has(partnerId)) {
                        // Wait a bit and check cache again
                        await new Promise((resolve) => setTimeout(resolve, 100));
                        if (partnerInfoCacheRef.current[partnerId]?.fetched) {
                                return partnerInfoCacheRef.current[partnerId];
                        }
                }

                // Mark as fetching
                fetchingPartnerRef.current.add(partnerId);

                try {
                        const user = await authApi.getUserById(partnerId);
                        const info = { name: user.username || `User ${partnerId.slice(0, 8)}`, fetched: true };
                        // Cache the result
                        partnerInfoCacheRef.current[partnerId] = info;
                        return info;
                } catch {
                        const info = { name: `User ${partnerId.slice(0, 8)}`, fetched: true };
                        // Cache even on error to avoid repeated failed calls
                        partnerInfoCacheRef.current[partnerId] = info;
                        return info;
                } finally {
                        // Remove from fetching set
                        fetchingPartnerRef.current.delete(partnerId);
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
                                        // Update store with reloaded rooms
                                        const { setRooms: setRoomsInStore } = useChatStore.getState();
                                        setRoomsInStore(updatedRooms);

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
                                } catch {
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

        // Use global WebSocket connection from ChatProvider
        // ChatProvider already subscribes to all rooms, we only need to listen to events
        const { isConnected, sendMessage: sendMessageToSocket } = useChatSocketContext();

        // Handle message received from WebSocket (only for selected room to display in ChatWindow)
        // Note: ChatProvider already handles all rooms globally and updates store
        // Use ref to avoid stale closure issues
        const selectedRoomIdRef = useRef<string | null>(selectedRoomId);
        useEffect(() => {
                selectedRoomIdRef.current = selectedRoomId;
        }, [selectedRoomId]);

        // Track processed messages to prevent duplicates from multiple subscriptions (global)
        const processedMessagesRef = useRef<Set<string>>(new Set());
        // Track processed messages per room to prevent duplicates when receiving same message multiple times
        const processedMessagesPerRoomRef = useRef<Map<string, Set<string>>>(new Map());

        const handleMessageReceived = useCallback(
                (message: MessageDTO) => {
                        // Double-check: Only handle messages for the currently selected room
                        if (message.roomId !== selectedRoomIdRef.current) {
                                return;
                        }

                        // Create a unique key for this message to prevent duplicates
                        // Use content + senderId + receiverId + timestamp (rounded to second) to identify duplicates
                        // IMPORTANT: Must match format used in ChatProvider for consistency
                        // ChatProvider uses: Math.floor(timestamp / 1000), so we use the same format
                        const messageKey = `${message.roomId}-${message.content}-${message.senderId}-${message.receiverId}-${message.timestamp ? Math.floor(new Date(message.timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000)}`;
                        
                        // Check if this message was already processed (from direct subscription or event or backend load)
                        if (processedMessagesRef.current.has(messageKey)) {
                                return;
                        }

                        // Mark this message as processed IMMEDIATELY before processing to prevent race conditions
                        // This ensures that even if handleMessageReceived is called twice, message is only processed once
                        processedMessagesRef.current.add(messageKey);
                        
                        // Clean up old processed messages (keep only last 200 keys to prevent memory leak)
                        if (processedMessagesRef.current.size > 200) {
                                const keysArray = Array.from(processedMessagesRef.current);
                                const recentKeys = keysArray.slice(-100); // Keep last 100 keys
                                processedMessagesRef.current = new Set(recentKeys);
                        }

                        setMessages((prev) => {
                                const messageTimestamp = message.timestamp || new Date().toISOString();
                                const messageTime = new Date(messageTimestamp).getTime();

                                // Filter và kiểm tra duplicate dựa trên senderId, receiverId, content và timestamp
                                // Nếu message đã tồn tại trong list thì không thêm duplicate
                                const existingMessage = prev.find((m) => {
                                        const mTime = new Date(m.timestamp).getTime();
                                        const timeDiff = Math.abs(mTime - messageTime);
                                        
                                        // Match chính xác: cùng senderId, receiverId, content và timestamp trong cùng 1 giây
                                        return (
                                                m.senderId === message.senderId &&
                                                m.receiverId === message.receiverId &&
                                                m.content === message.content &&
                                                timeDiff < 1000 // Cùng 1 giây = cùng 1 message
                                        );
                                });

                                // Nếu message đã tồn tại, không thêm duplicate
                                if (existingMessage) {
                                        return prev;
                                }

                                // Nếu là message từ chính mình, tìm optimistic message để update thay vì thêm mới
                                if (message.senderId === currentUserId) {
                                        const optimisticIndex = prev.findIndex(
                                                (m) =>
                                                        m.id.startsWith("temp-") &&
                                                        m.senderId === message.senderId &&
                                                        m.receiverId === message.receiverId &&
                                                        m.content === message.content
                                        );

                                        if (optimisticIndex >= 0) {
                                                // Update optimistic message với timestamp từ server
                                                const updated = [...prev];
                                                updated[optimisticIndex] = {
                                                        ...updated[optimisticIndex],
                                                        timestamp: messageTimestamp,
                                                };
                                                // Sort lại theo timestamp
                                                return updated.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                                        }
                                }

                                // Thêm message mới vào list
                                const newMessage: Message = {
                                        id: `temp-${Date.now()}`,
                                        roomId: message.roomId,
                                        senderId: message.senderId,
                                        receiverId: message.receiverId,
                                        content: message.content,
                                        timestamp: messageTimestamp,
                                        read: false,
                                };

                                // Thêm message và sort theo timestamp
                                const updated = [...prev, newMessage];
                                return updated.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                        });
                },
                [currentUserId] // Need currentUserId to check if message is from us
        );

        // Listen to global message events from ChatProvider only
        // ChatProvider already subscribes to all rooms and dispatches events
        // This avoids duplicate subscriptions and ensures messages are received correctly
        useEffect(() => {
                if (!selectedRoomId) {
                        return;
                }

                const handleGlobalMessage = (event: CustomEvent<MessageDTO>) => {
                        const message = event.detail;
                        console.log("📬 Received message:", message.content);
                        
                        // Only handle messages for the currently selected room
                        if (message.roomId !== selectedRoomIdRef.current) {
                                return;
                        }

                        // Create a unique key for this message (rounded to second for better duplicate detection)
                        const messageKey = `${message.content}-${message.senderId}-${message.receiverId}-${message.timestamp ? Math.floor(new Date(message.timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000)}`;
                        
                        // Get or create processed messages set for this room
                        if (!processedMessagesPerRoomRef.current.has(message.roomId)) {
                                processedMessagesPerRoomRef.current.set(message.roomId, new Set());
                        }
                        const processedSet = processedMessagesPerRoomRef.current.get(message.roomId)!;
                        
                        // Check if we've already processed this exact message for this room
                        if (processedSet.has(messageKey)) {
                                return;
                        }

                        // Mark as processed for this room IMMEDIATELY to prevent duplicates
                        processedSet.add(messageKey);
                        
                        // Clean up old processed messages for this room (keep only last 50 keys)
                        if (processedSet.size > 50) {
                                const keysArray = Array.from(processedSet);
                                const recentKeys = keysArray.slice(-25); // Keep last 25 keys
                                processedMessagesPerRoomRef.current.set(message.roomId, new Set(recentKeys));
                        }

                        // Call handleMessageReceived to update messages in ChatWindow
                        // processedMessagesRef (global) and processedMessagesPerRoomRef (per room) will prevent duplicates
                        handleMessageReceived(message);
                };

                window.addEventListener("chat-message-received", handleGlobalMessage as EventListener);

                return () => {
                        window.removeEventListener("chat-message-received", handleGlobalMessage as EventListener);
                };
        }, [selectedRoomId, handleMessageReceived]);

        // Track last loaded roomId to prevent duplicate loads
        const lastLoadedRoomIdRef = useRef<string | null>(null);

        // Load messages when room is selected
        useEffect(() => {
                const loadMessages = async () => {
                        if (!selectedRoomId) {
                                setMessages([]);
                                lastLoadedRoomIdRef.current = null;
                                processedMessagesRef.current.clear(); // Clear processed messages when no room selected
                                return;
                        }

                        // Prevent duplicate loads for the same room
                        if (lastLoadedRoomIdRef.current === selectedRoomId) {
                                return;
                        }

                        lastLoadedRoomIdRef.current = selectedRoomId;
                        processedMessagesRef.current.clear(); // Clear global processed messages when switching rooms
                        // Clear processed messages for this room when loading messages
                        processedMessagesPerRoomRef.current.delete(selectedRoomId);
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
                                const sortedMessages = mappedMessages.reverse();
                                
                                // Mark all loaded messages as processed BEFORE setting messages
                                // This prevents WebSocket messages from being added if they were already loaded from backend
                                sortedMessages.forEach((msg) => {
                                        const messageKey = `${msg.roomId}-${msg.content}-${msg.senderId}-${msg.receiverId}-${Math.floor(new Date(msg.timestamp).getTime() / 1000)}`;
                                        processedMessagesRef.current.add(messageKey);
                                });
                                
                                // Set messages AFTER marking them as processed to ensure consistency
                                // This ensures that if a WebSocket message arrives at the same time, it will be checked against processedMessagesRef
                                setMessages(sortedMessages);

                                // Get partner ID - use current rooms state but don't depend on it
                                const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
                                if (selectedRoom) {
                                        const partner =
                                                selectedRoom.user1Id === currentUserId
                                                        ? selectedRoom.user2Id
                                                        : selectedRoom.user1Id;
                                        
                                        // Only update partnerId if it changed
                                        if (partner !== partnerId) {
                                        setPartnerId(partner);
                                        }

                                        // Get partner name (only if not cached)
                                        const cachedInfo = partnerInfoCacheRef.current[partner];
                                        if (cachedInfo?.fetched) {
                                                setPartnerName(cachedInfo.name);
                                        } else {
                                        const info = await getPartnerInfo(partner);
                                        setPartnerName(info.name);
                                        }
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
                                                // Reset unread count for this room
                                                const { resetUnreadCount } = useChatStore.getState();
                                                resetUnreadCount(selectedRoomId);
                                        } catch {
                                                // Silent error handling - not critical
                                        }
                                }
                        } catch {
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

        // Update partner info when selectedRoomId changes (NOT when rooms update with new messages)
        // Only update when room selection changes, not when rooms are updated with new messages
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
                                // AND if we don't already have this partner's info cached
                                if (partner !== partnerId && partner !== lastUpdatedPartnerRef.current) {
                                        lastUpdatedPartnerRef.current = partner;
                                        setPartnerId(partner);
                                        
                                        // Check cache first, only fetch if not cached
                                        const cachedInfo = partnerInfoCacheRef.current[partner];
                                        if (cachedInfo?.fetched) {
                                                setPartnerName(cachedInfo.name);
                                        } else {
                                                getPartnerInfo(partner).then((info) => setPartnerName(info.name));
                                        }
                                }
                        }
                }
                // Only depend on selectedRoomId, NOT rooms - to avoid fetching when rooms update with new messages
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [selectedRoomId, currentUserId, getPartnerInfo]);


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
                                
                                // Update selectedRoomId if it's different (shouldn't happen, but just in case)
                                if (actualRoomId !== selectedRoomId) {
                                        setSelectedRoomId(actualRoomId);
                                }
                        } catch {
                                toast.error("Failed to create chat room. Please try again.");
                                return; // Don't send message if room creation fails
                        }

                        // Optimistic update: Add message to UI immediately
                        // This will be replaced by the real message when WebSocket receives it
                        const optimisticMessage: Message = {
                                id: `temp-${Date.now()}-${currentUserId}`, // Add userId to make it easier to identify
                                roomId: actualRoomId,
                                senderId: currentUserId,
                                receiverId,
                                content,
                                timestamp: new Date().toISOString(),
                                read: false,
                        };
                        setMessages((prev) => {
                                // Check if this optimistic message already exists (prevent duplicates if user clicks send multiple times)
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
                                // Add optimistic message and sort
                                const updated = [...prev, optimisticMessage];
                                return updated.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                        });

                        // Update room's last message in store
                        const { updateRoomLastMessage } = useChatStore.getState();
                        updateRoomLastMessage(actualRoomId, content, new Date().toISOString());

                        // Update selectedRoomId if different
                        if (actualRoomId !== selectedRoomId) {
                                setSelectedRoomId(actualRoomId);
                        }

                        // Send via WebSocket with correct roomId
                        console.log("📤 Sent message:", content);
                        sendMessageToSocket(actualRoomId, content, receiverId);

                        // Note: No need to reload messages manually here because:
                        // 1. WebSocket will send the message back via handleMessageReceived
                        // 2. Backend saves the message and broadcasts it via WebSocket
                        // 3. Our WebSocket subscription will receive it and update UI automatically
                        // 4. Manual reload causes duplicate messages and UI flickering
                },
                [selectedRoomId, isConnected, sendMessageToSocket, currentUserId]
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
