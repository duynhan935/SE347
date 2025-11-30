"use client";

import AuthProvider from "@/components/auth/AuthProvider";
import Footer from "@/components/layout/client/Footer";
import Header from "@/components/layout/client/Header";
import { usePathname } from "next/navigation";
import React from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
        const pathname = usePathname();
        
        // Check if current path is an admin dashboard (admin, merchant, or manager)
        const isAdminDashboard = pathname.startsWith("/admin") || 
                                 pathname.startsWith("/merchant") || 
                                 pathname.startsWith("/manager");

        return (
                <AuthProvider>
                        {!isAdminDashboard && <Header />}
                        <main>{children}</main>
                        {!isAdminDashboard && <Footer />}
                </AuthProvider>
        );
}
