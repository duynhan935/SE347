"use client";

import { Settings as SettingsIcon, Bell, Lock, Globe, Palette } from "lucide-react";

export default function SettingsPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cài đặt hệ thống</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý cấu hình và cài đặt hệ thống</p>
			</div>

			{/* Settings Sections */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* General Settings */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
							<SettingsIcon className="text-blue-600 dark:text-blue-400" size={20} />
						</div>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cài đặt chung</h2>
					</div>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Tên hệ thống
							</label>
							<input
								type="text"
								defaultValue="Restaurant Management System"
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Email hỗ trợ
							</label>
							<input
								type="email"
								defaultValue="support@restaurant.com"
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
							/>
						</div>
					</div>
				</div>

				{/* Notification Settings */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
							<Bell className="text-yellow-600 dark:text-yellow-400" size={20} />
						</div>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Thông báo</h2>
					</div>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-900 dark:text-white">Email thông báo</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">Nhận email khi có sự kiện quan trọng</p>
							</div>
							<label className="relative inline-flex items-center cursor-pointer">
								<input type="checkbox" className="sr-only peer" defaultChecked />
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-yellow/20 dark:peer-focus:ring-brand-yellow/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-yellow"></div>
							</label>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-900 dark:text-white">Push notification</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">Thông báo trực tiếp trên trình duyệt</p>
							</div>
							<label className="relative inline-flex items-center cursor-pointer">
								<input type="checkbox" className="sr-only peer" defaultChecked />
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-yellow/20 dark:peer-focus:ring-brand-yellow/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-yellow"></div>
							</label>
						</div>
					</div>
				</div>

				{/* Security Settings */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
							<Lock className="text-red-600 dark:text-red-400" size={20} />
						</div>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bảo mật</h2>
					</div>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-900 dark:text-white">Xác thực 2 yếu tố</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">Bật xác thực 2 lớp cho tài khoản admin</p>
							</div>
							<label className="relative inline-flex items-center cursor-pointer">
								<input type="checkbox" className="sr-only peer" />
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-yellow/20 dark:peer-focus:ring-brand-yellow/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-yellow"></div>
							</label>
						</div>
						<div>
							<button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
								Đổi mật khẩu
							</button>
						</div>
					</div>
				</div>

				{/* Appearance Settings */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
							<Palette className="text-purple-600 dark:text-purple-400" size={20} />
						</div>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Giao diện</h2>
					</div>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Chế độ giao diện
							</label>
							<select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow">
								<option value="light">Sáng</option>
								<option value="dark">Tối</option>
								<option value="auto">Tự động</option>
							</select>
						</div>
					</div>
				</div>

				{/* Language Settings */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
							<Globe className="text-green-600 dark:text-green-400" size={20} />
						</div>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ngôn ngữ & Khu vực</h2>
					</div>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngôn ngữ</label>
							<select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow">
								<option value="vi">Tiếng Việt</option>
								<option value="en">English</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Múi giờ</label>
							<select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow">
								<option value="Asia/Ho_Chi_Minh">GMT+7 (Ho Chi Minh)</option>
								<option value="UTC">UTC</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Save Button */}
			<div className="flex justify-end">
				<button className="px-6 py-2 bg-brand-yellow text-white rounded-lg hover:bg-brand-yellow/90 transition-colors">
					Lưu thay đổi
				</button>
			</div>
		</div>
	);
}
