"use client";

import { ChevronLeft, Minus, Plus } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useState } from "react";

type MenuItem = {
        id: number;
        name: string;
        ingredients: string;
        description: string;
        price: number;
        image: StaticImageData;
};
type RestaurantInfo = {
        id: number;
        name: string;
};

type FoodDetailClientProps = {
        foodItem: MenuItem;
        restaurant: RestaurantInfo;
};

export default function FoodDetail({ foodItem, restaurant }: FoodDetailClientProps) {
        const [quantity, setQuantity] = useState(1);

        const handleDecrement = () => {
                setQuantity((prev) => Math.max(1, prev - 1));
        };

        const handleIncrement = () => {
                setQuantity((prev) => prev + 1);
        };

        const totalPrice = (foodItem.price * quantity).toFixed(2);

        return (
                <div>
                        <Link
                                href={`/restaurants/${restaurant.id}`}
                                className="inline-flex items-center gap-2 text-gray-600 hover:text-black font-semibold mb-8"
                        >
                                <ChevronLeft className="w-5 h-5" />
                                Back to {restaurant.name}
                        </Link>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 p-4 lg:p-0">
                                {/* Cột bên trái: Hình ảnh */}
                                <div>
                                        <Image
                                                src={foodItem.image}
                                                alt={foodItem.name}
                                                width={600}
                                                height={600}
                                                className="w-full h-auto object-cover rounded-lg shadow-md"
                                        />
                                </div>

                                {/* Cột bên phải: Thông tin và tương tác */}
                                <div className="flex flex-col">
                                        <h1 className="text-4xl font-bold">{foodItem.name}</h1>
                                        <p className="text-3xl font-bold text-brand-purple my-6">
                                                ${foodItem.price.toFixed(2)}
                                        </p>

                                        <p className="text-gray-600 mt-4 text-lg leading-relaxed">
                                                <span className="font-bold"> Ingredients: </span>
                                                {foodItem.ingredients}
                                        </p>

                                        <p className="text-gray-500 mt-4 text-md leading-relaxed mb-5">
                                                {foodItem.description}
                                        </p>

                                        <div className="mt-auto">
                                                {" "}
                                                {/* Đẩy phần dưới cùng xuống */}
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
                                                        {/* Bộ chọn số lượng */}
                                                        <div className="flex items-center border rounded-md">
                                                                <button
                                                                        title="Decrement"
                                                                        onClick={handleDecrement}
                                                                        className="p-3 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
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
                                                                        className="p-3 text-gray-600 hover:bg-gray-100"
                                                                >
                                                                        <Plus className="w-5 h-5" />
                                                                </button>
                                                        </div>

                                                        <button className="flex-grow bg-brand-black text-white font-bold py-3 px-6 rounded-md hover:bg-brand-black/90 transition cursor-pointer">
                                                                Add to cart: ${totalPrice}
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
