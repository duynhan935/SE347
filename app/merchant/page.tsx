"use client";

import { Store, DollarSign, Users, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";

export default function MerchantDashboard() {
	const { user } = useAuthStore();

	const stats = [
		{
			title: "Tổng Nhà Hàng",
			value: "0",
			icon: Store,
			bgColor: "bg-blue-500",
			subtitle: "Đang hoạt động",
		},
		{
			title: "Tổng Doanh Thu",
			value: "0 VNĐ",
			icon: DollarSign,
			bgColor: "bg-green-500",
			subtitle: "Tất cả nhà hàng",
		},
		{
			title: "Tổng Nhân Viên",
			value: "0",
			icon: Users,
			bgColor: "bg-orange-500",
			subtitle: "Tất cả vị trí",
		},
		{
			title: "Tăng Trưởng",
			value: "0%",
			icon: TrendingUp,
			bgColor: "bg-purple-500",
			subtitle: "So với tháng trước",
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Merchant Dashboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						Xin chào, {user?.username || "Merchant"}! Chào mừng trở lại.
					</p>
				</div>
				<Link
					href="/merchant/restaurants/create"
					className="flex items-center gap-2 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors"
				>
					<Plus className="h-5 w-5" />
					Tạo Nhà Hàng Mới
				</Link>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{stats.map((stat, index) => {
					const Icon = stat.icon;
					return (
						<div
							key={index}
							className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
									<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
										{stat.value}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
										{stat.subtitle}
									</p>
								</div>
								<div className={`${stat.bgColor} p-3 rounded-lg`}>
									<Icon className="h-6 w-6 text-white" />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Quick Actions */}
			<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
					Hành Động Nhanh
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Link
						href="/merchant/restaurants/create"
						className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
					>
						<Store className="h-8 w-8 text-brand-yellow" />
						<div>
							<p className="font-medium text-gray-900 dark:text-white">Thêm Nhà Hàng</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Tạo nhà hàng mới
							</p>
						</div>
					</Link>
					<Link
						href="/merchant/restaurants"
						className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
					>
						<Store className="h-8 w-8 text-brand-yellow" />
						<div>
							<p className="font-medium text-gray-900 dark:text-white">Quản Lý Nhà Hàng</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Xem tất cả nhà hàng
							</p>
						</div>
					</Link>
					<Link
						href="/merchant/manage/staff"
						className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
					>
						<Users className="h-8 w-8 text-brand-yellow" />
						<div>
							<p className="font-medium text-gray-900 dark:text-white">Quản Lý Nhân Viên</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Thêm và quản lý staff
							</p>
						</div>
					</Link>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
					Hoạt Động Gần Đây
				</h2>
				<div className="text-center py-8 text-gray-500 dark:text-gray-400">
					Chưa có hoạt động nào
				</div>
			</div>
		</div>
	);
}
