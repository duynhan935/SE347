"use client";

import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Product } from "@/types";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

type FoodCardProps = {
        product: Product;
};

export const FoodCard = memo(({ product }: FoodCardProps) => {
        const router = useRouter();
        const { addItem } = useCartStore();
        const { user } = useAuthStore();
        const [isAdding, setIsAdding] = useState(false);

        const displayPrice = useMemo(() => product.productSizes?.[0]?.price, [product.productSizes]);
        const defaultSize = useMemo(() => product.productSizes?.[0], [product.productSizes]);

        const handleAddToCart = useCallback(
                async (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Prevent multiple clicks
                        if (isAdding) {
                                return;
                        }

                        if (!user) {
                                toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
                                router.push("/login");
                                return;
                        }

                        if (!product.productSizes || product.productSizes.length === 0) {
                                toast.error("Sản phẩm này không có size khả dụng");
                                return;
                        }

                        if (!product.restaurant?.id) {
                                toast.error("Không tìm thấy thông tin nhà hàng");
                                return;
                        }

                        setIsAdding(true);
                        try {
                                await addItem(
                                        {
                                                id: product.id,
                                                name: product.productName,
                                                price: defaultSize.price,
                                                image: product.imageURL || "/placeholder.png",
                                                restaurantId: product.restaurant.id,
                                                restaurantName: product.restaurant.resName || "Unknown Restaurant",
                                                sizeId: defaultSize.id,
                                                sizeName: defaultSize.sizeName,
                                        },
                                        1
                                );
                                // Toast notification is handled by cartStore.addItem
                        } catch (error) {
                                console.error("Failed to add to cart:", error);
                                toast.error("Không thể thêm vào giỏ hàng");
                        } finally {
                                // Ensure state is reset even if there's an error
                                setTimeout(() => {
                                        setIsAdding(false);
                                }, 300); // Small delay to prevent rapid clicks
                        }
                },
                [isAdding, user, product, defaultSize, addItem, router]
        );

        const handleBuyNow = useCallback(
                async (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (!user) {
                                toast.error("Vui lòng đăng nhập để mua hàng");
                                router.push("/login");
                                return;
                        }

                        // Add to cart first, then redirect to checkout
                        await handleAddToCart(e);
                        if (product.restaurant?.id) {
                                router.push(`/payment?restaurantId=${product.restaurant.id}`);
                        }
                },
                [user, product, router, handleAddToCart]
        );

        return (
                <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                        {/* Clickable Link - Entire card is clickable */}
                        <Link href={`/food/${product.slug}`} className="flex-grow flex flex-col">
                                {/* Image Section - Same as RestaurantCard */}
                                <div className="relative w-full h-48">
                                        <Image
                                                src={product.imageURL || "/placeholder.png"}
                                                alt={product.productName}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />

                                        {/* Delivery time badge */}
                                        {product.restaurant && (
                                                <div className="absolute bottom-2 right-2 bg-white/80 text-gray-800 text-xs px-2 py-1 rounded-full backdrop-blur-sm font-semibold">
                                                        {product.restaurant.duration} min
                                                </div>
                                        )}
                                </div>

                                {/* Content Section - Same structure as RestaurantCard */}
                                <div className="p-4 flex-grow flex flex-col">
                                        <h3 className="font-bold text-lg truncate" title={product.productName}>
                                                {product.productName}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 truncate">
                                                {product.restaurant?.resName}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-3 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                        <span className="font-medium text-gray-800">
                                                                {product.rating.toFixed(1)}
                                                        </span>
                                                        <span className="text-gray-500">
                                                                ({product.totalReview.toLocaleString()})
                                                        </span>
                                                </div>

                                                {/* Price */}
                                                {displayPrice !== undefined ? (
                                                        <span className="text-lg font-bold text-brand-purple">
                                                                ${displayPrice.toFixed(2)}
                                                        </span>
                                                ) : (
                                                        <span className="text-xs text-gray-500">No price</span>
                                                )}
                                        </div>
                                </div>
                        </Link>

                        {/* Action Buttons - Outside Link, prevent navigation */}
                        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                        <button
                                                onClick={handleAddToCart}
                                                disabled={isAdding}
                                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                                {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
                                        </button>
                                        <button
                                                onClick={handleBuyNow}
                                                disabled={isAdding}
                                                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-brand-purple hover:bg-brand-purple/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                                Mua ngay
                                        </button>
                                </div>
                        </div>
                </div>
        );
});

FoodCard.displayName = "FoodCard";
