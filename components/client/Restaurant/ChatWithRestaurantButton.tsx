"use client";

import { startChat } from "@/lib/utils/chatUtils";
import { useAuthStore } from "@/stores/useAuthStore";
import { Loader2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface ChatWithRestaurantButtonProps {
        merchantId: string;
        restaurantName: string;
        variant?: "default" | "outline" | "ghost";
        className?: string;
}

export default function ChatWithRestaurantButton({
        merchantId,
        restaurantName,
        variant = "default",
        className = "",
}: ChatWithRestaurantButtonProps) {
        const { user, isAuthenticated } = useAuthStore();
        const router = useRouter();
        const [isLoading, setIsLoading] = useState(false);
        const [isMounted, setIsMounted] = useState(false);

        // Fix hydration mismatch by only setting disabled state after mount
        useEffect(() => {
                setIsMounted(true);
        }, []);

        const handleChatClick = async () => {
                if (!isAuthenticated || !user?.id) {
                        toast.error("Vui lòng đăng nhập để chat với nhà hàng");
                        router.push("/login");
                        return;
                }

                // Prevent chatting with yourself
                if (user.id === merchantId) {
                        toast.error("Bạn không thể chat với chính mình");
                        return;
                }

                setIsLoading(true);
                try {
                        const roomId = await startChat(user.id, merchantId);
                        // Navigate to chat page with the roomId
                        router.push(`/chat?roomId=${roomId}`);
                } catch (error) {
                        console.error("Error starting chat:", error);
                        toast.error("Không thể tạo phòng chat. Vui lòng thử lại sau.");
                } finally {
                        setIsLoading(false);
                }
        };

        const baseStyles =
                "inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

        const variantStyles = {
                default: "bg-brand-purple text-white hover:bg-brand-purple/90 focus:ring-brand-purple",
                outline: "border-2 border-brand-purple text-brand-purple hover:bg-brand-purple/10 focus:ring-brand-purple",
                ghost: "text-brand-purple hover:bg-brand-purple/10 focus:ring-brand-purple",
        };

        // Ensure disabled is always a boolean to avoid hydration mismatch
        const isDisabled = isMounted ? isLoading || !isAuthenticated : false;

        return (
                <button
                        onClick={handleChatClick}
                        disabled={isDisabled}
                        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
                        aria-label={`Chat with ${restaurantName}`}
                >
                        {isLoading ? (
                                <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Đang tạo phòng chat...</span>
                                </>
                        ) : (
                                <>
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Chat với nhà hàng</span>
                                </>
                        )}
                </button>
        );
}
