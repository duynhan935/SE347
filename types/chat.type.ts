// Message from backend may have room object instead of roomId
export interface MessageFromBackend {
	id: string;
	roomId?: string; // May be present if backend serializes it directly
	room?: ChatRoom; // May be present if backend serializes the room object
	senderId: string;
	receiverId: string;
	content: string;
	timestamp: string; // LocalDateTime from backend
	read: boolean;
}

// Message used in frontend - always has roomId
export interface Message {
	id: string;
	roomId: string; // Always present in frontend
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

// Spring Data Page structure
export interface Page<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	number: number; // current page number (0-indexed)
	size: number; // page size
	first: boolean;
	last: boolean;
	numberOfElements: number; // number of elements in current page
	empty: boolean;
}

// Backend returns Data with Long (number in TypeScript)
export interface Data {
	data: number; // Long from backend
}

// Alias for backward compatibility
export type UnreadCountResponse = Data;

// Backend ResponseMessage only has message field
export interface ResponseMessage {
	message: string;
}
