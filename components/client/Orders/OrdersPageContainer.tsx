"use client";

import { FoodEat, Hero } from "@/constants";
import { OrderStatus } from "@/types/order.type";
import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { OrderItemRow, type OrderListItem } from "./OrderItemRow";
import { OrderSkeleton } from "./OrderSkeleton";
import { PeopleAlsoBought } from "./PeopleAlsoBought";

export interface OrdersPageOrder {
    id: string;
    createdAt: string;
    totalAmount: number;
    items: OrderListItem[];
    status?: OrderStatus;
    paymentStatus?: string;
}

interface OrdersPageContainerProps {
    orders: OrdersPageOrder[];
    isLoading: boolean;
    onRetry?: () => void;
    onSortChange?: (sortBy: string) => void;
}

export default function OrdersPageContainer({ orders, isLoading, onRetry, onSortChange }: OrdersPageContainerProps) {
    const formattedCount = isLoading ? "--" : orders.length;
    const [sortBy, setSortBy] = useState("recent");

    const handleSortChange = (value: string) => {
        setSortBy(value);
        if (onSortChange) {
            onSortChange(value);
        }
    };

    return (
        <div className="custom-container p-3 sm:p-1 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-start">
                {/* Left column: order list */}
                <div className="lg:col-span-2">
                    {/* Filter options */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-xl md:text-3xl font-bold">Your Orders ({formattedCount} orders)</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="font-semibold border-gray-300 border-2 px-3 py-2 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-colors cursor-pointer"
                                title="Sort by"
                            >
                                <option value="recent">Recent</option>
                                <option value="oldest">Oldest First</option>
                                <option value="amount-high">Amount: High to Low</option>
                                <option value="amount-low">Amount: Low to High</option>
                                <option value="status">By Status</option>
                            </select>
                        </div>
                    </div>
                    {/* Order list */}
                    <div className="space-y-8">
                        {isLoading && (
                            <div className="space-y-8">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <OrderSkeleton key={`order-skeleton-${index}`} />
                                ))}
                            </div>
                        )}

                        {!isLoading && orders.length === 0 && (
                            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white">
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                    {/* Icon */}
                                    <div className="mb-6 p-6 bg-gray-100 rounded-full">
                                        <Package className="w-16 h-16 text-gray-400" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>

                                    {/* Description */}
                                    <p className="text-gray-600 mb-8 max-w-md">
                                        You have not placed any orders yet. Browse restaurants and discover great food
                                        to get started.
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Link
                                            href="/restaurants"
                                            className="bg-brand-purple text-white px-6 py-3 rounded-full font-bold hover:bg-brand-purple/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Browse restaurants
                                        </Link>
                                        {onRetry && (
                                            <button
                                                onClick={onRetry}
                                                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                            >
                                                Retry
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isLoading &&
                            orders.map((order) => {
                                const orderDate = new Date(order.createdAt);
                                const formattedDate = isNaN(orderDate.getTime())
                                    ? order.createdAt
                                    : orderDate.toLocaleDateString("en-US");

                                // Get status display info - Solid colors, no icons
                                const getStatusInfo = (status?: OrderStatus) => {
                                    switch (status) {
                                        case OrderStatus.PENDING:
                                            return {
                                                text: "Pending confirmation",
                                                className: "bg-yellow-100 text-yellow-800",
                                            };
                                        case OrderStatus.CONFIRMED:
                                            return {
                                                text: "Confirmed",
                                                className: "bg-blue-100 text-blue-800",
                                            };
                                        case OrderStatus.PREPARING:
                                            return {
                                                text: "Preparing",
                                                className: "bg-purple-100 text-purple-800",
                                            };
                                        case OrderStatus.READY:
                                            return {
                                                text: "Ready",
                                                className: "bg-indigo-100 text-indigo-800",
                                            };
                                        case OrderStatus.COMPLETED:
                                            return {
                                                text: "Completed",
                                                className: "bg-green-100 text-green-800",
                                            };
                                        case OrderStatus.CANCELLED:
                                            return {
                                                text: "Cancelled",
                                                className: "bg-red-100 text-red-800",
                                            };
                                        default:
                                            return {
                                                text: "Unknown",
                                                className: "bg-gray-100 text-gray-800",
                                            };
                                    }
                                };

                                const statusInfo = getStatusInfo(order.status);

                                return (
                                    <div
                                        key={order.id}
                                        className="border border-gray-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300"
                                    >
                                        <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex-1">
                                                {/* Order ID and Status - Always on same line */}
                                                <div className="flex items-center gap-3 mb-2 flex-nowrap">
                                                    {/* Order ID - Bold and prominent */}
                                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 whitespace-nowrap">
                                                        Order {order.id}
                                                    </h2>
                                                    {order.status && (
                                                        <span
                                                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${statusInfo.className}`}
                                                        >
                                                            {statusInfo.text}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Date - Better contrast */}
                                                <p className="text-sm font-medium text-gray-700">
                                                    Placed on {formattedDate}
                                                </p>
                                                {order.paymentStatus && (
                                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                                        Payment:{" "}
                                                        <span className="capitalize">{order.paymentStatus}</span>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
                                                {/* Total - Large, bold, prominent */}
                                                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                                                    ${order.totalAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            {order.items.map((item) => (
                                                <OrderItemRow key={item.id} orderId={order.id} item={item} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Right column: promo */}
                <div className="lg:col-span-1 hidden lg:block">
                    <div className="bg-green-100 p-3 rounded-lg sticky top-24">
                        <Image src={Hero} alt="Food Delivery" className="w-full h-auto rounded-md" />

                        <Image src={FoodEat} alt="Food Delivery" className="w-full h-auto rounded-md mt-5" />
                    </div>
                </div>
            </div>

            <PeopleAlsoBought />
        </div>
    );
}
