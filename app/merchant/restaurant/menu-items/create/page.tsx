"use client";
// ✅ Sử dụng store bạn cung cấp
import { useCategoryStore } from "@/stores/categoryStore";
import { useSizeStore } from "@/stores/sizeStore";
import { useProductStore } from "@/stores/useProductsStores";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { SizePrice } from "@/types";
// ✅ Import icons
import { ChevronLeft, Loader2, Plus, Save, Trash2, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function MenuCreateForm() {
        const {
                categories,
                fetchAllCategories,
                createNewCategory,
                loading: categoryLoading,
                error: categoryError,
        } = useCategoryStore();
        const { sizes, fetchAllSizes, createNewSize, loading: sizeLoading, error: sizeError } = useSizeStore();
        const { getRestaurantByMerchantId } = useRestaurantStore();
        const restaurantId = useRestaurantStore((state) => state.restaurant?.id ?? "");
        const { createNewProduct, loading: productLoading, error: productError } = useProductStore();

        // --- State cho form (giữ nguyên) ---
        const [productName, setProductName] = useState("");
        const [description, setDescription] = useState("");
        const [categoryId, setCategoryId] = useState("");
        const [available, setAvailable] = useState(true);
        const [sizePrices, setSizePrices] = useState<SizePrice[]>([{ sizeId: "", price: "" }]);
        const [image, setImage] = useState<File | null>(null);
        const [imagePreview, setImagePreview] = useState<string | null>(null);
        const [showNewCategory, setShowNewCategory] = useState(false);
        const [newCategoryName, setNewCategoryName] = useState("");
        const [showNewSize, setShowNewSize] = useState(false);
        const [newSizeName, setNewSizeName] = useState("");

        useEffect(() => {
                fetchAllCategories();
                fetchAllSizes();
                const merchantId = "testmerchantid";
                if (merchantId && !restaurantId) {
                        getRestaurantByMerchantId(merchantId);
                } else if (!merchantId) {
                        toast.error("Thiếu thông tin Merchant!");
                }
        }, [fetchAllCategories, fetchAllSizes, getRestaurantByMerchantId, restaurantId]);

        const handleAddSizePrice = () => setSizePrices([...sizePrices, { sizeId: "", price: "" }]);
        const handleSizePriceChange = (index: number, field: keyof SizePrice, value: string) => {
                const updated = [...sizePrices];
                if (field === "price" && value !== "" && !/^\d*\.?\d*$/.test(value)) return;
                updated[index] = { ...updated[index], [field]: value };
                setSizePrices(updated);
        };
        const handleRemoveSizePrice = (index: number) => {
                if (sizePrices.length > 1) setSizePrices(sizePrices.filter((_, i) => i !== index));
                else toast.error("Cần ít nhất một size/giá.");
        };
        const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                                toast.error("Ảnh không quá 2MB!");
                                e.target.value = "";
                                return;
                        }
                        setImage(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                } else {
                        setImage(null);
                        setImagePreview(null);
                }
        };
        const handleSaveNewCategory = async () => {
                if (!newCategoryName.trim()) return toast.error("Nhập tên danh mục!");
                const loadingToast = toast.loading("Đang tạo...");
                try {
                        await createNewCategory({ cateName: newCategoryName.trim() });
                        toast.dismiss(loadingToast);
                        const currentError = useCategoryStore.getState().error;
                        if (currentError) {
                                toast.error(`Tạo thất bại: ${currentError}`);
                        } else {
                                toast.success("Tạo danh mục thành công!");
                                setNewCategoryName("");
                                setShowNewCategory(false);
                        }

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                        toast.dismiss(loadingToast);
                        toast.error(`Tạo thất bại: ${error.message || "Lỗi không xác định"}`);
                }
        };
        const handleSaveNewSize = async () => {
                if (!newSizeName.trim()) return toast.error("Nhập tên kích thước!");
                const loadingToast = toast.loading("Đang tạo...");
                try {
                        await createNewSize({ name: newSizeName.trim() });
                        toast.dismiss(loadingToast);
                        const currentError = useSizeStore.getState().error;
                        if (currentError) {
                                toast.error(`Tạo thất bại: ${currentError}`);
                        } else {
                                toast.success("Tạo kích thước thành công!");
                                setNewSizeName("");
                                setShowNewSize(false);
                        }
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                        toast.dismiss(loadingToast);
                        toast.error(`Tạo thất bại: ${error.message || "Lỗi không xác định"}`);
                }
        };

        const handleCreate = async () => {
                if (!productName.trim()) return toast.error("Nhập tên sản phẩm!");
                if (!categoryId) return toast.error("Chọn danh mục!");
                if (!image) return toast.error("Chọn ảnh sản phẩm!");
                if (!restaurantId) return toast.error("Lỗi: Thiếu ID nhà hàng!");
                const validSizePrices = sizePrices.filter(
                        (sp) => sp.sizeId && sp.price !== "" && Number(sp.price) >= 0
                );
                if (validSizePrices.length === 0) return toast.error("Cần ít nhất một size/giá hợp lệ.");
                const sizeIds = validSizePrices.map((sp) => sp.sizeId);
                if (new Set(sizeIds).size !== sizeIds.length) return toast.error("Không chọn trùng kích thước.");

                const productData = {
                        productName: productName.trim(),
                        description: description.trim(),
                        categoryId,
                        available,
                        restaurantId,
                        sizeIds: validSizePrices.map((sp) => ({ sizeId: sp.sizeId, price: Number(sp.price) })),
                };

                const loadingToast = toast.loading("Đang tạo sản phẩm...");

                try {
                        await createNewProduct(productData, image);
                        toast.dismiss(loadingToast);
                        const currentError = useProductStore.getState().error;
                        if (currentError) {
                                toast.error(`Tạo thất bại: ${currentError}`);
                        } else {
                                toast.success("Tạo sản phẩm thành công! 🎉");

                                setProductName("");
                                setDescription("");
                                setCategoryId("");
                                setSizePrices([{ sizeId: "", price: "" }]);
                                setImage(null);
                                setImagePreview(null);
                                setAvailable(true);
                        }
                        //eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (err: any) {
                        toast.dismiss(loadingToast);
                        toast.error(`Tạo thất bại: ${err.message || "Lỗi không xác định"}`);
                }
        };

        // Combine loading states
        const isProcessing = categoryLoading || sizeLoading || productLoading;

        // Lấy danh sách hợp lệ từ store (xử lý null/undefined)
        const validCategories = Array.isArray(categories) ? categories : [];
        const validSizes = Array.isArray(sizes) ? sizes : [];

        return (
                <div className="min-h-screen bg-gray-50 pb-10">
                        <Toaster position="top-center" reverseOrder={false} />
                        <div className="bg-white border-b sticky top-0 z-10">
                                {" "}
                                <div className="px-6 py-4">
                                        {" "}
                                        <div className="flex items-center gap-2 mb-4">
                                                {" "}
                                                <Link
                                                        href="/merchant/restaurant/menu-items"
                                                        className="p-1 rounded hover:bg-gray-100"
                                                >
                                                        {" "}
                                                        <ChevronLeft className="w-5 h-5 text-gray-600" />{" "}
                                                </Link>{" "}
                                                <h1 className="text-xl font-semibold text-gray-900">Menu</h1>{" "}
                                                <span className="text-gray-400 font-medium">/ Tạo món mới</span>{" "}
                                        </div>{" "}
                                        <div className="flex items-center gap-3">
                                                {" "}
                                                <button
                                                        onClick={handleCreate}
                                                        disabled={isProcessing}
                                                        className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                        {" "}
                                                        {isProcessing ? (
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                                <Save className="w-4 h-4 mr-2" />
                                                        )}{" "}
                                                        {isProcessing ? "Đang lưu..." : "Lưu món"}{" "}
                                                </button>{" "}
                                                <Link
                                                        href="/merchant/restaurant/menu-items"
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                >
                                                        {" "}
                                                        Hủy{" "}
                                                </Link>{" "}
                                        </div>{" "}
                                </div>{" "}
                        </div>

                        {/* Form */}
                        <div className="px-6 pt-6">
                                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6 max-w-4xl mx-auto">
                                        {/* --- Tên sản phẩm  --- */}
                                        <div>
                                                {" "}
                                                <label
                                                        htmlFor="productName"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        {" "}
                                                        Tên sản phẩm <span className="text-red-500">*</span>{" "}
                                                </label>{" "}
                                                <input
                                                        id="productName"
                                                        type="text"
                                                        value={productName}
                                                        onChange={(e) => setProductName(e.target.value)}
                                                        placeholder="Ví dụ: Cà phê sữa đá"
                                                        className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                        maxLength={100}
                                                />{" "}
                                        </div>

                                        {/* Danh mục */}
                                        <div>
                                                <div className="flex justify-between items-center mb-1">
                                                        {" "}
                                                        <label
                                                                htmlFor="category"
                                                                className="block text-sm font-medium text-gray-700"
                                                        >
                                                                {" "}
                                                                Danh mục <span className="text-red-500">*</span>{" "}
                                                        </label>{" "}
                                                        {!showNewCategory && (
                                                                <button
                                                                        type="button"
                                                                        onClick={() => setShowNewCategory(true)}
                                                                        className="flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                                                                        disabled={isProcessing}
                                                                >
                                                                        {" "}
                                                                        <Plus className="w-4 h-4 mr-1" /> Tạo mới{" "}
                                                                </button>
                                                        )}{" "}
                                                </div>
                                                {!showNewCategory ? (
                                                        <select
                                                                id="category"
                                                                value={categoryId}
                                                                onChange={(e) => setCategoryId(e.target.value)}
                                                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                                                disabled={isProcessing}
                                                        >
                                                                <option value="">-- Chọn danh mục --</option>
                                                                {/* ✅ Sử dụng validCategories */}
                                                                {validCategories.map((c) => (
                                                                        <option key={c.id} value={c.id}>
                                                                                {c.cateName}
                                                                        </option>
                                                                ))}
                                                        </select>
                                                ) : (
                                                        <div className="flex gap-2 items-center">
                                                                {" "}
                                                                <input
                                                                        type="text"
                                                                        value={newCategoryName}
                                                                        onChange={(e) =>
                                                                                setNewCategoryName(e.target.value)
                                                                        }
                                                                        placeholder="Tên danh mục mới..."
                                                                        className="flex-grow px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                                        disabled={categoryLoading}
                                                                />{" "}
                                                                <button
                                                                        type="button"
                                                                        onClick={handleSaveNewCategory}
                                                                        disabled={categoryLoading}
                                                                        className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium disabled:opacity-50 inline-flex items-center"
                                                                >
                                                                        {" "}
                                                                        {categoryLoading ? (
                                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                                "Lưu"
                                                                        )}{" "}
                                                                </button>{" "}
                                                                <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                                setShowNewCategory(false);
                                                                                setNewCategoryName("");
                                                                        }}
                                                                        disabled={categoryLoading}
                                                                        className="p-2 text-gray-500 hover:text-red-500 rounded hover:bg-gray-100 disabled:opacity-50"
                                                                        title="Hủy"
                                                                >
                                                                        {" "}
                                                                        <X className="w-5 h-5" />{" "}
                                                                </button>{" "}
                                                        </div>
                                                )}
                                        </div>

                                        {/* Kích thước & Giá */}
                                        <div className="border-t pt-6">
                                                <div className="flex justify-between items-center mb-3">
                                                        {" "}
                                                        <div>
                                                                {" "}
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                        {" "}
                                                                        Kích thước & Giá{" "}
                                                                        <span className="text-red-500">*</span>
                                                                </label>{" "}
                                                                <p className="text-xs text-gray-500">
                                                                        Thêm các lựa chọn size và giá.
                                                                </p>{" "}
                                                        </div>{" "}
                                                        {!showNewSize && (
                                                                <button
                                                                        type="button"
                                                                        onClick={() => setShowNewSize(true)}
                                                                        className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                                                                        disabled={isProcessing}
                                                                >
                                                                        {" "}
                                                                        <Plus className="w-4 h-4 mr-1" /> Thêm loại size{" "}
                                                                </button>
                                                        )}{" "}
                                                </div>
                                                {showNewSize && (
                                                        <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-md border items-center">
                                                                {" "}
                                                                <input
                                                                        type="text"
                                                                        value={newSizeName}
                                                                        onChange={(e) => setNewSizeName(e.target.value)}
                                                                        placeholder="Tên size (Vd: Nhỏ, Vừa, Lớn)"
                                                                        className="flex-grow px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                                        disabled={sizeLoading}
                                                                />{" "}
                                                                <button
                                                                        type="button"
                                                                        onClick={handleSaveNewSize}
                                                                        disabled={sizeLoading}
                                                                        className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium disabled:opacity-50 inline-flex items-center"
                                                                >
                                                                        {" "}
                                                                        {sizeLoading ? (
                                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                                "Lưu"
                                                                        )}{" "}
                                                                </button>{" "}
                                                                <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                                setShowNewSize(false);
                                                                                setNewSizeName("");
                                                                        }}
                                                                        disabled={sizeLoading}
                                                                        className="p-2 text-gray-500 hover:text-red-500 rounded hover:bg-gray-100 disabled:opacity-50"
                                                                        title="Hủy"
                                                                >
                                                                        {" "}
                                                                        <X className="w-5 h-5" />{" "}
                                                                </button>{" "}
                                                        </div>
                                                )}
                                                <div className="space-y-3">
                                                        {sizePrices.map((sp, index) => (
                                                                <div key={index} className="flex gap-3 items-center">
                                                                        <div className="flex-1">
                                                                                <select
                                                                                        title="Chọn size"
                                                                                        value={sp.sizeId}
                                                                                        onChange={(e) =>
                                                                                                handleSizePriceChange(
                                                                                                        index,
                                                                                                        "sizeId",
                                                                                                        e.target.value
                                                                                                )
                                                                                        }
                                                                                        className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                                                                        disabled={isProcessing}
                                                                                >
                                                                                        <option value="">
                                                                                                -- Chọn size --
                                                                                        </option>
                                                                                        {/* ✅ Sử dụng validSizes */}
                                                                                        {validSizes.map((s) => (
                                                                                                <option
                                                                                                        key={s.id}
                                                                                                        value={s.id}
                                                                                                >
                                                                                                        {s.name}
                                                                                                </option>
                                                                                        ))}
                                                                                </select>
                                                                        </div>
                                                                        <div className="w-1/3 relative">
                                                                                {" "}
                                                                                <input
                                                                                        type="text"
                                                                                        inputMode="numeric"
                                                                                        value={sp.price}
                                                                                        onChange={(e) =>
                                                                                                handleSizePriceChange(
                                                                                                        index,
                                                                                                        "price",
                                                                                                        e.target.value
                                                                                                )
                                                                                        }
                                                                                        placeholder="Giá bán"
                                                                                        className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pl-7"
                                                                                        disabled={isProcessing}
                                                                                />{" "}
                                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                                                                        ₫
                                                                                </span>{" "}
                                                                        </div>
                                                                        {sizePrices.length > 1 && (
                                                                                <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                                handleRemoveSizePrice(
                                                                                                        index
                                                                                                )
                                                                                        }
                                                                                        disabled={isProcessing}
                                                                                        className="p-2 text-red-500 hover:text-red-700 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                        title="Xóa"
                                                                                >
                                                                                        {" "}
                                                                                        <Trash2 className="w-4 h-4" />{" "}
                                                                                </button>
                                                                        )}
                                                                </div>
                                                        ))}
                                                </div>
                                                <button
                                                        type="button"
                                                        onClick={handleAddSizePrice}
                                                        disabled={isProcessing}
                                                        className="flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium mt-3 disabled:opacity-50"
                                                >
                                                        {" "}
                                                        <Plus className="w-4 h-4 mr-1" /> Thêm lựa chọn giá/size{" "}
                                                </button>
                                        </div>

                                        {/* --- Mô tả, Trạng thái, Ảnh sản phẩm (giữ nguyên) --- */}
                                        <div className="border-t pt-6">
                                                {" "}
                                                <label
                                                        htmlFor="description"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        {" "}
                                                        Mô tả <span className="text-gray-500">
                                                                (Không bắt buộc)
                                                        </span>{" "}
                                                </label>{" "}
                                                <textarea
                                                        id="description"
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                        rows={4}
                                                        placeholder="Mô tả chi tiết..."
                                                        className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                        maxLength={500}
                                                />{" "}
                                                <p className="text-xs text-gray-500 mt-1 text-right">
                                                        {description.length}/500
                                                </p>{" "}
                                        </div>
                                        <div className="border-t pt-6">
                                                {" "}
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {" "}
                                                        Trạng thái bán{" "}
                                                </label>{" "}
                                                <div className="flex items-center">
                                                        {" "}
                                                        <button
                                                                type="button"
                                                                onClick={() => setAvailable(!available)}
                                                                disabled={isProcessing}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 ${
                                                                        available ? "bg-orange-500" : "bg-gray-300"
                                                                }`}
                                                        >
                                                                {" "}
                                                                <span
                                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                                available
                                                                                        ? "translate-x-6"
                                                                                        : "translate-x-1"
                                                                        }`}
                                                                />{" "}
                                                        </button>{" "}
                                                        <span className="ml-3 text-sm text-gray-700">
                                                                {" "}
                                                                {available ? "Đang bán" : "Tạm dừng"}{" "}
                                                        </span>{" "}
                                                </div>{" "}
                                                <p className="text-xs text-gray-500 mt-1">
                                                        {available ? "Hiển thị trên menu." : "Ẩn khỏi menu."}
                                                </p>{" "}
                                        </div>
                                        <div className="border-t pt-6">
                                                {" "}
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {" "}
                                                        Ảnh sản phẩm <span className="text-red-500">*</span>{" "}
                                                        <span className="text-gray-500 text-xs">(Tối đa 2MB)</span>{" "}
                                                </label>{" "}
                                                <div className="flex items-center gap-4">
                                                        {" "}
                                                        <label
                                                                htmlFor="image-upload"
                                                                className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center hover:border-orange-400 transition-colors ${
                                                                        imagePreview ? "w-auto" : "w-full"
                                                                } ${
                                                                        isProcessing
                                                                                ? "opacity-50 cursor-not-allowed"
                                                                                : ""
                                                                }`}
                                                        >
                                                                {" "}
                                                                <input
                                                                        id="image-upload"
                                                                        type="file"
                                                                        accept="image/png, image/jpeg, image/webp"
                                                                        onChange={handleImageUpload}
                                                                        className="hidden"
                                                                        disabled={isProcessing}
                                                                />{" "}
                                                                {!imagePreview && (
                                                                        <div className="text-sm text-gray-500">
                                                                                {" "}
                                                                                <UploadCloud className="w-8 h-8 mx-auto mb-2 text-gray-400" />{" "}
                                                                                Kéo thả hoặc nhấn chọn ảnh{" "}
                                                                                <p className="text-xs mt-1">
                                                                                        PNG, JPG, WEBP (tối đa 2MB)
                                                                                </p>{" "}
                                                                        </div>
                                                                )}{" "}
                                                                {imagePreview && (
                                                                        <span className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                                                                {" "}
                                                                                Chọn ảnh khác{" "}
                                                                        </span>
                                                                )}{" "}
                                                        </label>{" "}
                                                        {imagePreview && (
                                                                <div className="relative w-32 h-32 border rounded-md overflow-hidden flex-shrink-0">
                                                                        {" "}
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img
                                                                                src={imagePreview}
                                                                                alt="Xem trước"
                                                                                className="object-cover w-full h-full"
                                                                        />{" "}
                                                                        <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                        setImage(null);
                                                                                        setImagePreview(null);
                                                                                        const input =
                                                                                                document.getElementById(
                                                                                                        "image-upload"
                                                                                                ) as HTMLInputElement;
                                                                                        if (input) input.value = "";
                                                                                }}
                                                                                disabled={isProcessing}
                                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50"
                                                                                title="Xóa ảnh"
                                                                        >
                                                                                {" "}
                                                                                <X className="w-3 h-3" />{" "}
                                                                        </button>{" "}
                                                                </div>
                                                        )}{" "}
                                                </div>{" "}
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
