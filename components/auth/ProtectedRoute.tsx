"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ProtectedRouteProps {
        children: React.ReactNode;
        allowedRoles?: ("ADMIN" | "MERCHANT" | "USER")[];
        requireAuth?: boolean;
}

export default function ProtectedRoute({ children, allowedRoles, requireAuth = true }: ProtectedRouteProps) {
        const [mounted, setMounted] = useState(false);
        const { isAuthenticated, user, loading } = useAuthStore();
        const router = useRouter();
        const pathname = usePathname();

        useEffect(() => {
                setMounted(true);
        }, []);

        useEffect(() => {
                if (!mounted) return;

                // Check auth in background without blocking
                // Use a longer delay to allow auth initialization to complete
                const checkAuth = setTimeout(() => {
                        // If authentication is required
                        if (requireAuth && !loading && !isAuthenticated) {
                                // Check if tokens exist - if yes, might still be loading or initializing
                                const hasTokens =
                                        typeof window !== "undefined" &&
                                        (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));

                                // Only redirect if definitely not authenticated and no tokens
                                // Give more time for auth initialization to complete
                                if (!hasTokens) {
                                        toast.error("Please login to access this page");
                                        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                                }
                                return;
                        }

                        // If user is authenticated but roles are restricted
                        if (requireAuth && !loading && isAuthenticated && allowedRoles && user?.role) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                if (!allowedRoles.includes(user.role as any)) {
                                        toast.error("You don't have permission to access this page");
                                        router.push("/");
                                        return;
                                }
                        }
                }, 500); // Longer delay to allow auth initialization to complete

                return () => clearTimeout(checkAuth);
        }, [mounted, isAuthenticated, user, loading, allowedRoles, requireAuth, router, pathname]);

        // Don't render anything until mounted to avoid hydration mismatch
        if (!mounted) {
                return null;
        }

        // Don't block with loading spinner - allow content to render
        // Auth check happens in background

        // If auth is required but user is not authenticated
        if (requireAuth && !isAuthenticated) {
                return null;
        }

        // If roles are restricted and user doesn't have permission
        if (requireAuth && isAuthenticated && allowedRoles && user?.role) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (!allowedRoles.includes(user.role as any)) {
                        return null;
                }
        }

        return <>{children}</>;
}
