"use client";

import Pagination from "@/components/client/Pagination";
import { useProductStore } from "@/stores/useProductsStores";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { Category } from "@/types";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Utensils } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FoodCard } from "./FoodCard";
import { FoodCardSkeleton } from "./FoodCardSkeleton";
import { RestaurantCard } from "./RestaurantCard";
import { RestaurantCardSkeleton } from "./RestaurantCardSkeleton";

const categoryIcons: { [key: string]: string } = {
        Burger: "🍔",
        Pizza: "🍕",
        Sandwiches: "🥪",
        Wings: "🍗",
        Coffee: "☕",
        Tea: "🍵",
        Indian: "🍛",
        Chinese: "🥡",
        Thai: "🍜",
        American: "🇺🇸",
        Mexican: "🌮",
        Japanese: "🍣",
        // Thêm các category khác nếu cần
};

export default function RestaurantList() {
        const searchParams = useSearchParams();
        const pathname = usePathname();
        const router = useRouter();
        const activeCategory = searchParams.get("category") || "";
        const scrollContainerRef = useRef<HTMLDivElement>(null);
        const ITEMS_PER_PAGE = 9;
        const { restaurants, getAllRestaurants, loading, categories, getAllCategories } = useRestaurantStore();
        const { fetchAllProducts, products, loading: productsLoading } = useProductStore();
        const searchType = searchParams.get("type") || "restaurants";

        // Layout state with localStorage persistence (only for food items)
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
                if (searchType === "restaurants") {
                        getAllRestaurants(params);
                } else if (searchType === "foods") {
                        params.set("lat", "10.7626");
                        params.set("lon", "106.6825");
                        fetchAllProducts(params);
                }
                getAllCategories();
        }, [getAllRestaurants, getAllCategories, fetchAllProducts, searchType, searchParams]);

        const handleCategoryClick = (categoryName: string) => {
                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                if (activeCategory === categoryName) {
                        currentParams.delete("category");
                } else {
                        currentParams.set("category", categoryName);
                }
                router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
        };

        const handleScroll = (scrollOffset: number) => {
                if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
                }
        };

        const items = searchType === "restaurants" ? restaurants : products;
        const totalResults = items.length;
        const title = searchType === "restaurants" ? "Restaurants" : "Food Items";

        return (
                <div>
                        {/* --- Explore by Category --- */}
                        <div className="mb-12">
                                <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold">Explore by category</h2>
                                        <a href="#" className="text-sm font-semibold text-brand-purple hover:underline">
                                                View All
                                        </a>
                                </div>

                                <div className="flex items-center gap-2">
                                        {/* Nút cuộn trái */}
                                        <button
                                                title="Scroll left"
                                                onClick={() => handleScroll(-300)}
                                                className="p-2 rounded-full bg-white shadow-md cursor-pointer hidden md:block hover:bg-gray-100 transition-colors"
                                        >
                                                <ChevronLeft className="w-6 h-6" />
                                        </button>

                                        {/* Thanh cuộn */}
                                        <div
                                                ref={scrollContainerRef}
                                                className="flex-grow flex items-center gap-4 overflow-x-auto scrollbar-hide"
                                        >
                                                {categories.map((category: Category) => (
                                                        <button
                                                                key={category.cateName}
                                                                onClick={() => handleCategoryClick(category.cateName)}
                                                                className={`cursor-pointer capitalize flex flex-col items-center justify-center gap-2 flex-shrink-0 w-24 h-24 text-center p-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 ${
                                                                        activeCategory === category.cateName
                                                                                ? "bg-brand-purple text-white shadow-lg"
                                                                                : "bg-white hover:bg-gray-50 shadow-sm border"
                                                                }`}
                                                        >
                                                                <span className="text-3xl">
                                                                        {categoryIcons[
                                                                                category.cateName
                                                                                        .charAt(0)
                                                                                        .toUpperCase() +
                                                                                        category.cateName.slice(1)
                                                                        ] || <Utensils />}
                                                                </span>
                                                                <span className="text-sm font-semibold truncate w-full">
                                                                        {category.cateName}
                                                                </span>
                                                        </button>
                                                ))}
                                        </div>

                                        {/* Nút cuộn phải */}
                                        <button
                                                title="Scroll right"
                                                onClick={() => handleScroll(300)}
                                                className="p-2 rounded-full bg-white shadow-md cursor-pointer hidden md:block hover:bg-gray-100 transition-colors"
                                        >
                                                <ChevronRight className="w-6 h-6" />
                                        </button>
                                </div>
                        </div>

                        {/* --- List Header & Layout Toggle --- */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h2 className="text-xl font-bold">
                                        {loading || productsLoading ? (
                                                <span className="inline-block h-6 w-32 bg-gray-200 rounded animate-pulse"></span>
                                        ) : (
                                                `${totalResults} ${title} Found`
                                        )}
                                </h2>

                                {/* Layout Toggle - Only show for food items */}
                                {searchType === "foods" && !loading && !productsLoading && items && items.length > 0 && (
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
                        {(loading || productsLoading) && (
                                <div
                                        className={`grid gap-6 ${
                                                searchType === "restaurants"
                                                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                        }`}
                                >
                                        {Array.from({ length: 6 }).map((_, index) =>
                                                searchType === "restaurants" ? (
                                                        <RestaurantCardSkeleton key={`restaurant-skeleton-${index}`} />
                                                ) : (
                                                        <FoodCardSkeleton key={`food-skeleton-${index}`} />
                                                )
                                        )}
                                </div>
                        )}

                        {/* Content when loaded */}
                        {!loading && !productsLoading && items && items.length > 0 && (
                                <>
                                        <div
                                                className={`transition-[grid-template-columns,gap,flex-direction] duration-500 ease-in-out ${
                                                        isTransitioning ? "opacity-70" : "opacity-100"
                                                } ${
                                                        searchType === "restaurants"
                                                                ? `grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
                                                                : foodLayout === "grid"
                                                                ? `grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
                                                                : `flex flex-col gap-4`
                                                }`}
                                        >
                                                {searchType === "restaurants"
                                                        ? restaurants.map((restaurant) => (
                                                                  <RestaurantCard
                                                                          key={restaurant.id}
                                                                          restaurant={restaurant}
                                                                  />
                                                          ))
                                                        : products.map((product) => (
                                                                  <FoodCard
                                                                          key={product.id}
                                                                          product={product}
                                                                          layout={foodLayout}
                                                                  />
                                                          ))}
                                        </div>
                                        <Pagination
                                                currentPage={Number(searchParams.get("page")) || 1}
                                                totalPages={Math.ceil(totalResults / ITEMS_PER_PAGE)}
                                                showInfo={true}
                                                scrollToTop={true}
                                        />
                                </>
                        )}

                        {/* Empty state */}
                        {!loading && !productsLoading && (!items || items.length === 0) && (
                                <div className="text-center py-12">
                                        <p className="text-gray-500 text-lg">No {title} found. Try adjusting your filters.</p>
                                </div>
                        )}
                </div>
        );
}
