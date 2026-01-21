"use client";

import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AddressSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    place_id: number;
}

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string, latitude: number, longitude: number) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export default function AddressAutocomplete({
    value,
    onChange,
    placeholder = "Enter address (e.g., 123 Main Street, Ho Chi Minh City)...",
    disabled = false,
    className = "",
}: AddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Sync input value with prop value
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Fetch address suggestions from OpenStreetMap Nominatim
    const fetchSuggestions = async (query: string) => {
        if (!query || query.trim().length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);
        try {
            // Using Nominatim API for address search (free, no API key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=vn&accept-language=en`,
                {
                    headers: {
                        "User-Agent": "FoodEats/1.0", // Required by Nominatim
                    },
                },
            );

            if (!response.ok) {
                throw new Error("Failed to fetch suggestions");
            }

            const data: AddressSuggestion[] = await response.json();
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
            setSelectedIndex(-1);
        } catch (error) {
            console.error("Error fetching address suggestions:", error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce search requests
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer for debounced search
        debounceTimerRef.current = setTimeout(() => {
            fetchSuggestions(newValue);
        }, 300); // 300ms debounce
    };

    // Handle address selection
    const handleSelectAddress = (suggestion: AddressSuggestion) => {
        const address = suggestion.display_name;
        const latitude = parseFloat(suggestion.lat);
        const longitude = parseFloat(suggestion.lon);

        setInputValue(address);
        setShowSuggestions(false);
        setSuggestions([]);
        onChange(address, latitude, longitude);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelectAddress(suggestions[selectedIndex]);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] disabled:opacity-50 pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : (
                        <MapPin className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={suggestion.place_id}
                            type="button"
                            onClick={() => handleSelectAddress(suggestion)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                                index === selectedIndex ? "bg-gray-50" : ""
                            } ${index === 0 ? "rounded-t-md" : ""} ${
                                index === suggestions.length - 1 ? "rounded-b-md" : ""
                            }`}
                        >
                            <MapPin className="w-4 h-4 text-[#EE4D2D] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 flex-1">{suggestion.display_name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

