"use client";

import OrderList from "@/components/admin/orders/OrderList";
import RestaurantList from "@/components/admin/restaurants/RestaurantsList";
import UserList from "@/components/admin/users/UserList";
import { ShoppingCart, Users, Utensils } from "lucide-react";
import { useState } from "react";
import { Order } from "./types/types";

type Tab = "users" | "restaurants" | "orders";

export default function AdminPage() {
        const [activeTab, setActiveTab] = useState<Tab>("users");

        // Dummy orders data - moved inside component to avoid hydration issues
        const dummyOrders: Order[] = [
                {
                        id: "ord1",
                        customerName: "Bob",
                        restaurantName: "Nhà hàng A",
                        totalPrice: 25.5,
                        status: "DELIVERED",
                        createdAt: "2024-01-15T10:00:00.000Z",
                },
                {
                        id: "ord2",
                        customerName: "Alice",
                        restaurantName: "Nhà hàng B",
                        totalPrice: 19.0,
                        status: "PENDING",
                        createdAt: "2024-01-16T14:30:00.000Z",
                },
                {
                        id: "ord3",
                        customerName: "Charlie",
                        restaurantName: "Nhà hàng A",
                        totalPrice: 45.0,
                        status: "CANCELLED",
                        createdAt: "2024-01-17T09:15:00.000Z",
                },
        ];

        // Note: UserList now fetches users internally, so we don't need to fetch here
        // This useEffect can be removed, but keeping it for now in case it's used elsewhere

        const tabs = [
                { id: "users" as Tab, label: "Users", icon: Users },
                { id: "restaurants" as Tab, label: "Restaurants", icon: Utensils },
                { id: "orders" as Tab, label: "Orders", icon: ShoppingCart },
        ];

        return (
                <div className="p-6 bg-brand-yellowlight min-h-screen">
                        <div className="max-w-7xl mx-auto">
                                <div className="mb-8">
                                        <h1 className="text-4xl font-bold text-brand-black mb-2">Admin Dashboard</h1>
                                        <p className="text-gray-600">Manage users, restaurants, and orders</p>
                                </div>

                                {/* Tabs */}
                                <div className="border-b border-gray-200 mb-6">
                                        <nav className="flex space-x-8">
                                                {tabs.map((tab) => {
                                                        const Icon = tab.icon;
                                                        return (
                                                                <button
                                                                        key={tab.id}
                                                                        onClick={() => setActiveTab(tab.id)}
                                                                        className={`
                                                                                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                                                                ${
                                                                                        activeTab === tab.id
                                                                                                ? "border-brand-purple text-brand-purple"
                                                                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                                                }
                                                                        `}
                                                                >
                                                                        <Icon className="w-5 h-5" />
                                                                        {tab.label}
                                                                </button>
                                                        );
                                                })}
                                        </nav>
                                </div>

                                {/* Tab Content */}
                                <div className="bg-white rounded-lg shadow-sm">
                                        {activeTab === "users" && <UserList />}
                                        {activeTab === "restaurants" && <RestaurantList />}
                                        {activeTab === "orders" && <OrderList initialOrders={dummyOrders} />}
                                </div>
                        </div>
                </div>
        );
}
