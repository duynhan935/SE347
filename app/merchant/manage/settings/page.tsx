"use client";

import { Save } from "lucide-react";

export default function MerchantSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cài Đặt</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý cài đặt tài khoản merchant</p>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Thông Tin Doanh Nghiệp</h2>
				<form className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Tên Doanh Nghiệp
							</label>
							<input
								type="text"
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Mã Số Thuế
							</label>
							<input
								type="text"
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
							/>
						</div>
					</div>
					<div className="pt-4">
						<button
							type="submit"
							className="flex items-center gap-2 px-6 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors"
						>
							<Save className="h-5 w-5" />
							Lưu Thay Đổi
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
