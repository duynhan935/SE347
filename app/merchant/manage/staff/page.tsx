"use client";

import { Loader2, Plus, Search } from "lucide-react";
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
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						Manage staff accounts and permissions
					</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg transition-colors"
				>
					<Plus className="h-5 w-5" />
					Add Staff
				</button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Total Staff</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
					<p className="text-2xl font-bold text-green-600 mt-1">0</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Locked</p>
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
							placeholder="Search staff..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
						/>
					</div>
					<select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange">
						<option value="ALL">All Roles</option>
						<option value="MANAGER">Manager</option>
						<option value="STAFF">Staff</option>
					</select>
				</div>
			</div>

			{/* Staff Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 size={40} className="animate-spin text-brand-orange" />
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Full Name
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Email
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Role
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Added Date
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y dark:divide-gray-700">
								<tr>
									<td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
										No staff members yet
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
							Add New Staff
						</h2>
						<form className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Full Name
								</label>
								<input
									type="text"
									className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
									placeholder="Enter full name"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Email
								</label>
								<input
									type="email"
									className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
									placeholder="Enter email"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Role
								</label>
								<select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange">
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
									Cancel
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg transition-colors"
								>
									Add
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
