"use client";

import { Restaurant, RestaurantData } from "@/types";
import { Clock, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type RestaurantFormModalProps = {
    isOpen: boolean;
    onClose: () => void;
    restaurantToEdit: Restaurant | null;
    onSave: (restaurantData: RestaurantData, imageFile?: File) => void;
};

export default function RestaurantFormModal({ isOpen, onClose, restaurantToEdit, onSave }: RestaurantFormModalProps) {
    // State for form (keep as is)
    const [resName, setResName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [openingTime, setOpeningTime] = useState("08:00");
    const [closingTime, setClosingTime] = useState("22:00");
    const [longitude, setLongitude] = useState(0);
    const [latitude, setLatitude] = useState(0);
    const [merchantId, setMerchantId] = useState("testmerchantid");
    const [imageFile, setImageFile] = useState<File | undefined>();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // 1. Use useRef to trigger input file
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditMode = restaurantToEdit !== null;
    const title = isEditMode ? "Edit Restaurant" : "Add New Restaurant";

    // Effect to load data (keep as is)
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                // Edit mode
                setResName(restaurantToEdit.resName);
                setAddress(restaurantToEdit.address);
                setPhone(restaurantToEdit.phone);
                setOpeningTime(restaurantToEdit.openingTime.substring(0, 5));
                setClosingTime(restaurantToEdit.closingTime.substring(0, 5));
                setLongitude(restaurantToEdit.longitude);
                setLatitude(restaurantToEdit.latitude);
                setMerchantId(restaurantToEdit.merchantId);
                setPreviewUrl(restaurantToEdit.imageURL as string | null);
                setImageFile(undefined);
            } else {
                // Add mode
                setResName("");
                setAddress("");
                setPhone("");
                setOpeningTime("08:00");
                setClosingTime("22:00");
                setLongitude(106.8021);
                setLatitude(10.8702);
                setMerchantId("testmerchantid");
                setPreviewUrl(null);
                setImageFile(undefined);
            }
        }
    }, [isOpen, restaurantToEdit, isEditMode]);

    // Handle when selecting image file (keep as is)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 2. Function to click on div also triggers input
    const handleImageContainerClick = () => {
        fileInputRef.current?.click();
    };

    // Handle submit (keep as is)
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!resName || !address || !merchantId) {
            toast.error("Please fill in Name, Address, and Merchant ID.");
            return;
        }

        const restaurantData: RestaurantData = {
            resName,
            address,
            phone,
            openingTime: `${openingTime}:00`,
            closingTime: `${closingTime}:00`,
            longitude: Number(longitude) || 0,
            latitude: Number(latitude) || 0,
            merchantId: merchantId,
        };

        onSave(restaurantData, imageFile);
    };

    if (!isOpen) {
        return null;
    }

    return (
        // Overlay (backdrop)
        <div
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex justify-center items-center"
        >
            {/* Modal content */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                {/* Close button (X) */}
                <button
                    title="Close"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-6">{title}</h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 3. Image upload area FIXED */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Image</label>
                        {/* Click on this div to upload */}
                        <div
                            onClick={handleImageContainerClick}
                            className="cursor-pointer mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-brand-purple transition-colors"
                        >
                            <div className="space-y-1 text-center">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        width={200}
                                        height={200}
                                        className="mx-auto h-32 w-auto object-contain rounded"
                                    />
                                ) : (
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                )}
                                <div className="flex text-sm text-gray-600">
                                    <span className="font-medium text-brand-purple">Upload a file</span>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                        {/* Input file is hidden */}
                        <input
                            title="File Upload"
                            ref={fileInputRef}
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* 4. 2-column layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="resName" className="block text-sm font-medium text-gray-700">
                                Name *
                            </label>
                            <input
                                id="resName"
                                type="text"
                                value={resName}
                                onChange={(e) => setResName(e.target.value)}
                                className="mt-1 w-full input-field"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-1 w-full input-field"
                            />
                        </div>
                    </div>

                    {/* 1-column layout */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Address *
                        </label>
                        <input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 w-full input-field"
                        />
                    </div>

                    {/* 2-column layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label htmlFor="openingTime" className="block text-sm font-medium text-gray-700">
                                Opening
                            </label>
                            <input
                                id="openingTime"
                                type="time"
                                value={openingTime}
                                onChange={(e) => setOpeningTime(e.target.value)}
                                className="mt-1 w-full input-field pr-10"
                            />
                            <Clock className="w-5 h-5 text-gray-400 absolute right-3 top-9" />
                        </div>
                        <div className="relative">
                            <label htmlFor="closingTime" className="block text-sm font-medium text-gray-700">
                                Closing
                            </label>
                            <input
                                id="closingTime"
                                type="time"
                                value={closingTime}
                                onChange={(e) => setClosingTime(e.target.value)}
                                className="mt-1 w-full input-field pr-10"
                            />
                            <Clock className="w-5 h-5 text-gray-400 absolute right-3 top-9" />
                        </div>
                    </div>

                    {/* 5. 3-column layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                                Latitude *
                            </label>
                            <input
                                id="latitude"
                                type="number"
                                step="any"
                                value={latitude}
                                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                                className="mt-1 w-full input-field"
                            />
                        </div>
                        <div>
                            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                                Longitude *
                            </label>
                            <input
                                id="longitude"
                                type="number"
                                step="any"
                                value={longitude}
                                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                                className="mt-1 w-full input-field"
                            />
                        </div>
                        <div>
                            <label htmlFor="merchantId" className="block text-sm font-medium text-gray-700">
                                Merchant ID *
                            </label>
                            <input
                                id="merchantId"
                                type="text"
                                value={merchantId}
                                onChange={(e) => setMerchantId(e.target.value)}
                                className="mt-1 w-full input-field"
                            />
                        </div>
                    </div>

                    {/* 6. Button style */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors font-semibold"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
