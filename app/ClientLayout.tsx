"use client";

import AuthProvider from "@/components/auth/AuthProvider";
import Header from "@/components/header/Header";
import Footer from "@/components/layout/client/Footer";
import { usePathname } from "next/navigation";
import React from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
        const pathname = usePathname();
        const isMerchant = pathname.includes("merchant");

        return (
                <AuthProvider>
                        {!isMerchant && <Header />}
                        <main className="pt-16 lg:pt-20 bg-brand-white min-h-screen">{children}</main>
                        {!isMerchant && <Footer />}
                </AuthProvider>
        );
}
