// File: app/_components/client/Restaurant/MenuItemCard.tsx
"use client";

import { type Product } from "@/types";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export const MenuItemCard = ({ item }: { item: Product }) => {
    const router = useRouter();
    const { addItem } = useCartStore();
    const { user } = useAuthStore();

    const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Please login to add items to cart");
            router.push("/login");
            return;
        }

        if (!item.productSizes || item.productSizes.length === 0) {
            toast.error("This product has no available sizes");
            return;
        }

        // Use first size as default
        const defaultSize = item.productSizes[0];

        await addItem(
            {
                id: item.id,
                name: item.productName,
                price: defaultSize.price,
                image: item.imageURL || "/placeholder.png",
                restaurantId: item.restaurant?.id || "",
                restaurantName: item.restaurant?.resName || "Unknown Restaurant",
                sizeId: defaultSize.id,
                sizeName: defaultSize.sizeName,
            },
            1
        );
    };
    const displayPrice = item.productSizes?.[0]?.price;

    return (
        <Link
            href={`/food/${item.slug}`}
            className="block border rounded-lg overflow-hidden h-full group bg-white hover:shadow-xl transition-shadow"
        >
            <div className="relative w-full h-32">
                <Image
                    src={item.imageURL || "/placeholder.png"}
                    alt={item.productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold truncate">{item.productName}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-grow h-10">{item.description}</p>
                <div className="flex justify-between items-center mt-3">
                    <p className="font-bold">
                        {item.productSizes.length > 1 ? "From " : ""}
                        {displayPrice ? `$${displayPrice.toFixed(2)}` : "N/A"}
                    </p>
                    <button
                        onClick={handleAddToCart}
                        className="text-brand-purple hover:text-brand-purple/80"
                        title="Add to Cart"
                    >
                        <PlusCircle className="w-7 h-7" />
                    </button>
                </div>
            </div>
        </Link>
    );
};
