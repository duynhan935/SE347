"use client";

import { useCategoryStore } from "@/stores/categoryStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { RestaurantData } from "@/types";
import { ChevronLeft, Loader2, Save, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface CreateRestaurantFormData
        extends Omit<
                RestaurantData,
                | "id"
                | "merchantId"
                | "rating"
                | "totalReview"
                | "distance"
                | "duration"
                | "products"
                | "cate"
                | "enabled"
                | "imageURL"
        > {
        categoryIds?: string[];
}

const initialFormData: CreateRestaurantFormData = {
        resName: "",
        address: "",
        longitude: 0,
        latitude: 0,
        openingTime: "09:00",
        closingTime: "22:00",
        phone: "",
        categoryIds: [],
};

export default function CreateRestaurantPage() {
        const router = useRouter();
        const params = useParams();
        const merchantId = params.merchantId as string;

        const { createNewRestaurant, loading: restaurantLoading, error: restaurantError } = useRestaurantStore();
        const { user } = useAuthStore();
        const loggedInMerchantId = user?.role === "MERCHANT" ? user.id : null;
        const { categories, fetchAllCategories, loading: categoryLoading, error: categoryError } = useCategoryStore();

        const [formData, setFormData] = useState<CreateRestaurantFormData>(initialFormData);
        const [imageFile, setImageFile] = useState<File | null>(null);
        const [imagePreview, setImagePreview] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);

        useEffect(() => {
                if (!loggedInMerchantId || loggedInMerchantId !== merchantId) {
                        toast.error("Access Denied.", { id: "auth-err" });
                        return;
                }

                fetchAllCategories();
        }, [loggedInMerchantId, merchantId, router, fetchAllCategories]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const { name, value, type } = e.target;

                if (type === "time") {
                        setFormData((prev) => ({ ...prev, [name]: value }));
                        return;
                }
                if (name === "latitude" || name === "longitude") {
                        setFormData((prev) => ({ ...prev, [name]: value }));
                        return;
                }

                setFormData((prev) => ({ ...prev, [name]: value }));
        };

        const handleCategoryChange = (categoryId: string) => {
                setFormData((prev) => {
                        const currentCategoryIds = prev.categoryIds || [];
                        const newCategoryIds = currentCategoryIds.includes(categoryId)
                                ? currentCategoryIds.filter((id) => id !== categoryId)
                                : [...currentCategoryIds, categoryId];
                        return { ...prev, categoryIds: newCategoryIds };
                });
        };

        const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                                toast.error("Image cannot exceed 2MB!");
                                e.target.value = "";
                                return;
                        }
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                } else {
                        setImageFile(null);
                        setImagePreview(null);
                }
        };

        const handleRemoveImage = () => {
                setImageFile(null);
                setImagePreview(null);
                const input = document.getElementById("image-upload") as HTMLInputElement;
                if (input) input.value = "";
        };

        // --- Form Submission ---
        const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                if (!loggedInMerchantId) return toast.error("Authentication error.");

                // --- Validation ---
                if (!formData.resName.trim()) return toast.error("Restaurant name is required.");
                if (!formData.address.trim()) return toast.error("Address is required.");
                if (!formData.phone.trim()) return toast.error("Phone number is required.");

                // Validate and convert lat/lon
                const latitudeNum = parseFloat(formData.latitude as any);
                const longitudeNum = parseFloat(formData.longitude as any);
                if (isNaN(latitudeNum) || isNaN(longitudeNum))
                        return toast.error("Latitude and Longitude must be valid numbers.");

                if (!formData.openingTime || !formData.closingTime)
                        return toast.error("Opening and closing times are required.");
                if (!formData.categoryIds || formData.categoryIds.length === 0)
                        return toast.error("Please select at least one category.");

                setIsSubmitting(true);
                const loadingToast = toast.loading("Creating restaurant...");

                const restaurantDataPayload: RestaurantData & { categoryIds?: string[] } = {
                        resName: formData.resName.trim(),
                        address: formData.address.trim(),
                        latitude: latitudeNum,
                        longitude: longitudeNum,
                        openingTime: formData.openingTime,
                        closingTime: formData.closingTime,
                        phone: formData.phone.trim(),
                        merchantId: loggedInMerchantId,
                        categoryIds: formData.categoryIds || [],
                };

                try {
                        await createNewRestaurant(restaurantDataPayload, imageFile ?? undefined);
                        const creationError = useRestaurantStore.getState().error;
                        toast.dismiss(loadingToast);

                        if (creationError) {
                                toast.error(`Failed to create: ${creationError}`);
                        } else {
                                toast.success("Restaurant created successfully! 🎉");
                                router.push(`/merchant/${merchantId}`); // Redirect back to selection page
                        }
                } catch (error: any) {
                        toast.dismiss(loadingToast);
                        toast.error(`An unexpected error occurred: ${error.message || "Unknown error"}`);
                        console.error("Create Restaurant Error:", error);
                } finally {
                        setIsSubmitting(false);
                }
        };

        // --- Render Logic ---
        if (!loggedInMerchantId || loggedInMerchantId !== merchantId) {
                return <div className="p-6 text-center text-red-600">Access Denied. Redirecting...</div>;
        }

        const validCategories = Array.isArray(categories) ? categories : [];

        return (
                <div className="min-h-screen bg-gray-50 pb-10">
                        <Toaster position="top-center" reverseOrder={false} />

                        {/* Header */}
                        <div className="bg-white border-b sticky top-0 z-10">
                                <div className="px-6 py-4">
                                        <div className="flex items-center gap-2 mb-4">
                                                <Link
                                                        href={`/merchant/${merchantId}`}
                                                        className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                                                >
                                                        <ChevronLeft className="w-5 h-5" />
                                                </Link>
                                                <h1 className="text-xl font-semibold text-gray-900">
                                                        Add New Restaurant
                                                </h1>
                                        </div>
                                        <div className="flex items-center">
                                                <button
                                                        type="submit"
                                                        form="create-restaurant-form"
                                                        disabled={isSubmitting || restaurantLoading || categoryLoading}
                                                        className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                        {isSubmitting || restaurantLoading ? (
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                                <Save className="w-4 h-4 mr-2" />
                                                        )}
                                                        {isSubmitting || restaurantLoading
                                                                ? "Saving..."
                                                                : "Save Restaurant"}
                                                </button>
                                                <Link
                                                        href={`/merchant/${merchantId}`}
                                                        className="ml-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                >
                                                        Cancel
                                                </Link>
                                        </div>
                                </div>
                        </div>

                        {/* Form */}
                        <div className="px-6 pt-6">
                                <form
                                        id="create-restaurant-form"
                                        onSubmit={handleSubmit}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 max-w-4xl mx-auto"
                                >
                                        {/* Restaurant Name */}
                                        <div>
                                                <label
                                                        htmlFor="resName"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Restaurant Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                        id="resName"
                                                        name="resName"
                                                        type="text"
                                                        value={formData.resName}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="e.g., The Cozy Corner Cafe"
                                                        className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                                                        maxLength={100}
                                                        disabled={isSubmitting}
                                                />
                                        </div>

                                        {/* Address */}
                                        <div>
                                                <label
                                                        htmlFor="address"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Address <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                        id="address"
                                                        name="address"
                                                        rows={3}
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="Enter full address"
                                                        className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                                                        maxLength={255}
                                                        disabled={isSubmitting}
                                                />
                                        </div>

                                        {/* Location (Lat/Lon) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                        <label
                                                                htmlFor="latitude"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                Latitude <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                                id="latitude"
                                                                name="latitude"
                                                                type="number"
                                                                step="any"
                                                                value={formData.latitude}
                                                                onChange={handleChange} // Keep storing as string/number based on input
                                                                required
                                                                placeholder="e.g., 10.9032198"
                                                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                                                                disabled={isSubmitting}
                                                        />
                                                </div>
                                                <div>
                                                        <label
                                                                htmlFor="longitude"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                Longitude <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                                id="longitude"
                                                                name="longitude"
                                                                type="number"
                                                                step="any"
                                                                value={formData.longitude}
                                                                onChange={handleChange}
                                                                required
                                                                placeholder="e.g., 106.7750317"
                                                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                                                                disabled={isSubmitting}
                                                        />
                                                </div>
                                                <p className="text-xs text-gray-500 md:col-span-2">
                                                        Tip: Use Google Maps to find coordinates.
                                                </p>
                                        </div>

                                        {/* Operating Hours */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                                                <div>
                                                        <label
                                                                htmlFor="openingTime"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                Opening Time <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                                id="openingTime"
                                                                name="openingTime"
                                                                type="time"
                                                                value={formData.openingTime}
                                                                onChange={handleChange}
                                                                required
                                                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                                                                disabled={isSubmitting}
                                                        />
                                                </div>
                                                <div>
                                                        <label
                                                                htmlFor="closingTime"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                                Closing Time <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                                id="closingTime"
                                                                name="closingTime"
                                                                type="time"
                                                                value={formData.closingTime}
                                                                onChange={handleChange}
                                                                required
                                                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                                                                disabled={isSubmitting}
                                                        />
                                                </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                                <label
                                                        htmlFor="phone"
                                                        className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                        Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                        id="phone"
                                                        name="phone"
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="e.g., 0901234567"
                                                        className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                                                        maxLength={15}
                                                        disabled={isSubmitting}
                                                />
                                        </div>

                                        {/* Category Selection */}
                                        <div className="border-t pt-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Categories <span className="text-red-500">*</span>
                                                </label>
                                                <p className="text-xs text-gray-500 mb-3">
                                                        Select one or more relevant categories.
                                                </p>
                                                {categoryLoading ? (
                                                        <div className="flex items-center justify-center h-20">
                                                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                                        </div>
                                                ) : categoryError ? (
                                                        <p className="text-sm text-red-500">
                                                                Error loading categories: {categoryError}
                                                        </p>
                                                ) : validCategories.length === 0 ? (
                                                        <p className="text-sm text-gray-500 italic">
                                                                No categories available. Please add categories first.
                                                        </p>
                                                ) : (
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 max-h-48 overflow-y-auto border rounded p-3 bg-gray-50/50">
                                                                {" "}
                                                                {/* Added bg */}
                                                                {validCategories.map((category) => (
                                                                        <div
                                                                                key={category.id}
                                                                                className="flex items-center"
                                                                        >
                                                                                <input
                                                                                        type="checkbox"
                                                                                        id={`category-${category.id}`}
                                                                                        name="categoryIds"
                                                                                        value={category.id}
                                                                                        checked={formData.categoryIds?.includes(
                                                                                                category.id
                                                                                        )}
                                                                                        onChange={() =>
                                                                                                handleCategoryChange(
                                                                                                        category.id
                                                                                                )
                                                                                        }
                                                                                        disabled={isSubmitting}
                                                                                        className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                                                                />
                                                                                <label
                                                                                        htmlFor={`category-${category.id}`}
                                                                                        className="ml-2 block text-sm text-gray-700 truncate cursor-pointer"
                                                                                >
                                                                                        {category.cateName}
                                                                                </label>
                                                                        </div>
                                                                ))}
                                                        </div>
                                                )}
                                        </div>

                                        {/* Image Upload */}
                                        <div className="border-t pt-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Restaurant Image{" "}
                                                        <span className="text-gray-500 text-xs">
                                                                (Optional, max 2MB)
                                                        </span>
                                                </label>
                                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                                        <label
                                                                htmlFor="image-upload"
                                                                className={`flex-grow w-full sm:w-auto cursor-pointer border-2 border-dashed rounded-lg p-6 text-center hover:border-orange-400 transition-colors ${
                                                                        isSubmitting
                                                                                ? "opacity-50 cursor-not-allowed bg-gray-100"
                                                                                : "bg-white hover:bg-orange-50/30"
                                                                }`}
                                                        >
                                                                <input
                                                                        id="image-upload"
                                                                        type="file"
                                                                        accept="image/png, image/jpeg, image/webp"
                                                                        onChange={handleImageUpload}
                                                                        className="hidden"
                                                                        disabled={isSubmitting}
                                                                />
                                                                <div className="text-sm text-gray-500">
                                                                        <UploadCloud className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                                        {imageFile ? (
                                                                                <span className="text-green-700 font-medium">
                                                                                        Selected: {imageFile.name}
                                                                                </span>
                                                                        ) : (
                                                                                "Click or drag & drop to upload"
                                                                        )}
                                                                        <p className="text-xs mt-1">
                                                                                PNG, JPG, WEBP recommended
                                                                        </p>
                                                                </div>
                                                        </label>

                                                        {imagePreview && (
                                                                <div className="relative w-32 h-32 border rounded-md overflow-hidden flex-shrink-0 mt-4 sm:mt-0 shadow-sm">
                                                                        <Image
                                                                                src={imagePreview}
                                                                                alt="Image Preview"
                                                                                layout="fill"
                                                                                objectFit="cover"
                                                                        />
                                                                        <button
                                                                                type="button"
                                                                                onClick={handleRemoveImage}
                                                                                disabled={isSubmitting}
                                                                                className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50"
                                                                                title="Remove Image"
                                                                                aria-label="Remove image preview"
                                                                        >
                                                                                <X className="w-3 h-3" />
                                                                        </button>
                                                                </div>
                                                        )}
                                                </div>
                                        </div>
                                </form>
                        </div>
                </div>
        );
}
