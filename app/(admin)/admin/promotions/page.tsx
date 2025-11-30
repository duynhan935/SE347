"use client";

import { Percent, Plus, Search, Filter, Calendar, Tag } from "lucide-react";
import { useState } from "react";

export default function PromotionsPage() {
	const [searchTerm, setSearchTerm] = useState("");

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản Lý Khuyến Mãi</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						Tạo và quản lý các chương trình khuyến mãi
					</p>
				</div>
				<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
					<Plus className="h-5 w-5" />
					Tạo Khuyến Mãi
				</button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Đang Hoạt Động</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
						</div>
						<div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
							<Tag className="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Sắp Hết Hạn</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
						</div>
						<div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
							<Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Tổng Giảm Giá</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0₫</p>
						</div>
						<div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
							<Percent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Đã Sử Dụng</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
						</div>
						<div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
							<Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1 relative">
						<Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Tìm kiếm khuyến mãi..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors">
						<Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
						<span className="text-gray-900 dark:text-white">Lọc</span>
					</button>
				</div>
			</div>

			{/* Promotions Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Mã Khuyến Mãi
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Loại
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Giảm Giá
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Thời Gian
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Trạng Thái
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Thao Tác
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
							<tr>
								<td colSpan={6} className="px-6 py-12 text-center">
									<Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
										Chưa có khuyến mãi nào
									</h3>
									<p className="text-gray-600 dark:text-gray-400 mb-4">
										Bắt đầu bằng cách tạo chương trình khuyến mãi đầu tiên
									</p>
									<button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
										<Plus className="h-5 w-5" />
										Tạo Khuyến Mãi Đầu Tiên
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
