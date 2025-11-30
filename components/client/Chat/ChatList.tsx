"use client";

import { ChatRoom } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

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

        useEffect(() => {
                const fetchPartnerInfo = async () => {
                        const infoMap: Record<string, { name: string; avatar?: string }> = {};
                        for (const room of rooms) {
                                const partnerId = room.user1Id === currentUserId ? room.user2Id : room.user1Id;
                                if (!infoMap[partnerId] && onGetPartnerInfo) {
                                        try {
                                                const info = await onGetPartnerInfo(partnerId);
                                                infoMap[partnerId] = info;
                                        } catch (error) {
                                                infoMap[partnerId] = { name: "Unknown User" };
                                        }
                                }
                        }
                        setPartnerInfoMap(infoMap);
                };

                if (rooms.length > 0 && onGetPartnerInfo) {
                        fetchPartnerInfo();
                }
        }, [rooms, currentUserId, onGetPartnerInfo]);

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
                        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
                } catch {
                        return "";
                }
        };

        return (
                <div className="flex flex-col h-full bg-white border-r border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                                {rooms.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                                                <MessageSquare className="w-12 h-12 mb-4" />
                                                <p className="text-center">No conversations yet</p>
                                        </div>
                                ) : (
                                        <div className="divide-y divide-gray-100">
                                                {rooms.map((room) => {
                                                        const partnerId = getPartnerId(room);
                                                        const partnerName = getPartnerName(room);
                                                        const isSelected = selectedRoomId === room.id;

                                                        return (
                                                                <button
                                                                        key={room.id}
                                                                        onClick={() => onSelectRoom(room.id)}
                                                                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                                                                                isSelected
                                                                                        ? "bg-blue-50 border-l-4 border-blue-500"
                                                                                        : ""
                                                                        }`}
                                                                >
                                                                        <div className="flex items-start gap-3">
                                                                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                                                                        {partnerName
                                                                                                .charAt(0)
                                                                                                .toUpperCase()}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center justify-between mb-1">
                                                                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                                                                        {partnerName}
                                                                                                </p>
                                                                                                {room.lastMessageTime && (
                                                                                                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                                                                                {formatTime(
                                                                                                                        room.lastMessageTime
                                                                                                                )}
                                                                                                        </span>
                                                                                                )}
                                                                                        </div>
                                                                                        {room.lastMessage && (
                                                                                                <p className="text-sm text-gray-600 truncate">
                                                                                                        {
                                                                                                                room.lastMessage
                                                                                                        }
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
