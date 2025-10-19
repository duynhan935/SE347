"use client";

// 1. Import thêm ProductSize
import { Product, ProductSize, Restaurant } from "@/types";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type FoodDetailClientProps = {
        foodItem: Product;
        restaurant: Restaurant;
};

export default function FoodDetail({ foodItem, restaurant }: FoodDetailClientProps) {
        const [quantity, setQuantity] = useState(1);

        const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(foodItem.productSizes?.[0]);

        const handleDecrement = () => {
                setQuantity((prev) => Math.max(1, prev - 1));
        };

        const handleIncrement = () => {
                setQuantity((prev) => prev + 1);
        };

        const currentPrice = selectedSize?.price ?? 0;
        const totalPrice = (currentPrice * quantity).toFixed(2);

        return (
                <div>
                        <Link
                                href={`/restaurants/${restaurant.id}`}
                                className="inline-flex items-center gap-2 text-gray-600 hover:text-black font-semibold mb-8"
                        >
                                <ChevronLeft className="w-5 h-5" />
                                Back to {restaurant.resName}
                        </Link>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 p-4 lg:p-0">
                                <div>
                                        <Image
                                                src={foodItem.imageURL || "/default-food-image.png"}
                                                alt={foodItem.productName}
                                                width={600}
                                                height={600}
                                                className="w-full h-auto object-cover rounded-lg shadow-md"
                                        />
                                </div>

                                <div className="flex flex-col">
                                        <h1 className="text-4xl font-bold">{foodItem.productName}</h1>
                                        {selectedSize ? (
                                                <p className="text-3xl font-bold text-brand-purple my-6">
                                                        ${selectedSize.price.toFixed(2)}
                                                </p>
                                        ) : (
                                                <p className="text-3xl font-bold text-red-500 my-6">
                                                        Please select a size
                                                </p>
                                        )}

                                        <p className="text-gray-500 mt-4 text-md leading-relaxed mb-5">
                                                {foodItem.description}
                                        </p>

                                        <div className="mt-auto">
                                                <div className="mb-6">
                                                        <h3 className="font-semibold text-gray-800 mb-3">
                                                                Select Size
                                                        </h3>
                                                        <div className="flex flex-wrap gap-3">
                                                                {foodItem.productSizes.length > 0 ? (
                                                                        foodItem.productSizes.map((size) => (
                                                                                <button
                                                                                        key={size.id}
                                                                                        onClick={() =>
                                                                                                setSelectedSize(size)
                                                                                        }
                                                                                        className={`px-4 py-2 border rounded-md transition cursor-pointer ${
                                                                                                selectedSize?.id ===
                                                                                                size.id
                                                                                                        ? "bg-brand-purple text-white border-brand-purple"
                                                                                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                                                                        }`}
                                                                                >
                                                                                        {size.sizeName}
                                                                                </button>
                                                                        ))
                                                                ) : (
                                                                        <p className="text-gray-500">
                                                                                No sizes available.
                                                                        </p>
                                                                )}
                                                        </div>
                                                </div>

                                                <label
                                                        htmlFor="special-instructions"
                                                        className="font-semibold text-gray-800"
                                                >
                                                        Special Instructions
                                                </label>
                                                <textarea
                                                        id="special-instructions"
                                                        rows={3}
                                                        placeholder="Add any request here"
                                                        className="w-full mt-2 p-3 border rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                ></textarea>

                                                <div className="flex items-center gap-4 mt-6">
                                                        <div className="flex items-center border rounded-md">
                                                                <button
                                                                        title="Decrement"
                                                                        onClick={handleDecrement}
                                                                        className="p-3 text-gray-600 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                                                                        disabled={quantity <= 1}
                                                                >
                                                                        <Minus className="w-5 h-5" />
                                                                </button>
                                                                <span className="px-6 text-lg font-bold">
                                                                        {quantity}
                                                                </span>
                                                                <button
                                                                        title="Increment"
                                                                        onClick={handleIncrement}
                                                                        className="p-3 text-gray-600 hover:bg-gray-100 cursor-pointer"
                                                                >
                                                                        <Plus className="w-5 h-5" />
                                                                </button>
                                                        </div>

                                                        <button
                                                                className="flex-grow bg-brand-black text-white font-bold py-3 px-6 rounded-md hover:bg-brand-black/90 transition cursor-pointer disabled:bg-gray-400"
                                                                disabled={!selectedSize}
                                                        >
                                                                Add to cart: ${totalPrice}
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
