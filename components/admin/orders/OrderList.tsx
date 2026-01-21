"use client";

import { Order } from "@/types/order.type";
import { Edit, Eye, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function OrderList({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [searchTerm, setSearchTerm] = useState("");
    const filteredOrders = useMemo(() => {
        if (!searchTerm) return orders;
        return orders.filter(
            (order) =>
                order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [orders, searchTerm]);

    // Admin usually doesn't delete orders, only can update status (e.g., cancel order)
    // Or view details

    // Example function to update status (you will need a modal/form for this)
    const handleUpdateStatus = (orderId: string) => {
        // Open modal to select new status
        // Logic: call API, then setOrders(...)
    };

    const formatMoney = (amount: unknown) => {
        const n = typeof amount === "number" ? amount : Number(amount);
        return `$${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
    };

    const shortId = (value: unknown, keep: number = 8) => {
        const s = String(value ?? "");
        if (!s) return "—";
        return s.length > keep ? `${s.slice(0, keep)}…` : s;
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="relative w-full sm:max-w-sm">
                    <input
                        type="text"
                        placeholder="Search by Order ID, Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Mobile: Card view (preferred) */}
            <div className="md:hidden space-y-3">
                {filteredOrders.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600">No orders found.</div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.orderId} className="rounded-lg border border-gray-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-500">Order</p>
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {shortId(order.orderId, 12)}
                                    </p>
                                </div>
                                <span
                                    className={`shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                                        order.status === "completed"
                                            ? "bg-green-100 text-green-800"
                                            : order.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : order.status === "cancelled"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-blue-100 text-blue-800"
                                    }`}
                                >
                                    {order.status}
                                </span>
                            </div>

                            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-gray-500">User</span>
                                    <span className="font-medium text-gray-900">{shortId(order.userId, 10)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-gray-500">Restaurant</span>
                                    <span className="font-medium text-gray-900 truncate max-w-[60%]">
                                        {order.restaurant?.name || "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-gray-500">Total</span>
                                    <span className="font-semibold text-gray-900">
                                        {formatMoney(order.finalAmount)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => handleUpdateStatus(order.orderId)}
                                    className="h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    title="Update Status"
                                >
                                    <Edit className="h-5 w-5" />
                                </button>
                                <Link
                                    href={`/admin/order/${order.orderId}`}
                                    className="h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    title="View Details"
                                >
                                    <Eye className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop/Tablet: Table with controlled horizontal scroll */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Restaurant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map((order) => (
                            <tr key={order.orderId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {shortId(order.orderId, 12)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {shortId(order.userId, 10)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {order.restaurant?.name || "—"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatMoney(order.finalAmount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            order.status === "completed"
                                                ? "bg-green-100 text-green-800"
                                                : order.status === "pending"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : order.status === "cancelled"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-blue-100 text-blue-800"
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="inline-flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleUpdateStatus(order.orderId)}
                                            className="h-11 w-11 inline-flex items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50"
                                            title="Update Status"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <Link
                                            href={`/admin/order/${order.orderId}`}
                                            className="h-11 w-11 inline-flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
                                            title="View Details"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
