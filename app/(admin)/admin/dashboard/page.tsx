"use client";

import { authApi } from "@/lib/api/authApi";
import { User } from "@/types";
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

// Mock data for charts
const platformGrowthData = [
    { name: "T1", users: 850, merchants: 28, restaurants: 95 },
    { name: "T2", users: 920, merchants: 32, restaurants: 108 },
    { name: "T3", users: 1050, merchants: 35, restaurants: 125 },
    { name: "T4", users: 980, merchants: 33, restaurants: 118 },
    { name: "T5", users: 1180, merchants: 38, restaurants: 135 },
    { name: "T6", users: 1350, merchants: 42, restaurants: 148 },
    { name: "T7", users: 1520, merchants: 45, restaurants: 156 },
    { name: "T8", users: 1420, merchants: 43, restaurants: 152 },
    { name: "T9", users: 1580, merchants: 47, restaurants: 168 },
    { name: "T10", users: 1720, merchants: 52, restaurants: 185 },
    { name: "T11", users: 1850, merchants: 56, restaurants: 198 },
    { name: "T12", users: 2100, merchants: 62, restaurants: 215 },
];

const revenueData = [
    { name: "T1", revenue: 285000000 },
    { name: "T2", revenue: 320000000 },
    { name: "T3", revenue: 398000000 },
    { name: "T4", revenue: 365000000 },
    { name: "T5", revenue: 445000000 },
    { name: "T6", revenue: 520000000 },
    { name: "T7", revenue: 585000000 },
    { name: "T8", revenue: 542000000 },
    { name: "T9", revenue: 615000000 },
    { name: "T10", revenue: 680000000 },
    { name: "T11", revenue: 725000000 },
    { name: "T12", revenue: 820000000 },
];

const topMerchantsData = [
    { name: "Merchant A", restaurants: 12, revenue: 185000000 },
    { name: "Merchant B", restaurants: 9, revenue: 152000000 },
    { name: "Merchant C", restaurants: 8, revenue: 128000000 },
    { name: "Merchant D", restaurants: 6, revenue: 95000000 },
    { name: "Merchant E", restaurants: 5, revenue: 78000000 },
];

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch all users
            const response = await authApi.getAllUsers();
            const users = response?.content || [];

            // Calculate stats
            const totalUsers = users.filter((u) => u.role === "USER").length;
            const totalMerchants = users.filter((u) => u.role === "MERCHANT" && u.enabled).length;
            const pendingMerchants = users.filter((u) => u.role === "MERCHANT" && !u.enabled);

            setStats({
                totalUsers,
                totalMerchants,
                pendingMerchants: pendingMerchants.length,
                totalRestaurants: 156, // TODO: Fetch from restaurant API
                activeRestaurants: 142, // TODO: Fetch from restaurant API
                totalRevenue: 125000, // TODO: Fetch from order API
                totalOrders: 3456, // TODO: Fetch from order API
            });

            // Set pending merchant requests (latest 5)
            setPendingMerchantRequests(pendingMerchants.slice(0, 5));
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast.error("Không thể tải dữ liệu dashboard");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Tổng quan hệ thống quản lý nhà hàng</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Users}
                    trend="12% so với tháng trước"
                    trendUp={true}
                    color="bg-blue-500"
                />
                <StatsCard
                    title="Tổng Merchants"
                    value={stats.totalMerchants}
                    icon={Store}
                    trend="5% so với tháng trước"
                    trendUp={true}
                    color="bg-purple-500"
                />
                <StatsCard
                    title="Nhà hàng hoạt động"
                    value={`${stats.activeRestaurants}/${stats.totalRestaurants}`}
                    icon={Utensils}
                    color="bg-green-500"
                />
                <StatsCard
                    title="Tổng doanh thu"
                    value={`${(stats.totalRevenue / 1000).toFixed(0)}K`}
                    icon={DollarSign}
                    trend="18% so với tháng trước"
                    trendUp={true}
                    color="bg-yellow-500"
                />
            </div>

            {/* Quick Actions & Pending Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Merchants */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Merchants chờ duyệt</h3>
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                            {stats.pendingMerchants}
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Có {stats.pendingMerchants} merchant đang chờ phê duyệt
                    </p>

                    {/* List of pending requests */}
                    {loading ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Đang tải...</div>
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
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Không có yêu cầu nào</div>
                    )}

                    <Link
                        href="/admin/merchant-requests"
                        className="inline-flex items-center gap-2 text-brand-yellow hover:text-brand-yellow/80 font-medium"
                    >
                        Xem danh sách <AlertCircle size={16} />
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thao tác nhanh</h3>
                    <div className="space-y-3">
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Users className="text-blue-500" size={20} />
                            <span className="text-gray-700 dark:text-gray-300">Quản lý Users</span>
                        </Link>
                        <Link
                            href="/admin/merchants"
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Store className="text-purple-500" size={20} />
                            <span className="text-gray-700 dark:text-gray-300">Quản lý Merchants</span>
                        </Link>
                        <Link
                            href="/admin/restaurants"
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Utensils className="text-green-500" size={20} />
                            <span className="text-gray-700 dark:text-gray-300">Quản lý Nhà hàng</span>
                        </Link>
                        <Link
                            href="/admin/categories"
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ShoppingCart className="text-orange-500" size={20} />
                            <span className="text-gray-700 dark:text-gray-300">Quản lý Categories</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Growth Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tăng Trưởng Platform</h3>
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
                        Tổng Doanh Thu Platform
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
                                name="Doanh Thu (₫)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Merchants Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Top 5 Merchants Theo Doanh Thu
                </h3>
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
                        <Bar dataKey="revenue" fill="#F59E0B" name="Doanh Thu (₫)" />
                        <Bar dataKey="restaurants" fill="#3B82F6" name="Số Nhà Hàng" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hoạt động gần đây</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <UserCheck className="text-green-600 dark:text-green-400" size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Merchant mới được phê duyệt
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">2 giờ trước</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Utensils className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Nhà hàng mới được đăng ký
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">5 giờ trước</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                            <TrendingUp className="text-yellow-600 dark:text-yellow-400" size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Doanh thu tăng 18%</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">1 ngày trước</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
