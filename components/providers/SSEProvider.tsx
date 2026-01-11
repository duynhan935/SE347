"use client";

import { useSSE } from "@/lib/hooks/useSSE";
import { useAuthStore } from "@/stores/useAuthStore";
import { ReactNode } from "react";

interface SSEProviderProps {
        children: ReactNode;
}

/**
 * SSE Provider - Manages SSE connection for order notifications
 * - Connects when user is authenticated
 * - Disconnects when user logs out
 * - Handles order accepted/rejected notifications via SSE
 */
export default function SSEProvider({ children }: SSEProviderProps) {
        const { user, isAuthenticated } = useAuthStore();
        
        // Connect to SSE for order notifications
        useSSE({
                userId: user?.id || null,
                isAuthenticated,
        });

        return <>{children}</>;
}

