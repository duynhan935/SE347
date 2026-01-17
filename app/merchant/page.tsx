"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { dashboardApi, buildDateRangeQuery, type DashboardDateRangePreset } from "@/lib/api/dashboardApi";
import { orderApi } from "@/lib/api/orderApi";
import type { Order } from "@/types/order.type";
import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    Clock,
    DollarSign,
    Plus,
    ShoppingCart,
    Star,
    Store,
    Truck,
    Users,
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

export default function MerchantDashboard() {
    const { user } = useAuthStore();

    const [rangePreset, setRangePreset] = useState<DashboardDateRangePreset>("30d");
    const dateQuery = useMemo(() => buildDateRangeQuery(rangePreset), [rangePreset]);

    const [loading, setLoading] = useState(true);
    const [restaurantOverview, setRestaurantOverview] = useState<{
        restaurantId: string;
        restaurantName: string;
        restaurantSlug: string;
        restaurantEnabled: boolean;
        totalProducts: number;
        rating: number;
        totalReviews: number;
        address: string;
        imageURL?: string | null;
        openingTime?: string | null;
        closingTime?: string | null;
    } | null>(null);
    const [overview, setOverview] = useState<{
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        pendingOrders: number;
        confirmedOrders: number;
        preparingOrders: number;
        readyOrders: number;
        completedOrders: number;
        cancelledOrders: number;
    } | null>(null);
    const [topProducts, setTopProducts] = useState<
        Array<{ productId: string; productName: string; totalQuantity: number; totalRevenue: number }>
    >([]);
    const [ratingStats, setRatingStats] = useState<{ averageRating: number; totalRatings: number } | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (!user?.id) return;

        const run = async () => {
            setLoading(true);
            try {
                const merchantId = user.id;

                const [restaurant, ov, trend, statuses, top, ratings] = await Promise.all([
                    dashboardApi.getMerchantRestaurantOverview(merchantId),
                    dashboardApi.getMerchantOverview(merchantId, dateQuery),
                    dashboardApi.getMerchantRevenueTrend(merchantId, dateQuery),
                    dashboardApi.getMerchantOrderStatusBreakdown(merchantId, dateQuery),
                    dashboardApi.getMerchantTopProducts(merchantId, { limit: 10, ...dateQuery }),
                    dashboardApi.getMerchantRatingStats(merchantId, dateQuery),
                ]);

                setRestaurantOverview(restaurant);
                setOverview(ov);

                setTopProducts(
                    (Array.isArray(top) ? top : []).map((p) => ({
                        productId: String(p.productId),
                        productName: String(p.productName),
                        totalQuantity: typeof p.totalQuantity === "number" ? p.totalQuantity : 0,
                        totalRevenue: typeof p.totalRevenue === "number" ? p.totalRevenue : 0,
                    }))
                );

                setRatingStats({
                    averageRating: typeof ratings?.averageRating === "number" ? ratings.averageRating : 0,
                    totalRatings: typeof ratings?.totalRatings === "number" ? ratings.totalRatings : 0,
                });

                // Recent orders (uses existing order API, scoped by restaurant)
                if (restaurant?.restaurantId) {
                    const recent = await orderApi.getOrdersByRestaurant(restaurant.restaurantId, merchantId, {
                        page: 1,
                        limit: 5,
                    });
                    setRecentOrders(Array.isArray(recent.orders) ? recent.orders : []);
                } else {
                    setRecentOrders([]);
                }
            } catch (error) {
                console.error("Failed to load merchant dashboard:", error);
                toast.error("Failed to load merchant dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [user?.id, dateQuery]);

    const cards = useMemo(() => {
        const ov = overview;
        const restaurant = restaurantOverview;
        const totalOrders = ov?.totalOrders ?? 0;
        const cancelledOrders = ov?.cancelledOrders ?? 0;
        const cancellationRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : "0.0";

        return [
            {
                title: "Total products",
                value: restaurant?.totalProducts ?? 0,
                subtitle: "In your menu",
                icon: Store,
                bgColor: "bg-blue-500",
            },
            {
                title: "Total revenue",
                value: ov ? `${formatVnd(ov.totalRevenue)}₫` : `0₫`,
                subtitle: `Last ${
                    rangePreset === "7d" ? "7" : rangePreset === "30d" ? "30" : rangePreset === "90d" ? "90" : ""
                } days`,
                icon: DollarSign,
                bgColor: "bg-green-500",
            },
            {
                title: "Total orders",
                value: totalOrders,
                subtitle: `${ov?.pendingOrders ?? 0} pending`,
                icon: ShoppingCart,
                bgColor: "bg-indigo-500",
            },
            {
                title: "Pending/Processing",
                value: (ov?.pendingOrders ?? 0) + (ov?.confirmedOrders ?? 0) + (ov?.preparingOrders ?? 0),
                subtitle: "Need attention",
                icon: Clock,
                bgColor: "bg-orange-500",
            },
            {
                title: "Cancellation rate",
                value: `${cancellationRate}%`,
                subtitle: `${cancelledOrders} cancelled`,
                icon: AlertCircle,
                bgColor: "bg-red-500",
            },
            {
                title: "Avg rating",
                value: ratingStats ? ratingStats.averageRating.toFixed(1) : "0.0",
                subtitle: `${ratingStats?.totalRatings ?? 0} review(s)`,
                icon: Star,
                bgColor: "bg-purple-500",
            },
        ];
    }, [overview, restaurantOverview, ratingStats, rangePreset]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Merchant Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Hello, {user?.username || "Merchant"}! Welcome back.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
                    <Link
                        href="/merchant/food/new"
                        className="flex items-center gap-2 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add Food Item
                    </Link>
                </div>
            </div>
            {/* Restaurant Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                {loading && !restaurantOverview ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Loading restaurant info...</div>
                ) : restaurantOverview ? (
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                {restaurantOverview.imageURL ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={restaurantOverview.imageURL}
                                        alt={restaurantOverview.restaurantName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Store className="text-gray-500" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {restaurantOverview.restaurantName}
                                    </h2>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-medium border ${
                                            restaurantOverview.restaurantEnabled
                                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800"
                                                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700"
                                        }`}
                                    >
                                        {restaurantOverview.restaurantEnabled ? "Active" : "Disabled"}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {restaurantOverview.address}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="inline-flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        {restaurantOverview.rating.toFixed(1)} ({restaurantOverview.totalReviews}{" "}
                                        reviews)
                                    </span>
                                    {restaurantOverview.openingTime && restaurantOverview.closingTime && (
                                        <span className="inline-flex items-center gap-1">
                                            <Truck className="h-4 w-4" />
                                            {restaurantOverview.openingTime} - {restaurantOverview.closingTime}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/merchant/food"
                                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                            >
                                Manage menu
                            </Link>
                            {restaurantOverview.restaurantSlug && (
                                <Link
                                    href={`/restaurants/${encodeURIComponent(restaurantOverview.restaurantSlug)}`}
                                    className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors text-sm"
                                >
                                    View storefront
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        No restaurant found for this merchant yet.
                    </div>
                )}
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((stat, index) => {
                    const Icon = stat.icon as React.ElementType;
                    return (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{stat.subtitle}</p>
                                </div>
                                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Order Status Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Trạng thái đơn hàng</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Chờ xác nhận</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {overview?.pendingOrders ?? 0}
                        </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Đang chuẩn bị</p>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                            {overview?.preparingOrders ?? 0}
                        </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-600 dark:text-green-400 mb-1">Hoàn thành</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {overview?.completedOrders ?? 0}
                        </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400 mb-1">Đã hủy</p>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                            {overview?.cancelledOrders ?? 0}
                        </p>
                    </div>
                </div>
            </div>
            {/* Top products */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top products</h2>
                {topProducts.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No sales data yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                    <th className="py-2 pr-3">Product</th>
                                    <th className="py-2 pr-3">Quantity</th>
                                    <th className="py-2 pr-3">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((p) => (
                                    <tr
                                        key={p.productId}
                                        className="border-b border-gray-100 dark:border-gray-700/60 text-gray-900 dark:text-gray-100"
                                    >
                                        <td className="py-3 pr-3 font-medium">{p.productName}</td>
                                        <td className="py-3 pr-3">{p.totalQuantity.toLocaleString()}</td>
                                        <td className="py-3 pr-3">{formatVnd(p.totalRevenue)}₫</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/merchant/food"
                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Store className="h-8 w-8 text-brand-yellow" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Manage Food Items</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Add and manage menu</p>
                        </div>
                    </Link>
                    <Link
                        href="/merchant/manage/staff"
                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Users className="h-8 w-8 text-brand-yellow" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Manage Staff</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Add and manage staff</p>
                        </div>
                    </Link>
                    <Link
                        href="/merchant/reports"
                        className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <BarChart3 className="h-8 w-8 text-brand-yellow" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reports</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">View statistics and reports</p>
                        </div>
                    </Link>
                </div>
            </div>
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent orders</h2>
                {loading ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
                ) : recentOrders.length === 0 ? (
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
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                    {o.status === "completed" ? (
                                        <CheckCircle2 className="text-green-600 dark:text-green-300" size={20} />
                                    ) : (
                                        <Clock className="text-orange-600 dark:text-orange-300" size={20} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Order {o.orderId} • {o.status}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(o.createdAt).toLocaleString("vi-VN")} •{" "}
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
