"use client";

import { getImageUrl } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type OrderListItem = {
        id: string;
        productId: string;
        productName: string;
        restaurantName: string;
        price: number;
        quantity: number;
        customizations?: string;
        imageURL?: string | null;
};

export const OrderItemRow = ({ item, orderId }: { item: OrderListItem; orderId: string }) => {
        const imageUrl = item.imageURL ? getImageUrl(item.imageURL) : null;
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
                                <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 text-brand-purple flex-shrink-0 shadow-sm">
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
                                
                                {/* Item Price - Smaller than total, gray */}
                                <p className="font-semibold text-sm text-gray-600">
                                        ${(item.price * item.quantity).toFixed(2)}
                                </p>
                        </div>

                        {/* Action Buttons - Pill-shaped, Primary vs Secondary */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                                <button className="text-sm font-bold bg-brand-purple text-white px-5 py-2.5 rounded-full hover:bg-brand-purple/90 transition-all duration-200 cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                                        Buy Again
                                </button>
                                <Link
                                        href={`/orders/${orderId}`}
                                        className="text-sm font-semibold px-5 py-2.5 rounded-full text-center hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 whitespace-nowrap text-gray-700"
                                >
                                        See Details
                                </Link>
                        </div>
                </div>
        );
};
