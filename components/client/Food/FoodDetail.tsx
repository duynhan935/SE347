"use client";

// 1. Import thêm ProductSize
import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Product, ProductSize, Restaurant } from "@/types";
import { ChevronRight, Home, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
    const [isMounted, setIsMounted] = useState(false);

    const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(foodItem.productSizes?.[0]);

    // Ensure component is mounted (client-side only)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleDecrement = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    const handleIncrement = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleAddToCart = useCallback(async () => {
        // Prevent multiple clicks or if not mounted
        if (isAdding || !isMounted) {
            return;
        }

        // Ensure addItem is available (should always be, but double-check)
        if (typeof addItem !== "function") {
            console.warn("[FoodDetail] addItem is not available yet");
            return;
        }

        if (!user) {
            toast.error("Please login to add items to cart");
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
                    image: getImageUrl(foodItem.imageURL),
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.resName,
                    categoryId: foodItem.categoryId,
                    categoryName: foodItem.categoryName,
                    sizeId: selectedSize.id,
                    sizeName: selectedSize.sizeName,
                    customizations: specialInstructions || undefined,
                },
                quantity
            );

            // Reset form
            setQuantity(1);
            setSpecialInstructions("");
        } catch (error) {
            console.error("Failed to add to cart:", error);
            toast.error("Failed to add item to cart");
        } finally {
            setTimeout(() => {
                setIsAdding(false);
            }, 300);
        }
    }, [isAdding, isMounted, addItem, user, selectedSize, foodItem, restaurant, quantity, specialInstructions, router]);

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
                <span className="text-gray-800 font-semibold truncate max-w-[300px]">{foodItem.productName}</span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 p-4 lg:p-0">
                {/* Image Section - Improved design */}
                <div className="relative">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <Image
                            src={getImageUrl(foodItem.imageURL, "/default-food-image.png")}
                            alt={foodItem.productName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            unoptimized={
                                !foodItem.imageURL ||
                                getImageUrl(foodItem.imageURL, "/default-food-image.png") === "/default-food-image.png"
                            }
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.png";
                            }}
                        />
                        {/* Placeholder overlay for broken images */}
                        {(!foodItem.imageURL ||
                            getImageUrl(foodItem.imageURL, "/default-food-image.png") ===
                                "/default-food-image.png") && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl">
                                <div className="text-center">
                                    <span className="text-6xl mb-3 block">🍽️</span>
                                    <span className="text-sm text-gray-600 font-medium">Đang chuẩn bị...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col space-y-6">
                    {/* Product Name - Bold and prominent */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{foodItem.productName}</h1>
                        {/* Price - Prominent with gradient */}
                        {selectedSize ? (
                            <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                ${selectedSize.price.toFixed(2)}
                            </p>
                        ) : (
                            <p className="text-lg font-semibold text-red-500">Vui lòng chọn size</p>
                        )}
                    </div>

                    {/* Description */}
                    {foodItem.description && (
                        <p className="text-gray-600 text-base leading-relaxed">{foodItem.description}</p>
                    )}

                    <div className="mt-auto space-y-6">
                        {/* Size Selection */}
                        {foodItem.productSizes && foodItem.productSizes.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 text-lg">Chọn size</h3>
                                <div className="flex flex-wrap gap-3">
                                    {foodItem.productSizes.map((size) => (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-5 py-2.5 border-2 rounded-full font-semibold transition-all duration-200 ${
                                                selectedSize?.id === size.id
                                                    ? "bg-brand-purple text-white border-brand-purple shadow-md"
                                                    : "bg-white text-gray-700 border-gray-300 hover:border-brand-purple/50 hover:bg-gray-50"
                                            }`}
                                        >
                                            {size.sizeName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Special Instructions */}
                        <div>
                            <label
                                htmlFor="special-instructions"
                                className="block font-bold text-gray-900 mb-2 text-lg"
                            >
                                Ghi chú đặc biệt (tùy chọn)
                            </label>
                            <textarea
                                id="special-instructions"
                                rows={3}
                                placeholder="Thêm yêu cầu đặc biệt của bạn..."
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all duration-200 resize-none"
                            ></textarea>
                        </div>

                        {/* Quantity and Add to Cart */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            {/* Quantity Controls - Improved design */}
                            <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
                                <button
                                    title="Giảm số lượng"
                                    onClick={handleDecrement}
                                    className="p-3 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <span className="px-6 py-3 text-lg font-bold text-gray-900 min-w-[4rem] text-center border-x border-gray-200">
                                    {quantity}
                                </span>
                                <button
                                    title="Tăng số lượng"
                                    onClick={handleIncrement}
                                    className="p-3 text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Add to Cart Button - Pill-shaped */}
                            {isMounted && (
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-brand-purple text-white font-bold py-4 px-8 rounded-full hover:bg-brand-purple/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                                    disabled={!selectedSize || isAdding || !isMounted}
                                >
                                    {isAdding ? "Đang thêm..." : `Thêm vào giỏ • $${totalPrice}`}
                                </button>
                            )}
                            {!isMounted && (
                                <div className="flex-1 bg-gray-400 text-white font-bold py-4 px-8 rounded-full text-center">
                                    Đang tải...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
