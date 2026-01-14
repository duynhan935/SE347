"use client";

import { useChatStore } from "@/stores/useChatStore";
import { ChatRoom } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ChatListProps {
    rooms: ChatRoom[];
    currentUserId: string;
    selectedRoomId: string | null;
    onSelectRoom: (roomId: string) => void;
    onGetPartnerInfo?: (partnerId: string) => Promise<{ name: string; avatar?: string }>;
}

export default function ChatList({
    rooms,
    currentUserId,
    selectedRoomId,
    onSelectRoom,
    onGetPartnerInfo,
}: ChatListProps) {
    const [partnerInfoMap, setPartnerInfoMap] = useState<Record<string, { name: string; avatar?: string }>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const getUnreadCountByRoom = useChatStore((state) => state.getUnreadCountByRoom);
    const fetchedPartnerIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const fetchPartnerInfo = async () => {
            const infoMap: Record<string, { name: string; avatar?: string }> = { ...partnerInfoMap };
            const partnersToFetch: string[] = [];

            for (const room of rooms) {
                const partnerId = room.user1Id === currentUserId ? room.user2Id : room.user1Id;
                if (!infoMap[partnerId] && !fetchedPartnerIdsRef.current.has(partnerId) && onGetPartnerInfo) {
                    partnersToFetch.push(partnerId);
                }
            }

            if (partnersToFetch.length > 0 && onGetPartnerInfo) {
                for (const partnerId of partnersToFetch) {
                    fetchedPartnerIdsRef.current.add(partnerId);
                    try {
                        const info = await onGetPartnerInfo(partnerId);
                        infoMap[partnerId] = info;
                    } catch {
                        infoMap[partnerId] = { name: "Unknown User" };
                    }
                }
                setPartnerInfoMap(infoMap);
            }
        };

        if (rooms.length > 0 && onGetPartnerInfo) {
            fetchPartnerInfo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rooms.length, currentUserId, onGetPartnerInfo]);

    const getPartnerId = (room: ChatRoom) => {
        return room.user1Id === currentUserId ? room.user2Id : room.user1Id;
    };

    const getPartnerName = (room: ChatRoom) => {
        const partnerId = getPartnerId(room);
        return partnerInfoMap[partnerId]?.name || `User ${partnerId.slice(0, 8)}`;
    };

    const formatTime = (timestamp: string | null) => {
        if (!timestamp) return "";
        try {
            const distance = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
            // Convert "about X minutes ago" to "X min ago"
            return distance.replace("about ", "").replace(" minutes", " min").replace(" minute", " min");
        } catch {
            return "";
        }
    };

    // Filter rooms based on search query
    const filteredRooms = rooms.filter((room) => {
        if (!searchQuery.trim()) return true;
        const partnerName = getPartnerName(room);
        const searchLower = searchQuery.toLowerCase();
        return partnerName.toLowerCase().includes(searchLower) || room.lastMessage?.toLowerCase().includes(searchLower);
    });

    // Generate avatar URL
    const getAvatarUrl = (partnerId: string, partnerName: string) => {
        const avatar = partnerInfoMap[partnerId]?.avatar;
        if (avatar) return avatar;
        const initial = partnerName.charAt(0).toUpperCase();
        return `https://placehold.co/48x48/${initial.charCodeAt(0) % 2 === 0 ? "EE4D2D" : "FF6B35"}/FFFFFF?text=${initial}`;
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for shops..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]/20 focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {filteredRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                        <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="text-center text-sm">
                            {searchQuery ? "No conversations found" : "No conversations yet"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredRooms.map((room) => {
                            const partnerName = getPartnerName(room);
                            const partnerId = getPartnerId(room);
                            const isSelected = selectedRoomId === room.id;
                            const unreadCount = getUnreadCountByRoom(room.id);
                            const avatarUrl = getAvatarUrl(partnerId, partnerName);

                            return (
                                <button
                                    key={room.id}
                                    onClick={() => onSelectRoom(room.id)}
                                    className={`w-full p-4 text-left transition-colors relative hover:bg-gray-50 ${
                                        isSelected ? "bg-orange-50 border-l-4 border-[#EE4D2D]" : ""
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#EE4D2D] to-orange-600 flex items-center justify-center text-white font-semibold">
                                                {partnerInfoMap[partnerId]?.avatar ? (
                                                    <Image
                                                        src={partnerInfoMap[partnerId].avatar!}
                                                        alt={partnerName}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <span>{partnerName.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            {/* Unread Badge */}
                                            {unreadCount > 0 && !isSelected && (
                                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                                    {unreadCount > 9 ? "9+" : unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p
                                                    className={`text-sm font-bold truncate ${
                                                        unreadCount > 0 && !isSelected
                                                            ? "text-gray-900"
                                                            : "text-gray-900"
                                                    }`}
                                                >
                                                    {partnerName}
                                                </p>
                                                {room.lastMessageTime && (
                                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                        {formatTime(room.lastMessageTime)}
                                                    </span>
                                                )}
                                            </div>
                                            {room.lastMessage && (
                                                <p
                                                    className={`text-sm truncate ${
                                                        unreadCount > 0 && !isSelected
                                                            ? "font-medium text-gray-900"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {room.lastMessage}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
