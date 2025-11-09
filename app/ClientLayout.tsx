"use client";

import AuthProvider from "@/components/auth/AuthProvider";
import Footer from "@/components/layout/client/Footer";
import Header from "@/components/layout/client/Header";
import { usePathname } from "next/navigation";
import React from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
        const pathname = usePathname();
        const isMerchant = pathname.includes("merchant");

        return (
                <AuthProvider>
                        {!isMerchant && <Header />}
                        <main>{children}</main>
                        {!isMerchant && <Footer />}
                </AuthProvider>
        );
}
