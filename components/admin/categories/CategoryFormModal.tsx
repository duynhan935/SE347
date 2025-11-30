"use client";

import { Category, CategoryData } from "@/types";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type CategoryFormModalProps = {
	isOpen: boolean;
	onClose: () => void;
	category: Category | null;
	onSave: (categoryData: CategoryData) => void;
};

export default function CategoryFormModal({ isOpen, onClose, category, onSave }: CategoryFormModalProps) {
	const [cateName, setCateName] = useState("");
	const [loading, setLoading] = useState(false);

	const isEditMode = category !== null;
	const title = isEditMode ? "Chỉnh sửa Category" : "Thêm Category mới";

	useEffect(() => {
		if (isOpen) {
			if (isEditMode && category) {
				setCateName(category.cateName || "");
			} else {
				setCateName("");
			}
		}
	}, [isOpen, category, isEditMode]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!cateName.trim()) {
			toast.error("Tên category là bắt buộc");
			return;
		}

		setLoading(true);
		try {
			await onSave({ cateName: cateName.trim() });
		} catch (error) {
			// Error handling is done in parent component
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div onClick={onClose} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex justify-center items-center transition-opacity">
			<div onClick={(e) => e.stopPropagation()} className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
				<button
					title="Đóng"
					onClick={onClose}
					className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
				>
					<X className="w-6 h-6" />
				</button>

				<h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="cateName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Tên Category <span className="text-red-500">*</span>
						</label>
						<input
							id="cateName"
							type="text"
							value={cateName}
							onChange={(e) => setCateName(e.target.value)}
							className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
							required
							disabled={loading}
							placeholder="Nhập tên category"
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							disabled={loading}
						>
							Hủy
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-brand-yellow text-white rounded-lg hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									Đang lưu...
								</>
							) : (
								"Lưu"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

