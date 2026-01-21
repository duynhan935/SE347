"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { ThemeProvider } from "@/components/admin/ThemeProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ThemeProvider>
                <div className="dark:bg-gray-900 dark:text-white overflow-x-hidden">
                    <div className="flex h-screen overflow-hidden">
                        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                            <main className="flex-1 bg-gray-50 dark:bg-gray-900">
                                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 xl:p-10">{children}</div>
                            </main>
                        </div>
                    </div>
                </div>
            </ThemeProvider>
        </ProtectedRoute>
    );
}
