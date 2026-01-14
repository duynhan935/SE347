"use client";

import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Product } from "@/types";
import { Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type FoodCardProps = {
    product: Product;
    layout?: "grid" | "flex"; // Option 1: grid (ShopeeFood), Option 2: flex (horizontal)
};

export const FoodCard = memo(({ product, layout = "grid" }: FoodCardProps) => {
    const router = useRouter();
    const addItem = useCartStore((state) => state.addItem);
    const setUserId = useCartStore((state) => state.setUserId);
    const { user } = useAuthStore();
    const [isAdding, setIsAdding] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Ensure component is mounted (client-side only)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Ensure userId is set in cart store when user is available
    useEffect(() => {
        if (isMounted && user?.id) {
            setUserId(user.id);
        }
    }, [isMounted, user?.id, setUserId]);

    const displayPrice = useMemo(() => product.productSizes?.[0]?.price, [product.productSizes]);
    const defaultSize = useMemo(() => product.productSizes?.[0], [product.productSizes]);
    const cardImageUrl = useMemo(() => getImageUrl(product.imageURL), [product.imageURL]);

    // Determine if product is best seller or popular (you can adjust logic based on your data)
    const isBestSeller = useMemo(() => {
        return product.totalReview > 50 || product.rating >= 4.5;
    }, [product.totalReview, product.rating]);

    const isPopular = useMemo(() => {
        return product.totalReview > 20 && product.rating >= 4.0;
    }, [product.totalReview, product.rating]);

    // Validate and format delivery time
    const deliveryTime = useMemo(() => {
        const duration = product.restaurant?.duration;
        if (!duration || typeof duration !== "number") {
            return null;
        }
        // If duration is unreasonable (> 60 minutes), show default range
        if (duration > 60 || duration <= 0) {
            return "20-30"; // Default reasonable range
        }
        return Math.round(duration).toString();
    }, [product.restaurant?.duration]);

    const isFastDelivery = useMemo(() => {
        const duration = product.restaurant?.duration;
        return duration && typeof duration === "number" && duration > 0 && duration <= 30;
    }, [product.restaurant?.duration]);

    const handleAddToCart = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (isAdding || !isMounted) {
                return;
            }

            if (typeof addItem !== "function") {
                console.warn("[FoodCard] addItem is not available yet");
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

            if (!defaultSize) {
                toast.error("Không tìm thấy size mặc định");
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
            } catch (error) {
                console.error("Failed to add to cart:", error);
                toast.error("Không thể thêm vào giỏ hàng");
            } finally {
                setTimeout(() => {
                    setIsAdding(false);
                }, 300);
            }
        },
        [isAdding, isMounted, user, product, defaultSize, cardImageUrl, addItem, router]
    );

    const handleBuyNow = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (isAdding || !isMounted) {
                return;
            }

            if (typeof addItem !== "function") {
                console.warn("[FoodCard] addItem is not available yet");
                return;
            }

            if (!user) {
                toast.error("Vui lòng đăng nhập để mua hàng");
                router.push("/login");
                return;
            }

            if (!product.restaurant?.id) {
                toast.error("Không tìm thấy thông tin nhà hàng");
                return;
            }

            setIsAdding(true);
            try {
                await handleAddToCart(e);
                await new Promise((resolve) => setTimeout(resolve, 500));
                router.push(`/payment?restaurantId=${product.restaurant.id}`);
            } catch (error) {
                console.error("Failed to add to cart in Buy Now:", error);
                toast.error("Không thể thêm vào giỏ hàng");
            } finally {
                setTimeout(() => {
                    setIsAdding(false);
                }, 300);
            }
        },
        [isAdding, isMounted, addItem, user, product, router, handleAddToCart]
    );

    // Option 1: Grid Layout (ShopeeFood style) - RECOMMENDED
    if (layout === "grid") {
        return (
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-[transform,shadow] duration-300 h-full flex flex-col hover:-translate-y-1">
                {/* Image Section - Rounded top corners */}
                <Link href={`/food/${product.slug}`} className="block relative">
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <Image
                            src={cardImageUrl}
                            alt={product.productName}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out rounded-t-2xl"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={!product.imageURL || cardImageUrl === "/placeholder.png"}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.png";
                            }}
                        />
                        {/* Placeholder overlay for broken images */}
                        {(!product.imageURL || cardImageUrl === "/placeholder.png") && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 rounded-t-2xl">
                                <div className="text-center">
                                    <span className="text-4xl mb-2 block">🍽️</span>
                                    <span className="text-xs text-gray-600 font-medium">Đang chuẩn bị...</span>
                                </div>
                            </div>
                        )}

                        {/* Badges on Image - Top Left */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                            {isBestSeller && (
                                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                                    🔥 Best Seller
                                </span>
                            )}
                            {!isBestSeller && isPopular && (
                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                                    ⚡ Bán chạy
                                </span>
                            )}
                            {isFastDelivery && !isBestSeller && (
                                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                                    ⚡ Fast
                                </span>
                            )}
                        </div>

                        {/* Delivery time badge - Top Right with glassmorphism */}
                        {deliveryTime && (
                            <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md text-gray-800 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-lg border border-white/50 z-10">
                                ⏱ {deliveryTime} phút
                            </div>
                        )}
                    </div>
                </Link>

                {/* Content Section - More padding for breathing room */}
                <div className="p-5 flex-grow flex flex-col">
                    <Link href={`/food/${product.slug}`} className="flex-grow flex flex-col">
                        {/* Product Name - Capitalize first letter, Bold, Larger */}
                        <h3
                            className="font-bold text-lg md:text-xl text-gray-900 line-clamp-2 mb-2 leading-tight"
                            title={product.productName}
                        >
                            {product.productName.charAt(0).toUpperCase() + product.productName.slice(1)}
                        </h3>

                        {/* Rating - Only show if > 0, with stars */}
                        {product.rating > 0 && (
                            <div className="flex items-center gap-1.5 mb-3">
                                <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span
                                            key={i}
                                            className={`text-xs ${
                                                i < Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"
                                            }`}
                                        >
                                            ⭐
                                        </span>
                                    ))}
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                                {product.totalReview > 0 && (
                                    <span className="text-xs text-gray-400">({product.totalReview})</span>
                                )}
                            </div>
                        )}

                        {/* Restaurant Name / Category - Smaller, lighter gray */}
                        <p className="text-xs text-gray-400 line-clamp-1 mb-3">
                            {product.restaurant?.resName || "Restaurant"}
                        </p>

                        {/* Price - Orange/Red-orange color, Prominent */}
                        <div className="mt-auto pt-2">
                            {displayPrice !== undefined ? (
                                <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                    ${displayPrice.toFixed(2)}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400">No price</p>
                            )}
                        </div>
                    </Link>

                    {/* Action Buttons - Pill-shaped CTA, refined + button */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={handleBuyNow}
                            disabled={isAdding || !isMounted}
                            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isAdding ? "Đang xử lý..." : "Mua ngay"}
                        </button>
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding || !isMounted}
                            className="p-2.5 text-brand-purple hover:bg-brand-purple/10 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-brand-purple/30 hover:border-brand-purple/50 bg-white hover:shadow-md"
                            title="Thêm vào giỏ"
                            aria-label="Thêm vào giỏ"
                        >
                            {isAdding ? (
                                <ShoppingCart className="w-5 h-5 animate-pulse" />
                            ) : (
                                <Plus className="w-5 h-5 font-bold" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Option 2: Flex Layout (Horizontal) - For long lists - Larger image
    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-[transform,shadow] duration-300 flex flex-row h-full hover:-translate-y-1">
            {/* Image Section - Left - Much larger (60-65% width) */}
            <Link
                href={`/food/${product.slug}`}
                className="block relative flex-shrink-0 w-[60%] md:w-[65%] min-w-[200px]"
            >
                <div className="relative w-full h-full min-h-[180px] md:min-h-[220px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-l-2xl">
                    <Image
                        src={cardImageUrl}
                        alt={product.productName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out rounded-l-2xl"
                        sizes="(max-width: 768px) 200px, 280px"
                        unoptimized={!product.imageURL || cardImageUrl === "/placeholder.png"}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.png";
                        }}
                    />
                    {/* Placeholder overlay - Larger and more visible */}
                    {(!product.imageURL || cardImageUrl === "/placeholder.png") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 rounded-l-2xl">
                            <div className="text-center">
                                <span className="text-4xl md:text-5xl block mb-2">🍽️</span>
                                <span className="text-xs md:text-sm text-gray-600 font-medium">Đang chuẩn bị...</span>
                            </div>
                        </div>
                    )}

                    {/* Badges - Top Left - Larger */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {isBestSeller && (
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                🔥 Best Seller
                            </span>
                        )}
                        {!isBestSeller && isPopular && (
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                ⚡ Bán chạy
                            </span>
                        )}
                        {isFastDelivery && !isBestSeller && !isPopular && (
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                ⚡ Fast
                            </span>
                        )}
                    </div>

                    {/* Delivery time badge - Top Right with glassmorphism */}
                    {deliveryTime && (
                        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md text-gray-800 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-lg border border-white/50 z-10">
                            ⏱ {deliveryTime} phút
                        </div>
                    )}
                </div>
            </Link>

            {/* Content Section - Right - More spacious and better layout */}
            <div className="flex-1 flex flex-col p-5 md:p-6 min-w-0 justify-between">
                <Link href={`/food/${product.slug}`} className="flex-grow flex flex-col min-w-0">
                    {/* Restaurant Name - Small, light gray at top */}
                    {product.restaurant?.resName && (
                        <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide mb-1.5 font-semibold">
                            {product.restaurant.resName}
                        </p>
                    )}

                    {/* Product Name - Large, Bold, Black */}
                    <h3
                        className="font-bold text-xl md:text-2xl text-gray-900 line-clamp-2 mb-3 leading-tight tracking-tight"
                        title={product.productName}
                    >
                        {product.productName.charAt(0).toUpperCase() + product.productName.slice(1)}
                    </h3>

                    {/* Rating with stars - Larger */}
                    {product.rating > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span
                                        key={i}
                                        className={`text-xs md:text-sm ${
                                            i < Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                    >
                                        ⭐
                                    </span>
                                ))}
                            </div>
                            <span className="text-xs md:text-sm font-semibold text-gray-700">
                                {product.rating.toFixed(1)}
                            </span>
                            {product.totalReview > 0 && (
                                <span className="text-xs text-gray-500">({product.totalReview})</span>
                            )}
                        </div>
                    )}

                    {/* Price - Large, Orange/Red-orange gradient */}
                    <div className="mt-auto mb-4">
                        {displayPrice !== undefined ? (
                            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent leading-none">
                                ${displayPrice.toFixed(2)}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400">No price</p>
                        )}
                    </div>
                </Link>

                {/* Action Buttons - Bottom, full width */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding || !isMounted}
                        className="p-2.5 text-brand-purple hover:bg-brand-purple/10 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-brand-purple/30 hover:border-brand-purple/50 bg-white hover:shadow-md"
                        title="Thêm vào giỏ"
                        aria-label="Thêm vào giỏ"
                    >
                        {isAdding ? (
                            <ShoppingCart className="w-5 h-5 animate-pulse" />
                        ) : (
                            <Plus className="w-5 h-5 font-bold" />
                        )}
                    </button>
                    <button
                        onClick={handleBuyNow}
                        disabled={isAdding || !isMounted}
                        className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isAdding ? "Đang xử lý..." : "Mua ngay"}
                    </button>
                </div>
            </div>
        </div>
    );
});

FoodCard.displayName = "FoodCard";
