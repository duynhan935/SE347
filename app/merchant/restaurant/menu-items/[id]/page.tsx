"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Save, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { useProductStore } from "@/stores/useProductsStores";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CommonImages } from "@/constants";

interface MenuFormData {
    id: string;
    name: string;
    price: string;
    size: string;
    category: string;
    categoryId: string;
    status: boolean;
    description: string;
    image: File | null;
    volume: string;
    totalReview: number;
    rating: number;
}

export default function MenuEditForm() {
    const { id } = useParams();
    const { product, fetchProductById, loading, error } = useProductStore();

    const [formData, setFormData] = useState<MenuFormData>({
        id: "",
        name: "",
        price: "",
        size: "",
        category: "",
        categoryId: "",
        status: false,
        description: "",
        image: null,
        volume: "",
        totalReview: 0,
        rating: 0,
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id) fetchProductById(id as string);
    }, [id, fetchProductById]);

    useEffect(() => {
        if (product) {
            const sizeData = product.productSizes?.[0];
            setFormData({
                id: product.id || "",
                name: product.productName || "",
                price: sizeData?.price?.toString() || "",
                size: sizeData?.sizeName || "",
                category: product.categoryName || "",
                categoryId: product.categoryId || "",
                status: product.available ?? false,
                description: product.description || "",
                image: null,
                volume: product.volume?.toString() || "",
                totalReview: product.totalReview || 0,
                rating: product.rating || 0,
            });
        }
    }, [product]);

    const handleInputChange = (field: keyof MenuFormData, value: string | boolean | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
        }
    };

    const handleSave = () => {
        console.log("Form sau khi chỉnh:", formData);
        // TODO: Gọi API update sản phẩm
    };

    const handleEdit = () => {
        setIsEditing(true);
        console.log("Đang chỉnh sửa sản phẩm:", formData.name);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-600">Lỗi: {error}</p>
            </div>
        );
    }

    const currentImage = product?.imageURL && product.imageURL.trim() !== "" ? product.imageURL : CommonImages.yeye;

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
                            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </button>
                        <button onClick={handleEdit} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                            <Pencil size={18} className="inline-block mr-1 text-gray-400 hover:text-orange-500" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                        {/* ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product ID</label>
                            <input
                                type="text"
                                value={formData.id}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                disabled={!isEditing}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    isEditing
                                        ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        : "border-gray-200 bg-gray-50 text-gray-700"
                                }`}
                            />
                        </div>

                        {/* Category */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category ID</label>
                                <input
                                    type="text"
                                    value={formData.categoryId}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Size & Price */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                                <input
                                    type="text"
                                    value={formData.size}
                                    onChange={(e) => handleInputChange("size", e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 border rounded-md ${
                                        isEditing
                                            ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            : "border-gray-200 bg-gray-50 text-gray-700"
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        ₫
                                    </span>
                                    <input
                                        type="text"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange("price", e.target.value)}
                                        disabled={!isEditing}
                                        className={`w-full pl-8 pr-3 py-2 border rounded-md ${
                                            isEditing
                                                ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                : "border-gray-200 bg-gray-50 text-gray-700"
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Volume */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                            <input
                                type="text"
                                value={formData.volume}
                                onChange={(e) => handleInputChange("volume", e.target.value)}
                                disabled={!isEditing}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    isEditing
                                        ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        : "border-gray-200 bg-gray-50 text-gray-700"
                                }`}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                rows={4}
                                disabled={!isEditing}
                                className={`w-full px-3 py-2 border rounded-md resize-none ${
                                    isEditing
                                        ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        : "border-gray-200 bg-gray-50 text-gray-700"
                                }`}
                            />
                        </div>

                        {/* Rating + Reviews */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <input
                                    type="text"
                                    value={formData.rating}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Reviews</label>
                                <input
                                    type="text"
                                    value={formData.totalReview}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <div className="flex items-center">
                                <button
                                    onClick={() => handleInputChange("status", !formData.status)}
                                    disabled={!isEditing}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        formData.status ? "bg-orange-500" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            formData.status ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                                <span className="ml-3 text-sm text-gray-700">
                                    {formData.status ? "Enabled" : "Disabled"}
                                </span>
                            </div>
                        </div>

                        {/* Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col items-center">
                                    <p className="text-sm text-gray-600 mb-2">Current Image</p>
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
                                        Select a file to update menu image
                                    </label>
                                    {formData.image && (
                                        <p className="mt-2 text-sm text-green-600">Selected: {formData.image.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
