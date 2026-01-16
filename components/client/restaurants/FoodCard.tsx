"use client";

import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Product } from "@/types";
import { CheckCircle2, Plus } from "lucide-react";
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
    const [imageError, setImageError] = useState(false);

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
    
    // Format price to USD
    const formattedPrice = useMemo(() => {
        if (displayPrice === undefined) return null;
        // Format with comma separator, 2 decimals for USD
        return displayPrice.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [displayPrice]);
    
    // Format sold count
    const soldCount = useMemo(() => {
        const count = product.totalReview || Math.floor(Math.random() * 500) + 50; // Mock sold count if not available
        if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
        return `${count}+`;
    }, [product.totalReview]);

    // Reset image error when image URL changes
    useEffect(() => {
        setImageError(false);
    }, [cardImageUrl]);

    // Determine if product is best seller or popular (you can adjust logic based on your data)
    const isBestSeller = useMemo(() => {
        return product.totalReview > 50 || product.rating >= 4.5;
    }, [product.totalReview, product.rating]);

    const isPopular = useMemo(() => {
        return product.totalReview > 20 && product.rating >= 4.0;
    }, [product.totalReview, product.rating]);

    // Check for promo/freeship (you can adjust logic based on your data)
    const hasPromo = useMemo(() => {
        // Example: Check if product has discount or special offer
        return product.totalReview > 30 || Math.random() > 0.7; // Placeholder logic
    }, [product.totalReview]);

    const hasFreeship = useMemo(() => {
        // Example: Check if restaurant offers free shipping
        return product.restaurant?.duration && product.restaurant.duration <= 25;
    }, [product.restaurant?.duration]);

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
                // Toast is handled by cartStore.addItem
            } catch (error) {
                console.error("Failed to add to cart:", error);
                // Error toast is handled by cartStore.addItem
            } finally {
                setTimeout(() => {
                    setIsAdding(false);
                }, 300);
            }
        },
        [isAdding, isMounted, user, product, defaultSize, cardImageUrl, addItem, router]
    );


    // Option 1: Grid Layout (ShopeeFood style) - RECOMMENDED
    if (layout === "grid") {
        return (
            <div className="group relative bg-white rounded-lg overflow-visible shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-[transform,shadow,border] duration-300 h-full flex flex-col hover:-translate-y-1 hover:border-2 hover:border-[#EE4D2D]/30 max-w-[280px] mx-auto">
                {/* Image Section - Rounded top corners */}
                <Link 
                    href={product.restaurant?.slug ? `/restaurants/${product.restaurant.slug}?productId=${product.id}` : `/food/${product.slug}`} 
                    className="block relative"
                >
                    <div className="relative w-full aspect-square overflow-hidden bg-gray-100 rounded-t-lg">
                        <Image
                            src={imageError ? "/placeholder.png" : cardImageUrl}
                            alt={product.productName}
                            fill
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 ease-out"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={!product.imageURL || cardImageUrl === "/placeholder.png" || imageError}
                            onError={() => {
                                // Only set error state once to prevent infinite loop
                                if (!imageError) {
                                    setImageError(true);
                                }
                            }}
                        />
                        {/* Placeholder overlay for broken images */}
                        {(!product.imageURL || cardImageUrl === "/placeholder.png") && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                                <div className="text-center">
                                    <span className="text-4xl mb-2 block">🍽️</span>
                                    <span className="text-xs text-gray-600 font-medium">Preparing...</span>
                                </div>
                            </div>
                        )}

                        {/* Promo/Freeship Badges - Top Right Corner */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                            {hasFreeship && (
                                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
                                    🚚 Freeship
                                </span>
                            )}
                            {hasPromo && !hasFreeship && (
                                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
                                    🎁 Promo
                                </span>
                            )}
                        </div>

                        {/* Best Seller/Popular Badges - Top Left */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                            {isBestSeller && (
                                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                                    🔥 Best Seller
                                </span>
                            )}
                            {!isBestSeller && isPopular && (
                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                                    ⚡ Bestseller
                                </span>
                            )}
                        </div>

                        {/* Rating & Time Badges - Bottom Left Overlay */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                            {product.rating > 0 && (
                                <div className="bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-semibold px-2 py-1 rounded-full shadow-md border border-white/50 flex items-center gap-1">
                                    <span className="text-yellow-500">⭐</span>
                                    <span>{product.rating.toFixed(1)}</span>
                                </div>
                            )}
                            {deliveryTime && (
                                <div className="bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-semibold px-2 py-1 rounded-full shadow-md border border-white/50 flex items-center gap-1">
                                    <span>🕒</span>
                                    <span>{deliveryTime} min</span>
                                </div>
                            )}
                        </div>

                    </div>
                </Link>

                {/* Content Section - More padding for breathing room */}
                <div className="p-5 flex-grow flex flex-col">
                    <Link 
                        href={product.restaurant?.slug ? `/restaurants/${product.restaurant.slug}?productId=${product.id}` : `/food/${product.slug}`} 
                        className="flex-grow flex flex-col"
                    >
                        {/* Product Name - Bold and Larger */}
                        <h3
                            className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 leading-tight"
                            title={product.productName}
                        >
                            {product.productName.charAt(0).toUpperCase() + product.productName.slice(1)}
                        </h3>

                        {/* Rating & Sold Count - Trust Information */}
                        <div className="flex items-center gap-2 mb-2">
                            {product.rating > 0 && (
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-500 text-xs">⭐</span>
                                    <span className="text-xs font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                                </div>
                            )}
                            <span className="text-xs text-gray-500">• {soldCount} sold</span>
                        </div>

                        {/* Restaurant Name with Verified Icon */}
                        <div className="flex items-center gap-1.5 mb-3">
                            <p className="text-sm text-gray-500 line-clamp-1 flex-1">
                                {product.restaurant?.resName || "Restaurant"}
                            </p>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        </div>

                        {/* Price - Orange-Red color, Prominent */}
                        <div className="mt-auto pt-2 relative pr-14">
                            {formattedPrice ? (
                                <p className="text-base md:text-lg font-bold text-[#EE4D2D]">
                                    {formattedPrice} ₫
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400">No price</p>
                            )}
                        </div>
                    </Link>

                    {/* Circle Add Button - Bottom Right Corner of Image */}
                    <div className="absolute bottom-3 right-3 z-20">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding || !isMounted}
                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-[#EE4D2D] hover:bg-[#EE4D2D]/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                            title="Add to Cart"
                            aria-label="Add to Cart"
                        >
                            {isAdding ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Plus className="w-5 h-5 md:w-6 md:h-6 font-bold" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Option 2: Flex Layout (Horizontal) - For long lists - Larger image
    return (
        <div className="group relative bg-white rounded-2xl overflow-visible shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-[transform,shadow,border] duration-300 flex flex-row h-full hover:-translate-y-1 hover:border-2 hover:border-[#EE4D2D]/30">
            {/* Image Section - Left - Much larger (60-65% width) */}
            <Link
                href={product.restaurant?.slug ? `/restaurants/${product.restaurant.slug}?productId=${product.id}` : `/food/${product.slug}`}
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
                                <span className="text-xs md:text-sm text-gray-600 font-medium">Preparing...</span>
                            </div>
                        </div>
                    )}

                    {/* Promo/Freeship Badges - Top Right Corner */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                        {hasFreeship && (
                            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
                                🚚 Freeship
                            </span>
                        )}
                        {hasPromo && !hasFreeship && (
                            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
                                🎁 Promo
                            </span>
                        )}
                    </div>

                    {/* Best Seller/Popular Badges - Top Left */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {isBestSeller && (
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                                🔥 Best Seller
                            </span>
                        )}
                        {!isBestSeller && isPopular && (
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                                ⚡ Bestseller
                            </span>
                        )}
                    </div>

                    {/* Rating & Time Badges - Bottom Left Overlay */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                        {product.rating > 0 && (
                            <div className="bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-semibold px-2 py-1 rounded-full shadow-md border border-white/50 flex items-center gap-1">
                                <span className="text-yellow-500">⭐</span>
                                <span>{product.rating.toFixed(1)}</span>
                            </div>
                        )}
                        {deliveryTime && (
                            <div className="bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-semibold px-2 py-1 rounded-full shadow-md border border-white/50 flex items-center gap-1">
                                <span>🕒</span>
                                <span>{deliveryTime} min</span>
                            </div>
                        )}
                    </div>

                </div>
            </Link>

            {/* Content Section - Right - More spacious and better layout */}
            <div className="flex-1 flex flex-col p-5 md:p-6 min-w-0 justify-between">
                <Link 
                    href={product.restaurant?.slug ? `/restaurants/${product.restaurant.slug}?productId=${product.id}` : `/food/${product.slug}`} 
                    className="flex-grow flex flex-col min-w-0"
                >
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

                    {/* Restaurant Name with Rating */}
                    {product.restaurant?.resName && (
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs text-gray-500 flex-1">
                                {product.restaurant.resName}
                            </p>
                            {product.rating > 0 && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <span className="text-yellow-500 text-xs">⭐</span>
                                    <span className="text-xs font-semibold text-gray-700">
                                        {product.rating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rating & Sold Count - Trust Information */}
                    <div className="flex items-center gap-2 mb-3">
                        {product.rating > 0 && (
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-500 text-xs">⭐</span>
                                <span className="text-xs font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                            </div>
                        )}
                        <span className="text-xs text-gray-500">• {soldCount} sold</span>
                    </div>

                    {/* Price - Large, Orange-Red */}
                    <div className="mt-auto mb-4 relative">
                        {formattedPrice ? (
                            <p className="text-2xl md:text-3xl font-bold text-[#EE4D2D] leading-none">
                                {formattedPrice} ₫
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400">No price</p>
                        )}
                    </div>
                </Link>

                {/* Circle Add Button - Bottom Right Corner */}
                <div className="absolute bottom-4 right-4 z-20">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding || !isMounted}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-[#EE4D2D] hover:bg-[#EE4D2D]/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                        title="Add to cart"
                        aria-label="Add to cart"
                    >
                        {isAdding ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Plus className="w-5 h-5 md:w-6 md:h-6 font-bold" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});

FoodCard.displayName = "FoodCard";
