"use client";

import { useGeolocation } from "@/lib/userLocation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import FilterSection from "./FilterSection";
const foodEatsOptions = [
        { value: "special-deals", label: "Special Deals" },
        { value: "top-eats", label: "Top Eats" },
];

const deliveryFeeOptions = [
        { value: "0-2", label: "$0-$2" },
        { value: "3-6", label: "$3-$6" },
        { value: "6-9", label: "$6-$9+" },
];
const sortOptions = [
        { value: "desc", label: "Rating: High to Low" },
        { value: "asc", label: "Rating: Low to High" },
];
const deliveryTimeOptions = [
        { value: "any", label: "Anytime" },
        { value: "15", label: "15 min" },
        { value: "30", label: "30 min" },
        { value: "45", label: "45 min" },
        { value: "60", label: "60 min" },
];

// --- Component con ---

export default function FilterSidebar() {
        const router = useRouter();
        const pathname = usePathname();
        const searchParams = useSearchParams();

        const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
        const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

        const { coords, error, loading } = useGeolocation();

        console.log(coords);

        const handleClearAll = () => {
                router.push(pathname, { scroll: false });
        };

        const handleCheckboxChange = (name: string, value: string) => {
                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                const allValues = currentParams.getAll(name);
                if (allValues.includes(value)) {
                        const newValues = allValues.filter((v) => v !== value);
                        currentParams.delete(name);
                        newValues.forEach((v) => currentParams.append(name, v));
                } else {
                        currentParams.append(name, value);
                }
                router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
        };

        const handleToggleChange = (name: string, value: string) => {
                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));

                if (currentParams.get(name) === value) {
                } else {
                        currentParams.set(name, value);
                }
                router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
        };

        const handlePriceApply = () => {
                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                if (minPrice) {
                        currentParams.set("minPrice", minPrice);
                } else {
                        currentParams.delete("minPrice");
                }
                if (maxPrice) {
                        currentParams.set("maxPrice", maxPrice);
                } else {
                        currentParams.delete("maxPrice");
                }
                router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
        };

        const searchType = searchParams.get("type") || "restaurants";

        return (
                <aside className="w-full py-2 px-4">
                        <div className="flex justify-between items-center ">
                                <h2 className="text-[20px] font-bold font-manrope leading-[30px]text-brand-black">
                                        Filters
                                </h2>
                                <button
                                        onClick={handleClearAll}
                                        className="text-sm font-bold text-brand-purple hover:underline font-manrope leading-[30px] cursor-pointer underline hover:text-brand-purple/80"
                                >
                                        Clear All
                                </button>
                        </div>

                        {/* Delivery Type */}
                        <div className="mt-[30px] grid grid-cols-2 gap-2 p-1 bg-brand-white rounded-md ">
                                <button
                                        onClick={() => handleToggleChange("type", "restaurants")}
                                        className={`border border-brand-black px-4 py-3 rounded text-sm font-semibold transition-colors uppercase cursor-pointer ${
                                                searchType === "restaurants"
                                                        ? "bg-brand-purple text-white"
                                                        : "bg-transparent text-gray-700"
                                        }`}
                                >
                                        Restaurants
                                </button>
                                <button
                                        onClick={() => handleToggleChange("type", "foods")}
                                        className={`border border-brand-black px-4 py-3 rounded text-sm font-semibold transition-colors uppercase cursor-pointer ${
                                                searchType === "foods"
                                                        ? "bg-brand-purple text-white"
                                                        : "bg-transparent text-gray-700"
                                        }`}
                                >
                                        Foods
                                </button>
                        </div>

                        {/* FoodEats */}
                        <FilterSection title="FoodEats">
                                {foodEatsOptions.map(({ value, label }) => (
                                        <div key={value} className="flex items-center">
                                                <input
                                                        id={value}
                                                        name="foodeats"
                                                        type="checkbox"
                                                        value={value}
                                                        checked={searchParams.getAll("foodeats").includes(value)}
                                                        onChange={() => handleCheckboxChange("foodeats", value)}
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label
                                                        htmlFor={value}
                                                        className="ml-3 text-[16px] font-manrope text-brand-grey leading-[28px]"
                                                >
                                                        {label}
                                                </label>
                                        </div>
                                ))}
                        </FilterSection>

                        {/* Price */}
                        {searchType === "foods" && (
                                <FilterSection title="Price">
                                        <div className="flex items-center gap-2">
                                                <input
                                                        type="number"
                                                        placeholder="Min"
                                                        value={minPrice}
                                                        onChange={(e) => setMinPrice(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                />
                                                <span>-</span>
                                                <input
                                                        type="number"
                                                        placeholder="Max"
                                                        value={maxPrice}
                                                        onChange={(e) => setMaxPrice(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                />
                                        </div>
                                        <button
                                                onClick={handlePriceApply}
                                                className="cursor-pointer w-full mt-3 px-4 py-2 bg-brand-purple text-white rounded-md text-sm font-semibold hover:bg-brand-purple/80"
                                        >
                                                Apply Price
                                        </button>
                                </FilterSection>
                        )}

                        {/* Max Delivery Fee */}
                        <FilterSection title="Max Delivery Fee">
                                {deliveryFeeOptions.map(({ value, label }) => (
                                        <div key={value} className="flex items-center">
                                                <input
                                                        id={value}
                                                        name="fee"
                                                        type="checkbox"
                                                        value={value}
                                                        checked={searchParams.getAll("fee").includes(value)}
                                                        onChange={() => handleCheckboxChange("fee", value)}
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label
                                                        htmlFor={value}
                                                        className="ml-3 text-[16px] font-manrope text-brand-grey leading-[28px]"
                                                >
                                                        {label}
                                                </label>
                                        </div>
                                ))}
                        </FilterSection>

                        {/* Sort by */}
                        <FilterSection title="Sort by">
                                {sortOptions.map(({ value, label }) => (
                                        <div key={value} className="flex items-center ">
                                                <input
                                                        id={value}
                                                        name="sortBy"
                                                        type="radio"
                                                        value={value}
                                                        checked={searchParams.get("sortBy") === value}
                                                        onChange={() => handleToggleChange("sortBy", value)}
                                                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label
                                                        htmlFor={value}
                                                        className="ml-3 text-[16px] font-manrope text-brand-grey leading-[28px]"
                                                >
                                                        {label}
                                                </label>
                                        </div>
                                ))}
                        </FilterSection>

                        {/* Delivery Time */}
                        <FilterSection title="Delivery Time">
                                {deliveryTimeOptions.map(({ value, label }) => (
                                        <div key={value} className="flex items-center">
                                                <input
                                                        id={value}
                                                        name="time"
                                                        type="checkbox"
                                                        value={value}
                                                        checked={searchParams.getAll("time").includes(value)}
                                                        onChange={() => handleCheckboxChange("time", value)}
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label
                                                        htmlFor={value}
                                                        className="ml-3 text-[16px] font-manrope text-brand-grey leading-[28px]"
                                                >
                                                        {label}
                                                </label>
                                        </div>
                                ))}
                        </FilterSection>
                </aside>
        );
}
