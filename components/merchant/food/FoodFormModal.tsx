"use client";

import type { Category, Product, ProductCreateData, Restaurant, Size } from "@/types";
import { X } from "lucide-react";

import FoodForm from "./FoodForm";

interface FoodFormModalProps {
    food: Product | null;
    categories: Category[];
    sizes: Size[];
    restaurant: Restaurant | null;
    onSave: (productData: ProductCreateData, imageFile?: File) => Promise<void>;
    onClose: () => void;
}

export default function FoodFormModal({ food, categories, sizes, restaurant, onSave, onClose }: FoodFormModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {food ? "Sửa Món Ăn" : "Thêm Món Ăn Mới"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label="Đóng"
                        title="Đóng"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <FoodForm
                        food={food}
                        categories={categories}
                        sizes={sizes}
                        restaurant={restaurant}
                        onSave={onSave}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
}
