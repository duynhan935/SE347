"use client";

import { getImageUrl } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/dashboardFormat";
import { Order, OrderStatus } from "@/types/order.type";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { OrderSummary } from "./OrderSummary";
import ReviewForm from "./ReviewForm";

type DisplayOrderItem = {
    id: string;
    name: string;
    shopName: string;
    price: number;
    quantity: number;
    note?: string;
    productId: string;
    imageURL?: string;
};

interface OrderDetailClientProps {
    order: Order;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
    const router = useRouter();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);

    const displayItems: DisplayOrderItem[] = useMemo(() => {
        return order.items.map((item, index) => {
            // Priority: cartItemImage > imageURL (vì cart chỉ có cartItemImage)
            let imageURL: string | undefined = undefined;
            
            // Helper function to check if image URL is valid
            const isValidImageUrl = (url: string | null | undefined): boolean => {
                if (!url || typeof url !== "string") return false;
                const trimmed = url.trim();
                return trimmed !== "" && trimmed !== "/placeholder.png";
            };
            
            // Debug: Log để kiểm tra dữ liệu
            console.log(`[OrderDetail] Item ${index}:`, {
                productId: item.productId,
                productName: item.productName,
                cartItemImage: item.cartItemImage,
                imageURL: item.imageURL,
            });
            
            if (isValidImageUrl(item.cartItemImage)) {
                imageURL = item.cartItemImage!.trim();
                console.log(`[OrderDetail] Using cartItemImage: ${imageURL}`);
            } else if (isValidImageUrl(item.imageURL)) {
                imageURL = item.imageURL!.trim();
                console.log(`[OrderDetail] Using imageURL: ${imageURL}`);
            }
            
            if (!imageURL) {
                console.warn(`[OrderDetail] No image found for item: ${item.productName} (${item.productId})`);
            }
            
            return {
                id: `${order?.orderId}-${item.productId}-${index}`,
                name: item.productName,
                shopName: order?.restaurant?.name || "Restaurant",
                price: item.price,
                quantity: item.quantity,
                note: item.customizations,
                productId: item.productId,
                imageURL: imageURL,
            };
        });
    }, [order.items, order?.orderId, order?.restaurant?.name]);

    const totalItems = displayItems.reduce((sum, item) => sum + item.quantity, 0);

    const groupedItems = displayItems.reduce(
        (acc, item) => {
            const { shopName } = item;
            if (!acc[shopName]) {
                acc[shopName] = [];
            }
            acc[shopName].push(item);
            return acc;
        },
        {} as Record<string, DisplayOrderItem[]>,
    );

    const isOrderCompleted = order.status === OrderStatus.COMPLETED;
    const canReview = isOrderCompleted && !hasReviewed;

    const handleReviewSubmitted = () => {
        setHasReviewed(true);
        setShowReviewForm(false);
        // Refresh page to show updated data
        router.refresh();
    };

    return (
        <div className="custom-container p-3 sm:p-1 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-start">
                {/* Left column: Order Details */}
                <div className="lg:col-span-2 space-y-8">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                        Order Details ({totalItems} {totalItems > 1 ? "items" : "item"})
                    </h1>

                    {/* Review Section - Show if order is completed */}
                    {isOrderCompleted && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            {!showReviewForm && !hasReviewed && (
                                <div className="text-center py-4">
                                    <p className="text-gray-600 mb-4">
                                        Your order has been completed. Please share your review!
                                    </p>
                                    <button
                                        onClick={() => setShowReviewForm(true)}
                                        className="px-6 py-3 bg-[#EE4D2D] text-white font-semibold rounded-lg hover:bg-[#EE4D2D]/90 transition-colors shadow-md hover:shadow-lg"
                                    >
                                        Review Order
                                    </button>
                                </div>
                            )}

                            {showReviewForm && canReview && (
                                <ReviewForm order={order} onReviewSubmitted={handleReviewSubmitted} />
                            )}

                            {hasReviewed && (
                                <div className="text-center py-4">
                                    <p className="text-green-600 font-medium">✓ Thank you for reviewing this order!</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-8">
                        {Object.entries(groupedItems).map(([shopName, items]) => (
                            <div
                                key={shopName}
                                className="border border-gray-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 bg-white"
                            >
                                {/* Restaurant Header */}
                                <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{shopName}</h2>
                                </div>

                                {/* Items */}
                                <div className="p-5">
                                    {items.map((item) => {
                                        const imageUrl = getImageUrl(item.imageURL || null);
                                        const finalImageUrl = imageUrl || "/placeholder.png";
                                        const hasImage = finalImageUrl && finalImageUrl !== "/placeholder.png";
                                        
                                        return (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-4 py-5 border-b border-gray-100 last:border-b-0"
                                        >
                                            {/* Product Image */}
                                            {hasImage ? (
                                                <div className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 shadow-sm">
                                                    <Image
                                                        src={finalImageUrl}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 80px, 96px"
                                                        unoptimized={finalImageUrl.startsWith("http")}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-md bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shadow-sm">
                                                    <svg
                                                        className="w-8 h-8 text-[#EE4D2D]"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                        />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Product Details */}
                                            <div className="flex-grow min-w-0 space-y-1.5">
                                                <p className="font-bold text-base md:text-lg leading-tight text-gray-900">
                                                    {item.name}
                                                </p>
                                                {item.note && (
                                                    <p className="text-xs md:text-sm text-gray-400">{item.note}</p>
                                                )}
                                                <p className="text-xs text-gray-400">Quantity: {item.quantity}</p>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-lg text-gray-900">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column: Order summary */}
                <div className="lg:col-span-1">
                    <OrderSummary order={order} />
                </div>
            </div>
        </div>
    );
}
