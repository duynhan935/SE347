"use client";

import Pagination from "@/components/client/Pagination";
import { useProductStore } from "@/stores/useProductsStores";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { LayoutGrid, List } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FoodCard } from "../restaurants/FoodCard";
import { FoodCardSkeleton } from "../restaurants/FoodCardSkeleton";
import { RestaurantCard } from "../restaurants/RestaurantCard";
import { RestaurantCardSkeleton } from "../restaurants/RestaurantCardSkeleton";
// Sidebar removed for Home page - using split-hero layout instead

const ITEMS_PER_PAGE = 12;

export default function HomeFoodList() {
        const searchParams = useSearchParams();
        const { fetchAllProducts, products, loading: productsLoading } = useProductStore();
        const { getAllRestaurants, restaurants, loading: restaurantsLoading } = useRestaurantStore();
        const searchType = searchParams.get("type") || "foods";

        // Layout state with localStorage persistence
        const [foodLayout, setFoodLayout] = useState<"grid" | "flex">(() => {
                if (typeof window !== "undefined") {
                        const saved = localStorage.getItem("foodCardLayout");
                        return (saved === "grid" || saved === "flex" ? saved : "grid") as "grid" | "flex";
                }
                return "grid";
        });

        // State to handle smooth layout transition
        const [isTransitioning, setIsTransitioning] = useState(false);

        // Save layout preference to localStorage
        useEffect(() => {
                if (typeof window !== "undefined") {
                        localStorage.setItem("foodCardLayout", foodLayout);
                }
        }, [foodLayout]);

        // Handle layout change with smooth transition
        const handleLayoutChange = useCallback((newLayout: "grid" | "flex") => {
                if (newLayout === foodLayout) return;

                setIsTransitioning(true);
                setTimeout(() => {
                        setFoodLayout(newLayout);
                        setTimeout(() => {
                                setIsTransitioning(false);
                        }, 100);
                }, 50);
        }, [foodLayout]);

        useEffect(() => {
                const params = new URLSearchParams(Array.from(searchParams.entries()));
                // Set default type to foods if not specified
                if (!params.get("type")) {
                        params.set("type", "foods");
                }
                
                // Convert category params to comma-separated lowercase string for backend
                const categoryParams = searchParams.getAll("category");
                params.delete("category"); // Remove all category params
                if (categoryParams.length > 0) {
                        // Convert to lowercase and join with comma
                        const categoryString = categoryParams.map(cat => cat.toLowerCase()).join(",");
                        params.set("category", categoryString);
                }
                
                if (searchType === "restaurants") {
                        getAllRestaurants(params);
                } else {
                        // Always set location for distance calculation
                        params.set("lat", "10.7626");
                        params.set("lon", "106.6825");
                        fetchAllProducts(params);
                }
        }, [fetchAllProducts, getAllRestaurants, searchParams, searchType]);

        const items = searchType === "restaurants" ? restaurants : products;
        const totalResults = items.length;
        const currentPage = Number(searchParams.get("page")) || 1;
        const isLoading = searchType === "restaurants" ? restaurantsLoading : productsLoading;

        // Format result text - user friendly
        const getResultText = () => {
                if (isLoading) {
                        return <span className="inline-block h-8 w-48 bg-gray-200 rounded animate-pulse"></span>;
                }
                if (totalResults === 0) {
                        return null; // Will show empty state instead
                }
                if (totalResults === 1) {
                        return `Found 1 ${searchType === "restaurants" ? "restaurant" : "item"} matching`;
                }
                return `Found ${totalResults} ${searchType === "restaurants" ? "restaurants" : "items"} matching`;
        };

        return (
                <div className="bg-[#F5F5F5] min-h-screen">
                        <div className="custom-container py-8">
                                {/* Desktop: 2-column layout, Mobile: Single column */}
                                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                                        {/* Sidebar removed for Home page - only show on other pages */}

                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                                {/* List Header & Layout Toggle */}
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                                        {totalResults > 0 && (
                                                                <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">
                                                                        {getResultText()}
                                                                </h2>
                                                        )}

                                                        {/* Layout Toggle - Only show for foods */}
                                                        {searchType === "foods" && !isLoading && products && products.length > 0 && (
                                                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                                                        <button
                                                                                onClick={() => handleLayoutChange("grid")}
                                                                                disabled={isTransitioning}
                                                                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                                                                        foodLayout === "grid"
                                                                                                ? "bg-brand-purple text-white shadow-sm"
                                                                                                : "text-gray-600 hover:bg-gray-50"
                                                                                } ${isTransitioning ? "opacity-50 cursor-wait" : ""}`}
                                                                                title="Grid Layout"
                                                                        >
                                                                                <LayoutGrid className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                                onClick={() => handleLayoutChange("flex")}
                                                                                disabled={isTransitioning}
                                                                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                                                                        foodLayout === "flex"
                                                                                                ? "bg-brand-purple text-white shadow-sm"
                                                                                                : "text-gray-600 hover:bg-gray-50"
                                                                                } ${isTransitioning ? "opacity-50 cursor-wait" : ""}`}
                                                                                title="List Layout"
                                                                        >
                                                                                <List className="w-4 h-4" />
                                                                        </button>
                                                                </div>
                                                        )}
                                                </div>

                                                {/* Loading state with skeletons */}
                                                {isLoading && (
                                                        <div className={`grid gap-6 ${
                                                                searchType === "restaurants"
                                                                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                                                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                                        }`}>
                                                                {Array.from({ length: 8 }).map((_, index) =>
                                                                        searchType === "restaurants" ? (
                                                                                <RestaurantCardSkeleton key={`restaurant-skeleton-${index}`} />
                                                                        ) : (
                                                                                <FoodCardSkeleton key={`food-skeleton-${index}`} />
                                                                        )
                                                                )}
                                                        </div>
                                                )}

                                                {/* Content when loaded */}
                                                {!isLoading && items && items.length > 0 && (
                                                        <>
                                                                <div
                                                                        className={`transition-[grid-template-columns,gap,flex-direction] duration-500 ease-in-out ${
                                                                                isTransitioning ? "opacity-70" : "opacity-100"
                                                                        } ${
                                                                                searchType === "restaurants"
                                                                                        ? `grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
                                                                                        : foodLayout === "grid"
                                                                                        ? `grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
                                                                                        : `flex flex-col gap-4`
                                                                        }`}
                                                                >
                                                                        {searchType === "restaurants"
                                                                                ? restaurants.map((restaurant) => (
                                                                                          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                                                                                  ))
                                                                                : products.map((product) => (
                                                                                          <FoodCard key={product.id} product={product} layout={foodLayout} />
                                                                                  ))}
                                                                </div>
                                                                <Pagination
                                                                        currentPage={currentPage}
                                                                        totalPages={Math.ceil(totalResults / ITEMS_PER_PAGE)}
                                                                        showInfo={true}
                                                                        scrollToTop={true}
                                                                />
                                                        </>
                                                )}

                                                {/* Empty state - Beautiful with icon */}
                                                {!isLoading && (!items || items.length === 0) && (
                                                        <div className="text-center py-20">
                                                                <div className="flex flex-col items-center justify-center">
                                                                        <div className="text-6xl mb-4">🍽️</div>
                                                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                                                No {searchType === "restaurants" ? "restaurants" : "food items"} in this category
                                                                        </h3>
                                                                        <p className="text-gray-500 text-sm max-w-md">
                                                                                Try searching with different keywords or choose another category to explore more.
                                                                        </p>
                                                                </div>
                                                        </div>
                                                )}
                                        </div>
                                </div>
                        </div>
                </div>
        );
}

