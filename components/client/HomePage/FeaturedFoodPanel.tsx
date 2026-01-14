"use client";

import { useProductStore } from "@/stores/useProductsStores";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CompactFoodCard } from "./CompactFoodCard";
import { CompactFoodCardSkeleton } from "./CompactFoodCardSkeleton";

export default function FeaturedFoodPanel() {
    const searchParams = useSearchParams();
    const { fetchAllProducts, products, loading: productsLoading } = useProductStore();

    useEffect(() => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set("type", "foods");
        // Set location for distance calculation
        params.set("lat", "10.7626");
        params.set("lon", "106.6825");
        // Sort by rating descending để lấy món nổi bật
        params.set("order", "desc");
        fetchAllProducts(params);
    }, [fetchAllProducts, searchParams]);

    // Use API data from store
    const productsToUse = products;

    // Filter và sort để lấy món ăn nổi bật
    const featuredProducts = useMemo(() => {
        if (!productsToUse || productsToUse.length === 0) return [];

        // Sort theo tiêu chí "nổi bật":
        // 1. Rating cao (>= 4.0)
        // 2. Nhiều đánh giá (> 20 reviews)
        // 3. Sắp xếp theo rating giảm dần, sau đó theo số lượng đánh giá
        return [...productsToUse]
            .filter((product) => {
                // Chỉ lấy món có rating >= 4.0 hoặc có nhiều đánh giá
                return (product.rating >= 4.0 && product.rating > 0) || product.totalReview > 20;
            })
            .sort((a, b) => {
                // Sort theo rating giảm dần
                if (b.rating !== a.rating) {
                    return b.rating - a.rating;
                }
                // Nếu rating bằng nhau, sort theo số lượng đánh giá giảm dần
                return (b.totalReview || 0) - (a.totalReview || 0);
            })
            .slice(0, 12); // Lấy 12 món nổi bật nhất
    }, [productsToUse]);

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 w-full h-full flex flex-col">
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    Món ăn nổi bật
                </h2>
                <p className="text-sm text-gray-500">
                    {productsLoading ? "Đang tải..." : `${featuredProducts.length} món ăn nổi bật`}
                </p>
            </div>

            {/* Food Grid - Responsive Layout */}
            {productsLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <CompactFoodCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            ) : featuredProducts && featuredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
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
                        Chưa có món ăn nổi bật
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
                        Hôm nay chưa có món này, thử tìm món khác nhé?
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/restaurants"
                            className="px-6 py-3 bg-[#EE4D2D] text-white rounded-lg font-semibold hover:bg-[#EE4D2D]/90 transition-colors text-center shadow-md hover:shadow-lg"
                        >
                            Xem tất cả nhà hàng
                        </Link>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                        >
                            Xóa bộ lọc
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

