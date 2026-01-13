"use client";

import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Star } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type SuggestedProduct = {
    id: number;
    name: string;
    category: string;
    image: StaticImageData;
    rating: number;
    reviewCount: number;
    price: number;
};

export const ProductSuggestionCard = ({ product }: { product: SuggestedProduct }) => {
    const router = useRouter();
    const { addItem } = useCartStore();
    const { user } = useAuthStore();
    const [isAdding, setIsAdding] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Ensure component is mounted (client-side only)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleAddToCart = useCallback(async () => {
        // Prevent multiple clicks or if not mounted
        if (isAdding || !isMounted) {
            return;
        }

        // Ensure addItem is available (should always be, but double-check)
        if (typeof addItem !== "function") {
            console.warn("[ProductSuggestionCard] addItem is not available yet");
            return;
        }

        if (!user) {
            toast.error("Please login to add items to cart");
            router.push("/login");
            return;
        }

        setIsAdding(true);
        try {
            const itemToAdd = {
                id: product.id.toString(),
                name: product.name,
                price: product.price,
                image: getImageUrl(product.image),
                restaurantId: "3",
                restaurantName: "The Burger Shop",
            };
            await addItem(itemToAdd, 1);
            toast.success(`${product.name} has been added to your cart.`);
        } catch (error) {
            console.error("Failed to add to cart:", error);
            toast.error("Failed to add item to cart");
        } finally {
            setTimeout(() => {
                setIsAdding(false);
            }, 300);
        }
    }, [isAdding, isMounted, addItem, user, product, router]);

    return (
        <div className="border rounded-lg p-4 text-center">
            <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-md mb-4"
            />
            <p className="text-sm text-gray-500">{product.category}</p>
            <h3 className="font-bold text-lg my-1">{product.name}</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>
                    {product.rating} ({product.reviewCount})
                </span>
            </div>
            <p className="font-extrabold text-xl mb-4">${product.price.toFixed(2)}</p>
            {isMounted ? (
                <button
                    onClick={handleAddToCart}
                    disabled={isAdding || !isMounted}
                    className="cursor-pointer w-full bg-white border border-gray-300 font-semibold py-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAdding ? "Đang thêm..." : "Add to Cart"}
                </button>
            ) : (
                <div className="w-full rounded-md border border-brand-purple/20 bg-brand-purple/5 px-4 py-2 text-center text-sm font-semibold text-brand-purple">
                    <span className="inline-flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-purple/30 border-t-brand-purple" />
                        Loading
                    </span>
                </div>
            )}
        </div>
    );
};
