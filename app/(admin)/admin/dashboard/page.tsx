"use client";

import { authApi } from "@/lib/api/authApi";
import { User } from "@/types";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { orderApi } from "@/lib/api/orderApi";
import { Order, OrderStatus } from "@/types/order.type";
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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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

type GrowthPoint = { name: string; users: number; merchants: number; restaurants: number };
type RevenuePoint = { name: string; revenue: number };
type TopMerchantPoint = { name: string; restaurants: number; revenue: number };

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalMerchants: 0,
        pendingMerchants: 0,
        totalRestaurants: 0,
        activeRestaurants: 0,
        totalRevenue: 0,
        totalOrders: 0,
    });
    const [pendingMerchantRequests, setPendingMerchantRequests] = useState<User[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [platformGrowthData, setPlatformGrowthData] = useState<GrowthPoint[]>([]);
    const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
    const [topMerchantsData, setTopMerchantsData] = useState<TopMerchantPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Users
            const usersPage = await authApi.getAllUsers({ page: 0, size: 1000 });
            const users = Array.isArray(usersPage?.content) ? usersPage.content : [];

            const totalUsers = users.filter((u) => u.role === "USER").length;
            const totalMerchants = users.filter((u) => u.role === "MERCHANT" && u.enabled).length;

            // Pending merchants (approval queue)
            const pendingPage = await authApi.getMerchantsPendingConsideration({ page: 0, size: 5 });
            const pendingList = Array.isArray(pendingPage?.content) ? pendingPage.content : [];
            const pendingCount =
                typeof pendingPage?.totalElements === "number" ? pendingPage.totalElements : pendingList.length;
            setPendingMerchantRequests(pendingList);

            // Restaurants
            const restaurantsResponse = await restaurantApi.getAllRestaurants(new URLSearchParams());
            const restaurants = Array.isArray(restaurantsResponse.data) ? restaurantsResponse.data : [];
            const totalRestaurants = restaurants.length;
            const activeRestaurants = restaurants.filter((r) => r.enabled).length;

            const restaurantIdToMerchantId = new Map<string, string>();
            const restaurantCountByMerchantId = new Map<string, number>();
            for (const r of restaurants) {
                restaurantIdToMerchantId.set(r.id, r.merchantId);
                restaurantCountByMerchantId.set(r.merchantId, (restaurantCountByMerchantId.get(r.merchantId) || 0) + 1);
            }

            // Orders: totals
            const totalsResult = await orderApi.getAllOrders({ page: 1, limit: 1 });
            const totalOrders = totalsResult.pagination?.total || 0;

            // Orders: recent activity
            const recentResult = await orderApi.getAllOrders({ page: 1, limit: 5 });
            setRecentOrders(recentResult.orders);

            // Orders: revenue + charts (completed orders)
            const completedOrders: Order[] = [];
            let page = 1;
            const limit = 100;
            const maxPages = 20;
            while (page <= maxPages) {
                const result = await orderApi.getAllOrders({ page, limit, status: OrderStatus.COMPLETED });
                completedOrders.push(...result.orders);
                if (!result.pagination || page >= (result.pagination.totalPages || 1)) break;
                page += 1;
            }

            const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);

            // Last 12 months helper
            const now = new Date();
            const months = Array.from({ length: 12 }, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                const label = `${d.toLocaleString("en-US", { month: "short" })} ${String(d.getFullYear()).slice(-2)}`;
                return { key, label, start: d };
            });

            const userCountByMonth = new Map<string, number>();
            const merchantCountByMonth = new Map<string, number>();
            for (const u of users) {
                if (!u.createdAt) continue;
                const d = new Date(u.createdAt);
                if (Number.isNaN(d.getTime())) continue;
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                if (u.role === "USER") userCountByMonth.set(key, (userCountByMonth.get(key) || 0) + 1);
                if (u.role === "MERCHANT") merchantCountByMonth.set(key, (merchantCountByMonth.get(key) || 0) + 1);
            }

            const restaurantCountByMonth = new Map<string, number>();
            for (const r of restaurants) {
                if (!r.createdAt) continue;
                const d = new Date(r.createdAt);
                if (Number.isNaN(d.getTime())) continue;
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                restaurantCountByMonth.set(key, (restaurantCountByMonth.get(key) || 0) + 1);
            }

            setPlatformGrowthData(
                months.map((m) => ({
                    name: m.label,
                    users: userCountByMonth.get(m.key) || 0,
                    merchants: merchantCountByMonth.get(m.key) || 0,
                    restaurants: restaurantCountByMonth.get(m.key) || 0,
                }))
            );

            const revenueByMonth = new Map<string, number>();
            const revenueByMerchantId = new Map<string, number>();
            for (const o of completedOrders) {
                const d = new Date(o.createdAt);
                if (!Number.isNaN(d.getTime())) {
                    const key = `${d.getFullYear()}-${d.getMonth()}`;
                    revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + (o.finalAmount || 0));
                }

                const merchantId =
                    o.merchantId || (o.restaurantId ? restaurantIdToMerchantId.get(o.restaurantId) : undefined);
                if (merchantId) {
                    revenueByMerchantId.set(
                        merchantId,
                        (revenueByMerchantId.get(merchantId) || 0) + (o.finalAmount || 0)
                    );
                }
            }

            setRevenueData(
                months.map((m) => ({
                    name: m.label,
                    revenue: revenueByMonth.get(m.key) || 0,
                }))
            );

            const merchantNameById = new Map<string, string>();
            for (const u of users) {
                if (u.role === "MERCHANT") merchantNameById.set(u.id, u.username);
            }

            const top = Array.from(revenueByMerchantId.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([merchantId, revenue]) => ({
                    name: merchantNameById.get(merchantId) || merchantId,
                    restaurants: restaurantCountByMerchantId.get(merchantId) || 0,
                    revenue,
                }));

            setTopMerchantsData(top);

            setStats({
                totalUsers,
                totalMerchants,
                pendingMerchants: pendingCount,
                totalRestaurants,
                activeRestaurants,
                totalRevenue,
                totalOrders,
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">System overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total users"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Users}
                    trend={undefined}
                    trendUp={undefined}
                    color="bg-blue-500"
                />
                <StatsCard
                    title="Total merchants"
                    value={stats.totalMerchants}
                    icon={Store}
                    trend={undefined}
                    trendUp={undefined}
                    color="bg-purple-500"
                />
                <StatsCard
                    title="Active restaurants"
                    value={`${stats.activeRestaurants}/${stats.totalRestaurants}`}
                    icon={Utensils}
                    color="bg-green-500"
                />
                <StatsCard
                    title="Total revenue"
                    value={`${stats.totalRevenue.toLocaleString()}₫`}
                    icon={DollarSign}
                    trend={undefined}
                    trendUp={undefined}
                    color="bg-yellow-500"
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Growth Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Platform growth (new per month)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={platformGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1F2937",
                                    border: "1px solid #374151",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} name="Users" />
                            <Line
                                type="monotone"
                                dataKey="merchants"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                name="Merchants"
                            />
                            <Line
                                type="monotone"
                                dataKey="restaurants"
                                stroke="#10B981"
                                strokeWidth={2}
                                name="Restaurants"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Trend */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Revenue (completed orders)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData}>
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
                                contentStyle={{
                                    backgroundColor: "#1F2937",
                                    border: "1px solid #374151",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#F59E0B"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                name="Revenue (₫)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Merchants Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top merchants by revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topMerchantsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9CA3AF" />
                        <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1F2937",
                                border: "1px solid #374151",
                                borderRadius: "0.5rem",
                            }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#F59E0B" name="Revenue (₫)" />
                        <Bar dataKey="restaurants" fill="#3B82F6" name="Restaurants" />
                    </BarChart>
                </ResponsiveContainer>
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
                                        {o.finalAmount.toLocaleString()}₫
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
