"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
        const [isInitialized, setIsInitialized] = useState(false);
        const initializeAuth = useAuthStore((state) => state.initializeAuth);

        useEffect(() => {
                const init = async () => {
                        try {
                                // Always call initializeAuth - it will check for tokens internally
                                await initializeAuth();
                        } catch (err) {
                                console.error("Auth initialization error:", err);
                                // Even if there's an error, we should still set initialized to true
                                // so the app doesn't get stuck in loading state
                        } finally {
                                setIsInitialized(true);
                        }
                };
                init();
        }, [initializeAuth]);

        // Don't block navigation - allow app to render immediately
        // Auth will be initialized in background
        return <>{children}</>;
}
