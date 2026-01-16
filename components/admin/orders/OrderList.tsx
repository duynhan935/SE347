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
                order.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [orders, searchTerm]);

    // Admin usually doesn't delete orders, only can update status (e.g., cancel order)
    // Or view details

    // Example function to update status (you will need a modal/form for this)
    const handleUpdateStatus = (orderId: string) => {
        // Open modal to select new status
        console.log(`Open status update modal for ${orderId}`);
        // Logic: call API, then setOrders(...)
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
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

            <div className="overflow-x-auto">
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
                                    {order.orderId.substring(0, 8)}...
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{order.userId.substring(0, 8)}...</td>
                                <td className="px-6 py-4 whitespace-nowrap">{order.restaurant?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">${Number(order.finalAmount).toFixed(2)}</td>
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
                                    <button
                                        onClick={() => handleUpdateStatus(order.orderId)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        title="Update Status"
                                    >
                                        <Edit className="w-5 h-5 inline-block" />
                                    </button>
                                    <Link
                                        href={`/admin/order/${order.orderId}`} // Link to detail page
                                        className="text-gray-600 hover:text-gray-900"
                                        title="View Details"
                                    >
                                        <Eye className="w-5 h-5 inline-block" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
