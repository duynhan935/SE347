"use client";

import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order } from "@/types/order.type";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";

export const OrderSummary = ({ order }: { order: Order }) => {
        const router = useRouter();
        const { addItem } = useCartStore();
        const { user, isAuthenticated } = useAuthStore();
        const [isAdding, setIsAdding] = useState(false);
        const isProcessingRef = useRef(false);

        const originalPrice = Number(order.totalAmount ?? 0);
        const savings = Number(order.discount ?? 0);
        const shipping = Number(order.deliveryFee ?? 0);
        const tax = Number(order.tax ?? 0);
        const total = Number(order.finalAmount ?? originalPrice - savings + shipping + tax);

        const handleBuyAgain = useCallback(async () => {
                // Prevent double clicks using both state and ref
                if (isAdding || isProcessingRef.current) return;
                
                // Set both state and ref immediately to prevent race conditions
                setIsAdding(true);
                isProcessingRef.current = true;

                // Check authentication
                const hasToken = typeof window !== "undefined" && 
                        (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));
                
                if (!user && !isAuthenticated && !hasToken) {
                        toast.error("Please sign in to buy again.");
                        setIsAdding(false);
                        isProcessingRef.current = false;
                        router.push("/login");
                        return;
                }

                const restaurantId = order.restaurantId || order.restaurant?.id;
                if (!restaurantId) {
                        toast.error("Restaurant information not found.");
                        setIsAdding(false);
                        isProcessingRef.current = false;
                        return;
                }

                if (!order.items || order.items.length === 0) {
                        toast.error("This order has no items.");
                        setIsAdding(false);
                        isProcessingRef.current = false;
                        return;
                }

                try {
                        // Add all items from order to cart
                        for (const item of order.items) {
                                try {
                                        await addItem(
                                                {
                                                        id: item.productId,
                                                        name: item.productName,
                                                        price: item.price,
                                                        image: "/placeholder.png", // Order items may not have imageURL
                                                        restaurantId: restaurantId,
                                                        restaurantName: order.restaurant?.name || "Restaurant",
                                                        customizations: item.customizations,
                                                },
                                                item.quantity
                                        );
                                } catch (itemError) {
                                        console.error(`Failed to add item ${item.productName}:`, itemError);
                                        // Continue with other items even if one fails
                                }
                        }
                        
                        // Wait a bit for cart to sync with backend
                        await new Promise((resolve) => setTimeout(resolve, 500));
                        
                        toast.success(`Added ${order.items.length} item(s) to your cart.`);
                        
                        // Navigate to checkout page
                        router.push(`/payment?restaurantId=${restaurantId}`);
                } catch (error) {
                        console.error("Failed to add items to cart:", error);
                        toast.error("Failed to add to cart.");
                } finally {
                        setIsAdding(false);
                        isProcessingRef.current = false;
                }
        }, [isAdding, order, addItem, user, isAuthenticated, router]);

        return (
                <div className="bg-gray-50 p-6 rounded-lg border w-full lg:sticky lg:top-24">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-3 text-gray-600">
                                <div className="flex justify-between">
                                                                        <span>Original Price</span>
                                                                        <span>${originalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                        <span>Savings</span>
                                                                        <span>-${savings.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                        <span>Shipping</span>
                                                                        <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between">
                                        <span>Estimated Sales Tax</span>
                                        <span>${tax.toFixed(2)}</span>
                                </div>
                        </div>
                        <div className="flex justify-between font-bold text-2xl mt-4 pt-4 border-t">
                                <span>Total</span>
                                                                        <span>${total.toFixed(2)}</span>
                        </div>
                        <button 
                                onClick={handleBuyAgain}
                                disabled={isAdding}
                                className="cursor-pointer w-full mt-6 bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                                {isAdding ? "Adding..." : "Buy Again"}
                        </button>
                </div>
        );
};
