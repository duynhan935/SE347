"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar() {
        const [searchQuery, setSearchQuery] = useState("");
        const [isFocused, setIsFocused] = useState(false);

        const handleSearch = (e: React.FormEvent) => {
                e.preventDefault();
                // TODO: Implement search functionality
                console.log("Searching for:", searchQuery);
        };

        return (
                <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-8">
                        <div className="relative w-full">
                                <input
                                        type="text"
                                        placeholder="Search restaurants, dishes..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        className={`w-full py-3 px-6 pl-12 bg-brand-white rounded-full text-brand-black placeholder:text-brand-grey font-manrope text-p2 border transition-all duration-200 ${
                                                isFocused
                                                        ? "border-brand-orange/50 shadow-lg shadow-brand-orange/10 ring-2 ring-brand-orange/20"
                                                        : "border-gray-200 shadow-md hover:shadow-lg"
                                        }`}
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey pointer-events-none" />
                        </div>
                </form>
        );
}
