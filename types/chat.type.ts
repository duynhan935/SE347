export interface Message {
	id: string;
	roomId: string;
	senderId: string;
	receiverId: string;
	content: string;
	timestamp: string;
	read: boolean;
}

export interface ChatRoom {
	id: string;
	user1Id: string;
	user2Id: string;
	lastMessageTime: string | null;
	lastMessage: string | null;
}

export interface MessageDTO {
	roomId: string;
	senderId: string;
	receiverId: string;
	content: string;
	timestamp?: string;
}

export interface RoomIdResponse {
	roomId: string;
}

export interface UnreadCountResponse {
	data: number;
}

