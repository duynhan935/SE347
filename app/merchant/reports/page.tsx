"use client";

import { dashboardApi, buildDateRangeQuery, type DashboardDateRangePreset } from "@/lib/api/dashboardApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { DollarSign, Download, ShoppingBag, Star, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { formatCurrency, formatNumber } from "@/lib/utils/dashboardFormat";
import Link from "next/link";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

function formatDateLabel(dateLike: string): string {
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return String(dateLike);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export default function MerchantReportsPage() {
    const { user } = useAuthStore();

    const [rangePreset, setRangePreset] = useState<DashboardDateRangePreset>("30d");
    const dateQuery = useMemo(() => buildDateRangeQuery(rangePreset), [rangePreset]);

    const [loading, setLoading] = useState(true);
    const [restaurantOverview, setRestaurantOverview] = useState<{
        restaurantId: string;
        restaurantName: string;
        restaurantSlug: string;
    } | null>(null);

    const [revenueAnalytics, setRevenueAnalytics] = useState<{
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
        revenueByRestaurant: Array<{ restaurantName: string; totalRevenue: number; totalOrders: number }>;
    } | null>(null);
    const [revenueTrend, setRevenueTrend] = useState<Array<{ name: string; revenue: number; orders: number }>>([]);
    const [hourlyStats, setHourlyStats] = useState<Array<{ hour: string; orders: number; revenue: number }>>([]);
    const [weekdayStats, setWeekdayStats] = useState<Array<{ name: string; orders: number; revenue: number }>>([]);
    const [timeSummary, setTimeSummary] = useState<{
        peakHour: { hour: number; totalOrders: number; totalRevenue: number };
        busiestDay: { dayName: string; totalOrders: number; totalRevenue: number };
    } | null>(null);

    const [topProducts, setTopProducts] = useState<
        Array<{
            productId: string;
            productName: string;
            totalQuantity: number;
            orderCount: number;
            totalRevenue: number;
        }>
    >([]);

    const [ratingStats, setRatingStats] = useState<{ averageRating: number; totalRatings: number } | null>(null);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const run = async () => {
            setLoading(true);
            try {
                const merchantId = user.id;
                let restaurant: Awaited<ReturnType<typeof dashboardApi.getMerchantRestaurantOverview>> | null = null;
                try {
                    restaurant = await dashboardApi.getMerchantRestaurantOverview(merchantId);
                } catch (error: unknown) {
                    const status =
                        error && typeof error === "object" && "response" in error
                            ? (error as { response?: { status?: number } }).response?.status
                            : undefined;
                    if (status === 404) {
                        setRestaurantOverview(null);
                        setRevenueAnalytics(null);
                        setRevenueTrend([]);
                        setHourlyStats([]);
                        setWeekdayStats([]);
                        setTimeSummary(null);
                        setTopProducts([]);
                        setRatingStats(null);
                        return;
                    }
                    throw error;
                }

                const [revenue, trend, hourly, timeAnalytics, top, ratings] = await Promise.all([
                    dashboardApi.getMerchantRevenue(merchantId, dateQuery),
                    dashboardApi.getMerchantRevenueTrend(merchantId, dateQuery),
                    dashboardApi.getMerchantHourlyStatistics(merchantId, dateQuery),
                    dashboardApi.getMerchantTimeAnalytics(merchantId, dateQuery),
                    dashboardApi.getMerchantTopProducts(merchantId, { limit: 5, ...dateQuery }),
                    dashboardApi.getMerchantRatingStats(merchantId, dateQuery),
                ]);

                setRestaurantOverview({
                    restaurantId: restaurant.restaurantId,
                    restaurantName: restaurant.restaurantName,
                    restaurantSlug: restaurant.restaurantSlug,
                });

                setRevenueAnalytics({
                    totalRevenue: typeof revenue.totalRevenue === "number" ? revenue.totalRevenue : 0,
                    totalOrders: typeof revenue.totalOrders === "number" ? revenue.totalOrders : 0,
                    averageOrderValue: typeof revenue.averageOrderValue === "number" ? revenue.averageOrderValue : 0,
                    revenueByRestaurant: (Array.isArray(revenue.revenueByRestaurant)
                        ? revenue.revenueByRestaurant
                        : []
                    ).map((r) => ({
                        restaurantName: r.restaurantName || "Restaurant",
                        totalRevenue: typeof r.totalRevenue === "number" ? r.totalRevenue : 0,
                        totalOrders: typeof r.totalOrders === "number" ? r.totalOrders : 0,
                    })),
                });

                setRevenueTrend(
                    (Array.isArray(trend) ? trend : []).map((p) => ({
                        name: formatDateLabel(p.date),
                        revenue: typeof p.totalRevenue === "number" ? p.totalRevenue : 0,
                        orders: typeof p.totalOrders === "number" ? p.totalOrders : 0,
                    })),
                );

                setHourlyStats(
                    (Array.isArray(hourly) ? hourly : []).map((h) => ({
                        hour: `${String(h.hour).padStart(2, "0")}:00`,
                        orders: typeof h.totalOrders === "number" ? h.totalOrders : 0,
                        revenue: typeof h.totalRevenue === "number" ? h.totalRevenue : 0,
                    })),
                );

                setWeekdayStats(
                    (Array.isArray(timeAnalytics.weekdayStatistics) ? timeAnalytics.weekdayStatistics : []).map(
                        (d) => ({
                            name: d.dayName,
                            orders: typeof d.totalOrders === "number" ? d.totalOrders : 0,
                            revenue: typeof d.totalRevenue === "number" ? d.totalRevenue : 0,
                        }),
                    ),
                );

                setTimeSummary({
                    peakHour: timeAnalytics.peakHour,
                    busiestDay: timeAnalytics.busiestDay,
                });

                setTopProducts(
                    (Array.isArray(top) ? top : []).map((p) => ({
                        productId: p.productId,
                        productName: p.productName,
                        totalQuantity: typeof p.totalQuantity === "number" ? p.totalQuantity : 0,
                        orderCount: typeof p.orderCount === "number" ? p.orderCount : 0,
                        totalRevenue: typeof p.totalRevenue === "number" ? p.totalRevenue : 0,
                    })),
                );

                setRatingStats({
                    averageRating: typeof ratings.averageRating === "number" ? ratings.averageRating : 0,
                    totalRatings: typeof ratings.totalRatings === "number" ? ratings.totalRatings : 0,
                });
            } catch (error) {
                console.error("Failed to load merchant reports:", error);
                toast.error("Failed to load reports.");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [user?.id, dateQuery]);

    const handleExport = async () => {
        if (!user?.id) {
            toast.error("Please sign in.");
            return;
        }

        if (!dateQuery.startDate || !dateQuery.endDate) {
            toast.error("Please pick a finite date range to export.");
            return;
        }

        try {
            const { blob, filename } = await dashboardApi.downloadMerchantPdfReport(user.id, {
                startDate: dateQuery.startDate,
                endDate: dateQuery.endDate,
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export report failed:", error);
            toast.error("Export failed.");
        }
    };

    const restaurantsCount = revenueAnalytics?.revenueByRestaurant?.length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Summary</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {restaurantOverview?.restaurantName
                            ? `Analytics for ${restaurantOverview.restaurantName}`
                            : "Merchant analytics"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
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

                    <button
                        onClick={handleExport}
                        disabled={loading || !dateQuery.startDate || !dateQuery.endDate}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                        <Download className="h-5 w-5" />
                        Export Report
                    </button>
                </div>
            </div>

            {!loading && !restaurantOverview && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-900 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-200">
                    <div className="flex items-start gap-3">
                        <Store className="mt-0.5" size={18} />
                        <div className="flex-1">
                            <p className="font-semibold">Restaurant setup required</p>
                            <p className="mt-1 text-sm opacity-90">
                                Create your restaurant profile to unlock reports and analytics.
                            </p>
                            <div className="mt-4">
                                <Link
                                    href="/merchant/manage/settings"
                                    className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-orange/90"
                                >
                                    Create restaurant profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatCurrency(revenueAnalytics?.totalRevenue || 0)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Avg order: {formatCurrency(Math.round(revenueAnalytics?.averageOrderValue || 0))}
                            </p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatNumber(revenueAnalytics?.totalOrders || 0)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">From selected range</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                            <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Number of Restaurants</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{restaurantsCount}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">With orders in range</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                            <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ratings</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {(ratingStats?.averageRating || 0).toFixed(1)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                {formatNumber(ratingStats?.totalRatings || 0)} ratings
                            </p>
                        </div>
                        <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                            <Star className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueTrend}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                formatter={(value: unknown, name: string) => {
                                    if (name === "revenue") return [formatCurrency(Number(value || 0)), "Revenue"];
                                    if (name === "orders") return [formatNumber(Number(value || 0)), "Orders"];
                                    return [String(value), name];
                                }}
                                contentStyle={{
                                    backgroundColor: "#1F2937",
                                    border: "1px solid #374151",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#F59E0B"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                name="Revenue ($)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Hourly Orders */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Orders by hour</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={hourlyStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="hour" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                formatter={(value: unknown, name: string) => {
                                    if (name === "revenue") return [formatCurrency(Number(value || 0)), "Revenue"];
                                    if (name === "orders") return [formatNumber(Number(value || 0)), "Orders"];
                                    return [String(value), name];
                                }}
                                contentStyle={{
                                    backgroundColor: "#1F2937",
                                    border: "1px solid #374151",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Legend />
                            <Bar dataKey="orders" fill="#3B82F6" name="Orders" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by restaurant */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue by restaurant</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueAnalytics?.revenueByRestaurant || []} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9CA3AF" />
                            <YAxis dataKey="restaurantName" type="category" stroke="#9CA3AF" width={120} />
                            <Tooltip
                                formatter={(value: unknown, name: string) => {
                                    if (name === "totalRevenue") return [formatCurrency(Number(value || 0)), "Revenue"];
                                    if (name === "totalOrders") return [formatNumber(Number(value || 0)), "Orders"];
                                    return [String(value), name];
                                }}
                                contentStyle={{
                                    backgroundColor: "#1F2937",
                                    border: "1px solid #374151",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Legend />
                            <Bar dataKey="totalRevenue" fill="#F59E0B" name="Revenue ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Weekday trend */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekday activity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weekdayStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                formatter={(value: unknown, name: string) => {
                                    if (name === "revenue") return [formatCurrency(Number(value || 0)), "Revenue"];
                                    if (name === "orders") return [formatNumber(Number(value || 0)), "Orders"];
                                    return [String(value), name];
                                }}
                                contentStyle={{
                                    backgroundColor: "#1F2937",
                                    border: "1px solid #374151",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} name="Orders" />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                name="Revenue ($)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    {timeSummary && (
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            Peak hour:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                                {timeSummary.peakHour.hour}:00
                            </span>
                            {" · "}
                            Busiest day:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                                {timeSummary.busiestDay.dayName}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Top 5 Best Selling Products
                </h3>
                {loading ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
                ) : topProducts.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No data.</div>
                ) : (
                    <div className="space-y-4">
                        {topProducts.map((p, index) => (
                            <div
                                key={p.productId || `${p.productName}-${index}`}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange font-bold text-lg">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{p.productName}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {p.totalQuantity} items • {p.orderCount} orders
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                                        {formatCurrency(p.totalRevenue)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatCurrency(
                                            p.orderCount > 0 ? Math.round(p.totalRevenue / p.orderCount) : 0,
                                        )}
                                        {" / order"}
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
