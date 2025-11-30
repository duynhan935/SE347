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

interface EditRestaurantFormData
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

export default function EditRestaurantPage() {
        const router = useRouter();
        const params = useParams();
        // Decode slug to handle URL encoding (e.g., "Nhà%20hàng%20UIT" -> "Nhà hàng UIT")
        const slug = decodeURIComponent(params.restaurantId as string);

        const { user } = useAuthStore();
        const loggedInMerchantId = user?.role === "MERCHANT" ? user.id : null;
        const {
                restaurant: restaurantFromStore,
                fetchRestaurantBySlug,
                updateRestaurant,
                loading: restaurantLoading,
        } = useRestaurantStore();
        const { categories, fetchAllCategories, loading: categoryLoading, error: categoryError } = useCategoryStore();

        // Use restaurant from store if it matches the slug (case-insensitive comparison)
        const restaurant = restaurantFromStore?.slug?.toLowerCase() === slug.toLowerCase() ? restaurantFromStore : null;

        const [formData, setFormData] = useState<EditRestaurantFormData>({
                resName: "",
                address: "",
                longitude: 0,
                latitude: 0,
                openingTime: "09:00",
                closingTime: "22:00",
                phone: "",
                categoryIds: [],
        });
        const [imageFile, setImageFile] = useState<File | null>(null);
        const [imagePreview, setImagePreview] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [isInitialized, setIsInitialized] = useState(false);

        // Initialize form data immediately if restaurant is in store (optimized for fast loading)
        useEffect(() => {
                if (isInitialized) return;

                // Check store FIRST for immediate initialization (no API call needed)
                const currentRestaurant = useRestaurantStore.getState().restaurant;

                // Case-insensitive slug comparison
                if (currentRestaurant?.slug?.toLowerCase() === slug.toLowerCase()) {
                        // Restaurant already in store, initialize immediately (synchronous)
                        if (currentRestaurant.merchantId !== loggedInMerchantId) {
                                toast.error("Access Denied. You can only edit your own restaurants.");
                                router.replace(`/merchant/${loggedInMerchantId || ""}`);
                                return;
                        }

                        const formatTime = (timeStr: string) => {
                                if (!timeStr) return "09:00";
                                return timeStr.substring(0, 5);
                        };

                        // Initialize form data synchronously
                        setFormData({
                                resName: currentRestaurant.resName || "",
                                address: currentRestaurant.address || "",
                                longitude: currentRestaurant.longitude || 0,
                                latitude: currentRestaurant.latitude || 0,
                                openingTime: formatTime(currentRestaurant.openingTime || "09:00"),
                                closingTime: formatTime(currentRestaurant.closingTime || "22:00"),
                                phone: currentRestaurant.phone || "",
                                categoryIds: currentRestaurant.cate?.map((c: { id: string }) => c.id) || [],
                        });

                        if (currentRestaurant.imageURL && typeof currentRestaurant.imageURL === "string") {
                                setImagePreview(currentRestaurant.imageURL);
                        }

                        setIsInitialized(true);
                        return; // Exit early - no need to fetch
                }

                // Restaurant not in store, check if we need to fetch
                // Only fetch if we don't have restaurant AND not currently loading
                if (slug && !restaurant && !restaurantLoading) {
                        fetchRestaurantBySlug(slug);
                }
        }, [slug, restaurant, restaurantLoading, isInitialized, loggedInMerchantId, router, fetchRestaurantBySlug]);

        // Initialize form when restaurant is loaded from API (if not already initialized from store)
        useEffect(() => {
                if (isInitialized || !restaurant || restaurant.slug?.toLowerCase() !== slug.toLowerCase()) return;

                if (restaurant.merchantId !== loggedInMerchantId) {
                        toast.error("Access Denied. You can only edit your own restaurants.");
                        router.replace(`/merchant/${loggedInMerchantId || ""}`);
                        return;
                }

                const formatTime = (timeStr: string) => {
                        if (!timeStr) return "09:00";
                        return timeStr.substring(0, 5);
                };

                setFormData({
                        resName: restaurant.resName || "",
                        address: restaurant.address || "",
                        longitude: restaurant.longitude || 0,
                        latitude: restaurant.latitude || 0,
                        openingTime: formatTime(restaurant.openingTime || "09:00"),
                        closingTime: formatTime(restaurant.closingTime || "22:00"),
                        phone: restaurant.phone || "",
                        categoryIds: restaurant.cate?.map((c: { id: string }) => c.id) || [],
                });

                if (restaurant.imageURL && typeof restaurant.imageURL === "string") {
                        setImagePreview(restaurant.imageURL);
                }

                setIsInitialized(true);
        }, [restaurant, slug, isInitialized, loggedInMerchantId, router]);

        // Fetch categories - only if not already loaded
        useEffect(() => {
                const currentCategories = useCategoryStore.getState().categories;
                if (Array.isArray(currentCategories) && currentCategories.length > 0) {
                        return; // Already loaded
                }
                if (!categoryLoading) {
                        fetchAllCategories();
                }
        }, [fetchAllCategories, categoryLoading]);

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
                        // Don't clear preview if editing existing image
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

                // Get restaurant from store or state (case-insensitive comparison)
                const currentRestaurantForUpdate = useRestaurantStore.getState().restaurant;
                const restaurantForUpdate =
                        currentRestaurantForUpdate?.slug?.toLowerCase() === slug.toLowerCase()
                                ? currentRestaurantForUpdate
                                : restaurantToDisplay;

                if (!loggedInMerchantId || !restaurantForUpdate) {
                        toast.error("Authentication error.");
                        return;
                }

                // Verify merchant owns this restaurant
                if (restaurantForUpdate.merchantId !== loggedInMerchantId) {
                        toast.error("Access Denied. You can only edit your own restaurants.");
                        return;
                }

                // --- Validation ---
                if (!formData.resName.trim()) return toast.error("Restaurant name is required.");
                if (!formData.address.trim()) return toast.error("Address is required.");
                if (!formData.phone.trim()) return toast.error("Phone number is required.");

                // Validate and convert lat/lon
                const latitudeNum = parseFloat(String(formData.latitude));
                const longitudeNum = parseFloat(String(formData.longitude));
                if (isNaN(latitudeNum) || isNaN(longitudeNum))
                        return toast.error("Latitude and Longitude must be valid numbers.");

                if (!formData.openingTime || !formData.closingTime)
                        return toast.error("Opening and closing times are required.");
                if (!formData.categoryIds || formData.categoryIds.length === 0)
                        return toast.error("Please select at least one category.");

                setIsSubmitting(true);
                const loadingToast = toast.loading("Updating restaurant...");

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
                        await updateRestaurant(restaurantForUpdate.id, restaurantDataPayload, imageFile ?? undefined);
                        const updateError = useRestaurantStore.getState().error;

                        if (updateError) {
                                toast.dismiss(loadingToast);
                                toast.error(`Failed to update: ${updateError}`);
                        } else {
                                toast.dismiss(loadingToast);
                                toast.success("Restaurant updated successfully! 🎉");

                                // Update form data with the updated restaurant from store
                                // Wait a bit for store to update
                                setTimeout(() => {
                                        const updatedRestaurant = useRestaurantStore.getState().restaurant;
                                        if (updatedRestaurant) {
                                                const formatTime = (timeStr: string) => {
                                                        if (!timeStr) return "09:00";
                                                        return timeStr.substring(0, 5);
                                                };

                                                setFormData({
                                                        resName: updatedRestaurant.resName || "",
                                                        address: updatedRestaurant.address || "",
                                                        longitude: updatedRestaurant.longitude || 0,
                                                        latitude: updatedRestaurant.latitude || 0,
                                                        openingTime: formatTime(
                                                                updatedRestaurant.openingTime || "09:00"
                                                        ),
                                                        closingTime: formatTime(
                                                                updatedRestaurant.closingTime || "22:00"
                                                        ),
                                                        phone: updatedRestaurant.phone || "",
                                                        categoryIds:
                                                                updatedRestaurant.cate?.map(
                                                                        (c: { id: string }) => c.id
                                                                ) || [],
                                                });

                                                if (
                                                        updatedRestaurant.imageURL &&
                                                        typeof updatedRestaurant.imageURL === "string"
                                                ) {
                                                        setImagePreview(updatedRestaurant.imageURL);
                                                }

                                                // Clear image file since it's been uploaded
                                                setImageFile(null);
                                        }
                                }, 100);

                                // Don't fetch again - we already have updated data in store
                                // fetchRestaurantBySlug will trigger getAllReviews which might cause 500 error
                                // The update was successful, so we don't need to refresh
                        }
                } catch (error) {
                        toast.dismiss(loadingToast);
                        const errorMessage = error instanceof Error ? error.message : "Unknown error";
                        toast.error(`An unexpected error occurred: ${errorMessage}`);
                        console.error("Update Restaurant Error:", error);
                } finally {
                        setIsSubmitting(false);
                }
        };

        // Get restaurant from store or state for display (case-insensitive comparison)
        const currentRestaurantFromStore = useRestaurantStore.getState().restaurant;
        const hasRestaurantInStore = currentRestaurantFromStore?.slug?.toLowerCase() === slug.toLowerCase();
        const restaurantToDisplay = hasRestaurantInStore ? currentRestaurantFromStore : restaurant;

        // --- Loading State - Optimized: Allow form to render immediately if restaurant is in store ---
        // Only show full loading if we're definitely fetching and have no data at all
        const shouldShowLoading = !hasRestaurantInStore && !restaurant && restaurantLoading && !isInitialized;

        if (shouldShowLoading) {
                return (
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                                <div className="text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                                        <p className="text-gray-600">Loading restaurant data...</p>
                                </div>
                        </div>
                );
        }

        // Access Control - check early (but allow form to render if restaurant is in store)
        if (restaurantToDisplay && restaurantToDisplay.merchantId !== loggedInMerchantId) {
                return (
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                                <div className="text-center text-red-600">
                                        <p className="text-lg font-semibold mb-2">Access Denied</p>
                                        <p>You can only edit your own restaurants.</p>
                                </div>
                        </div>
                );
        }

        // Allow form to render even if not initialized yet (will be initialized in useEffect)
        // This prevents blocking the UI while initialization happens
        const validCategories = Array.isArray(categories) ? categories : [];

        return (
                <div className="min-h-screen bg-gray-50 pb-10">
                        <Toaster position="top-center" reverseOrder={false} />

                        {/* Header */}
                        <div className="bg-white border-b sticky top-0 z-10">
                                <div className="px-6 py-4">
                                        <div className="flex items-center gap-2 mb-4">
                                                <Link
                                                        href={`/merchant/restaurant/${slug}/menu-items`}
                                                        className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                                                >
                                                        <ChevronLeft className="w-5 h-5" />
                                                </Link>
                                                <h1 className="text-xl font-semibold text-gray-900">
                                                        Edit Restaurant: {restaurantToDisplay?.resName || "Loading..."}
                                                </h1>
                                        </div>
                                        <div className="flex items-center">
                                                <button
                                                        type="submit"
                                                        form="edit-restaurant-form"
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
                                                                : "Save Changes"}
                                                </button>
                                                <Link
                                                        href={`/merchant/restaurant/${slug}/menu-items`}
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
                                        id="edit-restaurant-form"
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
                                                                onChange={handleChange}
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
                                                                (Optional, max 2MB - Leave empty to keep current image)
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
                                                                                "Click or drag & drop to upload new image"
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
                                                                                alt="Restaurant Preview"
                                                                                fill
                                                                                className="object-cover"
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
