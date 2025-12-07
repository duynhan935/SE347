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
                <div className="flex items-start gap-4 py-4 border-b last:border-b-0">
                        {/* Product Image or Icon */}
                        {hasImage ? (
                                <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                        <Image
                                                src={imageUrl}
                                                alt={item.productName}
                                                fill
                                                className="object-cover"
                                                unoptimized={imageUrl.startsWith("http")}
                                        />
                                </div>
                        ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-brand-purple/10 text-brand-purple flex-shrink-0">
                                        <ShoppingBag className="h-6 w-6" />
                                </div>
                        )}

                        {/* Product Details */}
                        <div className="flex-grow min-w-0 space-y-1">
                                <p className="font-semibold leading-tight text-base">{item.productName}</p>
                                <p className="text-sm text-gray-500">{item.restaurantName}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                                        <span>Qty: {item.quantity}</span>
                                        {item.customizations && (
                                                <span className="truncate max-w-[200px]" title={item.customizations}>
                                                        {item.customizations}
                                                </span>
                                        )}
                                </div>
                                <p className="font-bold text-lg text-brand-purple">
                                        ${(item.price * item.quantity).toFixed(2)}
                                </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                                <button className="text-sm font-semibold bg-brand-purple text-white px-4 py-2 rounded-md hover:bg-brand-purple/80 transition-colors cursor-pointer whitespace-nowrap">
                                        Buy Again
                                </button>
                                <Link
                                        href={`/orders/${orderId}`}
                                        className="text-sm font-semibold px-4 py-2 rounded-md text-center hover:bg-gray-50 border border-gray-400 transition-colors whitespace-nowrap"
                                >
                                        See Details
                                </Link>
                        </div>
                </div>
        );
};
