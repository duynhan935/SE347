"use client";

import { Category, Product } from "@/types";
import { useSearchParams } from "next/navigation";
import RestaurantMenu from "./RestaurantMenu";

type MenuWrapperProps = {
    restaurantId: string;
    restaurantName: string;
    restaurantSlug?: string;
    restaurantDuration?: number;
    products: Product[];
    categories: Category[];
};

export default function RestaurantMenuWrapper({
    restaurantId,
    restaurantName,
    restaurantSlug,
    restaurantDuration,
    products,
    categories,
}: MenuWrapperProps) {
    const searchParams = useSearchParams();
    const productId = searchParams.get("productId");

    return (
        <RestaurantMenu
            restaurantId={restaurantId}
            restaurantName={restaurantName}
            restaurantSlug={restaurantSlug}
            restaurantDuration={restaurantDuration}
            products={products}
            categories={categories}
            highlightProductId={productId || undefined}
        />
    );
}
