"use client";

import { Product } from "@/types";

interface FoodStatsProps {
        foods: Product[];
}

export default function FoodStats({ foods }: FoodStatsProps) {
        const total = foods.length;
        const availableCount = foods.filter((f) => f.available).length;
        const unavailableCount = total - availableCount;

        return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng Món Ăn</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{total}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Đang Bán</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{availableCount}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Hết Hàng</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{unavailableCount}</p>
                        </div>
                </div>
        );
}
