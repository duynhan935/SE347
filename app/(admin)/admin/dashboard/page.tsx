"use client";

import DashboardVisualization, { type DashboardApiBundle } from "@/components/dashboard/DashboardVisualization";
import {
    adaptAdminMerchantsPerformanceToViewModel,
    adaptAdminOrderStatisticsToViewModel,
    adaptAdminRevenueByMerchantToViewModel,
    adaptAdminSystemOverviewToViewModel,
} from "@/lib/adapters/dashboardAdapters";
import { buildDateRangeQuery, dashboardApi, type DashboardDateRangePreset } from "@/lib/api/dashboardApi";
import { orderApi } from "@/lib/api/orderApi";
import { formatDateTime } from "@/lib/formatters";
import { formatCurrency, formatNumber } from "@/lib/utils/dashboardFormat";
import type { Order } from "@/types/order.type";
import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Percent,
    ShoppingCart,
    Store,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

function safeToFixed(value: number | string | undefined, decimals: number = 1): string {
    if (value === undefined || value === null) return "0";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "0" : num.toFixed(decimals);
}

// Stats Card Component - TailAdmin Style
interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: number;
    trendLabel?: string;
    bgColor: string;
    iconColor: string;
}

function StatsCard({ title, value, icon: Icon, trend, trendLabel, bgColor, iconColor }: StatsCardProps) {
    const isPositive = trend !== undefined && trend > 0;
    const isNegative = trend !== undefined && trend < 0;

    return (
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${bgColor}`}>
                            <Icon className={iconColor} size={20} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-black dark:text-white mb-1">{title}</p>
                    <h4 className="text-2xl font-bold text-black dark:text-white mb-2">{value}</h4>
                    {trend !== undefined && (
                        <div className="flex items-center gap-1.5">
                            {isPositive && <TrendingUp size={16} className="text-meta-3" />}
                            {isNegative && <TrendingDown size={16} className="text-meta-1" />}
                            <span
                                className={`text-sm font-medium ${
                                    isPositive ? "text-meta-3" : isNegative ? "text-meta-1" : "text-meta-6"
                                }`}
                            >
                                {Math.abs(trend)}%
                            </span>
                            {trendLabel && (
                                <span className="text-sm font-medium text-black dark:text-white">{trendLabel}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [rangePreset, setRangePreset] = useState<DashboardDateRangePreset>("30d");
    const dateQuery = useMemo(() => buildDateRangeQuery(rangePreset), [rangePreset]);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<{
        activeUsers: number;
        activeMerchants: number;
        totalRestaurants: number;
        activeRestaurants: number;
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
        completionRate: number | string;
        pendingMerchants: number;
    } | null>(null);
    const [revenueBreakdown, setRevenueBreakdown] = useState<{
        totalProductAmount: number;
        totalDeliveryFee: number;
        totalTax: number;
        totalDiscount: number;
    } | null>(null);
    const [statusBreakdown, setStatusBreakdown] = useState<Array<{ name: string; count: number; amount: number }>>([]);
    const [paymentBreakdown, setPaymentBreakdown] = useState<Array<{ name: string; count: number; amount: number }>>(
        [],
    );
    const [, setRevenueByMerchant] = useState<
        Array<{ merchantId: string; revenue: number; orders: number; aov: number }>
    >([]);
    const [merchantPerformance, setMerchantPerformance] = useState<
        Array<{
            merchantId: string;
            restaurantName: string;
            revenue: number;
            orders: number;
            completionRate: number | string;
        }>
    >([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [vizData, setVizData] = useState<DashboardApiBundle | null>(null);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const [overview, revenue, orderStats, merchants, revenueByMerch] = await Promise.all([
                    dashboardApi.getAdminOverview(dateQuery),
                    dashboardApi.getAdminRevenueAnalytics(dateQuery),
                    dashboardApi.getAdminOrderStatistics(dateQuery),
                    dashboardApi.getAdminMerchantsPerformance(dateQuery),
                    dashboardApi.getAdminRevenueByMerchant(dateQuery),
                ]);

                setVizData({
                    overview: { success: true, data: overview },
                    revenue: { success: true, data: revenue },
                    orders: {
                        success: true,
                        data: {
                            statusBreakdown: Array.isArray(orderStats?.statusBreakdown)
                                ? orderStats.statusBreakdown
                                : [],
                        },
                    },
                    merchants: {
                        success: true,
                        data: Array.isArray(merchants) ? merchants : [],
                    },
                });

                setStats({
                    ...adaptAdminSystemOverviewToViewModel(overview),
                    pendingMerchants: 0,
                });
                setRevenueBreakdown(revenue);

                const { statusBreakdown, paymentBreakdown } = adaptAdminOrderStatisticsToViewModel(orderStats);
                setStatusBreakdown(statusBreakdown);
                setPaymentBreakdown(paymentBreakdown);

                setMerchantPerformance(adaptAdminMerchantsPerformanceToViewModel(merchants));
                setRevenueByMerchant(adaptAdminRevenueByMerchantToViewModel(revenueByMerch));

                // Recent orders
                const recent = await orderApi.getAllOrders({ page: 1, limit: 5 });
                setRecentOrders(Array.isArray(recent.orders) ? recent.orders : []);
            } catch (error) {
                console.error("Failed to load admin dashboard:", error);
                toast.error("Unable to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [dateQuery]);

    const cards = useMemo(() => {
        return [
            {
                title: "Total Revenue",
                value: formatCurrency(stats?.totalRevenue ?? 0),
                icon: DollarSign,
                bgColor: "bg-meta-3/10",
                iconColor: "text-meta-3",
                trend: 12.5,
                trendLabel: "vs last month",
            },
            {
                title: "Total Orders",
                value: stats?.totalOrders ?? 0,
                icon: ShoppingCart,
                bgColor: "bg-primary/10",
                iconColor: "text-primary",
                trend: 8.2,
                trendLabel: "vs last month",
            },
            {
                title: "Users",
                value: stats?.activeUsers ?? 0,
                icon: Users,
                bgColor: "bg-meta-6/10",
                iconColor: "text-meta-6",
                trend: 3.7,
                trendLabel: "new users",
            },
            {
                title: "Restaurants",
                value: `${stats?.activeRestaurants ?? 0}/${stats?.totalRestaurants ?? 0}`,
                icon: Store,
                bgColor: "bg-warning/10",
                iconColor: "text-warning",
                trend: undefined,
                trendLabel: "active",
            },
            {
                title: "Avg Order Value",
                value: formatCurrency(stats?.averageOrderValue ?? 0),
                icon: BarChart3,
                bgColor: "bg-meta-5/10",
                iconColor: "text-meta-5",
            },
            {
                title: "Completion Rate",
                value: stats ? `${safeToFixed(stats.completionRate)}%` : "0%",
                icon: CheckCircle2,
                bgColor: "bg-success/10",
                iconColor: "text-success",
            },
        ];
    }, [stats]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-sm font-medium text-gray-600 dark:text-white/60 mt-1">System overview</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={rangePreset}
                        onChange={(e) => setRangePreset(e.target.value as DashboardDateRangePreset)}
                        className="relative z-20 inline-flex appearance-none bg-transparent py-2 pl-3 pr-8 text-sm font-medium outline-none border border-stroke dark:border-strokedark rounded-lg dark:bg-meta-4"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="ytd">Year to date</option>
                        <option value="all">All time</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards - TailAdmin Style */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                {cards.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts (Recharts) */}
            {vizData && <DashboardVisualization data={vizData} />}

            {/* Revenue Breakdown */}
            <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 className="mb-5 text-xl font-semibold text-black dark:text-white">Revenue Breakdown</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                                <DollarSign size={20} className="text-primary" />
                            </div>
                            <p className="text-sm font-medium text-bodydark">Product Total</p>
                        </div>
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {formatCurrency(revenueBreakdown?.totalProductAmount ?? 0)}
                        </p>
                    </div>
                    <div className="rounded-lg bg-meta-3/5 p-4 border border-meta-3/20">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-3/20">
                                <ShoppingCart size={20} className="text-meta-3" />
                            </div>
                            <p className="text-sm font-medium text-bodydark">Delivery Fees</p>
                        </div>
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {formatCurrency(revenueBreakdown?.totalDeliveryFee ?? 0)}
                        </p>
                    </div>
                    <div className="rounded-lg bg-warning/5 p-4 border border-warning/20">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
                                <Percent size={20} className="text-warning" />
                            </div>
                            <p className="text-sm font-medium text-bodydark">Tax</p>
                        </div>
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {formatCurrency(revenueBreakdown?.totalTax ?? 0)}
                        </p>
                    </div>
                    <div className="rounded-lg bg-meta-1/5 p-4 border border-meta-1/20">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-1/20">
                                <TrendingDown size={20} className="text-meta-1" />
                            </div>
                            <p className="text-sm font-medium text-bodydark">Discounts</p>
                        </div>
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {formatCurrency(revenueBreakdown?.totalDiscount ?? 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Order & Payment Status */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
                {/* Order Status */}
                <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                        <h3 className="font-semibold text-black dark:text-white">Order Status</h3>
                    </div>
                    <div className="p-6">
                        {statusBreakdown.length === 0 ? (
                            <p className="text-sm text-bodydark">No data yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {statusBreakdown.map((item, index) => {
                                    const getStatusIcon = (name: string | undefined) => {
                                        const n = (name || "").toLowerCase();
                                        if (n.includes("pending")) return Clock;
                                        if (n.includes("completed")) return CheckCircle2;
                                        if (n.includes("cancel")) return XCircle;
                                        return AlertCircle;
                                    };
                                    const getStatusColor = (name: string | undefined) => {
                                        const n = (name || "").toLowerCase();
                                        if (n.includes("pending")) return "text-warning bg-warning/10";
                                        if (n.includes("completed")) return "text-meta-3 bg-meta-3/10";
                                        if (n.includes("cancel")) return "text-meta-1 bg-meta-1/10";
                                        return "text-primary bg-primary/10";
                                    };
                                    const Icon = getStatusIcon(item.name);
                                    const colorClass = getStatusColor(item.name);

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray dark:hover:bg-meta-4 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}
                                                >
                                                    <Icon size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-black dark:text-white capitalize">
                                                        {item.name || "Unknown"}
                                                    </p>
                                                    <p className="text-xs text-bodydark">
                                                        {formatNumber(item.count)} orders
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-black dark:text-white">
                                                {formatCurrency(item.amount)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Status */}
                <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                        <h3 className="font-semibold text-black dark:text-white">Payment Status</h3>
                    </div>
                    <div className="p-6">
                        {paymentBreakdown.length === 0 ? (
                            <p className="text-sm text-bodydark">No data yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {paymentBreakdown.map((item, index) => {
                                    const getPaymentColor = (name: string | undefined) => {
                                        const n = (name || "").toLowerCase();
                                        if (n.includes("paid")) return "text-meta-3 bg-meta-3/10";
                                        if (n.includes("pending")) return "text-warning bg-warning/10";
                                        if (n.includes("failed")) return "text-meta-1 bg-meta-1/10";
                                        return "text-primary bg-primary/10";
                                    };
                                    const colorClass = getPaymentColor(item.name);

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray dark:hover:bg-meta-4 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}
                                                >
                                                    <CreditCard size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-black dark:text-white capitalize">
                                                        {item.name?.toLowerCase() === "pending" ? "Unpaid" : (item.name || "Unknown")}
                                                    </p>
                                                    <p className="text-xs text-bodydark">
                                                        {formatNumber(item.count)} transactions
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-black dark:text-white">
                                                {formatCurrency(item.amount)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Merchants & Recent Orders */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
                {/* Top Merchants */}
                <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                        <h3 className="font-semibold text-black dark:text-white">Top Restaurants</h3>
                    </div>
                    <div className="p-6">
                        {merchantPerformance.length === 0 ? (
                            <p className="text-sm text-bodydark">No data yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {merchantPerformance.slice(0, 5).map((merchant, index) => (
                                    <div
                                        key={merchant.merchantId}
                                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray dark:hover:bg-meta-4 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                #{index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium text-black dark:text-white">
                                                    {merchant.restaurantName}
                                                </p>
                                                <p className="text-xs text-bodydark">
                                                    {formatNumber(merchant.orders)} orders •{" "}
                                                    {safeToFixed(merchant.completionRate)}% completion
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-meta-3">{formatCurrency(merchant.revenue)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6 py-4 dark:border-strokedark flex items-center justify-between">
                        <h3 className="font-semibold text-black dark:text-white">Recent Orders</h3>
                        <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <p className="text-sm text-bodydark">Loading...</p>
                        ) : recentOrders.length === 0 ? (
                            <p className="text-sm text-bodydark">No orders yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order) => {
                                    const statusColor =
                                        order.status === "completed"
                                            ? "bg-meta-3/10 text-meta-3"
                                            : order.status === "cancelled"
                                              ? "bg-meta-1/10 text-meta-1"
                                              : "bg-warning/10 text-warning";

                                    return (
                                        <div
                                            key={order.orderId}
                                            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray dark:hover:bg-meta-4 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <ShoppingCart size={18} className="text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-black dark:text-white">
                                                        #{order.orderId}
                                                    </p>
                                                    <p className="text-xs text-bodydark">
                                                        {formatDateTime(order.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-black dark:text-white mb-1">
                                                    {formatCurrency(order.finalAmount || 0)}
                                                </p>
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
