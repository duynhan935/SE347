"use client";

import { initializeDefaultLocation, useLocationStore } from "@/stores/useLocationStore";
import { useProductStore } from "@/stores/useProductsStores";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { CompactFoodCard } from "./CompactFoodCard";
import { CompactFoodCardSkeleton } from "./CompactFoodCardSkeleton";

export default function FeaturedFoodPanel() {
    const { fetchAllProducts, products, loading: productsLoading } = useProductStore();
    const { currentAddress, isLocationSet } = useLocationStore();

    // Initialize default location if not set
    useEffect(() => {
        if (!isLocationSet || !currentAddress) {
            initializeDefaultLocation();
        }
    }, [isLocationSet, currentAddress]);

    useEffect(() => {
        // Don't fetch products until we have location coordinates
        if (!currentAddress || !isLocationSet) {
            return;
        }

        const params = new URLSearchParams();
        params.set("type", "foods");
        // Set location for distance calculation from current address
        params.set("lat", currentAddress.lat.toString());
        params.set("lon", currentAddress.lng.toString());
        fetchAllProducts(params);
    }, [fetchAllProducts, currentAddress, isLocationSet]);

    // Use API data from store (already ensured to be array by store)
    const productsToUse = products;

    // Get first 12 products
    const featuredProducts = useMemo(() => {
        if (!productsToUse || productsToUse.length === 0) return [];
        return productsToUse.slice(0, 12);
    }, [productsToUse]);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Featured Foods
                </h2>
                <p className="text-sm text-gray-500">
                    {productsLoading ? "Loading..." : `${featuredProducts.length} featured items`}
                </p>
            </div>

            {/* Food Grid - Responsive Layout */}
            {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <CompactFoodCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            ) : featuredProducts && featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {featuredProducts.map((product) => (
                        <CompactFoodCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 min-h-[400px]">
                    {/* Large Illustration */}
                    <div className="mb-6">
                        <svg
                            width="200"
                            height="200"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-gray-300"
                        >
                            <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.1" />
                            <path
                                d="M70 80C70 75.5817 73.5817 72 78 72H122C126.418 72 130 75.5817 130 80V120C130 124.418 126.418 128 122 128H78C73.5817 128 70 124.418 70 120V80Z"
                                fill="currentColor"
                                opacity="0.2"
                            />
                            <circle cx="90" cy="100" r="8" fill="currentColor" opacity="0.3" />
                            <circle cx="110" cy="100" r="8" fill="currentColor" opacity="0.3" />
                            <path
                                d="M85 115C85 113.343 86.3431 112 88 112H112C113.657 112 115 113.343 115 115C115 116.657 113.657 118 112 118H88C86.3431 118 85 116.657 85 115Z"
                                fill="currentColor"
                                opacity="0.3"
                            />
                        </svg>
                    </div>

                    {/* Empty State Content */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        No featured foods available
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
                        No featured items today, try searching for other foods?
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/restaurants"
                            className="px-6 py-3 bg-[#EE4D2D] text-white rounded-lg font-semibold hover:bg-[#EE4D2D]/90 transition-colors text-center shadow-md hover:shadow-lg"
                        >
                            View All Restaurants
                        </Link>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                        >
                            Clear Filters
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

