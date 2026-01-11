"use client";

import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Download, Store } from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
} from "recharts";

type PieLabelEntry = { name?: string; percent?: number };

const revenueData = [
    { name: "T1", revenue: 45000000, orders: 180, restaurants: 3 },
    { name: "T2", revenue: 52000000, orders: 210, restaurants: 3 },
    { name: "T3", revenue: 61000000, orders: 245, restaurants: 4 },
    { name: "T4", revenue: 58000000, orders: 230, restaurants: 4 },
    { name: "T5", revenue: 68000000, orders: 280, restaurants: 4 },
    { name: "T6", revenue: 75000000, orders: 310, restaurants: 5 },
    { name: "T7", revenue: 82000000, orders: 340, restaurants: 5 },
    { name: "T8", revenue: 79000000, orders: 325, restaurants: 5 },
    { name: "T9", revenue: 85000000, orders: 350, restaurants: 5 },
    { name: "T10", revenue: 92000000, orders: 380, restaurants: 6 },
    { name: "T11", revenue: 98000000, orders: 410, restaurants: 6 },
    { name: "T12", revenue: 105000000, orders: 450, restaurants: 6 },
];

const restaurantPerformance = [
    { name: "Nhà Hàng A", revenue: 35000000, orders: 150, rating: 4.8 },
    { name: "Nhà Hàng B", revenue: 28000000, orders: 120, rating: 4.6 },
    { name: "Nhà Hàng C", revenue: 22000000, orders: 95, rating: 4.5 },
    { name: "Nhà Hàng D", revenue: 15000000, orders: 65, rating: 4.3 },
    { name: "Nhà Hàng E", revenue: 12000000, orders: 55, rating: 4.2 },
];

const categoryData = [
    { name: "Món Chính", value: 40, color: "#3B82F6" },
    { name: "Khai Vị", value: 25, color: "#10B981" },
    { name: "Tráng Miệng", value: 20, color: "#F59E0B" },
    { name: "Đồ Uống", value: 15, color: "#EF4444" },
];

const topProducts = [
    { name: "Phở Bò", sales: 3250, revenue: 162500000, restaurants: 6 },
    { name: "Bún Chả", sales: 2580, revenue: 129000000, restaurants: 5 },
    { name: "Cơm Tấm", sales: 2150, revenue: 96750000, restaurants: 6 },
    { name: "Bánh Mì", sales: 1820, revenue: 54600000, restaurants: 4 },
    { name: "Gỏi Cuốn", sales: 1650, revenue: 49500000, restaurants: 5 },
];

export default function MerchantReportsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Báo Cáo Tổng Hợp</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Phân tích doanh thu toàn bộ hệ thống nhà hàng
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors">
                    <Download className="h-5 w-5" />
                    Xuất Báo Cáo
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng Doanh Thu</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">105.000.000₫</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+15.2% vs tháng trước</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng Đơn Hàng</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">450</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+12.5% vs tháng trước</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                            <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Số Nhà Hàng</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">6</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+1 nhà hàng mới</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                            <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tăng Trưởng</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">18.5%</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">So với quý trước</p>
                        </div>
                        <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Xu Hướng Doanh Thu</h3>
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
                            <Legend />
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

                {/* Orders Trend */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Tổng Đơn Hàng Theo Tháng
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
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
                            <Line
                                type="monotone"
                                dataKey="orders"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                name="Số Đơn Hàng"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Restaurant Performance */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hiệu Suất Nhà Hàng</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={restaurantPerformance} layout="vertical">
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
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Phân Bố Theo Danh Mục</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: PieLabelEntry) =>
                                    `${entry.name ?? ""}: ${((entry.percent ?? 0) * 100).toFixed(0)}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Top 5 Sản Phẩm Bán Chạy Nhất
                </h3>
                <div className="space-y-4">
                    {topProducts.map((product, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-yellow/10 text-brand-yellow font-bold text-lg">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {product.sales} đơn • {product.restaurants} nhà hàng
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white text-lg">
                                    {product.revenue.toLocaleString()}₫
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {Math.round(product.revenue / product.sales).toLocaleString()}₫/đơn
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
