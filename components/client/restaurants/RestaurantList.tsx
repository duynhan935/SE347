"use client";

import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Pagination from "../Pagination";
import { RestaurantCard } from "./RestaurantCard";

const fakeCategories = [
        { name: "Burger", icon: "🍔" },
        { name: "Pizza", icon: "🍕" },
        { name: "Sandwiches", icon: "🥪" },
        { name: "Wings", icon: "🍗" },
        { name: "Coffee", icon: "☕" },
        { name: "Tea", icon: "☕" },
        { name: "Indian", icon: "🍛" },
        { name: "Chinese", icon: "🥡" },
        { name: "Thai", icon: "🍜" },
        { name: "American", icon: "🇺🇸" },
];

export default function RestaurantList() {
        const searchParams = useSearchParams();
        const pathname = usePathname();
        const router = useRouter();
        const activeCategory = searchParams.get("category") || "";
        const scrollContainerRef = useRef<HTMLDivElement>(null);
        const ITEMS_PER_PAGE = 9;
        const { restaurants, getAllRestaurants, loading } = useRestaurantStore();

        useEffect(() => {
                getAllRestaurants();
        }, [getAllRestaurants]);

        if (loading) return <p>Đang tải...</p>;
        console.log(restaurants);
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
                                                {fakeCategories.map((category, index) => (
                                                        <button
                                                                key={index}
                                                                onClick={() => handleCategoryClick(category.name)}
                                                                className={`flex flex-col items-center justify-center gap-2 flex-shrink-0 w-24 text-center p-3 rounded-lg transition-colors ${
                                                                        activeCategory === category.name
                                                                                ? "bg-brand-purple text-white"
                                                                                : "bg-gray-100 hover:bg-gray-200"
                                                                }`}
                                                        >
                                                                <span className="text-2xl">{category.icon}</span>
                                                                <span className="text-sm font-semibold">
                                                                        {category.name}
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
