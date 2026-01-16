"use client";

import { Size, SizeData } from "@/types";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type SizeFormModalProps = {
	isOpen: boolean;
	onClose: () => void;
	size: Size | null;
	onSave: (sizeData: SizeData) => void;
};

export default function SizeFormModal({ isOpen, onClose, size, onSave }: SizeFormModalProps) {
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);

	const isEditMode = size !== null;
	const title = isEditMode ? "Edit Size" : "Add New Size";

	useEffect(() => {
		if (isOpen) {
			if (isEditMode && size) {
				setName(size.name || "");
			} else {
				setName("");
			}
		}
	}, [isOpen, size, isEditMode]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error("Size name is required");
			return;
		}

		setLoading(true);
		try {
			await onSave({ name: name.trim() });
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
					title="Close"
					onClick={onClose}
					className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
				>
					<X className="w-6 h-6" />
				</button>

				<h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Size Name <span className="text-red-500">*</span>
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
							required
							disabled={loading}
							placeholder="Enter size name"
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							disabled={loading}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-brand-yellow text-white rounded-lg hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									Saving...
								</>
							) : (
								"Save"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

