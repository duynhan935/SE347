"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
        const [isInitialized, setIsInitialized] = useState(false);
        const [showLoading, setShowLoading] = useState(true);
        const initializeAuth = useAuthStore((state) => state.initializeAuth);
        const loading = useAuthStore((state) => state.loading);

        useEffect(() => {
                let timeoutId: NodeJS.Timeout;

                const init = async () => {
                        try {
                                // Start auth initialization but don't block UI immediately
                                const authPromise = initializeAuth();

                                // Show loading screen for at least 300ms for smooth UX
                                const minLoadingTime = new Promise((resolve) => {
                                        timeoutId = setTimeout(resolve, 300);
                                });

                                // Wait for both auth and minimum loading time
                                await Promise.all([authPromise, minLoadingTime]);
                        } catch (err) {
                                console.error("Auth initialization error:", err);
                                // Even if there's an error, we should still set initialized to true
                                // so the app doesn't get stuck in loading state
                        } finally {
                                setIsInitialized(true);
                                // Fade out loading screen smoothly
                                setTimeout(() => {
                                        setShowLoading(false);
                                }, 200);
                        }
                };

                init();

                return () => {
                        if (timeoutId) {
                                clearTimeout(timeoutId);
                        }
                };
        }, [initializeAuth]);

        // Show loading screen only during initial load with smooth transition
        if (!isInitialized || (showLoading && loading)) {
                return (
                        <div className="fixed inset-0 z-50">
                                <LoadingScreen />
                        </div>
                );
        }

        return <>{children}</>;
}
