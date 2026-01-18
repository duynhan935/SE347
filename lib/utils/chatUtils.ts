import { chatApi } from "@/lib/api/chatApi";

/**
 * Utility function to start or navigate to a chat with another user
 * @param currentUserId - The ID of the current user
 * @param otherUserId - The ID of the user to chat with
 * @returns The roomId for the chat
 */
export async function startChat(currentUserId: string, otherUserId: string): Promise<string> {
    try {
        // Validate inputs
        if (!currentUserId || !otherUserId) {
            throw new Error("User IDs are required");
        }

        // Trim and validate
        const userId1 = currentUserId.trim();
        const userId2 = otherUserId.trim();

        if (!userId1 || !userId2) {
            throw new Error("User IDs cannot be empty");
        }

        // Use GET method to get roomId (backend only supports GET endpoint)
        const response = await chatApi.getRoomId(userId1, userId2);

        if (!response?.data?.roomId) {
            throw new Error("Invalid response from server: roomId is missing");
        }

        return response.data.roomId;
    } catch (error) {
        console.error("Error starting chat:", error);
        const axiosError = error as {
            response?: { data?: unknown };
            config?: { url?: string; method?: string; headers?: unknown };
        };
        // Log response data if available
        if (axiosError?.response?.data) {
            console.error("Backend error response:", JSON.stringify(axiosError.response.data, null, 2));
        }
        // Log request details
        if (axiosError?.config) {
            console.error("Request config:", {
                url: axiosError.config.url,
                method: axiosError.config.method,
                headers: axiosError.config.headers,
            });
        }
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
