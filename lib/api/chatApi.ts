import { ChatRoom, Message, MessageDTO, RoomDTO, RoomIdResponse, UnreadCountResponse } from "@/types";
import api from "../axios";

export const chatApi = {
        // Lấy roomId từ 2 userId (có thể dùng RoomDTO hoặc userId1/userId2)
        // Encode userIds to handle special characters in URLs
        getRoomId: (userId1: string, userId2: string) => 
                api.get<RoomIdResponse>(`/chat/roomId/${encodeURIComponent(userId1)}/${encodeURIComponent(userId2)}`),

        // Tạo hoặc lấy roomId từ RoomDTO
        getOrCreateRoom: (roomDTO: RoomDTO) => api.post<RoomIdResponse>(`/chat/roomId`, roomDTO),

        // Lấy tất cả rooms của một user
        getAllRoomsByUserId: (userId: string) => api.get<ChatRoom[]>(`/chat/rooms/${userId}`),

        // Lấy tin nhắn trong room với pagination
        getMessagesByRoomId: (roomId: string, page: number = 0) =>
                api.get<Message[]>(`/chat/rooms/${roomId}/messages`, { params: { page } }),

        // Gửi tin nhắn (thông qua WebSocket hoặc HTTP)
        sendMessage: (messageDTO: MessageDTO) => api.post<Message>(`/chat/messages`, messageDTO),

        // Đếm số tin nhắn chưa đọc của user
        getUnreadCount: (userId: string) => api.get<UnreadCountResponse>(`/chat/rooms/unreadCount/${userId}`),

        // Đếm số tin nhắn chưa đọc trong một room
        getUnreadCountByRoom: (roomId: string, userId: string) =>
                api.get<UnreadCountResponse>(`/chat/rooms/${roomId}/unreadCount/${userId}`),

        // Đánh dấu tin nhắn đã đọc
        markMessagesAsRead: (roomId: string, userId: string) => api.put(`/chat/rooms/${roomId}/read/${userId}`),
};
