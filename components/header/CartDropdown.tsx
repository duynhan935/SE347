"use client";

import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CartDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { items: cartItems, removeItem, fetchCart, userId } = useCartStore();

    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Refresh cart when opening to avoid stale/empty first render
    useEffect(() => {
        if (!isOpen) return;
        if (!userId) return;

        fetchCart().catch(() => {
            // Ignore refresh failures; optimistic state still shows items
        });
    }, [isOpen, userId, fetchCart]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Cart Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                aria-label="Shopping cart"
                title="Shopping cart"
            >
                <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-[#EE4D2D] transition-colors" />
                {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#EE4D2D] text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-md">
                        {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold">Shopping Cart ({cartItemCount})</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Close cart"
                            aria-label="Close cart"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-gray-500 mb-4">Your cart is empty</p>
                            <Link
                                href="/restaurants"
                                onClick={() => setIsOpen(false)}
                                className="bg-[#EE4D2D] text-white px-6 py-2 rounded-md hover:bg-[#EE4D2D]/90 transition-colors"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Items List - Scrollable */}
                            <div className="overflow-y-auto flex-1 max-h-96">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        {(() => {
                                            const imageUrl = getImageUrl(item.image);
                                            const finalImageUrl = imageUrl || "/placeholder.png";

                                            if (finalImageUrl && finalImageUrl !== "/placeholder.png") {
                                                return (
                                                    <Image
                                                        src={finalImageUrl}
                                                        alt={item.name}
                                                        width={60}
                                                        height={60}
                                                        className="rounded-md object-cover"
                                                        unoptimized={finalImageUrl.startsWith("http")}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <div className="w-[60px] h-[60px] rounded-md bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                                        No Image
                                                    </div>
                                                );
                                            }
                                        })()}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                                            <p className="text-xs text-gray-500">{item.restaurantName}</p>
                                            {item.sizeName && (
                                                <p className="text-xs text-gray-400">Size: {item.sizeName}</p>
                                            )}
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-sm font-semibold">
                                                    ${item.price.toFixed(2)} x {item.quantity}
                                                </span>
                                                <span className="text-sm font-bold text-[#EE4D2D]">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id, item.restaurantId)}
                                            className="text-gray-400 hover:text-red-500 transition-colors self-start"
                                            title="Remove item"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-semibold text-lg">Total</span>
                                    <span className="font-bold text-xl text-[#EE4D2D]">${cartTotal.toFixed(2)}</span>
                                </div>
                                {(() => {
                                    // Group items by restaurant to determine checkout behavior
                                    const restaurantGroups = cartItems.reduce((acc, item) => {
                                        if (!acc[item.restaurantId]) {
                                            acc[item.restaurantId] = {
                                                restaurantName: item.restaurantName,
                                                items: [],
                                            };
                                        }
                                        acc[item.restaurantId].items.push(item);
                                        return acc;
                                    }, {} as Record<string, { restaurantName: string; items: typeof cartItems }>);

                                    const restaurantIds = Object.keys(restaurantGroups);
                                    const hasMultipleRestaurants = restaurantIds.length > 1;
                                    const firstRestaurantId = restaurantIds[0];

                                    return (
                                        <div className="flex gap-2">
                                            {/* View Cart - Always redirects to cart page where user can checkout each restaurant separately */}
                                            <Link
                                                href="/cart"
                                                onClick={() => setIsOpen(false)}
                                                className="flex-1 text-center bg-white border-2 border-[#EE4D2D] text-[#EE4D2D] px-4 py-2 rounded-md hover:bg-[#EE4D2D]/10 transition-colors font-semibold"
                                            >
                                                View Cart
                                            </Link>
                                            {/* Checkout - Only allow if single restaurant, otherwise redirect to cart */}
                                            {hasMultipleRestaurants ? (
                                                <Link
                                                    href="/cart"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex-1 text-center bg-[#EE4D2D] text-white px-4 py-2 rounded-md hover:bg-[#EE4D2D]/90 transition-colors font-semibold"
                                                    title="Please checkout one restaurant at a time"
                                                >
                                                    Checkout
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/payment?restaurantId=${firstRestaurantId}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex-1 text-center bg-[#EE4D2D] text-white px-4 py-2 rounded-md hover:bg-[#EE4D2D]/90 transition-colors font-semibold"
                                                >
                                                    Checkout
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
