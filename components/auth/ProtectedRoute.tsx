"use client";

import { getRoleBasedRedirectPath, shouldRedirectFromPath } from "@/lib/utils/redirectUtils";
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
        const { isAuthenticated, user, loading, isLoggingOut } = useAuthStore();
        const router = useRouter();
        const pathname = usePathname();

        useEffect(() => {
                setMounted(true);
        }, []);

        useEffect(() => {
                if (!mounted) return;
                if (!requireAuth) return;

                // Check if tokens exist immediately (client-side only)
                const hasTokens =
                        typeof window !== "undefined" &&
                        (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));

                // Fast path: If not loading and definitely not authenticated (no tokens and not authenticated)
                // Redirect immediately without delay
                if (!loading && !isAuthenticated && !hasTokens) {
                        // Don't show toast if user is logging out (to avoid duplicate toasts)
                        if (!isLoggingOut) {
                                toast.error("Please login to access this page");
                        }
                        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                        return;
                }

                // Check role permissions immediately if authenticated
                if (!loading && isAuthenticated && allowedRoles && user?.role) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if (!allowedRoles.includes(user.role as any)) {
                                toast.error("You don't have permission to access this page");
                                // Redirect to role-based dashboard instead of home
                                const redirectPath = getRoleBasedRedirectPath(user.role);
                                router.push(redirectPath);
                                return;
                        }
                }

                // Check if user should be redirected away from current path (e.g., Merchant/Admin on home page)
                if (!loading && isAuthenticated && user?.role) {
                        const { shouldRedirect, redirectTo } = shouldRedirectFromPath(pathname, user.role);
                        if (shouldRedirect) {
                                router.replace(redirectTo);
                                return;
                        }
                }

                // Only delay if auth is still loading and tokens exist (might be initializing)
                // This handles the case where auth store is still initializing from localStorage
                if (loading && hasTokens) {
                        // Wait for auth initialization to complete
                        const checkAuth = setTimeout(() => {
                                // This will re-run the effect when loading changes
                        }, 100); // Small delay only for initialization check

                        return () => clearTimeout(checkAuth);
                }
        }, [mounted, isAuthenticated, user, loading, allowedRoles, requireAuth, router, pathname, isLoggingOut]);

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
