"use client";

import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { Category } from "@/types";
import { ChevronLeft, ChevronRight, Utensils } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Pagination from "../Pagination";
import { RestaurantCard } from "./RestaurantCard";

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

        useEffect(() => {
                getAllRestaurants();
                getAllCategories();
        }, [getAllRestaurants, getAllCategories]);

        if (loading) return <p>Đang tải...</p>;
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
                                                                key={category.id}
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

                        {/* --- List Header & Grid --- */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h2 className="text-xl font-bold">{restaurants.length} Restaurants Found</h2>
                                {/* Sort By Dropdown */}
                        </div>
                        {restaurants && restaurants.length > 0 ? (
                                <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                                                {restaurants.map((restaurant) => (
                                                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                                                ))}
                                        </div>
                                        <Pagination totalResults={restaurants.length} itemsPerPage={ITEMS_PER_PAGE} />
                                </>
                        ) : (
                                <p>No restaurants found. Try adjusting your filters.</p>
                        )}
                </div>
        );
}
