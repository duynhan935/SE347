/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CommonImages } from "@/constants";
import { useCategoryStore } from "@/stores/categoryStore";
import { useSizeStore } from "@/stores/sizeStore";
import { useProductStore } from "@/stores/useProductsStores";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { Product, SizePrice } from "@/types";
import { ChevronLeft, Loader2, Pencil, Plus, Save, Trash2, UploadCloud, X } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface MenuFormData {
        id: string;
        productName: string;
        description: string;
        categoryId: string;
        available: boolean;
        restaurantId: string;
        sizePrices: SizePrice[];
}

export default function MenuEditForm() {
        const { id: productId } = useParams();
        const router = useRouter();

        const {
                product,
                fetchProductByProductId,
                updateProduct,
                deleteProduct,
                loading: productLoading,
                error: productError,
        } = useProductStore();
        const {
                categories,
                fetchAllCategories,
                createNewCategory,
                loading: categoryLoading,
                error: categoryError,
        } = useCategoryStore();
        const { sizes, fetchAllSizes, createNewSize, loading: sizeLoading, error: sizeError } = useSizeStore();
        const { getRestaurantByMerchantId } = useRestaurantStore();
        const restaurantIdFromStore = useRestaurantStore((state) => state.restaurant?.id ?? "");

        const [formData, setFormData] = useState<Partial<MenuFormData>>({});
        const [initialFormData, setInitialFormData] = useState<Partial<MenuFormData>>({});
        const [image, setImage] = useState<File | null>(null);
        const [imagePreview, setImagePreview] = useState<string | StaticImageData | null>(null);
        const [isEditing, setIsEditing] = useState(false);
        const [showNewCategory, setShowNewCategory] = useState(false);
        const [newCategoryName, setNewCategoryName] = useState("");
        const [showNewSize, setShowNewSize] = useState(false);
        const [newSizeName, setNewSizeName] = useState("");

        const initializeForm = useCallback(
                (productData: Product | null, restaurantId: string) => {
                        if (productData) {
                                const initialData: MenuFormData = {
                                        id: productData.id,
                                        productName: productData.productName || "",
                                        description: productData.description || "",
                                        categoryId: productData.categoryId || "",
                                        available: productData.available ?? false,
                                        restaurantId: restaurantId || productData.restaurant?.id || "",
                                        sizePrices:
                                                productData.productSizes?.length > 0
                                                        ? productData.productSizes.map((s: any) => ({
                                                                  sizeId: s.sizeId,
                                                                  price: s.price?.toString() ?? "",
                                                          }))
                                                        : [{ sizeId: "", price: "" }],
                                };
                                setFormData(initialData);
                                setInitialFormData(initialData);
                                setImagePreview(productData?.imageURL || null);
                        } else {
                                toast.error("Không tìm thấy thông tin sản phẩm!");
                                router.push("/merchant/restaurant/menu-items");
                        }
                },
                [router]
        );

        useEffect(() => {
                const merchantId = "testmerchantid";
                if (merchantId && !restaurantIdFromStore) {
                        getRestaurantByMerchantId(merchantId);
                }
                fetchAllCategories();
                fetchAllSizes();
                if (productId) {
                        fetchProductByProductId(productId as string);
                } else {
                        toast.error("ID sản phẩm không hợp lệ!");
                        router.push("/merchant/restaurant/menu-items");
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [productId, fetchProductByProductId, fetchAllCategories, fetchAllSizes, getRestaurantByMerchantId, router]);
        useEffect(() => {
                if (product && restaurantIdFromStore) {
                        initializeForm(product, restaurantIdFromStore);
                }
        }, [product, restaurantIdFromStore, initializeForm]);

        const handleChange = (field: keyof MenuFormData, value: any) => {
                if (!isEditing) return;
                setFormData((prev) => ({ ...prev, [field]: value }));
        };

        const handleSizePriceChange = (index: number, field: keyof SizePrice, value: string) => {
                if (!isEditing) return;
                const updated = [...(formData.sizePrices || [])];
                if (field === "price" && value !== "" && !/^\d*\.?\d*$/.test(value)) return;
                updated[index] = { ...updated[index], [field]: value };
                setFormData((prev) => ({ ...prev, sizePrices: updated }));
        };
        const handleAddSizePrice = () => {
                if (!isEditing) return;
                setFormData((prev) => ({
                        ...prev,
                        sizePrices: [...(prev.sizePrices || []), { sizeId: "", price: "" }],
                }));
        };
        const handleRemoveSizePrice = (index: number) => {
                if (!isEditing) return;
                const current = formData.sizePrices || [];
                if (current.length > 1) {
                        setFormData((prev) => ({ ...prev, sizePrices: current.filter((_, i) => i !== index) }));
                } else {
                        toast.error("Cần ít nhất một size/giá.");
                }
        };
        const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!isEditing) return;
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
                }
        };

        const handleSaveNewCategory = async () => {
                if (!isEditing || !newCategoryName.trim()) return;
                const loadingToast = toast.loading("Đang tạo...");
                try {
                        await createNewCategory({ cateName: newCategoryName.trim() });
                        toast.dismiss(loadingToast);
                        const currentError = useCategoryStore.getState().error;
                        if (currentError) toast.error(`Tạo thất bại: ${currentError}`);
                        else {
                                toast.success("Tạo danh mục thành công!");
                                setNewCategoryName("");
                                setShowNewCategory(false);
                        }
                } catch (error: any) {
                        toast.dismiss(loadingToast);
                        toast.error(`Tạo thất bại: ${error.message || "Lỗi"}`);
                }
        };

        // ✅ Hàm tạo size mới (dùng createNewSize)
        const handleSaveNewSize = async () => {
                if (!isEditing || !newSizeName.trim()) return;
                const loadingToast = toast.loading("Đang tạo...");
                try {
                        await createNewSize({ name: newSizeName.trim() }); // ✅ Gọi hàm store
                        toast.dismiss(loadingToast);
                        const currentError = useSizeStore.getState().error;
                        if (currentError) toast.error(`Tạo thất bại: ${currentError}`);
                        else {
                                toast.success("Tạo kích thước thành công!");
                                setNewSizeName("");
                                setShowNewSize(false);
                        }
                } catch (error: any) {
                        toast.dismiss(loadingToast);
                        toast.error(`Tạo thất bại: ${error.message || "Lỗi"}`);
                }
        };

        // ✅ Hàm xử lý lưu thay đổi (giữ nguyên logic gọi updateProduct)
        const handleSave = async () => {
                if (!formData.id || !product) return toast.error("Lỗi: Không tìm thấy sản phẩm!");
                // --- Validation ---
                if (!formData.productName?.trim()) return toast.error("Tên sản phẩm trống!");
                if (!formData.categoryId) return toast.error("Chưa chọn danh mục!");
                if (!imagePreview && !image) return toast.error("Chưa chọn ảnh!");
                if (!formData.restaurantId) return toast.error("Lỗi: Thiếu ID nhà hàng!");
                const validSizePrices = (formData.sizePrices || []).filter(
                        (sp) => sp.sizeId && sp.price !== "" && Number(sp.price) >= 0
                );
                if (validSizePrices.length === 0) return toast.error("Cần ít nhất một size/giá hợp lệ.");
                const sizeIds = validSizePrices.map((sp) => sp.sizeId);
                if (new Set(sizeIds).size !== sizeIds.length) return toast.error("Không chọn trùng kích thước.");
                // --- Kết thúc Validation ---

                const updatedProductData = {
                        productName: formData.productName.trim(),
                        description: formData.description?.trim() || "",
                        categoryId: formData.categoryId,
                        available: formData.available ?? false,
                        restaurantId: formData.restaurantId,
                        sizeIds: validSizePrices.map((sp) => ({ sizeId: sp.sizeId, price: Number(sp.price) })),
                };

                // So sánh thay đổi
                const initialValidSizePrices = (initialFormData.sizePrices || [])
                        .filter((sp) => sp.sizeId && sp.price !== "" && Number(sp.price) >= 0)
                        .map((sp) => ({ sizeId: sp.sizeId, price: Number(sp.price) }));
                const hasFormChanges =
                        updatedProductData.productName !== initialFormData.productName?.trim() ||
                        updatedProductData.description !== (initialFormData.description?.trim() || "") ||
                        updatedProductData.categoryId !== initialFormData.categoryId ||
                        updatedProductData.available !== (initialFormData.available ?? false) ||
                        JSON.stringify(
                                updatedProductData.sizeIds.slice().sort((a, b) => a.sizeId.localeCompare(b.sizeId))
                        ) !==
                                JSON.stringify(
                                        initialValidSizePrices.slice().sort((a, b) => a.sizeId.localeCompare(b.sizeId))
                                );

                if (!hasFormChanges && !image) {
                        toast("Không có thay đổi.", { icon: "🤷" });
                        setIsEditing(false);
                        return;
                }

                const loadingToast = toast.loading("Đang cập nhật...");
                try {
                        await updateProduct(formData.id, updatedProductData, image ?? undefined); // Gọi hàm từ useProductStore
                        toast.dismiss(loadingToast);
                        const currentError = useProductStore.getState().error;
                        if (currentError) {
                                toast.error(`Cập nhật thất bại: ${currentError}`);
                        } else {
                                toast.success("Cập nhật thành công! ✨");
                                setInitialFormData(formData); // Cập nhật trạng thái gốc
                                setImage(null); // Reset file ảnh
                                setIsEditing(false);
                                if (productId) fetchProductByProductId(productId as string); // Fetch lại data mới
                        }
                } catch (err: any) {
                        // Lỗi mạng etc.
                        toast.dismiss(loadingToast);
                        toast.error(`Cập nhật thất bại: ${err.message || "Lỗi"}`);
                }
        };

        // --- Hàm handleDelete, handleCancelEdit (giữ nguyên) ---
        const handleDelete = async () => {
                if (!formData.id) return toast.error("Lỗi: Thiếu ID sản phẩm!");
                if (window.confirm(`Xóa món "${formData.productName}"?`)) {
                        const lt = toast.loading("Đang xóa...");
                        try {
                                await deleteProduct(formData.id);
                                toast.dismiss(lt);
                                const ce = useProductStore.getState().error;
                                if (ce) toast.error(`Xóa thất bại: ${ce}`);
                                else {
                                        toast.success("Xóa thành công!");
                                        router.push("/merchant/restaurant/menu-items");
                                }
                        } catch (err: any) {
                                toast.dismiss(lt);
                                toast.error(`Xóa thất bại: ${err.message || "Lỗi"}`);
                        }
                }
        };
        const handleCancelEdit = () => {
                setFormData(initialFormData);
                setImage(null);
                setImagePreview(product?.imageURL || null);
                setIsEditing(false);
                setShowNewCategory(false);
                setShowNewSize(false);
                toast("Đã hủy thay đổi.", { icon: "↩️" });
        };
        // --- Kết thúc hàm ---

        // --- Loading & Error Handling ---
        const isLoadingData = (productLoading && !product) || categoryLoading || sizeLoading;
        const isProcessing = productLoading || categoryLoading || sizeLoading;
        if (isLoadingData && !Object.keys(formData).length) {
                return (
                        <div className="flex justify-center items-center h-screen">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        </div>
                );
        }
        if (productError && !product) {
                return <div className="p-6 text-center text-red-600">Lỗi tải dữ liệu sản phẩm: {productError}</div>;
        }

        const displayImage = imagePreview || CommonImages.yeye;
        const validCategories = Array.isArray(categories) ? categories : [];
        const validSizes = Array.isArray(sizes) ? sizes : [];

        return (
                <div className="min-h-screen bg-gray-50 pb-10">
                        <Toaster position="top-center" reverseOrder={false} />
                        {/* --- Header  --- */}
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
                                                <span className="text-gray-400 font-medium">/ Chỉnh sửa món</span>{" "}
                                        </div>{" "}
                                        <div className="flex items-center gap-3">
                                                {" "}
                                                {isEditing ? (
                                                        <>
                                                                {" "}
                                                                <button
                                                                        onClick={handleSave}
                                                                        disabled={isProcessing}
                                                                        className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                        {" "}
                                                                        {isProcessing ? (
                                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                        ) : (
                                                                                <Save className="w-4 h-4 mr-2" />
                                                                        )}{" "}
                                                                        {isProcessing ? "Đang lưu..." : "Lưu thay đổi"}{" "}
                                                                </button>{" "}
                                                                <button
                                                                        onClick={handleCancelEdit}
                                                                        disabled={isProcessing}
                                                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                                                >
                                                                        {" "}
                                                                        Hủy{" "}
                                                                </button>{" "}
                                                        </>
                                                ) : (
                                                        <button
                                                                onClick={() => setIsEditing(true)}
                                                                className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
                                                        >
                                                                {" "}
                                                                <Pencil size={16} className="mr-2" /> Chỉnh sửa{" "}
                                                        </button>
                                                )}{" "}
                                                <button
                                                        onClick={handleDelete}
                                                        disabled={isProcessing || isEditing}
                                                        className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                                                >
                                                        {" "}
                                                        <Trash2 size={16} className="mr-2" /> Xóa món{" "}
                                                </button>{" "}
                                        </div>{" "}
                                </div>{" "}
                        </div>

                        {/* Form */}
                        <div className="px-6 pt-6">
                                {!isEditing && Object.keys(formData).length > 0 && (
                                        <div
                                                className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md mb-6 max-w-4xl mx-auto text-sm"
                                                role="alert"
                                        >
                                                {" "}
                                                <p>
                                                        <span className="font-medium">Xem thông tin món ăn.</span> Nhấn
                                                        &quot;Chỉnh sửa&quot; để thay đổi.
                                                </p>{" "}
                                        </div>
                                )}
                                {Object.keys(formData).length > 0 ? (
                                        <div
                                                className={`bg-white rounded-lg shadow-sm border p-6 space-y-6 max-w-4xl mx-auto ${
                                                        !isEditing ? "opacity-70 pointer-events-none" : ""
                                                }`}
                                        >
                                                <div>
                                                        {" "}
                                                        <label
                                                                htmlFor="productName"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                Tên sản phẩm <span className="text-red-500">*</span>
                                                        </label>{" "}
                                                        <input
                                                                id="productName"
                                                                type="text"
                                                                value={formData.productName || ""}
                                                                onChange={(e) =>
                                                                        handleChange("productName", e.target.value)
                                                                }
                                                                disabled={!isEditing || isProcessing}
                                                                readOnly={!isEditing}
                                                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 read-only:bg-gray-100 read-only:cursor-not-allowed"
                                                                maxLength={100}
                                                        />{" "}
                                                </div>
                                                <div>
                                                        {" "}
                                                        <div className="flex justify-between items-center mb-1">
                                                                {" "}
                                                                <label
                                                                        htmlFor="category"
                                                                        className="block text-sm font-medium text-gray-700"
                                                                >
                                                                        {" "}
                                                                        Danh mục <span className="text-red-500">
                                                                                *
                                                                        </span>{" "}
                                                                </label>{" "}
                                                                {isEditing && !showNewCategory && (
                                                                        <button
                                                                                type="button"
                                                                                onClick={() => setShowNewCategory(true)}
                                                                                className="flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                                                                                disabled={isProcessing}
                                                                        >
                                                                                {" "}
                                                                                <Plus className="w-4 h-4 mr-1" /> Tạo
                                                                                mới{" "}
                                                                        </button>
                                                                )}{" "}
                                                        </div>{" "}
                                                        {!showNewCategory ? (
                                                                <select
                                                                        id="category"
                                                                        value={formData.categoryId || ""}
                                                                        onChange={(e) =>
                                                                                handleChange(
                                                                                        "categoryId",
                                                                                        e.target.value
                                                                                )
                                                                        }
                                                                        disabled={!isEditing || isProcessing}
                                                                        className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                >
                                                                        {" "}
                                                                        <option value="">
                                                                                -- Chọn danh mục --
                                                                        </option>{" "}
                                                                        {validCategories.map((c) => (
                                                                                <option key={c.id} value={c.id}>
                                                                                        {c.cateName}
                                                                                </option>
                                                                        ))}{" "}
                                                                </select>
                                                        ) : (
                                                                <div className="flex gap-2 items-center">
                                                                        {" "}
                                                                        <input
                                                                                type="text"
                                                                                value={newCategoryName}
                                                                                onChange={(e) =>
                                                                                        setNewCategoryName(
                                                                                                e.target.value
                                                                                        )
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
                                                        )}{" "}
                                                </div>
                                                <div className="border-t pt-6">
                                                        {" "}
                                                        <div className="flex justify-between items-center mb-3">
                                                                {" "}
                                                                <div>
                                                                        {" "}
                                                                        <label className="block text-sm font-medium text-gray-700">
                                                                                {" "}
                                                                                Kích thước & Giá{" "}
                                                                                <span className="text-red-500">
                                                                                        *
                                                                                </span>{" "}
                                                                        </label>{" "}
                                                                        <p className="text-xs text-gray-500">
                                                                                Chỉnh sửa hoặc thêm lựa chọn.
                                                                        </p>{" "}
                                                                </div>{" "}
                                                                {isEditing && !showNewSize && (
                                                                        <button
                                                                                type="button"
                                                                                onClick={() => setShowNewSize(true)}
                                                                                className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                                                                                disabled={isProcessing}
                                                                        >
                                                                                {" "}
                                                                                <Plus className="w-4 h-4 mr-1" /> Thêm
                                                                                loại size{" "}
                                                                        </button>
                                                                )}{" "}
                                                        </div>{" "}
                                                        {isEditing && showNewSize && (
                                                                <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-md border items-center">
                                                                        {" "}
                                                                        <input
                                                                                type="text"
                                                                                value={newSizeName}
                                                                                onChange={(e) =>
                                                                                        setNewSizeName(e.target.value)
                                                                                }
                                                                                placeholder="Tên size mới..."
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
                                                        )}{" "}
                                                        <div className="space-y-3">
                                                                {" "}
                                                                {(formData.sizePrices || []).map((sp, index) => (
                                                                        <div
                                                                                key={index}
                                                                                className="flex gap-3 items-center"
                                                                        >
                                                                                {" "}
                                                                                <div className="flex-1">
                                                                                        {" "}
                                                                                        <select
                                                                                                title="Chọn size"
                                                                                                value={sp.sizeId}
                                                                                                onChange={(e) =>
                                                                                                        handleSizePriceChange(
                                                                                                                index,
                                                                                                                "sizeId",
                                                                                                                e.target
                                                                                                                        .value
                                                                                                        )
                                                                                                }
                                                                                                disabled={
                                                                                                        !isEditing ||
                                                                                                        isProcessing
                                                                                                }
                                                                                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                                        >
                                                                                                {" "}
                                                                                                <option value="">
                                                                                                        -- Chọn size --
                                                                                                </option>{" "}
                                                                                                {validSizes.map((s) => (
                                                                                                        <option
                                                                                                                key={
                                                                                                                        s.id
                                                                                                                }
                                                                                                                value={
                                                                                                                        s.id
                                                                                                                }
                                                                                                        >
                                                                                                                {s.name}
                                                                                                        </option>
                                                                                                ))}{" "}
                                                                                        </select>{" "}
                                                                                </div>{" "}
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
                                                                                                                e.target
                                                                                                                        .value
                                                                                                        )
                                                                                                }
                                                                                                placeholder="Giá bán"
                                                                                                disabled={
                                                                                                        !isEditing ||
                                                                                                        isProcessing
                                                                                                }
                                                                                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pl-7 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                                                        />{" "}
                                                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                                                                                ₫
                                                                                        </span>{" "}
                                                                                </div>{" "}
                                                                                {isEditing &&
                                                                                        (formData.sizePrices || [])
                                                                                                .length > 1 && (
                                                                                                <button
                                                                                                        type="button"
                                                                                                        onClick={() =>
                                                                                                                handleRemoveSizePrice(
                                                                                                                        index
                                                                                                                )
                                                                                                        }
                                                                                                        disabled={
                                                                                                                isProcessing
                                                                                                        }
                                                                                                        className="p-2 text-red-500 hover:text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                                                                                                        title="Xóa"
                                                                                                >
                                                                                                        {" "}
                                                                                                        <Trash2 className="w-4 h-4" />{" "}
                                                                                                </button>
                                                                                        )}{" "}
                                                                        </div>
                                                                ))}{" "}
                                                        </div>{" "}
                                                        {isEditing && (
                                                                <button
                                                                        type="button"
                                                                        onClick={handleAddSizePrice}
                                                                        disabled={isProcessing}
                                                                        className="flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium mt-3 disabled:opacity-50"
                                                                >
                                                                        {" "}
                                                                        <Plus className="w-4 h-4 mr-1" /> Thêm lựa chọn{" "}
                                                                </button>
                                                        )}{" "}
                                                </div>
                                                <div className="border-t pt-6">
                                                        {" "}
                                                        <label
                                                                htmlFor="description"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                {" "}
                                                                Mô tả{" "}
                                                                <span className="text-gray-500">
                                                                        (Không bắt buộc)
                                                                </span>{" "}
                                                        </label>{" "}
                                                        <textarea
                                                                id="description"
                                                                value={formData.description || ""}
                                                                onChange={(e) =>
                                                                        handleChange("description", e.target.value)
                                                                }
                                                                rows={4}
                                                                disabled={!isEditing || isProcessing}
                                                                readOnly={!isEditing}
                                                                placeholder="Mô tả chi tiết..."
                                                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 read-only:bg-gray-100 read-only:cursor-not-allowed"
                                                                maxLength={500}
                                                        />{" "}
                                                        <p className="text-xs text-gray-500 mt-1 text-right">
                                                                {(formData.description || "").length}/500
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
                                                                        onClick={() =>
                                                                                handleChange(
                                                                                        "available",
                                                                                        !formData.available
                                                                                )
                                                                        }
                                                                        disabled={!isEditing || isProcessing}
                                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 ${
                                                                                formData.available
                                                                                        ? "bg-orange-500"
                                                                                        : "bg-gray-300"
                                                                        }`}
                                                                >
                                                                        {" "}
                                                                        <span
                                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                                        formData.available
                                                                                                ? "translate-x-6"
                                                                                                : "translate-x-1"
                                                                                }`}
                                                                        />{" "}
                                                                </button>{" "}
                                                                <span className="ml-3 text-sm text-gray-700">
                                                                        {" "}
                                                                        {formData.available
                                                                                ? "Đang bán"
                                                                                : "Tạm dừng"}{" "}
                                                                </span>{" "}
                                                        </div>{" "}
                                                        <p className="text-xs text-gray-500 mt-1">
                                                                {formData.available
                                                                        ? "Hiển thị trên menu."
                                                                        : "Ẩn khỏi menu."}
                                                        </p>{" "}
                                                </div>
                                                <div className="border-t pt-6">
                                                        {" "}
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                {" "}
                                                                Ảnh sản phẩm <span className="text-red-500">
                                                                        *
                                                                </span>{" "}
                                                                <span className="text-gray-500 text-xs">
                                                                        (Tối đa 2MB)
                                                                </span>{" "}
                                                        </label>{" "}
                                                        <div className="flex items-center gap-4">
                                                                {" "}
                                                                <label
                                                                        htmlFor="image-upload"
                                                                        className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center hover:border-orange-400 transition-colors ${
                                                                                !isEditing
                                                                                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                                                                                        : ""
                                                                        } ${
                                                                                !displayImage || image
                                                                                        ? "w-full"
                                                                                        : "w-auto"
                                                                        }`}
                                                                >
                                                                        {" "}
                                                                        <input
                                                                                id="image-upload"
                                                                                type="file"
                                                                                accept="image/png, image/jpeg, image/webp"
                                                                                onChange={handleImageUpload}
                                                                                className="hidden"
                                                                                disabled={!isEditing || isProcessing}
                                                                        />{" "}
                                                                        {(!displayImage || image) && (
                                                                                <div className="text-sm text-gray-500">
                                                                                        {" "}
                                                                                        <UploadCloud className="w-8 h-8 mx-auto mb-2 text-gray-400" />{" "}
                                                                                        Kéo thả hoặc nhấn chọn ảnh{" "}
                                                                                        <p className="text-xs mt-1">
                                                                                                PNG, JPG, WEBP (tối đa
                                                                                                2MB)
                                                                                        </p>{" "}
                                                                                </div>
                                                                        )}{" "}
                                                                        {displayImage && !image && isEditing && (
                                                                                <span className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                                                                        {" "}
                                                                                        Chọn ảnh khác{" "}
                                                                                </span>
                                                                        )}{" "}
                                                                        {image && (
                                                                                <p className="mt-2 text-xs text-green-600">
                                                                                        Đã chọn: {image.name}
                                                                                </p>
                                                                        )}{" "}
                                                                </label>{" "}
                                                                {displayImage && (
                                                                        <div className="relative w-32 h-32 border rounded-md overflow-hidden flex-shrink-0">
                                                                                {" "}
                                                                                <Image
                                                                                        src={displayImage}
                                                                                        alt="Ảnh sản phẩm"
                                                                                        layout="fill"
                                                                                        objectFit="cover"
                                                                                        onError={() =>
                                                                                                setImagePreview(
                                                                                                        CommonImages.yeye
                                                                                                )
                                                                                        }
                                                                                />{" "}
                                                                                {isEditing && image && (
                                                                                        <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                        setImage(null);
                                                                                                        setImagePreview(
                                                                                                                product?.imageURL ||
                                                                                                                        null
                                                                                                        );
                                                                                                        const input =
                                                                                                                document.getElementById(
                                                                                                                        "image-upload"
                                                                                                                ) as HTMLInputElement;
                                                                                                        if (input)
                                                                                                                input.value =
                                                                                                                        "";
                                                                                                }}
                                                                                                disabled={isProcessing}
                                                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50"
                                                                                                title="Hủy chọn ảnh mới"
                                                                                        >
                                                                                                {" "}
                                                                                                <X className="w-3 h-3" />{" "}
                                                                                        </button>
                                                                                )}{" "}
                                                                        </div>
                                                                )}{" "}
                                                        </div>{" "}
                                                </div>
                                                {/* --- Kết thúc --- */}
                                        </div>
                                ) : (
                                        // Hiển thị khi formData chưa load xong
                                        !productError && (
                                                <p className="text-center text-gray-500 py-10">
                                                        Đang tải chi tiết món ăn...
                                                </p>
                                        )
                                )}
                        </div>
                </div>
        );
}
