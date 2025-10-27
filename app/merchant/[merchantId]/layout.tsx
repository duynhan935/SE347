"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
        const router = useRouter();
        const params = useParams();
        const merchantIdFromUrl = "testmerchantid";
        const { user, isAuthenticated } = useAuthStore();
        const [isVerified, setIsVerified] = useState(true);

        useEffect(() => {
                if (!isAuthenticated) {
                        console.log("Merchant Layout: Not authenticated, redirecting...");
                        router.push("/login");
                } else if (user?.role !== "MERCHANT" || user?.id !== merchantIdFromUrl) {
                        console.error("Merchant Layout: Access Denied! Role mismatch or ID mismatch.");
                        router.push("/access-denied");
                } else {
                        setIsVerified(true);
                }
        }, [isAuthenticated, user, merchantIdFromUrl, router]);

        if (!isVerified && isAuthenticated) {
                return (
                        <div className="flex justify-center items-center h-screen bg-gray-100">
                                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                                <p className="ml-4 text-lg">Verifying Access...</p>
                        </div>
                );
        }

        // Only render children if verified
        if (!isVerified) {
                return null;
        }

        return (
                <div className="flex min-h-screen bg-gray-100">
                        <div className="flex-1 flex flex-col">
                                <main className="flex-1 p-4 md:p-6">
                                        <Toaster position="top-center" />
                                        {children}
                                </main>
                        </div>
                </div>
        );
}
