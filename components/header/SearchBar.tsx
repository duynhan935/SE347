"use client";

import { productApi } from "@/lib/api/productApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { Product, Restaurant } from "@/types";
import { Search, Store, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SearchSuggestion {
        type: "restaurant" | "product";
        id: string;
        name: string;
        slug?: string;
        image?: string | null;
        restaurantName?: string;
}

export default function SearchBar() {
        const [searchQuery, setSearchQuery] = useState("");
        const [isFocused, setIsFocused] = useState(false);
        const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
        const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
        const [showSuggestions, setShowSuggestions] = useState(false);
        const router = useRouter();
        const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
        const suggestionsRef = useRef<HTMLDivElement>(null);

        // Debounced search for suggestions
        useEffect(() => {
                // Clear previous timeout
                if (searchTimeoutRef.current) {
                        clearTimeout(searchTimeoutRef.current);
                }

                const trimmedQuery = searchQuery.trim();

                // Don't search if query is too short or empty
                if (trimmedQuery.length < 2) {
                        setSuggestions([]);
                        setShowSuggestions(false);
                        return;
                }

                // Set loading state
                setIsLoadingSuggestions(true);

                // Debounce: wait 300ms after user stops typing
                searchTimeoutRef.current = setTimeout(async () => {
                        try {
                                // Fetch both restaurants and products in parallel
                                const [restaurantsRes, productsRes] = await Promise.all([
                                        restaurantApi.getAllRestaurants(
                                                new URLSearchParams({ search: trimmedQuery, limit: "5" })
                                        ),
                                        productApi.getAllProducts(
                                                new URLSearchParams({ search: trimmedQuery, limit: "5" })
                                        ),
                                ]);

                                const restaurantSuggestions: SearchSuggestion[] = (restaurantsRes.data || []).map(
                                        (r: Restaurant) => ({
                                                type: "restaurant" as const,
                                                id: r.id,
                                                name: r.resName,
                                                slug: r.slug,
                                                image: typeof r.imageURL === "string" ? r.imageURL : null,
                                        })
                                );

                                const productSuggestions: SearchSuggestion[] = (productsRes.data || []).map(
                                        (p: Product) => ({
                                                type: "product" as const,
                                                id: p.id,
                                                name: p.productName,
                                                slug: p.slug,
                                                image: typeof p.imageURL === "string" ? p.imageURL : null,
                                                restaurantName: p.restaurant?.resName,
                                        })
                                );

                                // Combine and limit to 8 total suggestions (4 restaurants + 4 products)
                                const combined = [...restaurantSuggestions.slice(0, 4), ...productSuggestions.slice(0, 4)];
                                setSuggestions(combined);
                                setShowSuggestions(combined.length > 0 && isFocused);
                        } catch (error) {
                                console.error("Failed to fetch search suggestions:", error);
                                setSuggestions([]);
                        } finally {
                                setIsLoadingSuggestions(false);
                        }
                }, 300);

                // Cleanup timeout on unmount or query change
                return () => {
                        if (searchTimeoutRef.current) {
                                clearTimeout(searchTimeoutRef.current);
                        }
                };
        }, [searchQuery, isFocused]);

        // Close suggestions when clicking outside
        useEffect(() => {
                const handleClickOutside = (event: MouseEvent) => {
                        if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                                setShowSuggestions(false);
                        }
                };

                if (showSuggestions) {
                        document.addEventListener("mousedown", handleClickOutside);
                }

                return () => {
                        document.removeEventListener("mousedown", handleClickOutside);
                };
        }, [showSuggestions]);

        const handleSearch = (e: React.FormEvent) => {
                e.preventDefault();
                
                // Trim whitespace
                const trimmedQuery = searchQuery.trim();
                
                // If query is empty, redirect to restaurants page without search
                if (!trimmedQuery) {
                        router.push("/restaurants");
                        return;
                }

                // Redirect to restaurants page with search query
                router.push(`/restaurants?search=${encodeURIComponent(trimmedQuery)}&type=restaurants`);
                setShowSuggestions(false);
        };

        const handleSuggestionClick = (suggestion: SearchSuggestion) => {
                if (suggestion.type === "restaurant" && suggestion.slug) {
                        router.push(`/restaurants/${suggestion.slug}`);
                } else if (suggestion.type === "product" && suggestion.slug) {
                        router.push(`/food/${suggestion.slug}`);
                }
                setShowSuggestions(false);
                setSearchQuery("");
        };

        const handleInputFocus = () => {
                setIsFocused(true);
                if (suggestions.length > 0) {
                        setShowSuggestions(true);
                }
        };

        const handleInputBlur = () => {
                // Delay to allow click on suggestions
                setTimeout(() => {
                        setIsFocused(false);
                        setShowSuggestions(false);
                }, 200);
        };

        return (
                <div className="hidden lg:flex flex-1 max-w-2xl mx-8 relative" ref={suggestionsRef}>
                        <form onSubmit={handleSearch} className="w-full">
                                <div className="relative w-full">
                                        <input
                                                type="text"
                                                placeholder="Tìm bún bò, trà sữa, gà rán..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                                className={`w-full py-3 px-6 pl-12 bg-brand-white rounded-full text-brand-black placeholder:text-brand-grey font-manrope text-p2 border transition-all duration-200 ${
                                                        isFocused
                                                                ? "border-brand-orange/50 shadow-lg shadow-brand-orange/10 ring-2 ring-brand-orange/20"
                                                                : "border-gray-200 shadow-md hover:shadow-lg"
                                                }`}
                                        />
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey pointer-events-none" />
                                </div>
                        </form>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[400px] overflow-y-auto z-50">
                                        {isLoadingSuggestions ? (
                                                <div className="p-4 text-center text-gray-500">
                                                        <div className="animate-pulse">Đang tìm kiếm...</div>
                                                </div>
                                        ) : (
                                                <>
                                                        {suggestions.filter((s) => s.type === "restaurant").length > 0 && (
                                                                <div className="p-2">
                                                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                                                Restaurants
                                                                        </div>
                                                                        {suggestions
                                                                                .filter((s) => s.type === "restaurant")
                                                                                .map((suggestion) => (
                                                                                        <button
                                                                                                key={`restaurant-${suggestion.id}`}
                                                                                                onClick={() => handleSuggestionClick(suggestion)}
                                                                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors text-left"
                                                                                        >
                                                                                                <Store className="w-4 h-4 text-brand-purple flex-shrink-0" />
                                                                                                <div className="flex-1 min-w-0">
                                                                                                        <div className="font-medium text-sm text-gray-900 truncate">
                                                                                                                {suggestion.name}
                                                                                                        </div>
                                                                                                </div>
                                                                                        </button>
                                                                                ))}
                                                                </div>
                                                        )}

                                                        {suggestions.filter((s) => s.type === "product").length > 0 && (
                                                                <div className="p-2 border-t border-gray-100">
                                                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                                                Dishes
                                                                        </div>
                                                                        {suggestions
                                                                                .filter((s) => s.type === "product")
                                                                                .map((suggestion) => (
                                                                                        <button
                                                                                                key={`product-${suggestion.id}`}
                                                                                                onClick={() => handleSuggestionClick(suggestion)}
                                                                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors text-left"
                                                                                        >
                                                                                                <Utensils className="w-4 h-4 text-brand-orange flex-shrink-0" />
                                                                                                <div className="flex-1 min-w-0">
                                                                                                        <div className="font-medium text-sm text-gray-900 truncate">
                                                                                                                {suggestion.name}
                                                                                                        </div>
                                                                                                        {suggestion.restaurantName && (
                                                                                                                <div className="text-xs text-gray-500 truncate">
                                                                                                                        {suggestion.restaurantName}
                                                                                                                </div>
                                                                                                        )}
                                                                                                </div>
                                                                                        </button>
                                                                                ))}
                                                                </div>
                                                        )}

                                                        {/* View All Results */}
                                                        {searchQuery.trim().length >= 2 && (
                                                                <div className="p-2 border-t border-gray-100">
                                                                        <button
                                                                                onClick={handleSearch}
                                                                                className="w-full px-3 py-2 text-sm font-semibold text-brand-purple hover:bg-brand-purple/10 rounded-md transition-colors text-center"
                                                                        >
                                                                                View all results for &quot;{searchQuery}&quot;
                                                                        </button>
                                                                </div>
                                                        )}
                                                </>
                                        )}
                                </div>
                        )}
                </div>
        );
}
