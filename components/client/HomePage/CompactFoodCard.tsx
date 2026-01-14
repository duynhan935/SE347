"use client";

import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Product } from "@/types";
import { CheckCircle2, Clock, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type CompactFoodCardProps = {
    product: Product;
};

export const CompactFoodCard = memo(({ product }: CompactFoodCardProps) => {
    const router = useRouter();
    const addItem = useCartStore((state) => state.addItem);
    const setUserId = useCartStore((state) => state.setUserId);
    const { user } = useAuthStore();
    const [isAdding, setIsAdding] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && user?.id) {
            setUserId(user.id);
        }
    }, [isMounted, user?.id, setUserId]);

    const displayPrice = useMemo(() => product.productSizes?.[0]?.price, [product.productSizes]);
    const defaultSize = useMemo(() => product.productSizes?.[0], [product.productSizes]);
    const cardImageUrl = useMemo(() => getImageUrl(product.imageURL), [product.imageURL]);

    useEffect(() => {
        setImageError(false);
    }, [cardImageUrl]);

    // Check for promo/flash sale
    const hasFlashSale = useMemo(() => {
        return product.totalReview > 30 || Math.random() > 0.6;
    }, [product.totalReview]);

    const hasPromo = useMemo(() => {
        return product.totalReview > 20 || Math.random() > 0.7;
    }, [product.totalReview]);

    // Check if favorite (high rating or many reviews)
    const isFavorite = useMemo(() => {
        return product.rating >= 4.5 || product.totalReview > 50;
    }, [product.rating, product.totalReview]);

    // Delivery time
    const deliveryTime = useMemo(() => {
        const duration = product.restaurant?.duration;
        if (!duration || typeof duration !== "number") {
            return "20-30";
        }
        if (duration > 60 || duration <= 0) {
            return "20-30";
        }
        return Math.round(duration).toString();
    }, [product.restaurant?.duration]);

    // Format price to VNĐ
    const formatPrice = useMemo(() => {
        if (displayPrice === undefined) return null;
        // Convert USD to VND (assuming 1 USD = 25,000 VND, adjust as needed)
        const vndPrice = Math.round(displayPrice * 25000);
        return new Intl.NumberFormat("vi-VN").format(vndPrice);
    }, [displayPrice]);

    // Format review count
    const formatReviewCount = useMemo(() => {
        if (!product.totalReview || product.totalReview === 0) return null;
        if (product.totalReview >= 1000) {
            return `${(product.totalReview / 1000).toFixed(1)}k+`;
        }
        return `${product.totalReview}+`;
    }, [product.totalReview]);

    const handleAddToCart = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (isAdding || !isMounted) {
                return;
            }

            if (typeof addItem !== "function") {
                console.warn("[CompactFoodCard] addItem is not available yet");
                return;
            }

            if (!user) {
                toast.error("Please sign in to add items to cart");
                router.push("/login");
                return;
            }

            if (!product.productSizes || product.productSizes.length === 0) {
                toast.error("This product has no available sizes");
                return;
            }

            if (!product.restaurant?.id) {
                toast.error("Restaurant information not found");
                return;
            }

            if (!defaultSize) {
                toast.error("Default size not found");
                return;
            }

            setIsAdding(true);
            try {
                await addItem(
                    {
                        id: product.id,
                        name: product.productName,
                        price: defaultSize.price,
                        image: cardImageUrl,
                        restaurantId: product.restaurant.id,
                        restaurantName: product.restaurant.resName || "Unknown Restaurant",
                        categoryId: product.categoryId,
                        categoryName: product.categoryName,
                        sizeId: defaultSize.id,
                        sizeName: defaultSize.sizeName,
                    },
                    1
                );
                toast.success("Đã thêm vào giỏ hàng");
            } catch (error) {
                console.error("Failed to add to cart:", error);
                toast.error("Unable to add to cart");
            } finally {
                setTimeout(() => {
                    setIsAdding(false);
                }, 300);
            }
        },
        [isAdding, isMounted, user, product, defaultSize, cardImageUrl, addItem, router]
    );

    return (
        <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            {/* Image Section */}
            <Link
                href={product.restaurant?.slug ? `/restaurants/${product.restaurant.slug}?productId=${product.id}` : `/food/${product.slug}`}
                className="block relative w-full aspect-square overflow-hidden"
            >
                <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg">
                    <Image
                        src={imageError ? "/placeholder.png" : cardImageUrl}
                        alt={product.productName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        unoptimized={!product.imageURL || cardImageUrl === "/placeholder.png" || imageError}
                        onError={() => {
                            if (!imageError) {
                                setImageError(true);
                            }
                        }}
                    />

                    {/* Placeholder overlay */}
                    {(!product.imageURL || cardImageUrl === "/placeholder.png") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                            <span className="text-3xl">🍽️</span>
                        </div>
                    )}

                    {/* Favorite Badge - Top Left */}
                    {isFavorite && (
                        <div className="absolute top-1.5 left-1.5 z-20 pointer-events-none">
                            <span className="bg-[#EE4D2D] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                                ❤️ Yêu thích
                            </span>
                        </div>
                    )}

                    {/* Flash Sale / Promo Badge - Top Right */}
                    {hasFlashSale && (
                        <div className="absolute top-1.5 right-1.5 z-20 pointer-events-none">
                            <span className="bg-[#EE4D2D] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-sm">
                                Flash Sale
                            </span>
                        </div>
                    )}
                    {!hasFlashSale && hasPromo && (
                        <div className="absolute top-1.5 right-1.5 z-20 pointer-events-none">
                            <span className="bg-[#EE4D2D] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-sm">
                                Mã giảm giá
                            </span>
                        </div>
                    )}

                    {/* Delivery Time Badge - Bottom Left */}
                    {deliveryTime && (
                        <div className="absolute bottom-1.5 left-1.5 z-20 pointer-events-none">
                            <div className="bg-white/95 backdrop-blur-sm text-gray-800 text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{deliveryTime} min</span>
                            </div>
                        </div>
                    )}

                    {/* Quick Add Button - Bottom Right Corner */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding || !isMounted}
                        className="absolute bottom-2 right-2 z-30 w-8 h-8 bg-[#EE4D2D] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#EE4D2D]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                        title="Thêm vào giỏ"
                    >
                        {isAdding ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </Link>

            {/* Content Section */}
            <div className="p-3 space-y-1.5">
                {/* Product Name - Truncate 1 line */}
                <Link
                    href={product.restaurant?.slug ? `/restaurants/${product.restaurant.slug}?productId=${product.id}` : `/food/${product.slug}`}
                >
                    <h3
                        className="text-sm font-bold text-gray-900 line-clamp-1 truncate mt-1 hover:text-[#EE4D2D] transition-colors"
                        title={product.productName}
                    >
                        {product.productName}
                    </h3>
                </Link>

                {/* Restaurant Name with Verified Icon */}
                <div className="flex items-center gap-1.5">
                    <p className="text-xs text-gray-500 line-clamp-1 flex-1">
                        {product.restaurant?.resName || "Restaurant"}
                    </p>
                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                </div>

                {/* Rating with Review Count */}
                {product.rating > 0 && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-yellow-500">⭐</span>
                            <span className="text-xs font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                        </div>
                        {formatReviewCount && (
                            <span className="text-xs text-gray-500">({formatReviewCount} đánh giá)</span>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="pt-1">
                    {formatPrice ? (
                        <p className="text-base font-bold text-[#EE4D2D]">
                            {formatPrice}đ
                        </p>
                    ) : (
                        <p className="text-xs text-gray-400">Chưa có giá</p>
                    )}
                </div>
            </div>
        </div>
    );
});

CompactFoodCard.displayName = "CompactFoodCard";

