"use client";

import Link from "next/link";

export const OrderSummary = ({ subtotal }: { subtotal: number }) => {
    const shipping = 0 as number;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;

    return (
        <div className="bg-gray-50 p-6 rounded-lg lg:sticky lg:top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `$${shipping?.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span className="text-gray-600">Estimated Sales Tax</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
            </div>
            <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>
            <Link
                href="/payment"
                className="block w-full mt-6 bg-brand-purple text-white font-bold py-3 rounded-md hover:bg-brand-purple/90 transition-colors text-center"
            >
                Proceed to Check Out
            </Link>
        </div>
    );
};
