// File: app/page.tsx
"use client";

import FeaturedFoodPanel from "@/components/client/HomePage/FeaturedFoodPanel";
import HeroSearchSection from "@/components/client/HomePage/HeroSearchSection";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";

export default function HomePage() {
        const router = useRouter();
        const pathname = usePathname();
        const { user, isAuthenticated, loading } = useAuthStore();

        // REMOVED: Allow Merchant/Admin to access home page
        // They can freely switch between buying view and dashboard view

        return (
                <main className="min-h-screen bg-gray-50">
                        {/* 1. HERO SECTION (Full Width) */}
                        <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
                                <HeroSearchSection />
                        </section>

                        {/* 2. FEATURED FOODS SECTION (Container) */}
                        <section className="container mx-auto px-4 py-12 max-w-7xl">
                                <Suspense fallback={<GlobalLoader label="Loading" sublabel="Loading food list" />}>
                                        <FeaturedFoodPanel />
                                </Suspense>
                        </section>
                </main>
        );
}
