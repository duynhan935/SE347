"use client";

import { getRoleBasedRedirectPath, shouldRedirectFromPath } from "@/lib/utils/redirectUtils";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
    // Track previous authentication state to detect logout while on protected route
    const prevIsAuthenticatedRef = useRef<boolean | null>(null);
    const hasRedirectedRef = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Listen for localStorage changes (handles multi-tab logout scenarios)
    useEffect(() => {
        if (!mounted || !requireAuth || typeof window === "undefined") return;

        const handleStorageChange = (e: StorageEvent) => {
            // If tokens were removed in another tab, check authentication state
            if ((e.key === "accessToken" || e.key === "refreshToken") && !e.newValue) {
                const hasTokens = localStorage.getItem("accessToken") || localStorage.getItem("refreshToken");

                // If no tokens exist and we're on a protected route, redirect
                if (!hasTokens && !isLoggingOut) {
                    const currentAuth = useAuthStore.getState().isAuthenticated;
                    // If store still thinks we're authenticated but tokens are gone, sync state
                    if (currentAuth) {
                        useAuthStore.getState().logout();
                    } else if (!currentAuth && !hasRedirectedRef.current) {
                        hasRedirectedRef.current = true;
                        toast.error("Your session has expired. Please sign in again.");
                        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                    }
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [mounted, requireAuth, router, pathname, isLoggingOut]);

    useEffect(() => {
        if (!mounted) return;
        if (!requireAuth) return;

        // Reset redirect flag when authentication state changes
        if (isAuthenticated) {
            hasRedirectedRef.current = false;
        }

        // Detect logout while on protected route
        // If user was authenticated before but now is not, they were logged out
        const wasAuthenticated = prevIsAuthenticatedRef.current === true;
        const isNowUnauthenticated = !isAuthenticated && !loading;

        if (wasAuthenticated && isNowUnauthenticated && !isLoggingOut) {
            // User was logged out while on protected route
            hasRedirectedRef.current = true;
            toast.error("Your session has expired. Please sign in again.");
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        // Update previous authentication state
        if (!loading) {
            prevIsAuthenticatedRef.current = isAuthenticated;
        }

        // Check if tokens exist immediately (client-side only)
        const hasTokens =
            typeof window !== "undefined" &&
            (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));

        // Fast path: If not loading and definitely not authenticated (no tokens and not authenticated)
        // Redirect immediately without delay
        if (!loading && !isAuthenticated && !hasTokens && !hasRedirectedRef.current) {
            // Don't show toast if user is logging out (to avoid duplicate toasts)
            if (!isLoggingOut) {
                toast.error("Please sign in to access this page.");
            }
            hasRedirectedRef.current = true;
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        // Check role permissions immediately if authenticated
        if (!loading && isAuthenticated && allowedRoles && user?.role) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!allowedRoles.includes(user.role as any)) {
                toast.error("You don't have permission to access this page.");
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
