"use client";

import AuthProvider from "@/components/auth/AuthProvider";
import Header from "@/components/header/Header";
import Footer from "@/components/layout/client/Footer";
import { useCartSync } from "@/lib/hooks/useCartSync";
import { usePathname } from "next/navigation";
import React from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isMerchant = pathname.includes("merchant");
    const isAdmin = pathname.startsWith("/admin");
    // All auth-related pages (login, register, verify-email, etc.) should not show the main header/footer
    const authPaths = ["/login", "/register", "/verify-email", "/confirm", "/login-success"];
    const isAuthPage = authPaths.includes(pathname);

    // Sync cart with user authentication
    useCartSync();

    // Show Header/Footer only for client pages (not admin/merchant)
    const showHeaderFooter = !isMerchant && !isAdmin && !isAuthPage;

    // Apply padding-top only for client pages with header
    const mainClassName = showHeaderFooter
        ? "pt-16 lg:pt-20 bg-brand-white min-h-screen"
        : "bg-brand-white min-h-screen";

    return (
        <AuthProvider>
            {showHeaderFooter && <Header />}
            <main className={mainClassName}>{children}</main>
            {showHeaderFooter && <Footer />}
        </AuthProvider>
    );
}
