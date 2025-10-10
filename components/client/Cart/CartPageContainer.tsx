"use client";

import { CartItem, useCartStore } from "@/stores/cartStore";
import Link from "next/link";
import { CartItemRow } from "./CartItemRow";
import { OrderSummary } from "./OrderSummary";

export default function CartPageContainer() {
        const items = useCartStore((state) => state.items);
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
        }, {} as Record<number, { restaurantName: string; items: CartItem[] }>);

        if (items.length === 0) {
                return (
                        <div className="text-center py-20 custom-container">
                                <h1 className="text-3xl font-bold">Your shopping cart is empty</h1>
                                <p className="mt-4 text-gray-600">
                                        Looks like you haven&apos;t added anything to your cart yet.
                                </p>
                                <Link
                                        href="/"
                                        className="mt-6 inline-block bg-brand-purple text-white font-bold py-3 px-6 rounded-md"
                                >
                                        Start Shopping
                                </Link>
                        </div>
                );
        }

        return (
                <div className="custom-container py-12">
                        <h1 className="text-3xl font-bold mb-8">
                                Shopping cart ({totalItems} {totalItems > 1 ? "items" : "item"})
                        </h1>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-start">
                                <div className="lg:col-span-2 space-y-8">
                                        {Object.entries(groupedItems).map(([restaurantId, group]) => (
                                                <div key={restaurantId} className="border rounded-lg p-4">
                                                        <h2 className="text-xl font-bold mb-4">
                                                                {group.restaurantName}
                                                        </h2>
                                                        <div className="space-y-4">
                                                                {group.items.map((item) => (
                                                                        <CartItemRow key={item.id} item={item} />
                                                                ))}
                                                        </div>
                                                </div>
                                        ))}
                                </div>
                                <div className="lg:col-span-1">
                                        <OrderSummary subtotal={subtotal} />
                                </div>
                        </div>
                </div>
        );
}
