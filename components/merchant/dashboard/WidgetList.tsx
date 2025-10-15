"use client";

import React, { useState } from "react";
import { Move, Settings, Trash2, Star, ShoppingBag, FolderTree, MessageSquare } from "lucide-react";
import { useRestaurantStore } from "@/stores/useRestaurantStore";

interface Widget {
    id: string;
    icon: React.ReactNode;
    value: string;
    label: string;
}

export default function WidgetList() {
    const [hoveredWidget, setHoveredWidget] = useState<string | null>(null);
    const { restaurant } = useRestaurantStore();

    const rating = restaurant?.rating ?? 0;
    const totalReview = restaurant?.totalReview ?? 0;
    const totalProducts = restaurant?.products?.length ?? 0;
    const totalCategories = restaurant?.cate?.length ?? 0;

    const widgets: Widget[] = [
        {
            id: "rating",
            icon: <Star className="w-6 h-6 text-yellow-500" />,
            value: `${rating.toFixed(1)} ⭐`,
            label: "Đánh giá trung bình",
        },
        {
            id: "reviews",
            icon: <MessageSquare className="w-6 h-6 text-blue-500" />,
            value: `${totalReview}`,
            label: "Tổng số đánh giá",
        },
        {
            id: "products",
            icon: <ShoppingBag className="w-6 h-6 text-green-500" />,
            value: `${totalProducts}`,
            label: "Sản phẩm hiện có",
        },
        {
            id: "categories",
            icon: <FolderTree className="w-6 h-6 text-purple-500" />,
            value: `${totalCategories}`,
            label: "Danh mục",
        },
    ];

    const handleMove = (widgetId: string) => {
        console.log("Move widget:", widgetId);
    };

    const handleSettings = (widgetId: string) => {
        console.log("Settings for widget:", widgetId);
    };

    const handleDelete = (widgetId: string) => {
        console.log("Delete widget:", widgetId);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {widgets.map((widget) => (
                <div
                    key={widget.id}
                    className="bg-white rounded-lg shadow-sm border p-6 flex flex-col items-center relative transition-all duration-200 hover:shadow-md"
                    onMouseEnter={() => setHoveredWidget(widget.id)}
                    onMouseLeave={() => setHoveredWidget(null)}
                >
                    {/* Action Icons - Hiện khi hover */}
                    <div
                        className={`absolute top-3 right-3 flex gap-1 transition-all duration-200 ${
                            hoveredWidget === widget.id
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-1 pointer-events-none"
                        }`}
                    >
                        <button
                            onClick={() => handleMove(widget.id)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title="Di chuyển widget"
                        >
                            <Move className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => handleSettings(widget.id)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title="Cài đặt widget"
                        >
                            <Settings className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => handleDelete(widget.id)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title="Xóa widget"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    </div>

                    {/* Icon */}
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mb-4">
                        {widget.icon}
                    </div>

                    {/* Giá trị + mô tả */}
                    <div className="text-center w-full">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{widget.value}</div>
                        <div className="text-sm text-gray-500 italic">{widget.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
