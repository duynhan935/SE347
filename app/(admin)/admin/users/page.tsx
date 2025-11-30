"use client";

import { authApi } from "@/lib/api/authApi";
import { User } from "@/types";
import { Edit, Loader2, Search, Trash, Plus, Eye, Ban, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [filterRole, setFilterRole] = useState<string>("ALL");
	const [filterStatus, setFilterStatus] = useState<string>("ALL");

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const data = await authApi.getAllUsers();
			// Ensure data is an array
			setUsers(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch users:", error);
			toast.error("Không thể tải danh sách users");
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
		try {
			// TODO: Add API call to toggle user status
			toast.success(currentStatus ? "Đã vô hiệu hóa user" : "Đã kích hoạt user");
			fetchUsers();
		} catch (error) {
			toast.error("Không thể thay đổi trạng thái user");
		}
	};

	const handleDeleteUser = async (userId: string) => {
		if (!confirm("Bạn có chắc chắn muốn xóa user này?")) return;

		try {
			// TODO: Add API call to delete user
			toast.success("Đã xóa user");
			fetchUsers();
		} catch (error) {
			toast.error("Không thể xóa user");
		}
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = filterRole === "ALL" || user.role === filterRole;
		const matchesStatus = filterStatus === "ALL" || (filterStatus === "ACTIVE" ? user.enabled : !user.enabled);
		return matchesSearch && matchesRole && matchesStatus;
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Users</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý tất cả người dùng trong hệ thống</p>
				</div>
				<button className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-white rounded-lg hover:bg-brand-yellow/90 transition-colors">
					<Plus size={20} />
					Thêm User
				</button>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Search */}
					<div className="relative">
						<Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Tìm kiếm theo tên hoặc email..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
						/>
					</div>

					{/* Role Filter */}
					<select
						value={filterRole}
						onChange={(e) => setFilterRole(e.target.value)}
						className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
					>
						<option value="ALL">Tất cả vai trò</option>
						<option value="USER">User</option>
						<option value="MERCHANT">Merchant</option>
						<option value="MANAGER">Manager</option>
						<option value="ADMIN">Admin</option>
					</select>

					{/* Status Filter */}
					<select
						value={filterStatus}
						onChange={(e) => setFilterStatus(e.target.value)}
						className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
					>
						<option value="ALL">Tất cả trạng thái</option>
						<option value="ACTIVE">Hoạt động</option>
						<option value="INACTIVE">Vô hiệu hóa</option>
					</select>
				</div>
			</div>

			{/* Users Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center p-12">
						<Loader2 className="animate-spin text-brand-yellow" size={40} />
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										User
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Email
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Vai trò
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Trạng thái
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Số điện thoại
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Thao tác
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{filteredUsers.map((user) => (
									<tr
										key={user.id}
										className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-white font-semibold">
													{user.username.charAt(0).toUpperCase()}
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900 dark:text-white">
														{user.username}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
													user.role === "ADMIN"
														? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
														: user.role === "MERCHANT"
														? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
														: user.role === "MANAGER"
														? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
														: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
												}`}
											>
												{user.role}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
													user.enabled
														? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
														: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
												}`}
											>
												{user.enabled ? "Hoạt động" : "Vô hiệu hóa"}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
											{user.phone || "—"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex items-center justify-end gap-2">
												<button
													onClick={() => {}}
													className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
													title="Xem chi tiết"
												>
													<Eye size={18} />
												</button>
												<button
													onClick={() => {}}
													className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
													title="Chỉnh sửa"
												>
													<Edit size={18} />
												</button>
												<button
													onClick={() => handleToggleStatus(user.id, user.enabled)}
													className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
													title={user.enabled ? "Vô hiệu hóa" : "Kích hoạt"}
												>
													{user.enabled ? <Ban size={18} /> : <CheckCircle size={18} />}
												</button>
												<button
													onClick={() => handleDeleteUser(user.id)}
													className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
													title="Xóa"
												>
													<Trash size={18} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{filteredUsers.length === 0 && (
							<div className="text-center py-12 text-gray-500 dark:text-gray-400">Không tìm thấy user nào</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}