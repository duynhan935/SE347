"use client";

import { getImageUrl } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";

export type OrderListItem = {
    id: string;
    productId: string;
    productName: string;
    restaurantId?: string;
    restaurantName: string;
    price: number;
    quantity: number;
    customizations?: string;
    imageURL?: string | null;
    cartItemImage?: string | null; // Alternative image field from backend
};

export const OrderItemRow = ({ item, orderId }: { item: OrderListItem; orderId: string }) => {
    // Get image for display - check both imageURL and cartItemImage
    const displayImageSource = (item.imageURL && item.imageURL.trim() !== "") 
        ? item.imageURL 
        : (item.cartItemImage && item.cartItemImage.trim() !== "")
        ? item.cartItemImage
        : null;
    const imageUrl = displayImageSource ? getImageUrl(displayImageSource) : null;
    const hasImage = imageUrl && imageUrl !== "/placeholder.png";

    return (
        <div className="flex items-start gap-4 py-5 border-b border-gray-100 last:border-b-0">
            {/* Product Image - Real food image with rounded corners */}
            {hasImage ? (
                <div className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                    <Image
                        src={imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 80px, 96px"
                        unoptimized={imageUrl.startsWith("http")}
                    />
                </div>
            ) : (
                <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-md bg-gradient-to-br from-orange-100 to-orange-200 text-[#EE4D2D] flex-shrink-0 shadow-sm">
                    <ShoppingBag className="h-8 w-8" />
                </div>
            )}

            {/* Product Details - Better typography hierarchy */}
            <div className="flex-grow min-w-0 space-y-1.5">
                {/* Product Name - Bold */}
                <p className="font-bold text-base md:text-lg leading-tight text-gray-900">{item.productName}</p>

                {/* Restaurant Name - Small, light gray */}
                <p className="text-xs md:text-sm text-gray-400 font-medium">{item.restaurantName}</p>

                {/* Quantity and Customizations - Small, light gray */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                    <span>Qty: {item.quantity}</span>
                    {item.customizations && (
                        <span className="truncate max-w-[200px]" title={item.customizations}>
                            {item.customizations}
                        </span>
                    )}
                </div>

                {/* Item Price - USD format */}
                <p className="font-semibold text-sm text-gray-600">
                    ${((item.price * item.quantity)).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </p>
            </div>

            {/* Action Buttons - Removed from here, handled in OrdersPageContainer */}
            <div className="flex-shrink-0" data-order-id={orderId} />
        </div>
    );
};
