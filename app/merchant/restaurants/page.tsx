"use client";

import { Store, Plus, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function RestaurantsPage() {
	const [loading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nhà Hàng Của Tôi</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						Quản lý tất cả nhà hàng của bạn
					</p>
				</div>
				<Link
					href="/merchant/restaurants/create"
					className="flex items-center gap-2 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors"
				>
					<Plus className="h-5 w-5" />
					Thêm Nhà Hàng
				</Link>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Tổng Nhà Hàng</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Đang Hoạt Động</p>
					<p className="text-2xl font-bold text-green-600 mt-1">0</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Tạm Dừng</p>
					<p className="text-2xl font-bold text-red-600 mt-1">0</p>
				</div>
			</div>

			{/* Search */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
				<div className="relative">
					<Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						placeholder="Tìm kiếm nhà hàng..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
					/>
				</div>
			</div>

			{/* Restaurants Grid */}
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 size={40} className="animate-spin text-brand-yellow" />
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Empty State */}
					<div className="col-span-full">
						<div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
							<Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
								Chưa có nhà hàng nào
							</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								Bắt đầu bằng cách tạo nhà hàng đầu tiên của bạn
							</p>
							<Link
								href="/merchant/restaurants/create"
								className="inline-flex items-center gap-2 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors"
							>
								<Plus className="h-5 w-5" />
								Tạo Nhà Hàng Đầu Tiên
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
