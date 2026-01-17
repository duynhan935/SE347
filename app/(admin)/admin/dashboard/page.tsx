"use client";

import { authApi } from "@/lib/api/authApi";
import { dashboardApi, buildDateRangeQuery, type DashboardDateRangePreset } from "@/lib/api/dashboardApi";
import { User } from "@/types";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { orderApi } from "@/lib/api/orderApi";
import { Order } from "@/types/order.type";
import {
    AlertCircle,
    Clock,
    DollarSign,
    ShoppingCart,
    Store,
    TrendingUp,
    UserCheck,
    Users,
    Utensils,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

function formatVnd(value: number): string {
    try {
        return new Intl.NumberFormat("vi-VN").format(value);
    } catch {
        return value.toLocaleString();
    }
}

function formatDateLabel(dateLike: string): string {
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return String(dateLike);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
    color: string;
}

function StatsCard({ title, value, icon: Icon, trend, trendUp, color }: StatsCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
                    {trend && (
                        <p className={`text-sm mt-2 ${trendUp ? "text-green-600" : "text-red-600"}`}>
                            {trendUp ? "↑" : "↓"} {trend}
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                </div>
            </div>
        </div>
    );
}

type TrendPoint = { date: string; revenue: number; orders: number };
type TopMerchantPoint = { merchantId: string; revenue: number };
type StatusBreakdownPoint = { name: string; count: number; amount: number };
type PaymentBreakdownPoint = { name: string; count: number; amount: number };
type RevenueByMerchantPoint = { merchantId: string; revenue: number; orders: number; aov: number };
type MerchantPerformancePoint = {
    merchantId: string;
    restaurantName: string;
    revenue: number;
    orders: number;
    completionRate: number;
};

export default function AdminDashboard() {
    const [rangePreset, setRangePreset] = useState<DashboardDateRangePreset>("30d");
    const dateQuery = useMemo(() => buildDateRangeQuery(rangePreset), [rangePreset]);

    const [stats, setStats] = useState({
        activeUsers: 0,
        activeMerchants: 0,
        totalRestaurants: 0,
        activeRestaurants: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        completionRate: 0,
        pendingMerchants: 0,
    });
    const [pendingMerchantRequests, setPendingMerchantRequests] = useState<User[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [trendData, setTrendData] = useState<TrendPoint[]>([]);
    const [topMerchantsData, setTopMerchantsData] = useState<TopMerchantPoint[]>([]);
    const [revenueBreakdown, setRevenueBreakdown] = useState<{
        totalProductAmount: number;
        totalDeliveryFee: number;
        totalTax: number;
        totalDiscount: number;
    } | null>(null);
    const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdownPoint[]>([]);
    const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdownPoint[]>([]);
    const [revenueByMerchant, setRevenueByMerchant] = useState<RevenueByMerchantPoint[]>([]);
    const [merchantPerformance, setMerchantPerformance] = useState<MerchantPerformancePoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rangePreset]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Admin dashboard APIs (order-service)
            const [overview, revenue, ordersStats, revByMerchant, merchantsPerf] = await Promise.all([
                dashboardApi.getAdminOverview(dateQuery),
                dashboardApi.getAdminRevenueAnalytics(dateQuery),
                dashboardApi.getAdminOrderStatistics(dateQuery),
                dashboardApi.getAdminRevenueByMerchant(dateQuery),
                dashboardApi.getAdminMerchantsPerformance(dateQuery),
            ]);

            // Pending merchants (approval queue)
            const pendingPage = await authApi.getMerchantsPendingConsideration({ page: 0, size: 5 });
            const pendingList = Array.isArray(pendingPage?.content) ? pendingPage.content : [];
            const pendingCount =
                typeof pendingPage?.totalElements === "number" ? pendingPage.totalElements : pendingList.length;
            setPendingMerchantRequests(pendingList);

            // Restaurants (enabled/disabled) from restaurant-service
            let totalRestaurants = 0;
            let activeRestaurants = 0;
            try {
                const params = new URLSearchParams({ lat: "10.762622", lon: "106.660172" }); // Default: HCM
                const restaurantsResponse = await restaurantApi.getAllRestaurants(params);
                const restaurants = Array.isArray(restaurantsResponse.data?.content)
                    ? restaurantsResponse.data.content
                    : [];
                totalRestaurants = restaurants.length;
                activeRestaurants = restaurants.filter((r) => r.enabled).length;
            } catch {
                // Fallback to overview's totalRestaurants (restaurants that had orders)
                totalRestaurants = typeof overview?.totalRestaurants === "number" ? overview.totalRestaurants : 0;
                activeRestaurants = 0;
            }

            // Recent orders (small list)
            try {
                const recentResult = await orderApi.getAllOrders({ page: 1, limit: 5 });
                setRecentOrders(Array.isArray(recentResult.orders) ? recentResult.orders : []);
            } catch {
                setRecentOrders([]);
            }

            setRevenueBreakdown({
                totalProductAmount: typeof revenue?.totalProductAmount === "number" ? revenue.totalProductAmount : 0,
                totalDeliveryFee: typeof revenue?.totalDeliveryFee === "number" ? revenue.totalDeliveryFee : 0,
                totalTax: typeof revenue?.totalTax === "number" ? revenue.totalTax : 0,
                totalDiscount: typeof revenue?.totalDiscount === "number" ? revenue.totalDiscount : 0,
            });

            setStatusBreakdown(
                (Array.isArray(ordersStats?.statusBreakdown) ? ordersStats.statusBreakdown : []).map((s) => ({
                    name: String(s.status),
                    count: typeof s.count === "number" ? s.count : 0,
                    amount: typeof s.totalAmount === "number" ? s.totalAmount : 0,
                }))
            );

            setPaymentBreakdown(
                (Array.isArray(ordersStats?.paymentBreakdown) ? ordersStats.paymentBreakdown : []).map((p) => ({
                    name: String(p.paymentStatus),
                    count: typeof p.count === "number" ? p.count : 0,
                    amount: typeof p.totalAmount === "number" ? p.totalAmount : 0,
                }))
            );

            setRevenueByMerchant(
                (Array.isArray(revByMerchant) ? revByMerchant : []).slice(0, 10).map((r) => ({
                    merchantId: String(r.merchantId),
                    revenue: typeof r.totalRevenue === "number" ? r.totalRevenue : 0,
                    orders: typeof r.totalOrders === "number" ? r.totalOrders : 0,
                    aov: typeof r.averageOrderValue === "number" ? r.averageOrderValue : 0,
                }))
            );

            setMerchantPerformance(
                (Array.isArray(merchantsPerf) ? merchantsPerf : []).slice(0, 10).map((m) => ({
                    merchantId: String(m.merchantId),
                    restaurantName: String(m.restaurantName || "Restaurant"),
                    revenue: typeof m.totalRevenue === "number" ? m.totalRevenue : 0,
                    orders: typeof m.totalOrders === "number" ? m.totalOrders : 0,
                    completionRate:
                        typeof m.completionRate === "string"
                            ? Number(m.completionRate)
                            : typeof m.completionRate === "number"
                            ? m.completionRate
                            : 0,
                }))
            );

            setStats({
                activeUsers: typeof overview?.totalUsers === "number" ? overview.totalUsers : 0,
                activeMerchants: typeof overview?.totalMerchants === "number" ? overview.totalMerchants : 0,
                totalRestaurants,
                activeRestaurants,
                totalRevenue: typeof overview?.totalRevenue === "number" ? overview.totalRevenue : 0,
                totalOrders: typeof overview?.totalOrders === "number" ? overview.totalOrders : 0,
                averageOrderValue: typeof overview?.averageOrderValue === "number" ? overview.averageOrderValue : 0,
                completionRate:
                    typeof overview?.completionRate === "string"
                        ? Number(overview.completionRate)
                        : typeof overview?.completionRate === "number"
                        ? overview.completionRate
                        : 0,
                pendingMerchants: pendingCount,
            });
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast.error("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">System overview (orders analytics)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Range</label>
                        <select
                            value={rangePreset}
                            onChange={(e) => setRangePreset(e.target.value as DashboardDateRangePreset)}
                            className="h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="ytd">Year to date</option>
                            <option value="all">All time</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Active users"
                    value={stats.activeUsers.toLocaleString()}
                    icon={UserCheck}
                    color="bg-blue-500"
                />
                <StatsCard title="Active merchants" value={stats.activeMerchants} icon={Store} color="bg-purple-500" />
                <StatsCard
                    title="Active restaurants"
                    value={`${stats.activeRestaurants}/${stats.totalRestaurants}`}
                    icon={Utensils}
                    color="bg-green-500"
                />
                <StatsCard
                    title="Total revenue"
                    value={`${formatVnd(stats.totalRevenue)}₫`}
                    icon={DollarSign}
                    color="bg-yellow-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total orders"
                    value={stats.totalOrders.toLocaleString()}
                    icon={ShoppingCart}
                    color="bg-orange-500"
                />
                <StatsCard
                    title="Avg order value"
                    value={`${formatVnd(Math.round(stats.averageOrderValue))}₫`}
                    icon={TrendingUp}
                    color="bg-indigo-500"
                />
                <StatsCard
                    title="Completion rate"
                    value={`${stats.completionRate.toFixed(1)}%`}
                    icon={TrendingUp}
                    color="bg-emerald-500"
                />
            </div>

            {/* Quick Actions & Pending Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Merchants */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending merchants</h3>
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                            {stats.pendingMerchants}
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {stats.pendingMerchants} merchant(s) waiting for approval
                    </p>

                    {/* List of pending requests */}
                    {loading ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Loading...</div>
                    ) : pendingMerchantRequests.length > 0 ? (
                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                            {pendingMerchantRequests.map((merchant) => (
                                <div
                                    key={merchant.id}
                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                            {merchant.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {merchant.username}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{merchant.email}</p>
                                        </div>
                                    </div>
                                    <Clock className="text-yellow-500" size={16} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">No pending requests</div>
                    )}

                    <Link
                        href="/admin/merchants"
                        className="inline-flex items-center gap-2 text-brand-yellow hover:text-brand-yellow/80 font-medium"
                    >
                        View list <AlertCircle size={16} />
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick actions</h3>
                    <div className="space-y-3">
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Users className="text-blue-500" size={20} />
                            <span className="text-gray-700 dark:text-gray-300">Manage users</span>
                        </Link>
                        <Link
                            href="/admin/merchants"
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Store className="text-purple-500" size={20} />
                            <span className="text-gray-700 dark:text-gray-300">Manage merchants</span>
                        </Link>
                        <Link
                            href="/admin/restaurants"
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Utensils className="text-green-500" size={20} />
                            <span className="text-gray-700 dark:text-gray-300">Manage restaurants</span>
                        </Link>
                        <Link
                            href="/admin/categories"
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ShoppingCart className="text-orange-500" size={20} />
                            <span className="text-gray-700 dark:text-gray-300">Manage categories</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Order Status Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trạng thái đơn hàng</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statusBreakdown.map((status) => (
                        <div
                            key={status.name}
                            className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                        >
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 capitalize">{status.name}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{status.count}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatVnd(status.amount)}₫</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Status Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trạng thái thanh toán</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {paymentBreakdown.map((payment) => (
                        <div
                            key={payment.name}
                            className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                        >
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 capitalize">{payment.name}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{payment.count}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatVnd(payment.amount)}₫
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Revenue breakdown */}
            {revenueBreakdown && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Products</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                {formatVnd(revenueBreakdown.totalProductAmount)}₫
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Delivery fee</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                {formatVnd(revenueBreakdown.totalDeliveryFee)}₫
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Tax</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                {formatVnd(revenueBreakdown.totalTax)}₫
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Discount</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                -{formatVnd(revenueBreakdown.totalDiscount)}₫
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Merchants tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Top merchants by revenue
                    </h3>
                    {revenueByMerchant.length === 0 ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">No data.</div>
                    ) : (
                        <div className="space-y-3">
                            {revenueByMerchant.map((m) => (
                                <div
                                    key={m.merchantId}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {m.merchantId}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {m.orders.toLocaleString()} orders • AOV {formatVnd(Math.round(m.aov))}₫
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {formatVnd(m.revenue)}₫
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Merchants performance</h3>
                    {merchantPerformance.length === 0 ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">No data.</div>
                    ) : (
                        <div className="space-y-3">
                            {merchantPerformance.map((m) => (
                                <div
                                    key={`${m.merchantId}-${m.restaurantName}`}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {m.merchantId}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                            {m.restaurantName} • {m.orders.toLocaleString()} orders •{" "}
                                            {m.completionRate.toFixed(1)}% complete
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {formatVnd(m.revenue)}₫
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent orders</h3>
                {recentOrders.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No recent orders.</div>
                ) : (
                    <div className="space-y-4">
                        {recentOrders.map((o, idx) => (
                            <div
                                key={o.orderId}
                                className={`flex items-center gap-4 ${
                                    idx < recentOrders.length - 1
                                        ? "pb-4 border-b border-gray-200 dark:border-gray-700"
                                        : ""
                                }`}
                            >
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                    <ShoppingCart className="text-orange-600 dark:text-orange-400" size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Order {o.orderId} • {o.status}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(o.createdAt).toLocaleString("en-US")} •{" "}
                                        {formatVnd(o.finalAmount || 0)}₫
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
