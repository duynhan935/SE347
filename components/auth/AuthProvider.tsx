"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
        const [isInitialized, setIsInitialized] = useState(false);
        const initializeAuth = useAuthStore((state) => state.initializeAuth);
        const loading = useAuthStore((state) => state.loading);

        useEffect(() => {
                const init = async () => {
                        // Always call initializeAuth - it will check for tokens internally
                        await initializeAuth();
                        setIsInitialized(true);
                };
                init();
        }, [initializeAuth]);

        // Show loading while initializing auth or fetching user profile
        if (!isInitialized || loading) {
                return (
                        <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
                        </div>
                );
        }

        return <>{children}</>;
}
