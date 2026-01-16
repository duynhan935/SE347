"use client";

import { useCategoryStore } from "@/stores/categoryStore";
import { Category } from "@/types";
import { ChevronDown, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const priceRanges = [
    { value: "0-30000", label: "Under $1.20", min: 0, max: 30000 },
    { value: "30000-50000", label: "$1.20 - $2.00", min: 30000, max: 50000 },
    { value: "50000-100000", label: "$2.00 - $4.00", min: 50000, max: 100000 },
    { value: "100000+", label: "Over $4.00", min: 100000, max: null },
];

const ratingOptions = [
    { value: "5", label: "5 stars" },
    { value: "4", label: "4 stars and above" },
    { value: "3", label: "3 stars and above" },
];

const districts = [
    "District 1",
    "District 2",
    "District 3",
    "District 4",
    "District 5",
    "District 7",
    "Binh Thanh District",
    "Tan Binh District",
    "Phu Nhuan District",
];

const specialFilters = [
    { value: "freeship", label: "Free Shipping" },
    { value: "deal", label: "Great Deals" },
    { value: "favorite", label: "Favorites" },
];

interface SearchFiltersProps {
    isMobile?: boolean;
    onClose?: () => void;
}

export default function SearchFilters({ isMobile = false, onClose }: SearchFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { categories, fetchAllCategories } = useCategoryStore();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
    const [selectedRating, setSelectedRating] = useState<string>("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [selectedSpecialFilters, setSelectedSpecialFilters] = useState<string[]>([]);

    useEffect(() => {
        fetchAllCategories();
    }, [fetchAllCategories]);

    useEffect(() => {
        // Sync with URL params
        setSelectedCategories(searchParams.getAll("category") || []);
        setSelectedPriceRange(searchParams.get("priceRange") || "");
        setSelectedRating(searchParams.get("rating") || "");
        setSelectedDistrict(searchParams.get("district") || "");
        setSelectedSpecialFilters(searchParams.getAll("special") || []);
    }, [searchParams]);

    const updateURL = (updates: Record<string, string | string[] | null>) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        
        Object.entries(updates).forEach(([key, value]) => {
            currentParams.delete(key);
            if (value === null || (Array.isArray(value) && value.length === 0)) {
                // Already deleted
            } else if (Array.isArray(value)) {
                value.forEach((v) => currentParams.append(key, v));
            } else {
                currentParams.set(key, value);
            }
        });

        router.push(`/search?${currentParams.toString()}`, { scroll: false });
        if (onClose) onClose();
    };

    const handleCategoryToggle = (categoryName: string) => {
        const newCategories = selectedCategories.includes(categoryName)
            ? selectedCategories.filter((c) => c !== categoryName)
            : [...selectedCategories, categoryName];
        setSelectedCategories(newCategories);
        updateURL({ category: newCategories.length > 0 ? newCategories : null });
    };

    const handlePriceRangeChange = (value: string) => {
        const newValue = selectedPriceRange === value ? "" : value;
        setSelectedPriceRange(newValue);
        updateURL({ priceRange: newValue || null });
    };

    const handleRatingChange = (value: string) => {
        const newValue = selectedRating === value ? "" : value;
        setSelectedRating(newValue);
        updateURL({ rating: newValue || null });
    };

    const handleDistrictChange = (value: string) => {
        const newValue = selectedDistrict === value ? "" : value;
        setSelectedDistrict(newValue);
        updateURL({ district: newValue || null });
    };

    const handleSpecialFilterToggle = (value: string) => {
        const newFilters = selectedSpecialFilters.includes(value)
            ? selectedSpecialFilters.filter((f) => f !== value)
            : [...selectedSpecialFilters, value];
        setSelectedSpecialFilters(newFilters);
        updateURL({ special: newFilters.length > 0 ? newFilters : null });
    };

    const handleClearAll = () => {
        setSelectedCategories([]);
        setSelectedPriceRange("");
        setSelectedRating("");
        setSelectedDistrict("");
        setSelectedSpecialFilters([]);
        const currentParams = new URLSearchParams();
        const query = searchParams.get("q");
        if (query) currentParams.set("q", query);
        router.push(`/search?${currentParams.toString()}`, { scroll: false });
        if (onClose) onClose();
    };

    const hasActiveFilters =
        selectedCategories.length > 0 ||
        selectedPriceRange ||
        selectedRating ||
        selectedDistrict ||
        selectedSpecialFilters.length > 0;

    const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
        const [isOpen, setIsOpen] = useState(true);
        return (
            <div className="py-4 border-b border-gray-200">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center mb-3"
                >
                    <h5 className="font-semibold text-gray-900 text-sm">{title}</h5>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <div className="space-y-2">{children}</div>}
            </div>
        );
    };

    const content = (
        <div className={`${isMobile ? "p-4" : "p-4"} bg-white ${isMobile ? "" : "sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide"}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearAll}
                        className="text-sm text-[#EE4D2D] hover:text-[#EE4D2D]/80 font-medium flex items-center gap-1"
                    >
                        <X className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            {/* Category Filter */}
            <FilterSection title="Categories">
                {categories && categories.length > 0 ? (
                    <div className="space-y-3">
                        {categories.map((category: Category) => (
                            <label
                                key={category.cateName}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.cateName)}
                                    onChange={() => handleCategoryToggle(category.cateName)}
                                    className="w-4 h-4 text-[#EE4D2D] focus:ring-[#EE4D2D] rounded"
                                />
                                <span className="text-sm text-gray-700">{category.cateName}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Loading...</p>
                )}
            </FilterSection>

            {/* Price Range Filter */}
            <FilterSection title="Price Range">
                <div className="space-y-3">
                    {priceRanges.map((range) => (
                        <label
                            key={range.value}
                            className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded ${
                                selectedPriceRange === range.value ? "bg-[#EE4D2D]/10" : ""
                            }`}
                        >
                            <input
                                type="radio"
                                name="priceRange"
                                value={range.value}
                                checked={selectedPriceRange === range.value}
                                onChange={() => handlePriceRangeChange(range.value)}
                                className="w-4 h-4 text-[#EE4D2D] focus:ring-[#EE4D2D]"
                            />
                            <span className="text-sm text-gray-700">{range.label}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Rating Filter */}
            <FilterSection title="Rating">
                <div className="space-y-3">
                    {ratingOptions.map((option) => (
                        <label
                            key={option.value}
                            className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded ${
                                selectedRating === option.value ? "bg-[#EE4D2D]/10" : ""
                            }`}
                        >
                            <input
                                type="radio"
                                name="rating"
                                value={option.value}
                                checked={selectedRating === option.value}
                                onChange={() => handleRatingChange(option.value)}
                                className="w-4 h-4 text-[#EE4D2D] focus:ring-[#EE4D2D]"
                            />
                            <span className="text-sm text-gray-700 flex items-center gap-1">
                                {option.value === "5" && "⭐⭐⭐⭐⭐"}
                                {option.value === "4" && "⭐⭐⭐⭐"}
                                {option.value === "3" && "⭐⭐⭐"}
                                <span className="ml-1">{option.label}</span>
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* District Filter */}
            <FilterSection title="Area">
                <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    aria-label="Select area"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]/50"
                >
                    <option value="">All Areas</option>
                    {districts.map((district) => (
                        <option key={district} value={district}>
                            {district}
                        </option>
                    ))}
                </select>
            </FilterSection>

            {/* Special Filters */}
            <FilterSection title="Special">
                <div className="space-y-3">
                    {specialFilters.map((filter) => (
                        <label
                            key={filter.value}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                            <input
                                type="checkbox"
                                checked={selectedSpecialFilters.includes(filter.value)}
                                onChange={() => handleSpecialFilterToggle(filter.value)}
                                className="w-4 h-4 text-[#EE4D2D] focus:ring-[#EE4D2D] rounded"
                            />
                            <span className="text-sm text-gray-700">{filter.label}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </div>
    );

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    {content}
                </div>
            </div>
        );
    }

    return <aside className="w-full lg:w-[280px] flex-shrink-0">{content}</aside>;
}

