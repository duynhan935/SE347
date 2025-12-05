"use client";

// 1. Import thêm ProductSize
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Product, ProductSize, Restaurant } from "@/types";
import { ChevronRight, Home, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type FoodDetailClientProps = {
        foodItem: Product;
        restaurant: Restaurant;
};

export default function FoodDetail({ foodItem, restaurant }: FoodDetailClientProps) {
        const router = useRouter();
        const { addItem } = useCartStore();
        const { user } = useAuthStore();
        const [quantity, setQuantity] = useState(1);
        const [specialInstructions, setSpecialInstructions] = useState("");
        const [isAdding, setIsAdding] = useState(false);

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
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 mb-8 text-sm">
                                <Link
                                        href="/"
                                        className="flex items-center gap-1 text-gray-600 hover:text-brand-purple transition-colors"
                                >
                                        <Home className="w-4 h-4" />
                                        <span className="font-medium">Trang chủ</span>
                                </Link>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <Link
                                        href="/restaurants"
                                        className="text-gray-600 hover:text-brand-purple transition-colors font-medium"
                                >
                                        Nhà hàng
                                </Link>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <Link
                                        href={`/restaurants/${restaurant.slug}`}
                                        className="text-gray-600 hover:text-brand-purple transition-colors font-medium"
                                >
                                        {restaurant.resName}
                                </Link>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-800 font-semibold truncate max-w-[300px]">
                                        {foodItem.productName}
                                </span>
                        </nav>

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
                                                        value={specialInstructions}
                                                        onChange={(e) => setSpecialInstructions(e.target.value)}
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
                                                                onClick={async () => {
                                                                        // Prevent multiple clicks
                                                                        if (isAdding) {
                                                                                return;
                                                                        }

                                                                        if (!user) {
                                                                                toast.error(
                                                                                        "Please login to add items to cart"
                                                                                );
                                                                                router.push("/login");
                                                                                return;
                                                                        }

                                                                        if (!selectedSize) {
                                                                                toast.error("Please select a size");
                                                                                return;
                                                                        }

                                                                        setIsAdding(true);
                                                                        try {
                                                                                await addItem(
                                                                                        {
                                                                                                id: foodItem.id,
                                                                                                name: foodItem.productName,
                                                                                                price: selectedSize.price,
                                                                                                image:
                                                                                                        foodItem.imageURL ||
                                                                                                        "/placeholder.png",
                                                                                                restaurantId:
                                                                                                        restaurant.id,
                                                                                                restaurantName:
                                                                                                        restaurant.resName,
                                                                                                sizeId: selectedSize.id,
                                                                                                sizeName: selectedSize.sizeName,
                                                                                                customizations:
                                                                                                        specialInstructions ||
                                                                                                        undefined,
                                                                                        },
                                                                                        quantity
                                                                                );

                                                                                // Reset form
                                                                                setQuantity(1);
                                                                                setSpecialInstructions("");
                                                                        } catch (error) {
                                                                                console.error(
                                                                                        "Failed to add to cart:",
                                                                                        error
                                                                                );
                                                                                toast.error(
                                                                                        "Failed to add item to cart"
                                                                                );
                                                                        } finally {
                                                                                setTimeout(() => {
                                                                                        setIsAdding(false);
                                                                                }, 300);
                                                                        }
                                                                }}
                                                                className="flex-grow bg-brand-black text-white font-bold py-3 px-6 rounded-md hover:bg-brand-black/90 transition cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                disabled={!selectedSize || isAdding}
                                                        >
                                                                {isAdding
                                                                        ? "Đang thêm..."
                                                                        : `Add to cart: $${totalPrice}`}
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
