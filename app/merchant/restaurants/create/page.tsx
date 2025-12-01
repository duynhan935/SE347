"use client";

import { restaurantApi } from "@/lib/api/restaurantApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CreateRestaurantPage() {
        const router = useRouter();
        const user = useAuthStore((state) => state.user);
        const [loading, setLoading] = useState(false);
        const [imageFile, setImageFile] = useState<File | null>(null);
        const [imagePreview, setImagePreview] = useState<string>("");
        const [formData, setFormData] = useState({
                name: "",
                description: "",
                phone: "",
                email: "",
                address: "",
                openTime: "09:00",
                closeTime: "22:00",
        });

        const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                }
        };

        const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();

                if (!user?.id) {
                        toast.error("Vui lòng đăng nhập");
                        return;
                }

                setLoading(true);

                try {
                        // Backend dùng LocalTime, admin panel đang gửi dạng HH:mm:ss
                        const restaurantData = {
                                resName: formData.name,
                                address: formData.address,
                                longitude: 106.809883, // Default coordinates - should get from map in future
                                latitude: 10.841228,
                                openingTime: `${formData.openTime}:00`,
                                closingTime: `${formData.closeTime}:00`,
                                phone: formData.phone,
                                merchantId: user.id,
                        };

                        await restaurantApi.createRestaurant(restaurantData, imageFile || undefined);
                        toast.success("Tạo nhà hàng thành công!");
                        router.push("/merchant/restaurants");
                } catch (error: unknown) {
                        console.error("Create restaurant error:", error);
                        toast.error("Có lỗi xảy ra, vui lòng thử lại");
                } finally {
                        setLoading(false);
                }
        };

        return (
                <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                                <Link
                                        href="/merchant/restaurants"
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                        <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </Link>
                                <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                                Tạo Nhà Hàng Mới
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                Điền thông tin để tạo nhà hàng mới
                                        </p>
                                </div>
                        </div>

                        {/* Form */}
                        <form
                                onSubmit={handleSubmit}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                        >
                                <div className="space-y-6">
                                        {/* Restaurant Name */}
                                        <div>
                                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Tên Nhà Hàng <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) =>
                                                                setFormData({ ...formData, name: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                        placeholder="Nhập tên nhà hàng"
                                                />
                                        </div>

                                        {/* Description */}
                                        <div>
                                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Mô Tả
                                                </label>
                                                <textarea
                                                        rows={4}
                                                        value={formData.description}
                                                        onChange={(e) =>
                                                                setFormData({
                                                                        ...formData,
                                                                        description: e.target.value,
                                                                })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                        placeholder="Mô tả về nhà hàng của bạn"
                                                />
                                        </div>

                                        {/* Contact Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                                Số Điện Thoại <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                                type="tel"
                                                                required
                                                                value={formData.phone}
                                                                onChange={(e) =>
                                                                        setFormData({
                                                                                ...formData,
                                                                                phone: e.target.value,
                                                                        })
                                                                }
                                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                                placeholder="0123456789"
                                                        />
                                                </div>
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                                Email
                                                        </label>
                                                        <input
                                                                type="email"
                                                                value={formData.email}
                                                                onChange={(e) =>
                                                                        setFormData({
                                                                                ...formData,
                                                                                email: e.target.value,
                                                                        })
                                                                }
                                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                                placeholder="restaurant@example.com"
                                                        />
                                                </div>
                                        </div>

                                        {/* Address */}
                                        <div>
                                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Địa Chỉ <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                        type="text"
                                                        required
                                                        value={formData.address}
                                                        onChange={(e) =>
                                                                setFormData({ ...formData, address: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                        placeholder="Nhập địa chỉ nhà hàng"
                                                />
                                        </div>

                                        {/* Operating Hours */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                                Giờ Mở Cửa
                                                        </label>
                                                        <input
                                                                type="time"
                                                                value={formData.openTime}
                                                                onChange={(e) =>
                                                                        setFormData({
                                                                                ...formData,
                                                                                openTime: e.target.value,
                                                                        })
                                                                }
                                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                        />
                                                </div>
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                                Giờ Đóng Cửa
                                                        </label>
                                                        <input
                                                                type="time"
                                                                value={formData.closeTime}
                                                                onChange={(e) =>
                                                                        setFormData({
                                                                                ...formData,
                                                                                closeTime: e.target.value,
                                                                        })
                                                                }
                                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                        />
                                                </div>
                                        </div>

                                        {/* Restaurant Image */}
                                        <div>
                                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Hình Ảnh Nhà Hàng
                                                </label>
                                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                                                        {imagePreview ? (
                                                                <div className="relative">
                                                                        <Image
                                                                                src={imagePreview}
                                                                                alt="Preview"
                                                                                width={200}
                                                                                height={200}
                                                                                className="mx-auto rounded-lg object-cover"
                                                                        />
                                                                        <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                        setImageFile(null);
                                                                                        setImagePreview("");
                                                                                }}
                                                                                className="mt-2 text-sm text-red-500 hover:text-red-700"
                                                                        >
                                                                                Xóa ảnh
                                                                        </button>
                                                                </div>
                                                        ) : (
                                                                <>
                                                                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                                                Click để chọn ảnh
                                                                        </p>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                                                                PNG, JPG, GIF tối đa 10MB
                                                                        </p>
                                                                </>
                                                        )}
                                                        <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                                className="hidden"
                                                                id="restaurant-image"
                                                        />
                                                        {!imagePreview && (
                                                                <label
                                                                        htmlFor="restaurant-image"
                                                                        className="mt-4 inline-block px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg cursor-pointer transition-colors"
                                                                >
                                                                        Chọn Ảnh
                                                                </label>
                                                        )}
                                                </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-4 pt-4">
                                                <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="flex items-center gap-2 px-6 py-2 bg-brand-yellow hover:bg-brand-yellow/90 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                                                >
                                                        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                                                        Tạo Nhà Hàng
                                                </button>
                                                <Link
                                                        href="/merchant/restaurants"
                                                        className="px-6 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white rounded-lg transition-colors"
                                                >
                                                        Hủy
                                                </Link>
                                        </div>
                                </div>
                        </form>
                </div>
        );
}
