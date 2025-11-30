"use client";

import { Package, AlertTriangle, XCircle, DollarSign, Search, Filter } from "lucide-react";

const stats = [
	{
		label: "Tổng Sản Phẩm",
		value: "0",
		icon: Package,
		color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
	},
	{
		label: "Sắp Hết Hàng",
		value: "0",
		icon: AlertTriangle,
		color: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
	},
	{
		label: "Hết Hàng",
		value: "0",
		icon: XCircle,
		color: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
	},
	{
		label: "Giá Trị Tồn Kho",
		value: "0₫",
		icon: DollarSign,
		color: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
	},
];

export default function InventoryPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản Lý Kho Hàng</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">Theo dõi tồn kho và nhập hàng</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{stats.map((stat, index) => {
					const Icon = stat.icon;
					return (
						<div
							key={index}
							className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
									<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
								</div>
								<div className={`p-3 rounded-lg ${stat.color}`}>
									<Icon className="h-6 w-6" />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
						<input
							type="text"
							placeholder="Tìm kiếm sản phẩm..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-purple focus:border-transparent"
						/>
					</div>
					<button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
						<Filter className="h-5 w-5" />
						Lọc
					</button>
					<button className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors">
						Nhập Hàng
					</button>
				</div>
			</div>

			{/* Empty State */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
				<div className="text-center">
					<Package className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						Chưa Có Sản Phẩm Trong Kho
					</h3>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						Bắt đầu thêm sản phẩm vào kho hàng để quản lý tồn kho
					</p>
					<button className="px-6 py-3 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg transition-colors">
						Thêm Sản Phẩm Đầu Tiên
					</button>
				</div>
			</div>
		</div>
	);
}
