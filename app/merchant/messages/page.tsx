"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChatClient from "@/components/client/Chat/ChatClient";
import { chatApi } from "@/lib/api/chatApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { ChatRoom } from "@/types";
import { Loader2, MessageCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function MerchantMessagesPageInner() {
    const { user, isAuthenticated } = useAuthStore();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const initialRoomId = searchParams.get("roomId");

    useEffect(() => {
        const loadRooms = async () => {
            if (!user?.id || user.id.trim() === "") {
                setRooms([]);
                setIsLoading(false);
                return;
            }

            try {
                const response = await chatApi.getAllRoomsByUserId(user.id);
                setRooms(response.data?.content || []);
            } catch (error) {
                const axiosError = error as { response?: { status?: number } };
                if (axiosError?.response?.status === 404) {
                    setRooms([]);
                } else {
                    console.error("Error loading merchant chat rooms:", error);
                    setRooms([]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadRooms();
    }, [user?.id]);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Chat with customers and staff</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                    <MessageCircle className="h-4 w-4 text-brand-purple" />
                    <span className="font-medium">Merchant Inbox</span>
                </div>
            </div>

            {!isAuthenticated || !user ? (
                <div className="flex items-center justify-center h-[600px] rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Please log in to use chat</p>
                </div>
            ) : isLoading ? (
                <div className="flex items-center justify-center h-[600px]">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                </div>
            ) : (
                <ChatClient initialRooms={rooms} currentUserId={user.id} initialRoomId={initialRoomId} />
            )}
        </div>
    );
}

export default function MerchantMessagesPage() {
    return (
        <ProtectedRoute allowedRoles={["MERCHANT"]}>
            <Suspense
                fallback={
                    <div className="flex items-center justify-center h-[600px]">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                    </div>
                }
            >
                <MerchantMessagesPageInner />
            </Suspense>
        </ProtectedRoute>
    );
}
