import { ChatRoom, Data, MessageFromBackend, Page, ResponseMessage, RoomIdResponse } from "@/types";
import api from "../axios";

export const chatApi = {
    // Get roomId from two userIds
    // Encode userIds to handle special characters in URLs
    getRoomId: (userId1: string, userId2: string) =>
        api.get<RoomIdResponse>(`/chat/roomId/${encodeURIComponent(userId1)}/${encodeURIComponent(userId2)}`),

    // Get all rooms for a user (returns Page<ChatRoom>)
    getAllRoomsByUserId: (userId: string, page: number = 0, size: number = 20) =>
        api.get<Page<ChatRoom>>(`/chat/rooms/${userId}`, { params: { page, size } }),

    // Get messages in a room with pagination (returns Page<MessageFromBackend>)
    getMessagesByRoomId: (roomId: string, page: number = 0, size: number = 20) =>
        api.get<Page<MessageFromBackend>>(`/chat/rooms/${roomId}/messages`, { params: { page, size } }),

    // Count unread messages for a user (returns Data)
    getUnreadCount: (userId: string) => api.get<Data>(`/chat/rooms/unreadCount/${userId}`),

    // Count unread messages in a room (returns Data)
    getUnreadCountByRoom: (roomId: string, userId: string) =>
        api.get<Data>(`/chat/rooms/${roomId}/unreadCount/${userId}`),

    // Mark messages as read (returns ResponseMessage)
    markMessagesAsRead: (roomId: string, userId: string) =>
        api.put<ResponseMessage>(`/chat/rooms/${roomId}/read/${userId}`),
};
