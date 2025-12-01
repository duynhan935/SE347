"use client";

import { FoodEat, Hero } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { OrderItemRow, type OrderListItem } from "./OrderItemRow";
import { PeopleAlsoBought } from "./PeopleAlsoBought";

export interface OrdersPageOrder {
    id: string;
    createdAt: string;
    totalAmount: number;
    items: OrderListItem[];
}

interface OrdersPageContainerProps {
    orders: OrdersPageOrder[];
    isLoading: boolean;
    onRetry?: () => void;
}

export default function OrdersPageContainer({ orders, isLoading, onRetry }: OrdersPageContainerProps) {
    const formattedCount = isLoading ? "--" : orders.length;

    return (
        <div className="custom-container p-3 sm:p-1 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-start">
                {/* Cột bên trái: Danh sách đơn hàng */}
                <div className="lg:col-span-2">
                    {/* Filter options */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-xl md:text-3xl font-bold">Your Orders ({formattedCount} orders)</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Sort by:</span>
                            <select
                                className="font-semibold border-gray-700 border p-1 rounded-md shadow-sm"
                                title="Sort by"
                            >
                                <option>Recent</option>
                                <option>Past 3 months</option>
                                <option>2025</option>
                            </select>
                        </div>
                    </div>
                    {/* Order list */}
                    <div className="space-y-8">
                        {isLoading && (
                            <div className="border rounded-lg p-6 text-center text-gray-500">
                                Loading your recent orders...
                            </div>
                        )}

                        {!isLoading && orders.length === 0 && (
                            <div className="border rounded-lg p-6 text-center text-gray-500 space-y-4">
                                <p>You haven&apos;t placed any orders yet.</p>
                                <div className="flex justify-center gap-3">
                                    <Link
                                        href="/restaurants"
                                        className="bg-brand-purple text-white px-4 py-2 rounded-md hover:bg-brand-purple/80 transition-colors"
                                    >
                                        Browse Restaurants
                                    </Link>
                                    {onRetry && (
                                        <button
                                            onClick={onRetry}
                                            className="border border-brand-purple text-brand-purple px-4 py-2 rounded-md hover:bg-brand-purple/10 transition-colors"
                                        >
                                            Retry
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {!isLoading &&
                            orders.map((order) => {
                                const orderDate = new Date(order.createdAt);
                                const formattedDate = isNaN(orderDate.getTime())
                                    ? order.createdAt
                                    : orderDate.toLocaleDateString();

                                return (
                                    <div key={order.id} className="border rounded-lg overflow-hidden shadow-sm">
                                        <div className="flex flex-col gap-2 border-b bg-gray-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h2 className="text-lg font-bold">Order {order.id}</h2>
                                                <p className="text-sm text-gray-500">Placed on {formattedDate}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Total</p>
                                                <p className="text-lg font-semibold text-brand-purple">
                                                    ${order.totalAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            {order.items.map((item) => (
                                                <OrderItemRow key={item.id} orderId={order.id} item={item} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Cột bên phải: Quảng cáo */}
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
