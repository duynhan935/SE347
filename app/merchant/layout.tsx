"use client";

import Header from "@/components/admin/Header";
import { ThemeProvider } from "@/components/admin/ThemeProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MerchantSidebar from "@/components/merchant/MerchantSidebar";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Exclude register page from merchant protection (it's public for registration)
    if (pathname === "/merchant/register") {
        return <>{children}</>;
    }

    // Protect all other merchant routes - only MERCHANT role can access
    return (
        <ProtectedRoute allowedRoles={["MERCHANT"]}>
            <ThemeProvider>
                <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
                    <MerchantSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
                            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 xl:p-10">{children}</div>
                        </main>
                    </div>
                </div>
            </ThemeProvider>
        </ProtectedRoute>
    );
}
