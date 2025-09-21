"use client";

import { Filter, X } from "lucide-react";
import { useState } from "react";
import FilterSidebar from "./FilterSidebar";
import RestaurantList from "./RestaurantList";

type Restaurant = {
        id: number;
        name: string;
};

type RestaurantsContainerProps = {
        initialData: Restaurant[];
};

export default function RestaurantsContainer() {
        const [isFilterOpen, setIsFilterOpen] = useState(false);

        return (
                <>
                        {/* Mobile Screen */}
                        <div className="md:hidden p-4 border-b sticky top-0 bg-white z-10">
                                <button
                                        onClick={() => setIsFilterOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-semibold"
                                >
                                        <Filter className="w-4 h-4" />
                                        <span>Filters</span>
                                </button>
                        </div>

                        <div className="custom-container grid grid-cols-1 md:grid-cols-12 gap-x-8 py-8">
                                {/* --- Sidebar cho Desktop --- */}
                                <div className="hidden md:block md:col-span-4">
                                        <FilterSidebar />
                                </div>

                                {/* --- Drawer/Modal cho Mobile --- */}
                                {isFilterOpen && (
                                        <div
                                                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                                                onClick={() => setIsFilterOpen(false)}
                                        >
                                                <div
                                                        className="fixed top-0 -left-0 h-full w-[85%] max-w-sm bg-white z-50 p-6 overflow-y-auto"
                                                        onClick={(e) => e.stopPropagation()}
                                                        // Ngăn việc click bên trong làm đóng modal
                                                >
                                                        <div className="flex justify-end mb-4">
                                                                <button
                                                                        title="Close"
                                                                        onClick={() => setIsFilterOpen(false)}
                                                                >
                                                                        <X className="w-6 h-6" />
                                                                </button>
                                                        </div>
                                                        <FilterSidebar />
                                                </div>
                                        </div>
                                )}

                                {/* --- Danh sách nhà hàng --- */}
                                <div className="col-span-1 lg:col-span-8">
                                        <RestaurantList />
                                </div>
                        </div>
                </>
        );
}
