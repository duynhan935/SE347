/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Search, Filter, ChevronDown, Calendar } from "lucide-react";
import CustomSelect, { DropdownOption } from "./CustomSelect";

export interface FilterOption {
    label: string;
    options: DropdownOption[];
    type?: "select" | "date" | "input";
}

interface SearchFilterProps {
    searchPlaceholder: string;
    filterOptions: FilterOption[];
    showDatePicker?: boolean;
    datePlaceholder?: string;
    HeaderDropdown: React.ComponentType<any>;
    onSearch?: (value: string) => void;
    onFilterChange?: (filterIndex: number, value: string) => void;
    onClear?: () => void;
    className?: string;
}

export default function SearchFilter({
    searchPlaceholder,
    filterOptions,
    showDatePicker = true,
    datePlaceholder = "View all dates",
    HeaderDropdown,
    onSearch,
    onFilterChange,
    onClear,
    className = "",
}: SearchFilterProps) {
    const [searchValue, setSearchValue] = useState("");
    const [filterValues, setFilterValues] = useState<string[]>(filterOptions.map(() => ""));

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        onSearch?.(value);
    };

    const handleFilterChange = (index: number, value: string) => {
        const newValues = [...filterValues];
        newValues[index] = value;
        setFilterValues(newValues);
        onFilterChange?.(index, value);
    };

    const handleClear = () => {
        setSearchValue("");
        setFilterValues(filterOptions.map(() => ""));
        onClear?.();
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    className="border border-gray-300 rounded-lg py-2 pl-10 pr-4 w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-black" size={16} />
            </div>

            <HeaderDropdown
                trigger={
                    <button className="bg-white px-3 py-2 text-gray-600 flex items-center cursor-pointer border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter size={16} className="text-brand-black" />
                        <ChevronDown size={14} className="ml-1 text-brand-black" />
                    </button>
                }
                align="end"
            >
                <div className="px-4 py-4 flex flex-col gap-4">
                    {filterOptions.map((filter, index) => (
                        <div key={index}>
                            {filter.type === "input" ? (
                                <input
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder={filter.label}
                                    value={filterValues[index]}
                                    onChange={(e) => handleFilterChange(index, e.target.value)}
                                />
                            ) : (
                                <CustomSelect
                                    options={filter.options}
                                    placeholder={filter.label}
                                    value={filterValues[index]}
                                    onChange={(value) => handleFilterChange(index, value)}
                                />
                            )}
                        </div>
                    ))}

                    {showDatePicker && (
                        <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 bg-white cursor-pointer hover:bg-gray-50">
                            <Calendar size={16} className="text-brand-black mr-3" />
                            <span className="text-gray-500 text-sm">{datePlaceholder}</span>
                        </div>
                    )}

                    <div className="flex justify-end mt-2">
                        <button
                            className="text-orange-500 font-medium text-sm hover:text-orange-600 cursor-pointer"
                            onClick={handleClear}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </HeaderDropdown>
        </div>
    );
}
