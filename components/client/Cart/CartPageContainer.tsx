"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { CartItem, useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CartItemRow } from "./CartItemRow";

export default function CartPageContainer() {
    const { user, isAuthenticated } = useAuthStore();
    const { items, fetchCart, userId, isLoading: cartLoading, setUserId } = useCartStore();
        const [cartFetched, setCartFetched] = useState(false);

        // Ensure userId is set and fetch cart when component mounts
        useEffect(() => {
                if (!isAuthenticated || !user?.id) {
                        return;
                }

                // Ensure userId is set in cart store first
                if (userId !== user.id) {
                        setUserId(user.id);
                        // Reset cartFetched when userId changes to ensure we fetch again
                        setCartFetched(false);
                        return; // Wait for userId to be set before fetching
                }

                // Fetch cart when userId matches and hasn't been fetched yet
                if (userId === user.id && !cartFetched && !cartLoading) {
                        fetchCart()
                                .then(() => {
                                        // Mark as fetched after successful fetch
                                        setCartFetched(true);
                                })
                                .catch((error) => {
                                        // Silently handle errors - cart might not exist yet or service unavailable
                                        const status = (error as { response?: { status?: number } })?.response?.status;
                                        if (status !== 404 && status !== 503) {
                                                console.warn("Failed to fetch cart:", error);
                                        }
                                        // Still mark as fetched even on error (404/503 are expected for new users)
                                        setCartFetched(true);
                                });
                }

                // Mark as fetched when cart loading is complete (for cases where fetch was already in progress)
                // This handles the case where fetchCart was called elsewhere (e.g., from addItem)
                if (userId === user.id && !cartLoading && !cartFetched) {
                        setCartFetched(true);
                }
        }, [isAuthenticated, user?.id, userId, cartFetched, cartLoading, fetchCart, setUserId]);

        // Show loading state while fetching cart (especially important when coming from "add to cart")
        // Add a small delay to handle race conditions when user just added an item
        const [showLoading, setShowLoading] = useState(true);
        useEffect(() => {
                if (cartLoading || !cartFetched) {
                        setShowLoading(true);
                        return;
                }

                // Check if we're coming from "add to cart" by checking referrer
                // This helps us give more time for cart to sync when user just added an item
                const isFromAddToCart = typeof window !== "undefined" && 
                        (document.referrer.includes("/food") || 
                         document.referrer.includes("/restaurants") ||
                         document.referrer.includes("/restaurant"));

                // Add a delay to ensure cart state is fully updated after fetch completes
                // Longer delay if coming from add to cart to handle backend sync time
                const delay = isFromAddToCart ? 500 : 200;
                
                const timer = setTimeout(() => {
                        setShowLoading(false);
                }, delay);

                return () => clearTimeout(timer);
        }, [cartLoading, cartFetched]);
        // Show loading while fetching cart or waiting for state to update
        if (showLoading || cartLoading || !cartFetched) {
                return <GlobalLoader label="Đang tải giỏ hàng" sublabel="Vui lòng đợi..." />;
        }

        const totalItems = items.reduce((total, item) => total + item.quantity, 0);

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

        // Filter out restaurants with no items (should not happen, but safety check)
        const validGroupedItems = Object.fromEntries(
                Object.entries(groupedItems).filter(([, group]) => group.items.length > 0)
        );

        // Check if cart is empty (no items at all or all restaurants have no items)
        if (items.length === 0 || Object.keys(validGroupedItems).length === 0) {
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
                        <div className="space-y-8">
                                {Object.entries(validGroupedItems).map(([restaurantId, group]) => {
                                        const restaurantSubtotal = group.items.reduce(
                                                (total, item) => total + item.price * item.quantity,
                                                0
                                        );
                                        const restaurantTax = restaurantSubtotal * 0.05;
                                        const restaurantTotal = restaurantSubtotal + restaurantTax;

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
                                                                        {restaurantTotal.toFixed(2)})
                                                                </Link>
                                                        </div>
                                                        {/* Cart Items */}
                                                        <div className="p-5">
                                                                {group.items.map((item) => (
                                                                        <CartItemRow
                                                                                key={`${item.id}-${item.sizeId}`}
                                                                                item={item}
                                                                        />
                                                                ))}
                                                        </div>
                                                        {/* Restaurant Order Summary */}
                                                        <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
                                                                <div className="flex justify-between text-sm mb-2">
                                                                        <span className="text-gray-600">Subtotal</span>
                                                                        <span>${restaurantSubtotal.toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm mb-2">
                                                                        <span className="text-gray-600">Shipping</span>
                                                                        <span>FREE</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm mb-2">
                                                                        <span className="text-gray-600">Estimated Sales Tax</span>
                                                                        <span>${restaurantTax.toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-gray-300">
                                                                        <span>Total</span>
                                                                        <span className="text-brand-purple">${restaurantTotal.toFixed(2)}</span>
                                                                </div>
                                                        </div>
                                                </div>
                                        );
                                })}
                        </div>
                </div>
        );
}
