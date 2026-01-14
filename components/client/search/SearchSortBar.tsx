"use client";

import { useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "distance", label: "Nearest" },
    { value: "popular", label: "Top Sales" },
    { value: "rating", label: "Top Rated" },
];

export default function SearchSortBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "relevance";

    const handleSortChange = (value: string) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        if (value === "relevance") {
            currentParams.delete("sort");
        } else {
            currentParams.set("sort", value);
        }
        router.push(`/search?${currentParams.toString()}`, { scroll: false });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                {sortOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            currentSort === option.value
                                ? "bg-[#EE4D2D] text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

