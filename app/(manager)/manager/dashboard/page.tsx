"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, Clock, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { orderApi } from "@/lib/api/orderApi";

export default function ManagerDashboard() {
	const [stats, setStats] = useState({
		totalOrders: 0,
		revenue: 0,
		pendingOrders: 0,
		completedOrders: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		setLoading(true);
		try {
			// TODO: Get restaurant ID from auth context
			const restaurantId = "rest1";
			const orders = await orderApi.getOrdersByRestaurant(restaurantId);
			
			const totalOrders = orders.length;
			const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
			const pendingOrders = orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED").length;
			const completedOrders = orders.filter((o) => o.status === "DELIVERED").length;

			setStats({ totalOrders, revenue, pendingOrders, completedOrders });
		} catch (error) {
			console.error("Failed to fetch stats:", error);
			toast.error("Không thể tải thống kê");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
			</div>
		);
	}

	const statCards = [
		{
			title: "Tổng Đơn Hàng",
			value: stats.totalOrders,
			icon: ShoppingBag,
			color: "bg-blue-500",
		},
		{
			title: "Doanh Thu",
			value: `${stats.revenue.toLocaleString("vi-VN")}đ`,
			icon: DollarSign,
			color: "bg-green-500",
		},
		{
			title: "Đơn Đang Xử Lý",
			value: stats.pendingOrders,
			icon: Clock,
			color: "bg-orange-500",
		},
		{
			title: "Đơn Hoàn Thành",
			value: stats.completedOrders,
			icon: TrendingUp,
			color: "bg-purple-500",
		},
	];

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
					Dashboard
				</h1>
				<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
					Tổng quan về hoạt động nhà hàng
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{statCards.map((stat) => {
					const Icon = stat.icon;
					return (
						<div
							key={stat.title}
							className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
										{stat.title}
									</p>
									<p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
										{stat.value}
									</p>
								</div>
								<div className={`${stat.color} rounded-lg p-3`}>
									<Icon className="h-6 w-6 text-white" />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Today's Performance */}
				<div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
						Hiệu Suất Hôm Nay
					</h2>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Đơn mới</span>
							<span className="font-semibold text-gray-900 dark:text-white">12</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Đang nấu</span>
							<span className="font-semibold text-gray-900 dark:text-white">5</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Đang giao</span>
							<span className="font-semibold text-gray-900 dark:text-white">3</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">Hoàn thành</span>
							<span className="font-semibold text-green-600 dark:text-green-400">28</span>
						</div>
					</div>
				</div>

				{/* Top Dishes */}
				<div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
						Món Bán Chạy
					</h2>
					<div className="space-y-4">
						{[
							{ name: "Phở Bò Tái", orders: 45 },
							{ name: "Bún Chả", orders: 38 },
							{ name: "Cơm Tấm", orders: 32 },
							{ name: "Bánh Mì", orders: 28 },
						].map((dish, index) => (
							<div key={index} className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple font-semibold text-sm">
										{index + 1}
									</div>
									<span className="text-gray-900 dark:text-white">{dish.name}</span>
								</div>
								<span className="font-semibold text-gray-600 dark:text-gray-400">
									{dish.orders}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
