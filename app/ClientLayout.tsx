"use client";

import AuthProvider from "@/components/auth/AuthProvider";
import Header from "@/components/header/Header";
import Footer from "@/components/layout/client/Footer";
import ChatProvider from "@/components/providers/ChatProvider";
import SSEProvider from "@/components/providers/SSEProvider";
import ConfirmProvider from "@/components/ui/ConfirmModal";
import { useCartSync } from "@/lib/hooks/useCartSync";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
        const pathname = usePathname();
        const router = useRouter();
        const { user, isAuthenticated, loading } = useAuthStore();
        const isMerchant = pathname.includes("merchant");
        const isAdmin = pathname.startsWith("/admin");
        const isManager = pathname.startsWith("/manager");
        // All auth-related pages (login, register, verify-email, etc.) should not show the main header/footer
        const authPaths = ["/login", "/register", "/verify-email", "/confirm", "/login-success"];
        const isAuthPage = authPaths.includes(pathname);

        // Sync cart with user authentication
        useCartSync();

        // REMOVED: Allow Merchant/Admin to access client pages (home, search, restaurants, etc.)
        // They can freely switch between buying view and dashboard view
        // Only redirect if they try to access unauthorized routes (e.g., Merchant accessing /admin)

        // Show Header/Footer only for client pages (not admin/manager/merchant)
        const showHeaderFooter = !isMerchant && !isAdmin && !isManager && !isAuthPage;

        // No padding-top needed since Header is sticky (not fixed)
        const mainClassName = "bg-gray-50";

        return (
                <AuthProvider>
                        <ConfirmProvider>
                                <SSEProvider>
                                        <ChatProvider>
                                                {showHeaderFooter && <Header />}
                                                <main className={mainClassName}>{children}</main>
                                                {showHeaderFooter && <Footer />}
                                        </ChatProvider>
                                </SSEProvider>
                        </ConfirmProvider>
                </AuthProvider>
        );
}
