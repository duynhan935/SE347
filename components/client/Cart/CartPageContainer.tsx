"use client";

import { CartItem, useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { useEffect } from "react";
import { CartItemRow } from "./CartItemRow";
import { OrderSummary } from "./OrderSummary";

export default function CartPageContainer() {
    const { user, isAuthenticated } = useAuthStore();
    const { items, fetchCart, userId } = useCartStore();

    // Fetch cart when component mounts and user is authenticated
    useEffect(() => {
        if (isAuthenticated && user?.id && userId === user.id) {
            fetchCart().catch((error) => {
                // Silently handle errors - cart might not exist yet or service unavailable
                const status = (error as { response?: { status?: number } })?.response?.status;
                if (status !== 404 && status !== 503) {
                    console.warn("Failed to fetch cart:", error);
                }
            });
        }
    }, [isAuthenticated, user?.id, userId, fetchCart]);
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    const groupedItems = items.reduce((acc, item) => {
        const { restaurantId, restaurantName } = item;

        if (!acc[restaurantId]) {
            acc[restaurantId] = {
                restaurantName,
                items: [],
            };
        }

        acc[restaurantId].items.push(item);

        return acc;
    }, {} as Record<string, { restaurantName: string; items: CartItem[] }>);

    if (items.length === 0) {
        return (
            <div className="custom-container p-3 sm:p-1 md:p-12">
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white">
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        {/* Icon */}
                        <div className="mb-6 p-6 bg-gray-100 rounded-full">
                            <svg
                                className="w-16 h-16 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-8 max-w-md">
                            Bạn chưa thêm món ăn nào vào giỏ hàng. Hãy khám phá các món ăn ngon và thêm vào giỏ hàng
                            nhé!
                        </p>

                        {/* CTA Button */}
                        <Link
                            href="/restaurants"
                            className="bg-brand-purple text-white px-6 py-3 rounded-full font-bold hover:bg-brand-purple/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Khám phá món ăn
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="custom-container p-3 sm:p-1 md:p-12">
            <h1 className="text-xl md:text-3xl font-bold mb-8">
                Shopping cart ({totalItems} {totalItems > 1 ? "items" : "item"})
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {Object.entries(groupedItems).map(([restaurantId, group]) => {
                        const restaurantSubtotal = group.items.reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                        );

                        return (
                            <div
                                key={restaurantId}
                                className="border border-gray-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 bg-white"
                            >
                                {/* Restaurant Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                        {group.restaurantName}
                                    </h2>
                                    <Link
                                        href={`/payment?restaurantId=${restaurantId}`}
                                        className="bg-brand-purple text-white px-6 py-3 rounded-full font-bold hover:bg-brand-purple/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                                    >
                                        Đặt hàng ($
                                        {restaurantSubtotal.toFixed(2)})
                                    </Link>
                                </div>
                                {/* Cart Items */}
                                <div className="p-5">
                                    {group.items.map((item) => (
                                        <CartItemRow key={item.id} item={item} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="lg:col-span-1">
                    <OrderSummary subtotal={subtotal} />
                </div>
            </div>
        </div>
    );
}
