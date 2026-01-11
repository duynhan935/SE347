"use client";

import ChatClient from "@/components/client/Chat/ChatClient";
import { chatApi } from "@/lib/api/chatApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { ChatRoom } from "@/types";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ChatPageInner() {
    const { user, isAuthenticated } = useAuthStore();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const initialRoomId = searchParams.get("roomId");

    useEffect(() => {
        const loadRooms = async () => {
            // Validate user.id before making API call
            if (!user?.id || user.id === "testuserid" || user.id.trim() === "") {
                setIsLoading(false);
                setRooms([]);
                return;
            }

            try {
                const response = await chatApi.getAllRoomsByUserId(user.id);
                setRooms(response.data || []);
            } catch (error) {
                // 404 means user has no rooms yet - this is normal
                // Backend returns 404 instead of empty array when no rooms found
                const axiosError = error as { response?: { status?: number } };
                if (axiosError?.response?.status === 404) {
                    // User has no rooms yet - this is normal, not an error
                    setRooms([]);
                } else {
                    console.error("Error loading chat rooms:", error);
                    // Set empty array on error to prevent UI blocking
                    setRooms([]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadRooms();
    }, [user?.id]);

    return (
        <div className="custom-container py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 mt-2">Chat with merchants and other users</p>
            </div>

            {!isAuthenticated || !user ? (
                <div className="flex items-center justify-center h-[600px]">
                    <p className="text-gray-500">Please log in to use chat</p>
                </div>
            ) : isLoading ? (
                <div className="flex items-center justify-center h-[600px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <ChatClient initialRooms={rooms} currentUserId={user.id} initialRoomId={initialRoomId} />
            )}
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense
            fallback={
                <div className="custom-container py-8 flex items-center justify-center h-[600px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            }
        >
            <ChatPageInner />
        </Suspense>
    );
}
