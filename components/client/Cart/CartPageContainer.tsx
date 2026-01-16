"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { CartItem, useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CartItemRow } from "./CartItemRow";
import { OrderSummary } from "./OrderSummary";

// Format price to USD
const formatPriceUSD = (priceUSD: number): string => {
    return priceUSD.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function CartPageContainer() {
    const { user, isAuthenticated } = useAuthStore();
    const { items, fetchCart, userId, isLoading: cartLoading, setUserId } = useCartStore();
    const [cartFetched, setCartFetched] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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
                    // Select all items by default
                    const allItemKeys = items.map((item) => `${item.id}-${item.sizeId || ""}`);
                    setSelectedItems(new Set(allItemKeys));
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
    }, [isAuthenticated, user?.id, userId, cartFetched, cartLoading, fetchCart, setUserId, items]);

    // Select all items when items change
    useEffect(() => {
        if (items.length > 0) {
            const allItemKeys = items.map((item) => `${item.id}-${item.sizeId || ""}`);
            setSelectedItems(new Set(allItemKeys));
        }
    }, [items]); // When items change

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
        const isFromAddToCart =
            typeof window !== "undefined" &&
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

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    // Group items by restaurant
    const groupedItems = useMemo(() => {
        return items.reduce((acc, item) => {
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
    }, [items]);

    // Get selected items for checkout
    const selectedItemsList = useMemo(() => {
        return items.filter((item) => {
            const itemKey = `${item.id}-${item.sizeId || ""}`;
            return selectedItems.has(itemKey);
        });
    }, [items, selectedItems]);

    // Calculate totals for selected items
    const selectedSubtotal = useMemo(() => {
        return selectedItemsList.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [selectedItemsList]);

    const selectedTotalItems = useMemo(() => {
        return selectedItemsList.reduce((total, item) => total + item.quantity, 0);
    }, [selectedItemsList]);

    // Show loading while fetching cart or waiting for state to update
    if (showLoading || cartLoading || !cartFetched) {
        return <GlobalLoader label="Loading cart" sublabel="Please wait..." />;
    }

    // Toggle item selection
    const toggleItemSelection = (item: CartItem) => {
        const itemKey = `${item.id}-${item.sizeId || ""}`;
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemKey)) {
            newSelected.delete(itemKey);
        } else {
            newSelected.add(itemKey);
        }
        setSelectedItems(newSelected);
    };

    // Toggle select all
    const toggleSelectAll = () => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
        } else {
            const allItemKeys = items.map((item) => `${item.id}-${item.sizeId || ""}`);
            setSelectedItems(new Set(allItemKeys));
        }
    };

    // Check if cart is empty
    if (items.length === 0 || Object.keys(groupedItems).length === 0) {
        return (
            <div className="custom-container p-4 sm:p-6 md:p-12">
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        {/* Icon */}
                        <div className="mb-6 p-6 bg-gray-100 rounded-full">
                            <svg
                                className="w-20 h-20 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Empty Cart</h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-8 max-w-md">
                            You haven't added any food items to your cart yet. Explore restaurants and add delicious dishes to your cart.
                        </p>

                        {/* CTA Button */}
                        <Link
                            href="/"
                            className="bg-[#EE4D2D] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#EE4D2D]/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Go Shopping Now
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Get first restaurant ID for checkout (if only one restaurant)
    const restaurantIds = Object.keys(groupedItems);
    const firstRestaurantId = restaurantIds[0];

    return (
        <div className="custom-container p-4 sm:p-6 md:p-12">
            {/* Header */}
            <h1 className="text-2xl md:text-3xl font-bold mb-6">
                Shopping Cart ({totalItems} {totalItems > 1 ? "items" : "item"})
            </h1>

            {/* Desktop: 2 Column Layout */}
            <div className="hidden lg:grid lg:grid-cols-[65%_35%] gap-6">
                {/* Left Column: Cart Items */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    {/* Header with Select All */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedItems.size === items.length && items.length > 0}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 text-[#EE4D2D] border-gray-300 rounded focus:ring-[#EE4D2D] focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Select All ({selectedItems.size} items)
                            </span>
                        </label>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-gray-100">
                        {Object.entries(groupedItems).map(([restaurantId, group]) => (
                            <div key={restaurantId} className="p-6">
                                {/* Restaurant Name */}
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">{group.restaurantName}</h2>
                                
                                {/* Items */}
                                {group.items.map((item) => {
                                    const itemKey = `${item.id}-${item.sizeId || ""}`;
                                    const isSelected = selectedItems.has(itemKey);
                                    
                                    return (
                                        <div key={itemKey} className="mb-4 last:mb-0">
                                            <CartItemRow
                                                item={item}
                                                isSelected={isSelected}
                                                onToggleSelect={() => toggleItemSelection(item)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="lg:sticky lg:top-24 h-fit">
                    <OrderSummary
                        subtotal={selectedSubtotal}
                        selectedItems={selectedItemsList}
                        restaurantId={restaurantIds.length === 1 ? firstRestaurantId : undefined}
                        totalItems={selectedTotalItems}
                    />
                </div>
            </div>

            {/* Mobile: Single Column + Fixed Bottom Bar */}
            <div className="lg:hidden">
                {/* Cart Items */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-20">
                    {/* Header with Select All */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedItems.size === items.length && items.length > 0}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 text-[#EE4D2D] border-gray-300 rounded focus:ring-[#EE4D2D] focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Select All ({selectedItems.size})
                            </span>
                        </label>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-gray-100">
                        {Object.entries(groupedItems).map(([restaurantId, group]) => (
                            <div key={restaurantId} className="p-4">
                                {/* Restaurant Name */}
                                <h2 className="text-base font-semibold text-gray-900 mb-3">{group.restaurantName}</h2>
                                
                                {/* Items */}
                                {group.items.map((item) => {
                                    const itemKey = `${item.id}-${item.sizeId || ""}`;
                                    const isSelected = selectedItems.has(itemKey);
                                    
                                    return (
                                        <div key={itemKey} className="mb-3 last:mb-0">
                                            <CartItemRow
                                                item={item}
                                                isSelected={isSelected}
                                                onToggleSelect={() => toggleItemSelection(item)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fixed Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:hidden">
                    <div className="custom-container px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Total</span>
                                <span className="text-lg font-bold text-[#EE4D2D]">
                                    {formatPriceVND(selectedSubtotal)} $
                                </span>
                            </div>
                            <Link
                                href={
                                    restaurantIds.length === 1
                                        ? `/payment?restaurantId=${firstRestaurantId}`
                                        : "/payment"
                                }
                                className="bg-[#EE4D2D] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#EE4D2D]/90 transition-colors shadow-md"
                            >
                                Checkout ({selectedTotalItems})
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
