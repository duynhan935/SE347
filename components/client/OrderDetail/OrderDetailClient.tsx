"use client";

import { Order, OrderStatus } from "@/types/order.type";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OrderTrackingTimeline from "../Orders/OrderTrackingTimeline";
import { OrderSummary } from "./OrderSummary";
import ReviewForm from "./ReviewForm";

type DisplayOrderItem = {
    id: string;
    name: string;
    shopName: string;
    price: number;
    quantity: number;
    note?: string;
};

interface OrderDetailClientProps {
    order: Order;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
    const router = useRouter();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);

    const displayItems: DisplayOrderItem[] = order.items.map((item, index) => ({
        id: `${order?.orderId}-${item.productId}-${index}`,
        name: item.productName,
        shopName: order?.restaurant?.name || "Restaurant",
        price: item.price,
        quantity: item.quantity,
        note: item.customizations,
    }));

    const totalItems = displayItems.reduce((sum, item) => sum + item.quantity, 0);

    const groupedItems = displayItems.reduce((acc, item) => {
        const { shopName } = item;
        if (!acc[shopName]) {
            acc[shopName] = [];
        }
        acc[shopName].push(item);
        return acc;
    }, {} as Record<string, DisplayOrderItem[]>);

    // Format price to VND
    const formatPrice = (priceUSD: number): string => {
        const vndPrice = priceUSD * 25000; // Convert USD to VND
        return vndPrice.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

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

                    {/* Tracking Timeline */}
                    <OrderTrackingTimeline status={order.status} />

                    {/* Review Section - Show if order is completed */}
                    {isOrderCompleted && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            {!showReviewForm && !hasReviewed && (
                                <div className="text-center py-4">
                                    <p className="text-gray-600 mb-4">
                                        Đơn hàng của bạn đã hoàn thành. Hãy chia sẻ đánh giá của bạn!
                                    </p>
                                    <button
                                        onClick={() => setShowReviewForm(true)}
                                        className="px-6 py-3 bg-[#EE4D2D] text-white font-semibold rounded-lg hover:bg-[#EE4D2D]/90 transition-colors shadow-md hover:shadow-lg"
                                    >
                                        Đánh giá đơn hàng
                                    </button>
                                </div>
                            )}

                            {showReviewForm && canReview && (
                                <ReviewForm order={order} onReviewSubmitted={handleReviewSubmitted} />
                            )}

                            {hasReviewed && (
                                <div className="text-center py-4">
                                    <p className="text-green-600 font-medium">
                                        ✓ Cảm ơn bạn đã đánh giá đơn hàng này!
                                    </p>
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
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-4 py-5 border-b border-gray-100 last:border-b-0"
                                        >
                                            {/* Image - Improved placeholder */}
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
                                                    {formatPrice(item.price * item.quantity)} ₫
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cột phải: Tóm tắt đơn hàng */}
                <div className="lg:col-span-1">
                    <OrderSummary order={order} />
                </div>
            </div>
        </div>
    );
}

