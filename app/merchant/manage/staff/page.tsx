"use client";

import { Plus, Search, Loader2 } from "lucide-react";
import { useState } from "react";

export default function StaffManagementPage() {
	const [loading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản Lý Nhân Viên</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						Quản lý tài khoản nhân viên và phân quyền
					</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="flex items-center gap-2 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors"
				>
					<Plus className="h-5 w-5" />
					Thêm Nhân Viên
				</button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Tổng Nhân Viên</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Đang Hoạt Động</p>
					<p className="text-2xl font-bold text-green-600 mt-1">0</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Bị Khóa</p>
					<p className="text-2xl font-bold text-red-600 mt-1">0</p>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative">
						<Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Tìm kiếm nhân viên..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
						/>
					</div>
					<select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow">
						<option value="ALL">Tất cả vai trò</option>
						<option value="MANAGER">Manager</option>
						<option value="STAFF">Staff</option>
					</select>
				</div>
			</div>

			{/* Staff Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 size={40} className="animate-spin text-brand-yellow" />
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Họ Tên
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Email
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Vai Trò
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Trạng Thái
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Ngày Thêm
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Hành Động
									</th>
								</tr>
							</thead>
							<tbody className="divide-y dark:divide-gray-700">
								<tr>
									<td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
										Chưa có nhân viên nào
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Add Staff Modal */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
							Thêm Nhân Viên Mới
						</h2>
						<form className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Họ Tên
								</label>
								<input
									type="text"
									className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
									placeholder="Nhập họ tên"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Email
								</label>
								<input
									type="email"
									className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
									placeholder="Nhập email"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Vai Trò
								</label>
								<select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow">
									<option value="MANAGER">Manager</option>
									<option value="STAFF">Staff</option>
								</select>
							</div>
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
								>
									Hủy
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors"
								>
									Thêm
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
