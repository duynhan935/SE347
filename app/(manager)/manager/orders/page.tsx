"use client";

import { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { orderApi } from "@/lib/api/orderApi";
import { Order, OrderStatus } from "@/types";

export default function ManagerOrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("ALL");

	useEffect(() => {
		fetchOrders();
	}, []);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			// TODO: Get restaurant ID from auth context
			const restaurantId = "rest1";
			const data = await orderApi.getOrdersByRestaurant(restaurantId);
			setOrders(data);
		} catch (error) {
			console.error("Failed to fetch orders:", error);
			toast.error("Không thể tải danh sách đơn hàng");
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
		try {
			await orderApi.updateOrderStatus(orderId, status);
			toast.success("Đã cập nhật trạng thái đơn hàng");
			fetchOrders();
		} catch (error) {
			console.error("Failed to update order status:", error);
			toast.error("Không thể cập nhật trạng thái");
		}
	};

	const getStatusBadge = (status: OrderStatus) => {
		const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
			PENDING: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
			CONFIRMED: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
			PREPARING: { label: "Đang nấu", className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
			READY: { label: "Sẵn sàng", className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
			DELIVERING: { label: "Đang giao", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" },
			DELIVERED: { label: "Hoàn thành", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
			CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
		};

		const config = statusConfig[status];
		return (
			<span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
				{config.label}
			</span>
		);
	};

	const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
		const statusFlow: Record<OrderStatus, OrderStatus | null> = {
			PENDING: OrderStatus.CONFIRMED,
			CONFIRMED: OrderStatus.PREPARING,
			PREPARING: OrderStatus.READY,
			READY: OrderStatus.DELIVERING,
			DELIVERING: OrderStatus.DELIVERED,
			DELIVERED: null,
			CANCELLED: null,
		};
		return statusFlow[currentStatus];
	};

	const filteredOrders = orders.filter((order) => {
		const matchesSearch = order.id.includes(searchTerm);
		const matchesStatus = filterStatus === "ALL" || order.status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
					Quản Lý Đơn Hàng
				</h1>
				<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
					Theo dõi và xử lý các đơn hàng
				</p>
			</div>

			{/* Filters */}
			<div className="flex flex-col gap-4 sm:flex-row">
				{/* Search */}
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Tìm kiếm theo mã đơn..."
						className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
					/>
				</div>

				{/* Status Filter */}
				<select
					value={filterStatus}
					onChange={(e) => setFilterStatus(e.target.value)}
					className="rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
				>
					<option value="ALL">Tất cả trạng thái</option>
					<option value="PENDING">Chờ xác nhận</option>
					<option value="CONFIRMED">Đã xác nhận</option>
					<option value="PREPARING">Đang nấu</option>
					<option value="READY">Sẵn sàng</option>
					<option value="DELIVERING">Đang giao</option>
					<option value="DELIVERED">Hoàn thành</option>
					<option value="CANCELLED">Đã hủy</option>
				</select>
			</div>

			{/* Orders Table */}
			<div className="rounded-lg bg-white shadow dark:bg-gray-800">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b dark:border-gray-700">
							<tr>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
									Mã Đơn
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
									Khách Hàng
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
									Món Ăn
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
									Tổng Tiền
								</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
									Trạng Thái
								</th>
								<th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
									Thao Tác
								</th>
							</tr>
						</thead>
						<tbody className="divide-y dark:divide-gray-700">
							{filteredOrders.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-6 py-12 text-center text-gray-600 dark:text-gray-400">
										Không có đơn hàng nào
									</td>
								</tr>
							) : (
								filteredOrders.map((order) => {
									const nextStatus = getNextStatus(order.status);
									return (
										<tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
											<td className="px-6 py-4">
												<p className="font-medium text-gray-900 dark:text-white">
													#{order.id}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{new Date(order.createdAt).toLocaleString("vi-VN")}
												</p>
											</td>
											<td className="px-6 py-4">
												<p className="font-medium text-gray-900 dark:text-white">
													{order.customerName}
												</p>
												<p className="text-sm text-gray-600 dark:text-gray-400">
													{order.customerPhone}
												</p>
											</td>
											<td className="px-6 py-4">
												<p className="text-sm text-gray-600 dark:text-gray-400">
													{order.items.length} món
												</p>
											</td>
											<td className="px-6 py-4">
												<p className="font-semibold text-gray-900 dark:text-white">
													{order.totalPrice.toLocaleString("vi-VN")}đ
												</p>
											</td>
											<td className="px-6 py-4">
												{getStatusBadge(order.status)}
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center justify-end gap-2">
													<button
														className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
														title="Xem chi tiết"
													>
														<Eye className="h-4 w-4" />
													</button>
													{nextStatus && (
														<button
															onClick={() => handleUpdateStatus(order.id, nextStatus)}
															className="rounded-lg bg-brand-purple px-3 py-2 text-sm font-medium text-white hover:bg-brand-purple/90"
														>
															{nextStatus === OrderStatus.CONFIRMED && "Xác nhận"}
															{nextStatus === OrderStatus.PREPARING && "Bắt đầu nấu"}
															{nextStatus === OrderStatus.READY && "Sẵn sàng"}
															{nextStatus === OrderStatus.DELIVERING && "Giao hàng"}
															{nextStatus === OrderStatus.DELIVERED && "Hoàn thành"}
														</button>
													)}
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
