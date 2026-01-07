export interface Message {
	id: string;
	roomId: string;
	senderId: string;
	receiverId: string;
	content: string;
	timestamp: string; // LocalDateTime from backend
	read: boolean;
}

export interface ChatRoom {
	id: string;
	user1Id: string;
	user2Id: string;
	lastMessageTime: string | null; // LocalDateTime from backend, can be null
	lastMessage: string | null; // Can be null
}

export interface MessageDTO {
	roomId: string;
	senderId: string;
	receiverId: string;
	content: string;
	timestamp?: string; // LocalDateTime, optional when creating
}

export interface RoomDTO {
	userId1: string;
	userId2: string;
}

export interface RoomIdResponse {
	roomId: string;
}

export interface UnreadCountResponse {
	data: number;
}

export interface ResponseMessage {
	success: boolean;
	message: string;
	data?: unknown;
}
