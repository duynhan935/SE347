"use client";

import { restaurantApi } from "@/lib/api/restaurantApi";
import { Restaurant } from "@/types";
import { Loader2, Search, Eye, Edit, Ban, CheckCircle, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function RestaurantsPage() {
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [filterStatus, setFilterStatus] = useState<string>("ALL");

	useEffect(() => {
		fetchRestaurants();
	}, []);

	const fetchRestaurants = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			const data = await restaurantApi.getAllRestaurants(params);
			// Ensure data is an array
			setRestaurants(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Failed to fetch restaurants:", error);
			toast.error("Không thể tải danh sách nhà hàng");
			setRestaurants([]);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleStatus = async (restaurantId: string, currentStatus: boolean) => {
		try {
			// TODO: Add API call to toggle restaurant status
			toast.success(currentStatus ? "Đã vô hiệu hóa nhà hàng" : "Đã kích hoạt nhà hàng");
			fetchRestaurants();
		} catch {
			toast.error("Không thể thay đổi trạng thái nhà hàng");
		}
	};

	const filteredRestaurants = restaurants.filter((restaurant) => {
		const matchesSearch =
			restaurant.resName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			restaurant.address.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = filterStatus === "ALL" || (filterStatus === "ACTIVE" ? restaurant.enabled : !restaurant.enabled);
		return matchesSearch && matchesStatus;
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Nhà hàng</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý tất cả nhà hàng trong hệ thống</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Tổng nhà hàng</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{restaurants.length}</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</p>
					<p className="text-2xl font-bold text-green-600 mt-1">{restaurants.filter((r) => r.enabled).length}</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-600 dark:text-gray-400">Tạm dừng</p>
					<p className="text-2xl font-bold text-red-600 mt-1">{restaurants.filter((r) => !r.enabled).length}</p>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Search */}
					<div className="relative">
						<Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
						/>
					</div>

					{/* Status Filter */}
					<select
						value={filterStatus}
						onChange={(e) => setFilterStatus(e.target.value)}
						className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
					>
						<option value="ALL">Tất cả trạng thái</option>
						<option value="ACTIVE">Đang hoạt động</option>
						<option value="INACTIVE">Tạm dừng</option>
					</select>
				</div>
			</div>

			{/* Restaurants Grid */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center p-12">
						<Loader2 className="animate-spin text-brand-yellow" size={40} />
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
						{filteredRestaurants.map((restaurant) => (
							<div
								key={restaurant.id}
								className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
							>
								{/* Restaurant Image */}
								<div className="relative h-48 bg-gray-200 dark:bg-gray-700">
									{restaurant.imageURL ? (
										<Image
											src={typeof restaurant.imageURL === "string" ? restaurant.imageURL : restaurant.imageURL}
											alt={restaurant.resName}
											fill
											className="object-cover"
										/>
									) : (
										<div className="flex items-center justify-center h-full text-gray-400">No Image</div>
									)}
									<div className="absolute top-2 right-2">
										<span
											className={`px-2 py-1 text-xs font-semibold rounded-full ${
												restaurant.enabled
													? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
													: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
											}`}
										>
											{restaurant.enabled ? "Hoạt động" : "Tạm dừng"}
										</span>
									</div>
								</div>

								{/* Restaurant Info */}
								<div className="p-4 space-y-3">
									<div>
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{restaurant.resName}</h3>
										<div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
											<MapPin size={14} />
											<span className="line-clamp-1">{restaurant.address}</span>
										</div>
									</div>

									<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
										<div className="flex items-center gap-1">
											<Clock size={14} />
											<span>
												{restaurant.openingTime} - {restaurant.closingTime}
											</span>
										</div>
										<div className="flex items-center gap-1">
											<span className="text-yellow-500">★</span>
											<span>{restaurant.rating.toFixed(1)}</span>
										</div>
									</div>

									<div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
										<button
											onClick={() => {}}
											className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
										>
											<Eye size={16} />
											Chi tiết
										</button>
										<button
											onClick={() => {}}
											className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
										>
											<Edit size={16} />
											Sửa
										</button>
										<button
											onClick={() => handleToggleStatus(restaurant.id, restaurant.enabled)}
											className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
												restaurant.enabled
													? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
													: "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
											}`}
										>
											{restaurant.enabled ? <Ban size={16} /> : <CheckCircle size={16} />}
											{restaurant.enabled ? "Tạm dừng" : "Kích hoạt"}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
				{!loading && filteredRestaurants.length === 0 && (
					<div className="text-center py-12 text-gray-500 dark:text-gray-400">Không tìm thấy nhà hàng nào</div>
				)}
			</div>
		</div>
	);
}