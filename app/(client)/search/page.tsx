"use client";

import { CompactFoodCard } from "@/components/client/HomePage/CompactFoodCard";
import { CompactFoodCardSkeleton } from "@/components/client/HomePage/CompactFoodCardSkeleton";
import Pagination from "@/components/client/Pagination";
import SearchFilters from "@/components/client/search/SearchFilters";
import SearchSortBar from "@/components/client/search/SearchSortBar";
import { initializeDefaultLocation, useLocationStore } from "@/stores/useLocationStore";
import { useProductStore } from "@/stores/useProductsStores";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { fetchAllProducts, products, loading: productsLoading, totalPages, totalElements } = useProductStore();
    const { currentAddress, isLocationSet } = useLocationStore();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const query = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "relevance";
    const pageParam = searchParams.get("page");
    const currentPageNumber = pageParam ? parseInt(pageParam, 10) : 1;
    const PAGE_SIZE = 12; // Default page size

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

        // Set location for distance calculation from current address (REQUIRED)
        params.set("lat", currentAddress.lat.toString());
        params.set("lon", currentAddress.lng.toString());

        // Set nearby/distance filter (max distance in meters, default 20000)
        const nearby = searchParams.get("nearby");
        if (nearby && nearby.trim() !== "") {
            params.set("nearby", nearby);
        }

        // Convert category params to comma-separated lowercase string for backend
        const categoryParams = searchParams.getAll("category");
        if (categoryParams.length > 0) {
            // Convert to lowercase and join with comma
            const categoryString = categoryParams.map((cat) => cat.toLowerCase()).join(",");
            params.set("category", categoryString);
        }

        // Add search query if present
        if (query) {
            params.set("search", query);
        }

        // Map sort options to API params (backend expects locationsorted and rating for sorting)
        // Backend: locationsorted="asc" or "desc" for distance sorting
        // Backend: rating="asc" or "desc" for rating sorting
        if (sort === "distance") {
            // Sort by distance ascending (nearest first)
            params.set("locationsorted", "asc");
        } else if (sort === "rating") {
            // Sort by rating descending (highest first)
            params.set("rating", "desc");
        } else if (sort === "popular") {
            // Backend doesn't have popularity sort, use rating descending as fallback
            params.set("rating", "desc");
        }
        // "relevance" or default: no sort parameter, backend will use default sorting

        // Map price range filter (backend expects BigDecimal values)
        const priceRange = searchParams.get("priceRange");
        if (priceRange) {
            const [min, max] = priceRange.split("-");
            if (min) {
                // Price is in USD (from SearchFilters), convert to number
                const minPrice = parseFloat(min);
                if (!isNaN(minPrice)) {
                    params.set("minPrice", minPrice.toString());
                }
            }
            if (max && max !== "+") {
                // Price is in USD, convert to number
                const maxPrice = parseFloat(max);
                if (!isNaN(maxPrice)) {
                    params.set("maxPrice", maxPrice.toString());
                }
            }
        }

        // Add pagination parameters (Spring Boot Pageable uses 0-indexed page, size)
        // Convert 1-indexed page to 0-indexed for backend
        const page = currentPageNumber > 0 ? currentPageNumber - 1 : 0;
        params.set("page", page.toString());
        params.set("size", PAGE_SIZE.toString());

        fetchAllProducts(params);
    }, [fetchAllProducts, searchParams, sort, query, currentAddress, isLocationSet, currentPageNumber]);

    // Filter products based on URL params (client-side filtering for additional filters not supported by backend)
    const filteredProducts = useMemo(() => {
        // Use API data from store (already filtered and sorted by backend)
        let result = [...products];

        // Client-side filtering for special filters that backend doesn't support
        const specialFilters = searchParams.getAll("special");
        if (specialFilters.includes("favorite")) {
            // Filter for highly rated or popular products
            result = result.filter((product) => product.rating >= 4.5 || (product.totalReview || 0) > 50);
        }

        // Note: Rating filter is handled client-side because backend uses 'rating' parameter for sorting, not filtering
        const ratingFilter = searchParams.get("rating");
        if (ratingFilter && sort !== "rating") {
            // Only apply rating filter if not using rating sort (to avoid confusion)
            const minRating = parseFloat(ratingFilter);
            if (!isNaN(minRating)) {
                result = result.filter((product) => (product.rating || 0) >= minRating);
            }
        }

        return result;
    }, [products, searchParams, sort]);

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
                {isFilterOpen && <SearchFilters isMobile={true} onClose={() => setIsFilterOpen(false)} />}

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
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">All Food Items</h1>
                            )}
                            <p className="text-sm text-gray-500">
                                {productsLoading
                                    ? "Loading..."
                                    : totalElements > 0
                                      ? `Showing ${(currentPageNumber - 1) * PAGE_SIZE + 1}-${Math.min(currentPageNumber * PAGE_SIZE, totalElements)} of ${totalElements} ${totalElements === 1 ? "result" : "results"}`
                                      : "No results found"}
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
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredProducts.map((product) => (
                                        <CompactFoodCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <Pagination
                                            currentPage={currentPageNumber}
                                            totalPages={totalPages}
                                            onPageChange={(newPage: number) => {
                                                const currentParams = new URLSearchParams(
                                                    Array.from(searchParams.entries()),
                                                );
                                                if (newPage === 1) {
                                                    currentParams.delete("page");
                                                } else {
                                                    currentParams.set("page", newPage.toString());
                                                }
                                                router.push(`/search?${currentParams.toString()}`, { scroll: false });
                                                // Scroll to top after navigation
                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                            }}
                                            showInfo={true}
                                            scrollToTop={false} // We handle scrolling manually
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-lg">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
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
