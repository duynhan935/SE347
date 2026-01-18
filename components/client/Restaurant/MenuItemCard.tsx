// File: app/_components/client/Restaurant/MenuItemCard.tsx
"use client";

import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { type Product } from "@/types";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export const MenuItemCard = memo(
    ({ item, restaurantId, restaurantName }: { item: Product; restaurantId?: string; restaurantName?: string }) => {
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
        // Use the same image URL that's displayed on the card
        const cardImageUrl = useMemo(() => getImageUrl(item.imageURL), [item.imageURL]);
        const sizes = useMemo(() => item.productSizes ?? [], [item.productSizes]);
        const displayPrice = useMemo(() => {
            if (!sizes || sizes.length === 0) return null;
            // Find minimum price from all sizes
            const prices = sizes.map(size => size.price).filter(price => price != null);
            if (prices.length === 0) return null;
            return Math.min(...prices);
        }, [sizes]);
        const hasMultipleSizes = useMemo(() => sizes && sizes.length > 1, [sizes]);

        const handleAddToCart = useCallback(
            async (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                e.stopPropagation();

                // Prevent multiple clicks or if not mounted
                if (isAdding || !isMounted) {
                    return;
                }

                // Ensure addItem is available (should always be, but double-check)
                if (typeof addItem !== "function") {
                    console.warn("[MenuItemCard] addItem is not available yet");
                    return;
                }

                if (!user) {
                    toast.error("Please login to add items to cart");
                    router.push("/login");
                    return;
                }

                if (!sizes || sizes.length === 0) {
                    toast.error("This product has no available sizes");
                    return;
                }

                // Use first size as default
                const defaultSize = sizes[0];

                if (!defaultSize) {
                    toast.error("No default size found");
                    return;
                }

                setIsAdding(true);
                try {
                    // Use the same image URL that's displayed on the card
                    console.log("[MenuItemCard] Adding to cart:", {
                        productId: item.id,
                        productName: item.productName,
                        originalImageURL: item.imageURL,
                        cardImageUrl: cardImageUrl,
                        imageURLType: typeof item.imageURL,
                    });

                    await addItem(
                        {
                            id: item.id,
                            name: item.productName,
                            price: defaultSize.price,
                            image: cardImageUrl, // Use the same image as displayed on card
                            restaurantId: restaurantId || item.restaurant?.id || "",
                            restaurantName: restaurantName || item.restaurant?.resName || "Unknown Restaurant",
                            categoryId: item.categoryId,
                            categoryName: item.categoryName,
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
            [isAdding, isMounted, user, item, cardImageUrl, addItem, router, restaurantId, restaurantName]
        );

        const hasImage = cardImageUrl && cardImageUrl !== "/placeholder.png";

        return (
            <Link
                href={`/food/${item.slug}`}
                className="block border border-gray-200 rounded-2xl overflow-hidden h-full group bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
            >
                {/* Image Section - Improved design */}
                <div className="relative w-full h-40 md:h-48 overflow-hidden bg-gradient-to-br from-[#EE4D2D]/5 to-orange-500/5 rounded-t-2xl">
                    {hasImage ? (
                        <Image
                            src={cardImageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={!item.imageURL || cardImageUrl === "/placeholder.png"}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.png";
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#EE4D2D]/10 to-orange-500/10">
                            <div className="text-center">
                                <span className="text-4xl mb-2 block">🍽️</span>
                                <span className="text-xs text-gray-600 font-medium">Preparing...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 md:p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-base md:text-lg text-gray-900 line-clamp-2 mb-2 leading-tight">
                        {item.productName}
                    </h3>
                    {item.description && (
                        <p className="text-xs md:text-sm text-gray-400 mt-1 line-clamp-2 flex-grow mb-3">
                            {item.description}
                        </p>
                    )}
                    <div className="flex justify-between items-center mt-auto pt-2">
                        <p className="font-bold text-lg md:text-xl text-[#EE4D2D]">
                            {hasMultipleSizes && displayPrice ? "From " : ""}
                            {displayPrice ? `$${displayPrice.toFixed(2)}` : "N/A"}
                        </p>
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding || !isMounted}
                            className="p-2.5 text-[#EE4D2D] hover:bg-[#EE4D2D]/10 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#EE4D2D]/30 hover:border-[#EE4D2D]/50 bg-white hover:shadow-md"
                            title="Add to Cart"
                            aria-label="Add to Cart"
                        >
                            {isAdding ? (
                                <PlusCircle className="w-5 h-5 animate-pulse" />
                            ) : (
                                <PlusCircle className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </Link>
        );
    }
);

MenuItemCard.displayName = "MenuItemCard";
