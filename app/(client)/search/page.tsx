"use client";

import { CompactFoodCard } from "@/components/client/HomePage/CompactFoodCard";
import { CompactFoodCardSkeleton } from "@/components/client/HomePage/CompactFoodCardSkeleton";
import SearchFilters from "@/components/client/search/SearchFilters";
import SearchSortBar from "@/components/client/search/SearchSortBar";
import { useProductStore } from "@/stores/useProductsStores";
import { Filter } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const { fetchAllProducts, products, loading: productsLoading } = useProductStore();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const query = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "relevance";

    useEffect(() => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set("type", "foods");
        
        // Set location for distance calculation
        params.set("lat", "10.7626");
        params.set("lon", "106.6825");

        // Add search query if present
        if (query) {
            params.set("search", query);
        }

        // Map sort options to API params
        if (sort === "rating") {
            params.set("order", "desc");
        } else if (sort === "popular") {
            // Assuming API supports popularity sort
            params.set("order", "desc");
        }

        // Map price range filter
        const priceRange = searchParams.get("priceRange");
        if (priceRange) {
            const [min, max] = priceRange.split("-");
            if (min) {
                // Convert VND to USD (assuming 1 USD = 25,000 VND)
                const minUSD = parseInt(min) / 25000;
                params.set("minPrice", minUSD.toString());
            }
            if (max && max !== "+") {
                const maxUSD = parseInt(max) / 25000;
                params.set("maxPrice", maxUSD.toString());
            }
        }

        // Map rating filter
        const rating = searchParams.get("rating");
        if (rating) {
            params.set("rating", rating);
        }

        fetchAllProducts(params);
    }, [fetchAllProducts, searchParams, sort, query]);

    // Filter products based on URL params (client-side filtering for additional filters)
    const filteredProducts = useMemo(() => {
        // Use API data from store
        const productsToUse = products;
        
        let result = [...productsToUse];

        // Filter by category
        const categories = searchParams.getAll("category");
        if (categories.length > 0) {
            result = result.filter((product) =>
                categories.includes(product.categoryName)
            );
        }

        // Filter by rating
        const rating = searchParams.get("rating");
        if (rating) {
            const minRating = parseFloat(rating);
            result = result.filter((product) => product.rating >= minRating);
        }

        // Filter by special filters
        const specialFilters = searchParams.getAll("special");
        if (specialFilters.includes("favorite")) {
            result = result.filter((product) => product.rating >= 4.5 || product.totalReview > 50);
        }

        // Sort products
        if (sort === "rating") {
            result.sort((a, b) => b.rating - a.rating);
        } else if (sort === "popular") {
            result.sort((a, b) => (b.totalReview || 0) - (a.totalReview || 0));
        } else if (sort === "distance") {
            // Distance sorting would be handled by API
            // Just maintain current order
        }

        return result;
    }, [searchParams, sort]);

    const totalResults = filteredProducts.length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="custom-container py-6">
                {/* Mobile Filter Button */}
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                {/* Mobile Filter Drawer */}
                {isFilterOpen && (
                    <SearchFilters isMobile={true} onClose={() => setIsFilterOpen(false)} />
                )}

                {/* Main Content - 2 Column Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar - Desktop Only */}
                    <div className="hidden lg:block">
                        <SearchFilters />
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 min-w-0">
                        {/* Search Results Header */}
                        <div className="mb-4">
                            {query ? (
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Search results for &quot;{query}&quot;
                                </h1>
                            ) : (
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    All Food Items
                                </h1>
                            )}
                            <p className="text-sm text-gray-500">
                                {productsLoading
                                    ? "Loading..."
                                    : `${totalResults} ${totalResults === 1 ? 'result' : 'results'} found`}
                            </p>
                        </div>

                        {/* Sort Bar */}
                        <SearchSortBar />

                        {/* Results Grid */}
                        {productsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <CompactFoodCardSkeleton key={`skeleton-${index}`} />
                                ))}
                            </div>
                        ) : filteredProducts && filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.slice(0, 12).map((product) => (
                                    <CompactFoodCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-lg">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        No results found
                                    </h3>
                                    <p className="text-gray-500 text-sm max-w-md mb-6">
                                        {query
                                            ? `No food items found for &quot;${query}&quot;. Try searching with different keywords.`
                                            : "No food items match your filters."}
                                    </p>
                                    <button
                                        onClick={() => {
                                            const currentParams = new URLSearchParams();
                                            if (query) currentParams.set("q", query);
                                            window.location.href = `/search?${currentParams.toString()}`;
                                        }}
                                        className="px-6 py-3 bg-[#EE4D2D] text-white rounded-lg font-semibold hover:bg-[#EE4D2D]/90 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

