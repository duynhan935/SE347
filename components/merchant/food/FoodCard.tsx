"use client";

import { Product } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";

interface FoodCardProps {
    food: Product;
    onEdit: (food: Product) => void;
    onDelete: (foodId: string) => void;
}

export default function FoodCard({ food, onEdit, onDelete }: FoodCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Food Image */}
            <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
                {food.imageURL && typeof food.imageURL === "string" && food.imageURL.trim() !== "" ? (
                    <Image src={food.imageURL} alt={food.productName} fill className="object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
                <div className="absolute top-2 right-2">
                    <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            food.available
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                    >
                        {food.available ? "Có sẵn" : "Hết hàng"}
                    </span>
                </div>
            </div>

            {/* Food Info */}
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {food.productName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{food.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Danh mục: {food.categoryName}</span>
                    <span className="text-lg font-bold text-brand-purple">
                        {food.productSizes[0]?.price.toLocaleString("vi-VN") || "N/A"}đ
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => onEdit(food)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <Edit size={16} />
                        Sửa
                    </button>
                    <button
                        onClick={() => onDelete(food.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}
