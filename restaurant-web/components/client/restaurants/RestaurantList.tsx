"use client";

import burgerImage from "@/assets/Restaurant/Burger.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StaticImageData } from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import Pagination from "../Pagination";
import { RestaurantCard } from "./RestaurantCard";

// --- Dữ liệu giả (Fake Data) ---
type Restaurant = {
        id: number;
        name: string;
        image: StaticImageData;
        deliveryFee: string;
        deliveryTime: number;
        foodType: string;
        rating: number;
        reviewCount: number;
};
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
const fakeRestaurants: Restaurant[] = [
        {
                id: 1,
                name: "The Burger Cafe",
                image: burgerImage,
                deliveryFee: "$0",
                deliveryTime: 20,
                foodType: "Burger",
                rating: 4.6,
                reviewCount: 2200,
        },
        {
                id: 2,
                name: "The Pizza Hut",
                image: burgerImage,
                deliveryFee: "$0",
                deliveryTime: 20,
                foodType: "Pizza",
                rating: 4.6,
                reviewCount: 2200,
        },
        {
                id: 3,
                name: "Caprese Sandwich Hub",
                image: burgerImage,
                deliveryFee: "$0",
                deliveryTime: 20,
                foodType: "Fast Food",
                rating: 4.6,
                reviewCount: 2200,
        },
        {
                id: 4,
                name: "The Wings Cafe",
                image: burgerImage,
                deliveryFee: "$1.99",
                deliveryTime: 30,
                foodType: "Fast Food",
                rating: 4.8,
                reviewCount: 1800,
        },
        {
                id: 5,
                name: "The Coffee Express",
                image: burgerImage,
                deliveryFee: "$0",
                deliveryTime: 15,
                foodType: "Coffee & Tea",
                rating: 4.9,
                reviewCount: 3100,
        },
        {
                id: 6,
                name: "The Biryani House",
                image: burgerImage,
                deliveryFee: "$2.49",
                deliveryTime: 40,
                foodType: "Indian",
                rating: 4.5,
                reviewCount: 980,
        },
        {
                id: 7,
                name: "Noodle & Co.",
                image: burgerImage,
                deliveryFee: "$0",
                deliveryTime: 25,
                foodType: "Thai",
                rating: 4.7,
                reviewCount: 1500,
        },
        {
                id: 8,
                name: "Taco Tuesday",
                image: burgerImage,
                deliveryFee: "$0",
                deliveryTime: 20,
                foodType: "Mexican",
                rating: 4.6,
                reviewCount: 1250,
        },
        {
                id: 9,
                name: "Sushi Central",
                image: burgerImage,
                deliveryFee: "$3.00",
                deliveryTime: 35,
                foodType: "Japanese",
                rating: 4.9,
                reviewCount: 2500,
        },
];

type RestaurantListProps = {
        initialData?: Restaurant[];
};

export default function RestaurantList({ initialData }: RestaurantListProps) {
        const restaurants = initialData && initialData.length > 0 ? initialData : fakeRestaurants;
        const searchParams = useSearchParams();
        const pathname = usePathname();
        const router = useRouter();
        const activeCategory = searchParams.get("category") || "";

        const scrollContainerRef = useRef<HTMLDivElement>(null);

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
                                <div className="relative flex items-center">
                                        <div
                                                onClick={() => handleScroll(-300)}
                                                className="absolute left-0 bg-white p-2 rounded-full shadow-md cursor-pointer hidden md:block z-10 -translate-x-1/2"
                                        >
                                                <ChevronLeft className="w-6 h-6" />
                                        </div>

                                        <div
                                                ref={scrollContainerRef}
                                                className="flex items-center gap-4 overflow-x-hidden pb-4 -mb-4 scrollbar-hide"
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

                                        <div
                                                onClick={() => handleScroll(300)}
                                                className="absolute right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hidden md:block z-10 translate-x-1/2"
                                        >
                                                <ChevronRight className="w-6 h-6" />
                                        </div>
                                </div>
                        </div>

                        {/* --- Restaurant List Header --- */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h2 className="text-xl font-bold">{restaurants.length} Restaurants Near Austin, TX</h2>
                                <div className="flex items-center gap-2">
                                        <label htmlFor="sort-by" className="text-sm font-semibold">
                                                Sort By:
                                        </label>
                                        <select
                                                id="sort-by"
                                                className="border rounded-md px-3 py-2 text-sm focus:ring-brand-purple focus:border-brand-purple"
                                        >
                                                <option>Popular</option>
                                                <option>Recommended</option>
                                                <option>Distance</option>
                                        </select>
                                </div>
                        </div>

                        {/* --- Restaurant Grid --- */}
                        {restaurants.length > 0 ? (
                                <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                                                {restaurants.map((restaurant) => (
                                                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                                                ))}
                                        </div>
                                        <Pagination totalResults={20} itemsPerPage={2} />
                                </>
                        ) : (
                                <p>No restaurants found. Try adjusting your filters.</p>
                        )}
                </div>
        );
}
