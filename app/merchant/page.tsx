"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { dashboardApi, buildDateRangeQuery, type DashboardDateRangePreset } from "@/lib/api/dashboardApi";
import { orderApi } from "@/lib/api/orderApi";
import type { Order } from "@/types/order.type";
import { useOrderWebSocket } from "@/lib/hooks/useOrderWebSocket";
import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    Clock,
    DollarSign,
    ShoppingCart,
    Star,
    Store,
    TrendingDown,
    TrendingUp,
    Truck,
    Users,
    Package,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import MerchantCharts from "@/components/dashboard/MerchantCharts";
import { formatCurrency, formatNumber } from "@/lib/utils/dashboardFormat";

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
                                className={`text-sm font-medium ${isPositive ? "text-meta-3" : isNegative ? "text-meta-1" : "text-meta-6"}`}
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
    const [ratingStats, setRatingStats] = useState<{
        averageRating: number;
        totalRatings: number;
        ratingDistribution: Record<"1" | "2" | "3" | "4" | "5", number> | Record<number, number>;
    } | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    const fetchOrders = useCallback(async () => {
        if (!user?.id || !restaurantOverview?.restaurantId) return;
        try {
            const recent = await orderApi.getOrdersByRestaurant(restaurantOverview.restaurantId, user.id, {
                page: 1,
                limit: 5,
            });
            setRecentOrders(Array.isArray(recent.orders) ? recent.orders : []);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    }, [user?.id, restaurantOverview?.restaurantId]);

    const handleOrderStatusUpdate = useCallback(
        (update: { orderId: string; status: string }) => {
            toast.success(`Order ${update.orderId} updated: ${update.status}`);
            fetchOrders();
        },
        [fetchOrders],
    );

    const { isConnected: wsConnected } = useOrderWebSocket({
        restaurantId: restaurantOverview?.restaurantId,
        onOrderStatusUpdate: handleOrderStatusUpdate,
    });

    useEffect(() => {
        if (!user?.id) return;

        const run = async () => {
            setLoading(true);
            try {
                const merchantId = user.id;

                let restaurant: Awaited<ReturnType<typeof dashboardApi.getMerchantRestaurantOverview>> | null = null;
                try {
                    restaurant = await dashboardApi.getMerchantRestaurantOverview(merchantId);
                    setRestaurantOverview(restaurant);
                } catch (error: unknown) {
                    const status =
                        error && typeof error === "object" && "response" in error
                            ? (error as { response?: { status?: number } }).response?.status
                            : undefined;

                    // Normal: merchant has no restaurant yet
                    if (status === 404) {
                        setRestaurantOverview(null);
                        setOverview(null);
                        setTopProducts([]);
                        setRatingStats(null);
                        setRecentOrders([]);
                        return;
                    }
                    throw error;
                }

                const [ov, top, ratings] = await Promise.all([
                    dashboardApi.getMerchantOverview(merchantId, dateQuery),
                    dashboardApi.getMerchantTopProducts(merchantId, { limit: 10, ...dateQuery }),
                    dashboardApi.getMerchantRatingStats(merchantId, dateQuery),
                ]);

                setOverview(ov);

                setTopProducts(
                    (Array.isArray(top) ? top : []).map((p) => ({
                        productId: String(p.productId),
                        productName: String(p.productName),
                        totalQuantity: typeof p.totalQuantity === "number" ? p.totalQuantity : 0,
                        totalRevenue: typeof p.totalRevenue === "number" ? p.totalRevenue : 0,
                    })),
                );

                setRatingStats({
                    averageRating: typeof ratings?.averageRating === "number" ? ratings.averageRating : 0,
                    totalRatings: typeof ratings?.totalRatings === "number" ? ratings.totalRatings : 0,
                    ratingDistribution:
                        typeof ratings?.ratingDistribution === "object" && ratings?.ratingDistribution
                            ? ratings.ratingDistribution
                            : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                });

                // Recent orders
                if (restaurant?.restaurantId) {
                    const recent = await orderApi.getOrdersByRestaurant(restaurant.restaurantId, merchantId, {
                        page: 1,
                        limit: 5,
                    });
                    setRecentOrders(Array.isArray(recent.orders) ? recent.orders : []);
                }
            } catch (error) {
                console.error("Failed to load merchant dashboard:", error);
                toast.error("Unable to load dashboard data.");
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

        return [
            {
                title: "Total Revenue",
                value: formatCurrency(ov?.totalRevenue ?? 0),
                icon: DollarSign,
                bgColor: "bg-meta-3/10",
                iconColor: "text-meta-3",
                trend: 11.01,
                trendLabel: "vs last month",
            },
            {
                title: "Total Orders",
                value: totalOrders,
                icon: ShoppingCart,
                bgColor: "bg-primary/10",
                iconColor: "text-primary",
                trend: 2.59,
                trendLabel: "vs last month",
            },
            {
                title: "Products",
                value: restaurant?.totalProducts ?? 0,
                icon: Package,
                bgColor: "bg-meta-6/10",
                iconColor: "text-meta-6",
            },
            {
                title: "Avg Rating",
                value: ratingStats ? ratingStats.averageRating.toFixed(1) : "0.0",
                icon: Star,
                bgColor: "bg-warning/10",
                iconColor: "text-warning",
                trend: undefined,
                trendLabel: `${formatNumber(ratingStats?.totalRatings ?? 0)} reviews`,
            },
        ];
    }, [overview, restaurantOverview, ratingStats]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Merchant Dashboard</h1>
                    <p className="text-sm font-medium text-gray-600 dark:text-white/60 mt-1">
                        {wsConnected && <span className="text-meta-3">● </span>}
                        Hello, {user?.username || "Merchant"}!
                    </p>
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
                    <Link
                        href="/merchant/food/new"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary py-2 px-4 text-sm font-medium text-white transition hover:bg-opacity-90"
                    >
                        <Store size={18} />
                        Add Menu Item
                    </Link>
                </div>
            </div>

            {!loading && !restaurantOverview && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-900 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-200">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5" size={18} />
                        <div className="flex-1">
                            <p className="font-semibold">Restaurant setup required</p>
                            <p className="mt-1 text-sm opacity-90">
                                Your account is approved, but you haven’t created a restaurant profile yet. Create one
                                to unlock dashboard stats, orders, and food management.
                            </p>
                            <div className="mt-4">
                                <Link
                                    href="/merchant/manage/settings"
                                    className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-orange/90"
                                >
                                    <Store size={16} />
                                    Create restaurant profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards - TailAdmin Style */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                {cards.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            <MerchantCharts
                orders={recentOrders.map((o) => ({
                    orderId: String(o.orderId ?? ""),
                    finalAmount: typeof o.finalAmount === "number" ? o.finalAmount : 0,
                    createdAt: String(o.createdAt ?? ""),
                    status: String(o.status ?? ""),
                }))}
                topProducts={topProducts.map((p) => ({
                    productName: String(p.productName ?? ""),
                    totalRevenue: typeof p.totalRevenue === "number" ? p.totalRevenue : 0,
                    totalQuantity: typeof p.totalQuantity === "number" ? p.totalQuantity : 0,
                }))}
                ratingDistribution={ratingStats?.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }}
            />

            {/* Restaurant Info & Order Status */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
                {/* Restaurant Overview */}
                <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Restaurant Info</h3>
                    {loading && !restaurantOverview ? (
                        <div className="text-sm text-bodydark">Loading...</div>
                    ) : restaurantOverview ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl bg-gray/30 dark:bg-meta-4 flex items-center justify-center overflow-hidden">
                                    {restaurantOverview.imageURL ? (
                                        <Image
                                            src={restaurantOverview.imageURL}
                                            alt={restaurantOverview.restaurantName}
                                            width={64}
                                            height={64}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Store className="text-bodydark" size={32} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-lg font-semibold text-black dark:text-white">
                                            {restaurantOverview.restaurantName}
                                        </h4>
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                restaurantOverview.restaurantEnabled
                                                    ? "bg-success/10 text-success"
                                                    : "bg-danger/10 text-danger"
                                            }`}
                                        >
                                            {restaurantOverview.restaurantEnabled ? "Active" : "Temporarily Closed"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-bodydark">{restaurantOverview.address}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Star size={16} className="text-warning fill-warning" />
                                    <span className="font-medium text-black dark:text-white">
                                        {restaurantOverview.rating.toFixed(1)}
                                    </span>
                                    <span className="text-bodydark">
                                        ({formatNumber(restaurantOverview.totalReviews)} reviews)
                                    </span>
                                </div>
                                {restaurantOverview.openingTime && restaurantOverview.closingTime && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} className="text-bodydark" />
                                        <span className="text-bodydark">
                                            {restaurantOverview.openingTime} - {restaurantOverview.closingTime}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Link
                                    href="/merchant/food"
                                    className="flex-1 text-center rounded-lg border border-stroke py-2 px-3 text-sm font-medium transition hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4"
                                >
                                    Manage Menu
                                </Link>
                                {restaurantOverview.restaurantSlug && (
                                    <Link
                                        href={`/restaurants/${encodeURIComponent(restaurantOverview.restaurantSlug)}`}
                                        className="flex-1 text-center rounded-lg bg-primary py-2 px-3 text-sm font-medium text-white transition hover:bg-opacity-90"
                                    >
                                        View Storefront
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-bodydark">No restaurant yet.</div>
                    )}
                </div>

                {/* Order Status */}
                <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Order Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-warning/10 p-4 text-center">
                            <Clock size={24} className="mx-auto mb-2 text-warning" />
                            <p className="text-sm font-medium text-bodydark mb-1">Pending Confirmation</p>
                            <p className="text-2xl font-bold text-black dark:text-white">
                                {overview?.pendingOrders ?? 0}
                            </p>
                        </div>
                        <div className="rounded-lg bg-primary/10 p-4 text-center">
                            <Truck size={24} className="mx-auto mb-2 text-primary" />
                            <p className="text-sm font-medium text-bodydark mb-1">In Progress</p>
                            <p className="text-2xl font-bold text-black dark:text-white">
                                {(overview?.confirmedOrders ?? 0) + (overview?.preparingOrders ?? 0)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-meta-3/10 p-4 text-center">
                            <CheckCircle2 size={24} className="mx-auto mb-2 text-meta-3" />
                            <p className="text-sm font-medium text-bodydark mb-1">Completed</p>
                            <p className="text-2xl font-bold text-black dark:text-white">
                                {overview?.completedOrders ?? 0}
                            </p>
                        </div>
                        <div className="rounded-lg bg-meta-1/10 p-4 text-center">
                            <AlertCircle size={24} className="mx-auto mb-2 text-meta-1" />
                            <p className="text-sm font-medium text-bodydark mb-1">Canceled</p>
                            <p className="text-2xl font-bold text-black dark:text-white">
                                {overview?.cancelledOrders ?? 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Products & Recent Orders */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
                {/* Top Products */}
                <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                        <h3 className="font-semibold text-black dark:text-white">Top Products</h3>
                    </div>
                    <div className="p-6">
                        {topProducts.length === 0 ? (
                            <p className="text-sm text-bodydark">No data yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {topProducts.slice(0, 5).map((product, index) => (
                                    <div
                                        key={product.productId}
                                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray dark:hover:bg-meta-4 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                #{index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium text-black dark:text-white">
                                                    {product.productName}
                                                </p>
                                                <p className="text-xs text-bodydark">
                                                    {formatNumber(product.totalQuantity)} sold
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-meta-3">
                                            {formatCurrency(product.totalRevenue)}
                                        </p>
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
                        <Link href="/merchant/orders" className="text-sm font-medium text-primary hover:underline">
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
                                                        {new Date(order.createdAt).toLocaleString("en-US")}
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

            {/* Quick Actions */}
            <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Link
                        href="/merchant/food"
                        className="flex items-center gap-4 rounded-lg border border-stroke p-4 transition hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Store className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-black dark:text-white">Manage Menu Items</p>
                            <p className="text-sm text-bodydark">Add and edit your menu</p>
                        </div>
                    </Link>
                    <Link
                        href="/merchant/manage/staff"
                        className="flex items-center gap-4 rounded-lg border border-stroke p-4 transition hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-meta-6/10">
                            <Users className="text-meta-6" size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-black dark:text-white">Manage Staff</p>
                            <p className="text-sm text-bodydark">Add and manage staff</p>
                        </div>
                    </Link>
                    <Link
                        href="/merchant/reports"
                        className="flex items-center gap-4 rounded-lg border border-stroke p-4 transition hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-meta-3/10">
                            <BarChart3 className="text-meta-3" size={24} />
                        </div>
                        <div>
                            <p className="font-semibold text-black dark:text-white">Reports</p>
                            <p className="text-sm text-bodydark">View detailed analytics</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
