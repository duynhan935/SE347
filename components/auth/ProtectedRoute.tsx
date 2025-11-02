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
                // Don't redirect while loading
                if (loading) return;

                // If authentication is required
                if (requireAuth && !isAuthenticated) {
                        toast.error("Please login to access this page");
                        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                        return;
                }

                // If user is authenticated but roles are restricted
                if (requireAuth && isAuthenticated && allowedRoles && user?.role) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if (!allowedRoles.includes(user.role as any)) {
                                toast.error("You don't have permission to access this page");
                                router.push("/");
                                return;
                        }
                }
        }, [mounted, isAuthenticated, user, loading, allowedRoles, requireAuth, router, pathname]);

        // Don't render anything until mounted to avoid hydration mismatch
        if (!mounted) {
                return null;
        }

        // Show loading state while checking auth
        if (loading) {
                return (
                        <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
                        </div>
                );
        }

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
