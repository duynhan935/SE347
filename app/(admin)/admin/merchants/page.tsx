"use client";

import { Loader2, Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { merchantApi } from "@/lib/api/merchantApi";
import { Merchant } from "@/types";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { orderApi } from "@/lib/api/orderApi";
import { OrderStatus } from "@/types/order.type";

export default function MerchantsPage() {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    useEffect(() => {
        fetchMerchants();
    }, []);

    const fetchMerchants = async () => {
        setLoading(true);
        try {
            const data = await merchantApi.getAllMerchants();
            const baseMerchants = Array.isArray(data) ? data : [];

            const params = new URLSearchParams({ lat: "10.762622", lon: "106.660172" }); // Default: HCM
            const restaurantsResponse = await restaurantApi.getAllRestaurants(params);
            const restaurants = Array.isArray(restaurantsResponse.data) ? restaurantsResponse.data : [];

            const restaurantCountByMerchantId = new Map<string, number>();
            const restaurantIdToMerchantId = new Map<string, string>();
            for (const r of restaurants) {
                restaurantCountByMerchantId.set(r.merchantId, (restaurantCountByMerchantId.get(r.merchantId) || 0) + 1);
                restaurantIdToMerchantId.set(r.id, r.merchantId);
            }

            const revenueByMerchantId = new Map<string, number>();
            let page = 1;
            const limit = 100;
            const maxPages = 20;
            while (page <= maxPages) {
                const { orders, pagination } = await orderApi.getAllOrders({
                    page,
                    limit,
                    status: OrderStatus.COMPLETED,
                });

                for (const o of orders) {
                    const merchantId =
                        o.merchantId || (o.restaurantId ? restaurantIdToMerchantId.get(o.restaurantId) : undefined);
                    if (!merchantId) continue;
                    revenueByMerchantId.set(
                        merchantId,
                        (revenueByMerchantId.get(merchantId) || 0) + (o.finalAmount || 0)
                    );
                }

                if (!pagination || page >= (pagination.totalPages || 1)) break;
                page += 1;
            }

            setMerchants(
                baseMerchants.map((m) => ({
                    ...m,
                    totalRestaurants: restaurantCountByMerchantId.get(m.id) || 0,
                    totalRevenue: revenueByMerchantId.get(m.id) || 0,
                }))
            );
        } catch (error) {
            console.error("Failed to fetch merchants:", error);
            toast.error("Failed to load merchants.");
            setMerchants([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveMerchant = async (merchantId: string) => {
        try {
            await merchantApi.approveMerchant(merchantId);
            toast.success("Merchant approved.");
            fetchMerchants();
        } catch (error) {
            console.error("Failed to approve merchant:", error);
            toast.error("Failed to approve merchant.");
        }
    };

    const handleRejectMerchant = async (merchantId: string) => {
        const reason = prompt("Enter a rejection reason:");
        if (!reason) return;

        try {
            await merchantApi.rejectMerchant(merchantId, reason);
            toast.success("Merchant rejected.");
            fetchMerchants();
        } catch (error) {
            console.error("Failed to reject merchant:", error);
            toast.error("Failed to reject merchant.");
        }
    };

    const filteredMerchants = merchants.filter((merchant) => {
        const matchesSearch =
            merchant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (merchant.businessName && merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === "ALL" || merchant.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Merchants</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Review and approve merchant accounts</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total merchants</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{merchants.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                        {merchants.filter((m) => m.status === "PENDING").length}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {merchants.filter((m) => m.status === "APPROVED").length}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                        {merchants.filter((m) => m.status === "REJECTED").length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by username, email, or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    >
                        <option value="ALL">All statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Merchants Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-brand-yellow" size={40} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Merchant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Company
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Restaurants
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredMerchants.map((merchant) => (
                                    <tr
                                        key={merchant.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                                                    {merchant.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {merchant.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {merchant.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {merchant.businessName || "—"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {merchant.totalRestaurants}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {merchant.totalRevenue.toLocaleString()}₫
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    merchant.status === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                        : merchant.status === "APPROVED"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                }`}
                                            >
                                                {merchant.status === "PENDING"
                                                    ? "Pending"
                                                    : merchant.status === "APPROVED"
                                                    ? "Approved"
                                                    : "Rejected"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {}}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="View details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {merchant.status === "PENDING" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveMerchant(merchant.id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectMerchant(merchant.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredMerchants.length === 0 && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                No merchants found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
