/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Save, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useProductStore } from "@/stores/useProductsStores";
import { useCategoryStore } from "@/stores/categoryStore";
import { useSizeStore } from "@/stores/sizeStore";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { CommonImages } from "@/constants";

interface SizePrice {
    sizeId: string;
    price: number;
}

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
    const { id } = useParams();
    const { product, fetchProductByProductId, updateProduct, loading, error } = useProductStore();
    const { categories, fetchAllCategories } = useCategoryStore();
    const { sizes, fetchAllSizes } = useSizeStore();
    const restaurantId = useRestaurantStore((state) => state.restaurant?.id ?? "");
    const { getRestaurantByMerchantId } = useRestaurantStore();

    const [formData, setFormData] = useState<MenuFormData>({
        id: "",
        productName: "",
        description: "",
        categoryId: "",
        available: false,
        restaurantId: "",
        sizePrices: [],
    });
    const [image, setImage] = useState<File | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // ✅ Fetch dữ liệu cần thiết
    useEffect(() => {
        if (id) fetchProductByProductId(id as string);
        fetchAllCategories();
        fetchAllSizes();
        const merchantId = "testmerchantid"; // tạm thời
        getRestaurantByMerchantId(merchantId);
    }, [id, fetchProductByProductId, fetchAllCategories, fetchAllSizes, getRestaurantByMerchantId]);

    // ✅ Khi có product thì set lại form
    useEffect(() => {
        if (product) {
            setFormData({
                id: product.id,
                productName: product.productName || "",
                description: product.description || "",
                categoryId: product.categoryId || "",
                available: product.available ?? false,
                restaurantId: restaurantId || "",
                sizePrices:
                    product.productSizes?.map((s: any) => ({
                        sizeId: s.sizeId,
                        price: s.price,
                    })) || [],
            });
        }
    }, [product, restaurantId]);

    // ✅ Xử lý thay đổi trường nhập
    const handleChange = (field: keyof MenuFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSizePriceChange = (index: number, field: keyof SizePrice, value: string | number) => {
        const updated = [...formData.sizePrices];
        updated[index] = { ...updated[index], [field]: value };
        setFormData((prev) => ({ ...prev, sizePrices: updated }));
    };

    const handleAddSizePrice = () => {
        setFormData((prev) => ({
            ...prev,
            sizePrices: [...prev.sizePrices, { sizeId: "", price: 0 }],
        }));
    };

    const handleRemoveSizePrice = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            sizePrices: prev.sizePrices.filter((_, i) => i !== index),
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImage(file);
    };

    const handleSave = async () => {
        if (!product) {
            alert("Không tìm thấy sản phẩm để cập nhật!");
            return;
        }

        // Giữ lại dữ liệu cũ nếu người dùng không chỉnh sửa
        const updatedProductData = {
            productName: formData.productName || product.productName,
            description: formData.description || product.description,
            categoryId: formData.categoryId || product.categoryId,
            available: formData.available !== undefined ? formData.available : product.available,
            restaurantId: formData.restaurantId || restaurantId,
            sizeIds:
                formData.sizePrices.length > 0
                    ? formData.sizePrices.filter((s) => s.sizeId && s.price > 0)
                    : product.productSizes?.map((s: any) => ({
                          sizeId: s.sizeId,
                          price: s.price,
                      })) || [],
        };

        // Kiểm tra xem có thay đổi gì không
        const hasChanges =
            updatedProductData.productName !== product.productName ||
            updatedProductData.description !== product.description ||
            updatedProductData.categoryId !== product.categoryId ||
            updatedProductData.available !== product.available ||
            JSON.stringify(updatedProductData.sizeIds) !==
                JSON.stringify(
                    product.productSizes?.map((s: any) => ({
                        sizeId: s.sizeId,
                        price: s.price,
                    }))
                ) ||
            image;

        if (!hasChanges) {
            alert("Không có thay đổi nào để lưu!");
            return;
        }

        try {
            await updateProduct(formData.id, updatedProductData, image ?? undefined);
            alert("Cập nhật sản phẩm thành công!");
            setIsEditing(false);
        } catch (err) {
            console.error("Lỗi cập nhật sản phẩm:", err);
            alert("Cập nhật sản phẩm thất bại!");
        }
    };

    const currentImage = product?.imageURL && product.imageURL.trim() !== "" ? product.imageURL : CommonImages.yeye;

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
        );

    if (error)
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-600">Lỗi: {error}</p>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="px-6 py-4">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/merchant/restaurant/menu-items" className="hover:text-gray-700">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <h1 className="text-xl font-semibold text-gray-900">Menu</h1>
                        <span className="text-gray-400">Edit</span>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={handleSave}
                            disabled={!isEditing}
                            className={`inline-flex items-center px-4 py-2 font-medium rounded-md transition-colors ${
                                isEditing
                                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            <Pencil size={18} className="inline-block mr-1 text-gray-400 hover:text-orange-500" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                        {/* Tên sản phẩm */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                            <input
                                type="text"
                                value={formData.productName}
                                onChange={(e) => handleChange("productName", e.target.value)}
                                disabled={!isEditing}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    isEditing
                                        ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        : "border-gray-200 bg-gray-50 text-gray-700"
                                }`}
                            />
                        </div>

                        {/* Danh mục */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => handleChange("categoryId", e.target.value)}
                                disabled={!isEditing}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    isEditing
                                        ? "border-gray-300 focus:ring-2 focus:ring-orange-500"
                                        : "border-gray-200 bg-gray-50 text-gray-700"
                                }`}
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.cateName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Kích thước & Giá */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Kích thước & Giá</label>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleAddSizePrice}
                                        className="flex items-center text-orange-500 hover:text-orange-600 text-sm"
                                    >
                                        + Thêm size
                                    </button>
                                )}
                            </div>
                            {formData.sizePrices.map((sp, index) => (
                                <div key={index} className="flex gap-3 mb-2">
                                    <select
                                        value={sp.sizeId}
                                        onChange={(e) => handleSizePriceChange(index, "sizeId", e.target.value)}
                                        disabled={!isEditing}
                                        className="w-1/2 px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="">-- Chọn size --</option>
                                        {sizes.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="0"
                                        value={sp.price}
                                        onChange={(e) => handleSizePriceChange(index, "price", Number(e.target.value))}
                                        disabled={!isEditing}
                                        placeholder="Giá"
                                        className="w-1/3 px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500"
                                    />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSizePrice(index)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Mô tả */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                rows={3}
                                disabled={!isEditing}
                                className={`w-full px-3 py-2 border rounded-md resize-none ${
                                    isEditing
                                        ? "border-gray-300 focus:ring-2 focus:ring-orange-500"
                                        : "border-gray-200 bg-gray-50 text-gray-700"
                                }`}
                            />
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => handleChange("available", !formData.available)}
                                    disabled={!isEditing}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        formData.available ? "bg-orange-500" : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            formData.available ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                                <span className="ml-3 text-sm text-gray-700">
                                    {formData.available ? "Enabled" : "Disabled"}
                                </span>
                            </div>
                        </div>

                        {/* Hình ảnh */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh sản phẩm</label>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col items-center">
                                    <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại</p>
                                    <Image
                                        src={currentImage}
                                        alt="Current Product"
                                        width={280}
                                        height={280}
                                        className="rounded-md border object-cover"
                                    />
                                </div>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={!isEditing}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className={`cursor-pointer text-sm ${
                                            isEditing
                                                ? "text-gray-500 hover:text-gray-700"
                                                : "text-gray-300 cursor-not-allowed"
                                        }`}
                                    >
                                        Chọn ảnh để cập nhật
                                    </label>
                                    {image && <p className="mt-2 text-sm text-green-600">Đã chọn: {image.name}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
