"use client";

import { authApi } from "@/lib/api/authApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { Eye, EyeOff, MapPin, Upload } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface MerchantRequestFormProps {
        onSuccess?: () => void;
        onCancel?: () => void;
        initialEmail?: string;
        initialUsername?: string;
}

export function MerchantRequestForm({
        onSuccess,
        onCancel,
        initialEmail = "",
        initialUsername = "",
}: MerchantRequestFormProps) {
        const [username, setUsername] = useState(initialUsername);
        const [email, setEmail] = useState(initialEmail);
        const [password, setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");
        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const [loading, setLoading] = useState(false);

        // Restaurant information
        const [resName, setResName] = useState("");
        const [address, setAddress] = useState("");
        const [longitude, setLongitude] = useState<number>(0);
        const [latitude, setLatitude] = useState<number>(0);
        const [openingTime, setOpeningTime] = useState("09:00");
        const [closingTime, setClosingTime] = useState("22:00");
        const [phone, setPhone] = useState("");
        const [restaurantImage, setRestaurantImage] = useState<File | null>(null);
        const [imagePreview, setImagePreview] = useState<string | null>(null);

        const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                        setRestaurantImage(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                }
        };

        const handleGetLocation = () => {
                if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                                (position) => {
                                        setLatitude(position.coords.latitude);
                                        setLongitude(position.coords.longitude);
                                        toast.success("Đã lấy vị trí thành công!");
                                },
                                () => {
                                        toast.error("Không thể lấy vị trí. Vui lòng nhập thủ công.");
                                }
                        );
                } else {
                        toast.error("Trình duyệt không hỗ trợ lấy vị trí.");
                }
        };

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                if (password !== confirmPassword) {
                        toast.error("Mật khẩu và xác nhận mật khẩu không khớp");
                        return;
                }

                if (password.length < 6) {
                        toast.error("Mật khẩu phải có ít nhất 6 ký tự");
                        return;
                }

                // Validate restaurant information
                if (!resName.trim()) {
                        toast.error("Vui lòng nhập tên nhà hàng");
                        return;
                }

                if (!address.trim()) {
                        toast.error("Vui lòng nhập địa chỉ nhà hàng");
                        return;
                }

                if (longitude === 0 || latitude === 0) {
                        toast.error("Vui lòng nhập tọa độ địa chỉ nhà hàng");
                        return;
                }

                if (!phone.trim()) {
                        toast.error("Vui lòng nhập số điện thoại nhà hàng");
                        return;
                }

                setLoading(true);
                try {
                        // Step 1: Register user
                        await authApi.register({
                                username,
                                email,
                                password,
                                confirmPassword,
                                role: "MERCHANT",
                        });

                        // Step 2: Get userId by fetching all users and finding the newly registered one
                        // Note: This is a workaround since backend doesn't return userId in register response
                                                        let userId: string | null = null;
                                                        try {
                                                                        const usersPage = await authApi.getAllUsers();
                                                                        const users = Array.isArray(usersPage?.content) ? usersPage.content : [];
                                                                        const newUser = users.find((u) => u.email === email && u.role === "MERCHANT");
                                                                        if (newUser) {
                                                                                        userId = newUser.id;
                                                                        }
                                                        } catch (userError) {
                                console.log("Could not fetch users to get userId:", userError);
                                // If we can't get userId, we'll store restaurant info for later
                        }

                        // Step 3: Create restaurant if we have userId
                        if (userId) {
                                try {
                                        const restaurantData = {
                                                resName,
                                                address,
                                                longitude,
                                                latitude,
                                                openingTime,
                                                closingTime,
                                                phone,
                                                merchantId: userId,
                                        };

                                        await restaurantApi.createRestaurant(
                                                restaurantData,
                                                restaurantImage || undefined
                                        );

                                        toast.success(
                                                "Đã gửi yêu cầu trở thành merchant và tạo nhà hàng thành công! Vui lòng chờ admin phê duyệt. Bạn sẽ nhận được email thông báo khi được phê duyệt."
                                        );
                                } catch (restaurantError: unknown) {
                                        // If restaurant creation fails, save info for later
                                        const errorMsg =
                                                (restaurantError as { response?: { data?: { message?: string } } })
                                                        ?.response?.data?.message ||
                                                (restaurantError as { message?: string })?.message ||
                                                "Không thể tạo nhà hàng ngay bây giờ";
                                        console.log("Restaurant creation error:", errorMsg);

                                        // Save restaurant info to localStorage for later creation
                                        const restaurantInfo = {
                                                resName,
                                                address,
                                                longitude,
                                                latitude,
                                                openingTime,
                                                closingTime,
                                                phone,
                                                email, // Use email to identify merchant later
                                                imageFile: restaurantImage
                                                        ? {
                                                                  name: restaurantImage.name,
                                                                  type: restaurantImage.type,
                                                                  size: restaurantImage.size,
                                                          }
                                                        : null,
                                        };
                                        localStorage.setItem(
                                                `pending_restaurant_${email}`,
                                                JSON.stringify(restaurantInfo)
                                        );

                                        toast.success(
                                                "Đã gửi yêu cầu trở thành merchant thành công! Thông tin nhà hàng đã được lưu. Nhà hàng sẽ được tạo sau khi bạn được phê duyệt. Bạn sẽ nhận được email thông báo khi được phê duyệt."
                                        );
                                }
                        } else {
                                // If we can't get userId, save restaurant info for later
                                const restaurantInfo = {
                                        resName,
                                        address,
                                        longitude,
                                        latitude,
                                        openingTime,
                                        closingTime,
                                        phone,
                                        email,
                                        imageFile: restaurantImage
                                                ? {
                                                          name: restaurantImage.name,
                                                          type: restaurantImage.type,
                                                          size: restaurantImage.size,
                                                  }
                                                : null,
                                };
                                localStorage.setItem(`pending_restaurant_${email}`, JSON.stringify(restaurantInfo));

                                toast.success(
                                        "Đã gửi yêu cầu trở thành merchant thành công! Thông tin nhà hàng đã được lưu. Nhà hàng sẽ được tạo sau khi bạn được phê duyệt. Bạn sẽ nhận được email thông báo khi được phê duyệt."
                                );
                        }

                        onSuccess?.();
                } catch (error: unknown) {
                        let errorMessage = "Không thể gửi yêu cầu. Vui lòng thử lại.";

                        // Handle different error formats
                        const errorResponse = error as {
                                response?: {
                                        data?: {
                                                message?: string;
                                                errorCode?: string;
                                        };
                                };
                                message?: string;
                        };

                        if (errorResponse?.response?.data) {
                                const errorData = errorResponse.response.data;

                                // Check for duplicate email error
                                if (
                                        errorData.errorCode === "CONFLICT" ||
                                        errorData.message?.includes("Duplicate entry") ||
                                        errorData.message?.toLowerCase().includes("email") ||
                                        errorData.message?.toLowerCase().includes("duplicate")
                                ) {
                                        errorMessage =
                                                "Email này đã được sử dụng trong hệ thống. Vui lòng sử dụng email khác hoặc đăng nhập nếu bạn đã có tài khoản.";
                                } else if (errorData.message) {
                                        errorMessage = errorData.message;
                                }
                        } else if (errorResponse?.message) {
                                errorMessage = errorResponse.message;
                        }

                        toast.error(errorMessage);
                        console.error("Registration error:", error);
                } finally {
                        setLoading(false);
                }
        };

        return (
                <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                                <label
                                        htmlFor="merchant-username"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                        Tên đăng nhập
                                </label>
                                <input
                                        type="text"
                                        id="merchant-username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        disabled={!!initialUsername}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="johndoe"
                                />
                        </div>

                        <div>
                                <label
                                        htmlFor="merchant-email"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                        Email
                                </label>
                                <input
                                        type="email"
                                        id="merchant-email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={!!initialEmail}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="you@example.com"
                                />
                        </div>

                        <div>
                                <label
                                        htmlFor="merchant-password"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                        Mật khẩu
                                </label>
                                <div className="relative">
                                        <input
                                                type={showPassword ? "text" : "password"}
                                                id="merchant-password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                placeholder="••••••••"
                                        />
                                        <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                                        >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                </div>
                        </div>

                        <div>
                                <label
                                        htmlFor="merchant-confirm-password"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                        Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                        <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                id="merchant-confirm-password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                placeholder="••••••••"
                                        />
                                        <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                                        >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                </div>
                        </div>

                        {/* Restaurant Information Section */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin nhà hàng</h3>

                                <div className="space-y-4">
                                        <div>
                                                <label
                                                        htmlFor="res-name"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Tên nhà hàng <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                        type="text"
                                                        id="res-name"
                                                        value={resName}
                                                        onChange={(e) => setResName(e.target.value)}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                        placeholder="Nhập tên nhà hàng"
                                                />
                                        </div>

                                        <div>
                                                <label
                                                        htmlFor="res-address"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Địa chỉ <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                        type="text"
                                                        id="res-address"
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                        placeholder="Nhập địa chỉ nhà hàng"
                                                />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                        <label
                                                                htmlFor="res-latitude"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                Vĩ độ (Latitude) <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                                type="number"
                                                                id="res-latitude"
                                                                value={latitude || ""}
                                                                onChange={(e) =>
                                                                        setLatitude(parseFloat(e.target.value) || 0)
                                                                }
                                                                required
                                                                step="any"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                                placeholder="10.762622"
                                                        />
                                                </div>
                                                <div>
                                                        <label
                                                                htmlFor="res-longitude"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                Kinh độ (Longitude){" "}
                                                                <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                                type="number"
                                                                id="res-longitude"
                                                                value={longitude || ""}
                                                                onChange={(e) =>
                                                                        setLongitude(parseFloat(e.target.value) || 0)
                                                                }
                                                                required
                                                                step="any"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                                placeholder="106.660172"
                                                        />
                                                </div>
                                        </div>

                                        <button
                                                type="button"
                                                onClick={handleGetLocation}
                                                className="flex items-center gap-2 text-sm text-brand-purple hover:text-brand-purple/80 transition-colors"
                                        >
                                                <MapPin className="h-4 w-4" />
                                                Lấy vị trí tự động
                                        </button>

                                        <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                        <label
                                                                htmlFor="opening-time"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                Giờ mở cửa <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                                type="time"
                                                                id="opening-time"
                                                                value={openingTime}
                                                                onChange={(e) => setOpeningTime(e.target.value)}
                                                                required
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                        />
                                                </div>
                                                <div>
                                                        <label
                                                                htmlFor="closing-time"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                Giờ đóng cửa <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                                type="time"
                                                                id="closing-time"
                                                                value={closingTime}
                                                                onChange={(e) => setClosingTime(e.target.value)}
                                                                required
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                        />
                                                </div>
                                        </div>

                                        <div>
                                                <label
                                                        htmlFor="res-phone"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Số điện thoại <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                        type="tel"
                                                        id="res-phone"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition"
                                                        placeholder="0123456789"
                                                />
                                        </div>

                                        <div>
                                                <label
                                                        htmlFor="res-image"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Hình ảnh nhà hàng
                                                </label>
                                                <div className="mt-1 flex items-center gap-4">
                                                        <label
                                                                htmlFor="res-image"
                                                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                                                        >
                                                                <Upload className="h-4 w-4" />
                                                                <span className="text-sm">Chọn ảnh</span>
                                                                <input
                                                                        type="file"
                                                                        id="res-image"
                                                                        accept="image/*"
                                                                        onChange={handleImageChange}
                                                                        className="hidden"
                                                                />
                                                        </label>
                                                        {imagePreview && (
                                                                <div className="relative">
                                                                        <img
                                                                                src={imagePreview}
                                                                                alt="Preview"
                                                                                className="h-16 w-16 object-cover rounded-md"
                                                                        />
                                                                        <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                        setRestaurantImage(null);
                                                                                        setImagePreview(null);
                                                                                }}
                                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                                                        >
                                                                                ×
                                                                        </button>
                                                                </div>
                                                        )}
                                                </div>
                                        </div>
                                </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                                <p className="font-semibold mb-1">Lưu ý:</p>
                                <p>
                                        Yêu cầu của bạn sẽ được gửi đến admin để phê duyệt. Bạn sẽ nhận được email thông
                                        báo khi được phê duyệt hoặc từ chối. Thông tin nhà hàng sẽ được tạo sau khi bạn
                                        được phê duyệt.
                                </p>
                        </div>

                        <div className="flex gap-3">
                                {onCancel && (
                                        <button
                                                type="button"
                                                onClick={onCancel}
                                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-all duration-300"
                                        >
                                                Hủy
                                        </button>
                                )}
                                <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 px-4 bg-brand-purple text-white font-semibold rounded-md hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                        {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                                </button>
                        </div>
                </form>
        );
}
