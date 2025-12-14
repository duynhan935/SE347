"use client";

import { ThemeProvider } from "@/components/admin/ThemeProvider";
import MerchantSidebar from "@/components/merchant/MerchantSidebar";
import Header from "@/components/admin/Header";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState } from "react";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ProtectedRoute allowedRoles={["MERCHANT"]}>
            <ThemeProvider>
                <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
                    <MerchantSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
                            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">{children}</div>
                        </main>
                    </div>
                </div>
            </ThemeProvider>
        </ProtectedRoute>
    );
}
