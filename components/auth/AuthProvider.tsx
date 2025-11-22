"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
        const [isInitialized, setIsInitialized] = useState(false);
        const initializeAuth = useAuthStore((state) => state.initializeAuth);

        useEffect(() => {
                const init = async () => {
                        // Check if tokens exist in localStorage first
                        const hasTokens =
                                typeof window !== "undefined" &&
                                (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));

                        if (hasTokens) {
                                // If tokens exist, initialize in background without blocking
                                initializeAuth().catch(console.error);
                        }

                        // Mark as initialized immediately to allow navigation
                        setIsInitialized(true);
                };
                init();
        }, [initializeAuth]);

        // Don't block navigation - allow app to render immediately
        // Auth will be initialized in background
        return <>{children}</>;
}
