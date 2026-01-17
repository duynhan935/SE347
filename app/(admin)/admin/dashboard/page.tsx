"use client";

import { dashboardApi, buildDateRangeQuery, type DashboardDateRangePreset } from "@/lib/api/dashboardApi";
import { orderApi } from "@/lib/api/orderApi";
import type { Order } from "@/types/order.type";
import {
    DollarSign,
    ShoppingCart,
    Store,
    Users,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    CreditCard,
    Percent,
    BarChart3,
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
        []
    );
    const [revenueByMerchant, setRevenueByMerchant] = useState<
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

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const [overview, revenue, orderStats, merchants, revenueByMerch] = await Promise.all([
                    dashboardApi.getAdminOverview(dateQuery),
                    dashboardApi.getAdminRevenueAnalytics(dateQuery),
                    dashboardApi.getAdminOrderStatistics(dateQuery),
                    dashboardApi.getAdminMerchantsPerformance({ limit: 10, ...dateQuery }),
                    dashboardApi.getAdminRevenueByMerchant({ limit: 10, ...dateQuery }),
                ]);

                setStats(overview);
                setRevenueBreakdown(revenue);

                setStatusBreakdown(Array.isArray(orderStats?.statusBreakdown) ? orderStats.statusBreakdown : []);
                setPaymentBreakdown(Array.isArray(orderStats?.paymentBreakdown) ? orderStats.paymentBreakdown : []);

                setMerchantPerformance(Array.isArray(merchants) ? merchants : []);
                setRevenueByMerchant(Array.isArray(revenueByMerch) ? revenueByMerch : []);

                // Recent orders
                const recent = await orderApi.getAllOrders({ page: 1, limit: 5 });
                setRecentOrders(Array.isArray(recent.orders) ? recent.orders : []);
            } catch (error) {
                console.error("Failed to load admin dashboard:", error);
                toast.error("Không thể tải dữ liệu dashboard.");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [dateQuery]);

    const cards = useMemo(() => {
        return [
            {
                title: "Tổng doanh thu",
                value: stats ? `${formatVnd(stats.totalRevenue)}₫` : `0₫`,
                icon: DollarSign,
                bgColor: "bg-meta-3/10",
                iconColor: "text-meta-3",
                trend: 12.5,
                trendLabel: "so với tháng trước",
            },
            {
                title: "Tổng đơn hàng",
                value: stats?.totalOrders ?? 0,
                icon: ShoppingCart,
                bgColor: "bg-primary/10",
                iconColor: "text-primary",
                trend: 8.2,
                trendLabel: "so với tháng trước",
            },
            {
                title: "Người dùng",
                value: stats?.activeUsers ?? 0,
                icon: Users,
                bgColor: "bg-meta-6/10",
                iconColor: "text-meta-6",
                trend: 3.7,
                trendLabel: "người dùng mới",
            },
            {
                title: "Nhà hàng",
                value: `${stats?.activeRestaurants ?? 0}/${stats?.totalRestaurants ?? 0}`,
                icon: Store,
                bgColor: "bg-warning/10",
                iconColor: "text-warning",
                trend: undefined,
                trendLabel: "đang hoạt động",
            },
            {
                title: "Giá trị TB/Đơn",
                value: stats ? `${formatVnd(stats.averageOrderValue)}₫` : `0₫`,
                icon: BarChart3,
                bgColor: "bg-meta-5/10",
                iconColor: "text-meta-5",
            },
            {
                title: "Tỷ lệ hoàn thành",
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
                    <h1 className="text-title-md2 font-semibold text-black dark:text-white">Dashboard Admin</h1>
                    <p className="text-sm font-medium text-black/60 dark:text-white/60 mt-1">
                        Tổng quan hệ thống giao đồ ăn
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={rangePreset}
                        onChange={(e) => setRangePreset(e.target.value as DashboardDateRangePreset)}
                        className="relative z-20 inline-flex appearance-none bg-transparent py-2 pl-3 pr-8 text-sm font-medium outline-none border border-stroke dark:border-strokedark rounded-lg dark:bg-meta-4"
                    >
                        <option value="7d">7 ngày qua</option>
                        <option value="30d">30 ngày qua</option>
                        <option value="90d">90 ngày qua</option>
                        <option value="ytd">Năm nay</option>
                        <option value="all">Tất cả</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards - TailAdmin Style */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
                {cards.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Revenue Breakdown */}
            <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 className="mb-5 text-xl font-semibold text-black dark:text-white">Phân tích doanh thu</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                                <DollarSign size={20} className="text-primary" />
                            </div>
                            <p className="text-sm font-medium text-bodydark">Tiền hàng</p>
                        </div>
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {formatVnd(revenueBreakdown?.totalProductAmount ?? 0)}₫
                        </p>
                    </div>
                    <div className="rounded-lg bg-meta-3/5 p-4 border border-meta-3/20">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-3/20">
                                <ShoppingCart size={20} className="text-meta-3" />
                            </div>
                            <p className="text-sm font-medium text-bodydark">Phí giao hàng</p>
                        </div>
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {formatVnd(revenueBreakdown?.totalDeliveryFee ?? 0)}₫
                        </p>
                    </div>
                    <div className="rounded-lg bg-warning/5 p-4 border border-warning/20">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
                                <Percent size={20} className="text-warning" />
                            </div>
                            <p className="text-sm font-medium text-bodydark">Thuế</p>
                        </div>
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {formatVnd(revenueBreakdown?.totalTax ?? 0)}₫
                        </p>
                    </div>
                    <div className="rounded-lg bg-meta-1/5 p-4 border border-meta-1/20">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-1/20">
                                <TrendingDown size={20} className="text-meta-1" />
                            </div>
                            <p className="text-sm font-medium text-bodydark">Giảm giá</p>
                        </div>
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {formatVnd(revenueBreakdown?.totalDiscount ?? 0)}₫
                        </p>
                    </div>
                </div>
            </div>

            {/* Order & Payment Status */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
                {/* Order Status */}
                <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                        <h3 className="font-semibold text-black dark:text-white">Trạng thái đơn hàng</h3>
                    </div>
                    <div className="p-6">
                        {statusBreakdown.length === 0 ? (
                            <p className="text-sm text-bodydark">Chưa có dữ liệu.</p>
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
                                                    <p className="text-xs text-bodydark">{item.count} đơn</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-black dark:text-white">
                                                {formatVnd(item.amount)}₫
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
                        <h3 className="font-semibold text-black dark:text-white">Trạng thái thanh toán</h3>
                    </div>
                    <div className="p-6">
                        {paymentBreakdown.length === 0 ? (
                            <p className="text-sm text-bodydark">Chưa có dữ liệu.</p>
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
                                                        {item.name || "Unknown"}
                                                    </p>
                                                    <p className="text-xs text-bodydark">{item.count} giao dịch</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-black dark:text-white">
                                                {formatVnd(item.amount)}₫
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
                        <h3 className="font-semibold text-black dark:text-white">Top nhà hàng</h3>
                    </div>
                    <div className="p-6">
                        {merchantPerformance.length === 0 ? (
                            <p className="text-sm text-bodydark">Chưa có dữ liệu.</p>
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
                                                    {merchant.orders} đơn • {safeToFixed(merchant.completionRate)}% hoàn
                                                    thành
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-meta-3">{formatVnd(merchant.revenue)}₫</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6 py-4 dark:border-strokedark flex items-center justify-between">
                        <h3 className="font-semibold text-black dark:text-white">Đơn hàng gần đây</h3>
                        <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <p className="text-sm text-bodydark">Đang tải...</p>
                        ) : recentOrders.length === 0 ? (
                            <p className="text-sm text-bodydark">Chưa có đơn hàng.</p>
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
                                                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-black dark:text-white mb-1">
                                                    {formatVnd(order.finalAmount || 0)}₫
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

            {/* Quick Stats */}
            <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Thống kê nhanh</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-meta-3/10">
                            <Store className="text-meta-3" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-bodydark">Merchants đang chờ</p>
                            <p className="text-xl font-bold text-black dark:text-white">
                                {stats?.pendingMerchants ?? 0}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Users className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-bodydark">Merchants hoạt động</p>
                            <p className="text-xl font-bold text-black dark:text-white">
                                {stats?.activeMerchants ?? 0}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                            <CheckCircle2 className="text-warning" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-bodydark">Tỷ lệ hoàn thành</p>
                            <p className="text-xl font-bold text-black dark:text-white">
                                {stats ? `${safeToFixed(stats.completionRate)}%` : "0%"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-meta-6/10">
                            <BarChart3 className="text-meta-6" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-bodydark">AOV</p>
                            <p className="text-xl font-bold text-black dark:text-white">
                                {stats ? `${formatVnd(stats.averageOrderValue)}₫` : "0₫"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
