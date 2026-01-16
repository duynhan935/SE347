"use client";

import { useCategoryStore } from "@/stores/categoryStore";
import { Category } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Category icons with diverse emojis
const categoryIcons: { [key: string]: string } = {
        Burger: "🍔",
        Pizza: "🍕",
        Sandwiches: "🥪",
        Wings: "🍗",
        Coffee: "☕",
        Tea: "🧋",
        Indian: "🍛",
        Chinese: "🥡",
        Thai: "🍜",
        American: "🍔",
        Mexican: "🌮",
        Japanese: "🍣",
        Korean: "🍲",
        Dessert: "🍰",
        Bakery: "🥖",
        FastFood: "🍟",
        Seafood: "🦐",
        Vegetarian: "🥗",
        Vietnamese: "🍜",
};

// Category colors - different light background colors for each category
const categoryColors: { [key: string]: { bg: string; activeBg: string; text: string } } = {
        Burger: { bg: "bg-orange-50", activeBg: "bg-orange-500", text: "text-orange-700" },
        Pizza: { bg: "bg-red-50", activeBg: "bg-red-500", text: "text-red-700" },
        Sandwiches: { bg: "bg-yellow-50", activeBg: "bg-yellow-500", text: "text-yellow-700" },
        Wings: { bg: "bg-amber-50", activeBg: "bg-amber-500", text: "text-amber-700" },
        Coffee: { bg: "bg-amber-50", activeBg: "bg-amber-600", text: "text-amber-800" },
        Tea: { bg: "bg-green-50", activeBg: "bg-green-500", text: "text-green-700" },
        Indian: { bg: "bg-yellow-50", activeBg: "bg-yellow-600", text: "text-yellow-800" },
        Chinese: { bg: "bg-red-50", activeBg: "bg-red-600", text: "text-red-800" },
        Thai: { bg: "bg-orange-50", activeBg: "bg-orange-600", text: "text-orange-800" },
        Japanese: { bg: "bg-pink-50", activeBg: "bg-pink-500", text: "text-pink-700" },
        Korean: { bg: "bg-red-50", activeBg: "bg-red-600", text: "text-red-800" },
        Dessert: { bg: "bg-pink-50", activeBg: "bg-pink-500", text: "text-pink-700" },
        Bakery: { bg: "bg-amber-50", activeBg: "bg-amber-500", text: "text-amber-700" },
        FastFood: { bg: "bg-orange-50", activeBg: "bg-orange-500", text: "text-orange-700" },
        Seafood: { bg: "bg-blue-50", activeBg: "bg-blue-500", text: "text-blue-700" },
        Vegetarian: { bg: "bg-green-50", activeBg: "bg-green-500", text: "text-green-700" },
        Vietnamese: { bg: "bg-orange-50", activeBg: "bg-orange-600", text: "text-orange-800" },
};

