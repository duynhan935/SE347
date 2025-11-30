"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { productApi } from "@/lib/api/productApi";
import { Product } from "@/types";

export default function ManagerMenuPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchProducts();
	}, []);

	const fetchProducts = async () => {
		setLoading(true);
		try {
			// TODO: Filter by restaurant ID from auth context
			const response = await productApi.getAllProducts(new URLSearchParams());
			setProducts(response.data);
		} catch (error) {
			console.error("Failed to fetch products:", error);
			toast.error("Không thể tải danh sách món ăn");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteProduct = async (id: string) => {
		if (!confirm("Bạn có chắc chắn muốn xóa món ăn này?")) return;

		try {
			await productApi.deleteProduct(id);
			toast.success("Đã xóa món ăn");
			fetchProducts();
		} catch (error) {
			console.error("Failed to delete product:", error);
			toast.error("Không thể xóa món ăn");
		}
	};

	const filteredProducts = products.filter((product) =>
		product.productName.toLowerCase().includes(searchTerm.toLowerCase())
	);

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
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Quản Lý Thực Đơn
					</h1>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
						Quản lý các món ăn trong nhà hàng
					</p>
				</div>
				<button className="flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2 text-white hover:bg-brand-purple/90 transition-colors">
					<Plus className="h-5 w-5" />
					Thêm Món
				</button>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Tìm kiếm món ăn..."
					className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
				/>
			</div>

			{/* Products Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{filteredProducts.map((product) => (
					<div
						key={product.id}
						className="rounded-lg bg-white shadow hover:shadow-lg transition-shadow dark:bg-gray-800"
					>
						{/* Product Image */}
						<div className="relative h-48 w-full">
						<Image
							src={product.imageURL || "/placeholder-food.jpg"}
							alt={product.productName}
								fill
								className="rounded-t-lg object-cover"
							/>
							<div className="absolute top-2 right-2">
								<span
									className={`rounded-full px-3 py-1 text-xs font-semibold ${
										product.available
											? "bg-green-500 text-white"
											: "bg-red-500 text-white"
									}`}
								>
									{product.available ? "Có sẵn" : "Hết hàng"}
								</span>
							</div>
						</div>

						{/* Product Info */}
						<div className="p-4">
					<h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
						{product.productName}
					</h3>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
						{product.description}
					</p>
					<p className="mt-2 text-xl font-bold text-brand-purple">
						{product.productSizes[0]?.price.toLocaleString("vi-VN") || "N/A"}đ
					</p>							{/* Actions */}
							<div className="mt-4 flex items-center gap-2">
								<button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
									<Edit className="h-4 w-4" />
									Sửa
								</button>
								<button
									onClick={() => handleDeleteProduct(product.id)}
									className="flex items-center justify-center rounded-lg border border-red-300 px-3 py-2 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-500 dark:hover:bg-red-900/20"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
