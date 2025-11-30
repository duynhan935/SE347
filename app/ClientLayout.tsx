"use client";

import AuthProvider from "@/components/auth/AuthProvider";
import Header from "@/components/header/Header";
import Footer from "@/components/layout/client/Footer";
import { usePathname } from "next/navigation";
import React from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isMerchant = pathname.includes("merchant");
    const isAdmin = pathname.startsWith("/admin");
    const isManager = pathname.startsWith("/manager");
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

    // Show Header/Footer only for client pages (not admin/manager/merchant)
    const showHeaderFooter = !isMerchant && !isAdmin && !isManager && !isAuthPage;

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
