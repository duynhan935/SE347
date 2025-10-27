"use client";

import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { FolderTree, MessageSquare, Move, Settings, ShoppingBag, Star, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface Widget {
        id: string;
        icon: React.ReactNode;
        value: string | number;
        label: string;
}

// Nhận restaurantId làm prop
export default function WidgetList({ restaurantId }: { restaurantId: string | null }) {
        const [hoveredWidget, setHoveredWidget] = useState<string | null>(null);

        const restaurantFromStore = useRestaurantStore((state) => state.restaurant);
        const loading = useRestaurantStore((state) => state.loading);

        const restaurant = useMemo(() => {
                return restaurantFromStore?.id === restaurantId ? restaurantFromStore : null;
        }, [restaurantFromStore, restaurantId]);

        const [widgetsData, setWidgetsData] = useState<Widget[]>([]);

        useEffect(() => {
                if (restaurant) {
                        const rating = restaurant.rating ?? 0;
                        const totalReview = restaurant.totalReview ?? 0;
                        const totalProducts = Array.isArray(restaurant.products) ? restaurant.products.length : 0;
                        const totalCategories = Array.isArray(restaurant.cate) ? restaurant.cate.length : 0;

                        setWidgetsData([
                                {
                                        id: "rating",
                                        icon: <Star className="w-6 h-6 text-yellow-500" />,
                                        value: `${rating.toFixed(1)} ⭐`,
                                        label: "Average Rating",
                                },
                                {
                                        id: "reviews",
                                        icon: <MessageSquare className="w-6 h-6 text-blue-500" />,
                                        value: totalReview,
                                        label: "Total Reviews",
                                },
                                {
                                        id: "products",
                                        icon: <ShoppingBag className="w-6 h-6 text-green-500" />,
                                        value: totalProducts,
                                        label: "Menu Items",
                                },
                                {
                                        id: "categories",
                                        icon: <FolderTree className="w-6 h-6 text-purple-500" />,
                                        value: totalCategories,
                                        label: "Categories",
                                },
                        ]);
                } else if (!loading) {
                        // Clear widgets if not loading and no matching restaurant
                        setWidgetsData([]);
                }
                // Depend on the derived 'restaurant' object and 'loading' state
        }, [restaurant, loading]);

        // Handlers (keep as is)
        const handleMove = (widgetId: string) => console.log("Move widget:", widgetId);
        const handleSettings = (widgetId: string) => console.log("Settings for widget:", widgetId);
        const handleDelete = (widgetId: string) => console.log("Delete widget:", widgetId);

        // Loading state: Show placeholders if loading AND the specific restaurant data isn't available yet
        if (loading && !restaurant && restaurantId) {
                return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {Array.from({ length: 4 }).map((_, index) => (
                                        <div
                                                key={index}
                                                className="bg-white rounded-lg shadow-sm border p-6 flex flex-col items-center justify-center h-[160px] animate-pulse"
                                        >
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3"></div>
                                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        </div>
                                ))}
                        </div>
                );
        }

        // Placeholder if no restaurant ID is passed or no data after loading
        if (!restaurantId || widgetsData.length === 0) {
                return (
                        <div className="text-center text-gray-400 py-10 border border-dashed rounded-lg bg-gray-50/50 mb-8 italic">
                                {restaurantId ? "No widget data available." : "Select a restaurant to view metrics."}
                        </div>
                );
        }

        // Render actual widgets
        return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {widgetsData.map((widget) => (
                                <div
                                        key={widget.id}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col items-center relative transition-shadow duration-200 hover:shadow-md h-[150px] group"
                                        onMouseEnter={() => setHoveredWidget(widget.id)}
                                        onMouseLeave={() => setHoveredWidget(null)}
                                >
                                        {/* Action Icons */}
                                        <div
                                                className={`absolute top-2 right-2 flex gap-0.5 transition-opacity duration-200 opacity-0 group-hover:opacity-100`}
                                        >
                                                <button
                                                        onClick={() => handleMove(widget.id)}
                                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                                                        title="Move widget"
                                                >
                                                        <Move size={14} />
                                                </button>
                                                <button
                                                        onClick={() => handleSettings(widget.id)}
                                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                                                        title="Widget settings"
                                                >
                                                        <Settings size={14} />
                                                </button>
                                                <button
                                                        onClick={() => handleDelete(widget.id)}
                                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
                                                        title="Remove widget"
                                                >
                                                        <Trash2 size={14} />
                                                </button>
                                        </div>

                                        {/* Icon */}
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg mb-3 flex-shrink-0 border border-gray-100">
                                                {widget.icon}
                                        </div>

                                        {/* Value + Label */}
                                        <div className="text-center w-full mt-auto">
                                                <div className="text-xl font-bold text-gray-800 mb-0.5 leading-tight">
                                                        {widget.value}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium truncate capitalize">
                                                        {widget.label}
                                                </div>
                                        </div>
                                </div>
                        ))}
                </div>
        );
}
