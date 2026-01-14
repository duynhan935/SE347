"use client";

import { useCategoryStore } from "@/stores/categoryStore";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Category icons với emoji đa dạng
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
    Com: "🍚",
    "Trà sữa": "🧋",
    "Đồ chay": "🥗",
};

export default function HeroSearchSection() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { categories, fetchAllCategories } = useCategoryStore();
    const activeCategory = searchParams.get("category") || "";
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchAllCategories();
    }, [fetchAllCategories]);

    const handleCategoryClick = (categoryName: string) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.set("type", "foods");
        currentParams.delete("page");

        if (activeCategory === categoryName) {
            currentParams.delete("category");
        } else {
            currentParams.set("category", categoryName);
        }

        router.push(`/?${currentParams.toString()}`, { scroll: false });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();

        if (!trimmedQuery) {
            router.push("/?type=foods");
            return;
        }

        // Redirect to search page
        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    };

    // Popular categories for quick access
    const customCategories = [
        { name: "Com", displayName: "Cơm" },
        { name: "Trà sữa", displayName: "Trà sữa" },
        { name: "Đồ chay", displayName: "Đồ chay" },
    ];
    
    const allCategories = [
        ...customCategories,
        ...(categories?.slice(0, 6).map(cat => ({ name: cat.cateName, displayName: cat.cateName })) || []),
    ];

    return (
        <div className="relative w-full h-full flex flex-col justify-center px-4 md:px-8 lg:px-12 xl:px-16 py-12 lg:py-20">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/40 w-full h-full" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-2xl">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    Đặt đồ ăn ngay,
                    <br />
                    <span className="text-[#EE4D2D]">giao hàng siêu tốc</span>
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-8">
                    Hơn 1000+ món ăn ngon, đặt món chỉ trong 1 phút
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm bún bò, trà sữa, gà rán..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-4 pl-14 pr-6 bg-white rounded-full text-gray-900 placeholder:text-gray-400 text-base shadow-xl focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]/50"
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#EE4D2D] text-white rounded-full font-semibold hover:bg-[#EE4D2D]/90 transition-colors shadow-lg"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </form>

                {/* Category Tags */}
                <div>
                    <p className="text-white/80 text-sm mb-4 font-medium">Danh mục phổ biến:</p>
                    <div className="flex flex-wrap gap-3">
                        {/* All Category */}
                        <button
                            onClick={() => {
                                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                                currentParams.set("type", "foods");
                                currentParams.delete("category");
                                currentParams.delete("page");
                                router.push(`/?${currentParams.toString()}`, { scroll: false });
                            }}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                !activeCategory
                                    ? "bg-[#EE4D2D] text-white shadow-lg"
                                    : "bg-white/90 text-gray-700 hover:bg-white"
                            }`}
                        >
                            <span>🍽️</span>
                            <span>Tất cả</span>
                        </button>

                        {/* Popular Categories */}
                        {allCategories.map((cat) => {
                            const categoryName = cat.name;
                            const displayName = cat.displayName;
                            const normalizedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
                            const icon = categoryIcons[normalizedName] || categoryIcons[categoryName] || "🍽️";
                            const isActive = activeCategory === categoryName;

                            return (
                                <button
                                    key={categoryName}
                                    onClick={() => handleCategoryClick(categoryName)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                        isActive
                                            ? "bg-[#EE4D2D] text-white shadow-lg"
                                            : "bg-white/90 text-gray-700 hover:bg-white"
                                    }`}
                                >
                                    <span>{icon}</span>
                                    <span>{displayName}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

