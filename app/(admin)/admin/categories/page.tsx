"use client";

import CategoryFormModal from "@/components/admin/categories/CategoryFormModal";
import { categoryApi } from "@/lib/api/categoryApi";
import { Category, CategoryData } from "@/types";
import { Edit, Loader2, Plus, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		setLoading(true);
		try {
			const response = await categoryApi.getAllCategories();
			setCategories(response.data);
		} catch (error) {
			console.error("Failed to fetch categories:", error);
			toast.error("Không thể tải danh sách categories");
		} finally {
			setLoading(false);
		}
	};

	const handleSaveCategory = async (categoryData: CategoryData) => {
		try {
			if (editingCategory) {
				await categoryApi.updateCategory(editingCategory.id, categoryData);
				toast.success("Đã cập nhật category");
			} else {
				await categoryApi.createCategory(categoryData);
				toast.success("Đã thêm category mới");
			}
			setIsModalOpen(false);
			setEditingCategory(null);
			fetchCategories();
		} catch (error) {
			console.error("Failed to save category:", error);
			toast.error("Không thể lưu category");
		}
	};

	const handleDeleteCategory = async (categoryId: string) => {
		if (!confirm("Bạn có chắc chắn muốn xóa category này?")) return;

		try {
			await categoryApi.deleteCategory(categoryId);
			toast.success("Đã xóa category");
			fetchCategories();
		} catch (error) {
			console.error("Failed to delete category:", error);
			toast.error("Không thể xóa category");
		}
	};

	const filteredCategories = categories.filter((category) =>
		category.cateName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Categories</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý danh mục món ăn trong hệ thống</p>
				</div>
				<button
					onClick={() => {
						setEditingCategory(null);
						setIsModalOpen(true);
					}}
					className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-white rounded-lg hover:bg-brand-yellow/90 transition-colors"
				>
					<Plus size={20} />
					Thêm Category
				</button>
			</div>

			{/* Stats */}
			<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
				<p className="text-sm text-gray-600 dark:text-gray-400">Tổng số Categories</p>
				<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{categories.length}</p>
			</div>

			{/* Search */}
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
				<div className="relative">
					<Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						placeholder="Tìm kiếm category..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
					/>
				</div>
			</div>

			{/* Categories Table */}
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
										STT
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Tên Category
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Thao tác
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{filteredCategories.map((category, index) => (
									<tr
										key={category.id}
										className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
											{index + 1}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900 dark:text-white">
												{category.cateName}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex items-center justify-end gap-2">
												<button
													onClick={() => {
														setEditingCategory(category);
														setIsModalOpen(true);
													}}
													className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
													title="Chỉnh sửa"
												>
													<Edit size={18} />
												</button>
												<button
													onClick={() => handleDeleteCategory(category.id)}
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
						{filteredCategories.length === 0 && (
							<div className="text-center py-12 text-gray-500 dark:text-gray-400">
								Không tìm thấy category nào
							</div>
						)}
					</div>
				)}
			</div>

			{isModalOpen && (
				<CategoryFormModal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						setEditingCategory(null);
					}}
					category={editingCategory}
					onSave={handleSaveCategory}
				/>
			)}
		</div>
	);
}
