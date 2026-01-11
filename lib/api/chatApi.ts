import { ChatRoom, Data, MessageFromBackend, Page, ResponseMessage, RoomIdResponse } from "@/types";
import api from "../axios";

export const chatApi = {
        // Lấy roomId từ 2 userId (có thể dùng RoomDTO hoặc userId1/userId2)
        // Encode userIds to handle special characters in URLs
        getRoomId: (userId1: string, userId2: string) => 
                api.get<RoomIdResponse>(`/chat/roomId/${encodeURIComponent(userId1)}/${encodeURIComponent(userId2)}`),

        // Lấy tất cả rooms của một user (trả về Page<ChatRoom>)
        getAllRoomsByUserId: (userId: string, page: number = 0, size: number = 20) =>
                api.get<Page<ChatRoom>>(`/chat/rooms/${userId}`, { params: { page, size } }),

        // Lấy tin nhắn trong room với pagination (trả về Page<MessageFromBackend>)
        getMessagesByRoomId: (roomId: string, page: number = 0, size: number = 20) =>
                api.get<Page<MessageFromBackend>>(`/chat/rooms/${roomId}/messages`, { params: { page, size } }),

        // Đếm số tin nhắn chưa đọc của user (trả về Data)
        getUnreadCount: (userId: string) => api.get<Data>(`/chat/rooms/unreadCount/${userId}`),

        // Đếm số tin nhắn chưa đọc trong một room (trả về Data)
        getUnreadCountByRoom: (roomId: string, userId: string) =>
                api.get<Data>(`/chat/rooms/${roomId}/unreadCount/${userId}`),

        // Đánh dấu tin nhắn đã đọc (trả về ResponseMessage)
        markMessagesAsRead: (roomId: string, userId: string) => 
                api.put<ResponseMessage>(`/chat/rooms/${roomId}/read/${userId}`),
};
