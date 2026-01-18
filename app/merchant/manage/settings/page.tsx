"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { useMerchantRestaurant } from "@/lib/hooks/useMerchantRestaurant";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import type { RestaurantData } from "@/types";
import { Clock, Image as ImageIcon, MapPin, Phone, Save, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MerchantSettingsPage() {
    const { user } = useAuthStore();
    const { currentRestaurant, isLoadingRestaurant, isCreatingRestaurant } = useMerchantRestaurant();
    const { getRestaurantByMerchantId } = useRestaurantStore();

    const [formData, setFormData] = useState<RestaurantData>({
        resName: "",
        address: "",
        longitude: 106.809883,
        latitude: 10.841228,
        openingTime: "09:00",
        closingTime: "22:00",
        phone: "",
        merchantId: user?.id || "",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [saving, setSaving] = useState(false);

    // Load restaurant data
    useEffect(() => {
        if (currentRestaurant) {
            // Convert openingTime and closingTime from "HH:mm:ss" to "HH:mm" if needed
            const openingTime = currentRestaurant.openingTime.includes(":")
                ? currentRestaurant.openingTime.substring(0, 5)
                : currentRestaurant.openingTime;
            const closingTime = currentRestaurant.closingTime.includes(":")
                ? currentRestaurant.closingTime.substring(0, 5)
                : currentRestaurant.closingTime;

            setFormData({
                resName: currentRestaurant.resName || "",
                address: currentRestaurant.address || "",
                longitude: currentRestaurant.longitude || 106.809883,
                latitude: currentRestaurant.latitude || 10.841228,
                openingTime: openingTime || "09:00",
                closingTime: closingTime || "22:00",
                phone: currentRestaurant.phone || "",
                merchantId: currentRestaurant.merchantId || user?.id || "",
            });

            if (currentRestaurant.imageURL && typeof currentRestaurant.imageURL === "string") {
                setImagePreview(currentRestaurant.imageURL);
            }
        }
    }, [currentRestaurant, user?.id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!currentRestaurant?.id || !user?.id) {
            toast.error("Restaurant information not available");
            return;
        }

        if (!formData.resName.trim()) {
            toast.error("Restaurant name is required");
            return;
        }

        if (!formData.address.trim()) {
            toast.error("Address is required");
            return;
        }

        if (!formData.phone.trim()) {
            toast.error("Phone number is required");
            return;
        }

        setSaving(true);
        try {
            // Convert time from "HH:mm" to "HH:mm:ss" for backend
            const restaurantData: RestaurantData = {
                ...formData,
                openingTime:
                    formData.openingTime.includes(":") && formData.openingTime.split(":").length === 2
                        ? `${formData.openingTime}:00`
                        : formData.openingTime,
                closingTime:
                    formData.closingTime.includes(":") && formData.closingTime.split(":").length === 2
                        ? `${formData.closingTime}:00`
                        : formData.closingTime,
                merchantId: user.id,
            };

            await restaurantApi.updateRestaurant(currentRestaurant.id, restaurantData, imageFile || undefined);
            toast.success("Restaurant information updated successfully");

            // Refresh restaurant data
            await getRestaurantByMerchantId(user.id);
        } catch (error: unknown) {
            console.error("Failed to update restaurant:", error);
            const message =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast.error(message ?? "Failed to update restaurant information");
        } finally {
            setSaving(false);
        }
    };

    if (!user?.id || user.role !== "MERCHANT") {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-700 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200">
                You must be a merchant to access this page.
            </div>
        );
    }

    if (isLoadingRestaurant || isCreatingRestaurant || !currentRestaurant) {
        return (
            <GlobalLoader
                label={isCreatingRestaurant ? "Setting up" : "Loading"}
                sublabel={isCreatingRestaurant ? "Creating your restaurant profile" : "Loading restaurant information"}
                showLogo
            />
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage merchant account settings</p>
            </div>

            {/* Restaurant Information Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Restaurant Information</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Restaurant Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Restaurant Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.resName}
                            onChange={(e) => setFormData({ ...formData, resName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                            placeholder="Enter restaurant name"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <MapPin className="inline w-4 h-4 mr-1" />
                            Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
                            placeholder="Enter restaurant address"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Phone className="inline w-4 h-4 mr-1" />
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                            placeholder="Enter phone number"
                        />
                    </div>

                    {/* Opening Hours */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            <Clock className="inline w-4 h-4 mr-1" />
                            Opening Hours <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Opening Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.openingTime}
                                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Closing Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.closingTime}
                                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <ImageIcon className="inline w-4 h-4 mr-1" />
                            Restaurant Image
                        </label>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm font-medium">Choose Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                                {imageFile && (
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{imageFile.name}</span>
                                )}
                            </div>

                            {imagePreview && (
                                <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <Image src={imagePreview} alt="Restaurant preview" fill className="object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-5 w-5" />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
