// File: app/page.tsx
"use client";

import FeaturedFoodPanel from "@/components/client/HomePage/FeaturedFoodPanel";
import HeroSearchSection from "@/components/client/HomePage/HeroSearchSection";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { shouldRedirectFromPath } from "@/lib/utils/redirectUtils";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function HomePage() {
        const router = useRouter();
        const pathname = usePathname();
        const { user, isAuthenticated, loading } = useAuthStore();

        // Redirect Merchant/Admin away from home page
        useEffect(() => {
                if (!loading && isAuthenticated && user?.role) {
                        const { shouldRedirect, redirectTo } = shouldRedirectFromPath(pathname, user.role);
                        if (shouldRedirect) {
                                router.replace(redirectTo);
                        }
                }
        }, [loading, isAuthenticated, user?.role, pathname, router]);

        return (
                <main className="h-[calc(100vh-80px)] overflow-hidden">
                        {/* Split-Hero Layout: Left (Search) + Right (Food Panel) */}
                        <div className="flex h-full items-stretch">
                                {/* Left Column: Hero Search Section - 40% width */}
                                <div className="w-full lg:w-[40%] relative h-full flex-shrink-0">
                                        <HeroSearchSection />
                                </div>

                                {/* Right Column: Featured Food Panel - 60% width */}
                                <div className="hidden lg:flex w-[60%] h-full overflow-y-auto scrollbar-hide bg-gray-50 flex-shrink-0">
                                        <div className="w-full flex items-start justify-center ">
                                                <div className="w-full max-w-5xl">
                                                        <Suspense fallback={<GlobalLoader label="Loading" sublabel="Loading food list" />}>
                                                                <FeaturedFoodPanel />
                                                        </Suspense>
                                                </div>
                                        </div>
                                </div>

                                {/* Mobile: Right Column below Left */}
                                <div className="lg:hidden w-full h-auto overflow-y-auto scrollbar-hide bg-gray-50">
                                        <div className="w-full p-4">
                                                <Suspense fallback={<GlobalLoader label="Loading" sublabel="Loading food list" />}>
                                                        <FeaturedFoodPanel />
                                                </Suspense>
                                        </div>
                                </div>
                        </div>
                </main>
        );
}