export default function FoodHero() {
        const router = useRouter();
        const searchParams = useSearchParams();
        const scrollContainerRef = useRef<HTMLDivElement>(null);
        const categoriesRef = useRef<HTMLDivElement>(null);
        const { categories, fetchAllCategories } = useCategoryStore();
        const activeCategory = searchParams.get("category") || "";
        const searchType = searchParams.get("type") || "foods";
        const [isSticky, setIsSticky] = useState(false);

        useEffect(() => {
                fetchAllCategories();
        }, [fetchAllCategories]);

        // Sticky categories on scroll
        useEffect(() => {
                const handleScroll = () => {
                        if (categoriesRef.current) {
                                const rect = categoriesRef.current.getBoundingClientRect();
                                setIsSticky(rect.top <= 80); // Header height is ~80px
                        }
                };

                window.addEventListener("scroll", handleScroll);
                return () => window.removeEventListener("scroll", handleScroll);
        }, []);

        const handleScroll = (scrollOffset: number) => {
                if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
                }
        };

        const handleTypeChange = (type: "foods" | "restaurants") => {
                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                currentParams.set("type", type);
                currentParams.delete("page");
                router.push(`/?${currentParams.toString()}`, { scroll: false });
        };

        const handleCategoryClick = (categoryName: string) => {
                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                
                // Set type to foods if not already set
                currentParams.set("type", "foods");
                
                // Remove page param when changing category
                currentParams.delete("page");
                
                if (activeCategory === categoryName) {
                        // If clicking the same category, remove it
                        currentParams.delete("category");
                } else {
                        // Set new category
                        currentParams.set("category", categoryName);
                }
                
                router.push(`/?${currentParams.toString()}`, { scroll: false });
        };

        const getCategoryColor = (categoryName: string, isActive: boolean) => {
                const normalizedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
                const colors = categoryColors[normalizedName] || { bg: "bg-gray-50", activeBg: "bg-brand-purple", text: "text-gray-700" };
                
                if (isActive) {
                        return `bg-brand-purple text-white shadow-lg scale-105`;
                }
                return `${colors.bg} ${colors.text} hover:${colors.bg.replace("50", "100")} border border-gray-200`;
        };

        return (
                <>
                        <section className="bg-gradient-to-b from-brand-yellowlight to-white pt-24 pb-4 lg:pt-32 lg:pb-6">
                                <div className="custom-container">
                                        {/* Title Section - Compact */}
                                        <div className="text-center mb-6">
                                                <h1 className="text-2xl lg:text-3xl font-bold font-roboto-serif text-brand-black mb-2">
                                                        Order Food, Delivery from 20&apos;
                                                </h1>
                                                <p className="text-brand-grey text-sm">
                                                        Search and order your favorite dishes
                                                </p>
                                        </div>

                                        {/* Tab Switcher - Right below title */}
                                        <div className="flex justify-center mb-6">
                                                <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                                        <button
                                                                onClick={() => handleTypeChange("foods")}
                                                                className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                                                                        searchType === "foods"
                                                                                ? "bg-brand-purple text-white shadow-sm"
                                                                                : "text-gray-600 hover:bg-gray-50"
                                                                }`}
                                                        >
                                                                Foods
                                                        </button>
                                                        <button
                                                                onClick={() => handleTypeChange("restaurants")}
                                                                className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                                                                        searchType === "restaurants"
                                                                                ? "bg-brand-purple text-white shadow-sm"
                                                                                : "text-gray-600 hover:bg-gray-50"
                                                                }`}
                                                        >
                                                                Restaurants
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        </section>

                        {/* Sticky Categories Section - Only displayed on Mobile when type=foods */}
                        {searchType === "foods" && (
                                <div
                                        ref={categoriesRef}
                                        className={`lg:hidden transition-all duration-300 ${
                                                isSticky
                                                        ? "fixed top-20 left-0 right-0 z-40 bg-white shadow-md py-4 border-b border-gray-200"
                                                        : "relative bg-white"
                                        }`}
                                >
                                        <div className="custom-container">
                                                {/* Categories Section */}
                                                <div className="mb-4">
                                                        <div className="flex items-center gap-2">
                                                                {/* Scroll Left Button */}
                                                                <button
                                                                        title="Scroll left"
                                                                        onClick={() => handleScroll(-300)}
                                                                        className="p-2 rounded-full bg-white shadow-md cursor-pointer hidden md:block hover:bg-gray-100 transition-colors flex-shrink-0"
                                                                >
                                                                        <ChevronLeft className="w-5 h-5" />
                                                                </button>

                                                                {/* Categories Scroll Container */}
                                                                <div
                                                                        ref={scrollContainerRef}
                                                                        className="flex-grow flex items-center gap-2 lg:gap-3 overflow-x-auto scrollbar-hide pb-2"
                                                                >
                                                                        {/* All Category */}
                                                                        <button
                                                                                onClick={() => {
                                                                                        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                                                                                        currentParams.set("type", "foods");
                                                                                        currentParams.delete("category");
                                                                                        currentParams.delete("page");
                                                                                        router.push(`/?${currentParams.toString()}`, { scroll: false });
                                                                                }}
                                                                                className={`cursor-pointer flex flex-col items-center justify-center gap-1.5 flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 text-center p-2 rounded-xl transition-all duration-300 transform hover:-translate-y-1 ${
                                                                                        !activeCategory
                                                                                                ? "bg-brand-purple text-white shadow-lg scale-105"
                                                                                                : "bg-gray-50 text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200"
                                                                                }`}
                                                                        >
                                                                                <span className="text-lg lg:text-2xl">🍽️</span>
                                                                                <span className="text-[10px] lg:text-xs font-semibold leading-tight">All</span>
                                                                        </button>

                                                                        {/* Other Categories */}
                                                                        {categories && categories.map((category: Category) => {
                                                                                const normalizedName = category.cateName.charAt(0).toUpperCase() + category.cateName.slice(1);
                                                                                const icon = categoryIcons[normalizedName] || "🍽️";
                                                                                const isActive = activeCategory === category.cateName;
                                                                                const colorClass = getCategoryColor(category.cateName, isActive);

                                                                                return (
                                                                                        <button
                                                                                                key={category.cateName}
                                                                                                onClick={() => handleCategoryClick(category.cateName)}
                                                                                                className={`cursor-pointer flex flex-col items-center justify-center gap-1.5 flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 text-center p-2 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-sm ${colorClass}`}
                                                                                        >
                                                                                                <span className="text-lg lg:text-2xl">{icon}</span>
                                                                                                <span className="text-[10px] lg:text-xs font-semibold leading-tight truncate w-full px-0.5">
                                                                                                        {category.cateName}
                                                                                                </span>
                                                                                        </button>
                                                                                );
                                                                        })}
                                                                </div>

                                                                {/* Scroll Right Button */}
                                                                <button
                                                                        title="Scroll right"
                                                                        onClick={() => handleScroll(300)}
                                                                        className="p-2 rounded-full bg-white shadow-md cursor-pointer hidden md:block hover:bg-gray-100 transition-colors flex-shrink-0"
                                                                >
                                                                        <ChevronRight className="w-5 h-5" />
                                                                </button>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        )}
                </>
        );
}

