"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export type OrderListItem = {
    id: string;
    productId: string;
    productName: string;
    restaurantName: string;
    price: number;
    quantity: number;
    customizations?: string;
};

export const OrderItemRow = ({ item, orderId }: { item: OrderListItem; orderId: string }) => (
    <div className="flex items-start gap-4 py-4 border-b last:border-b-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-purple/10 text-brand-purple">
            <ShoppingBag className="h-5 w-5" />
        </div>
        <div className="flex-grow space-y-1">
            <p className="font-semibold leading-tight">{item.productName}</p>
            <p className="text-sm text-gray-500">{item.restaurantName}</p>
            <div className="flex flex-wrap items-center gap-x-4 text-xs text-gray-400">
                <span>Item ID: {item.productId}</span>
                <span>Qty: {item.quantity}</span>
                {item.customizations && <span className="truncate">{item.customizations}</span>}
            </div>
            <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <button className="text-sm font-semibold bg-brand-purple text-white px-4 py-2 rounded-md hover:bg-brand-purple/80 cursor-pointer">
                Buy Again
            </button>
            <Link
                href={`/orders/${orderId}`}
                className="text-sm font-semibold px-4 py-2 rounded-md text-center hover:bg-gray-50 border border-gray-400"
            >
                See Details
            </Link>
        </div>
    </div>
);
