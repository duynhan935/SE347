"use client";

import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Download } from "lucide-react";
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
} from "recharts";

const revenueData = [
    { name: "T1", revenue: 12000000, orders: 45 },
    { name: "T2", revenue: 15000000, orders: 52 },
    { name: "T3", revenue: 18000000, orders: 61 },
    { name: "T4", revenue: 14000000, orders: 48 },
    { name: "T5", revenue: 22000000, orders: 73 },
    { name: "T6", revenue: 25000000, orders: 85 },
    { name: "T7", revenue: 28000000, orders: 92 },
    { name: "T8", revenue: 24000000, orders: 78 },
    { name: "T9", revenue: 26000000, orders: 83 },
    { name: "T10", revenue: 29000000, orders: 95 },
    { name: "T11", revenue: 31000000, orders: 102 },
    { name: "T12", revenue: 35000000, orders: 115 },
];

const categoryData = [
    { name: "Món Chính", value: 45, color: "#3B82F6" },
    { name: "Khai Vị", value: 20, color: "#10B981" },
    { name: "Tráng Miệng", value: 15, color: "#F59E0B" },
    { name: "Đồ Uống", value: 20, color: "#EF4444" },
];

const topProducts = [
    { name: "Phở Bò", sales: 1250, revenue: 62500000 },
    { name: "Bún Chả", sales: 980, revenue: 49000000 },
    { name: "Cơm Tấm", sales: 850, revenue: 38250000 },
    { name: "Bánh Mì", sales: 720, revenue: 21600000 },
    { name: "Gỏi Cuốn", sales: 650, revenue: 19500000 },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Báo Cáo</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Phân tích doanh thu và hiệu quả kinh doanh</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors">
                    <Download className="h-5 w-5" />
                    Xuất Báo Cáo
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Doanh Thu Tháng Này</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">35.000.000₫</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+12.5% vs tháng trước</p>
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
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">115</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+8.3% vs tháng trước</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                            <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Đơn Trung Bình</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">304.348₫</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+3.8% vs tháng trước</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tỷ Lệ Hoàn Thành</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">96.5%</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">+2.1% vs tháng trước</p>
                        </div>
                        <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Doanh Thu Theo Tháng</h3>
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
                                dataKey="revenue"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                name="Doanh Thu (₫)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Orders Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Đơn Hàng Theo Tháng</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
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
                            <Bar dataKey="orders" fill="#8B5CF6" name="Số Đơn Hàng" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
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

                {/* Top Products */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Top 5 Sản Phẩm Bán Chạy
                    </h3>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-purple/10 text-brand-purple font-semibold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{product.sales} đơn</p>
                                    </div>
                                </div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {product.revenue.toLocaleString()}₫
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
