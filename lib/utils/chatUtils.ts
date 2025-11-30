import { chatApi } from "@/lib/api/chatApi";

/**
 * Utility function to start or navigate to a chat with another user
 * @param currentUserId - The ID of the current user
 * @param otherUserId - The ID of the user to chat with
 * @returns The roomId for the chat
 */
export async function startChat(currentUserId: string, otherUserId: string): Promise<string> {
        try {
                const response = await chatApi.getRoomId(currentUserId, otherUserId);
                return response.data.roomId;
        } catch (error) {
                console.error("Error starting chat:", error);
                throw error;
        }
}

/**
 * Navigate to chat page with a specific room selected
 * @param roomId - The room ID to open
 */
export function navigateToChat(roomId: string) {
        // Using window.location for now since we need to pass roomId
        // In a more sophisticated implementation, you could use query params
        window.location.href = `/chat?roomId=${roomId}`;
}
