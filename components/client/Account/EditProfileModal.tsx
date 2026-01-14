"use client";

import Button from "@/components/Button";
import { useAuthStore } from "@/stores/useAuthStore";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type EditProfileModalProps = {
        isOpen: boolean;
        onClose: () => void;
        user: {
                name: string;
                avatar: string;
                phone?: string | null;
        };
};

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
        const [name, setName] = useState("");
        const [phone, setPhone] = useState("");
        const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
        const [avatarFile, setAvatarFile] = useState<File | null>(null);
        const fileInputRef = useRef<HTMLInputElement>(null);
        const { updateProfile, loading } = useAuthStore();

        // Update fields when user changes and when modal opens
        useEffect(() => {
                setName(user.name || "");
                setPhone(user.phone || "");
                setAvatarPreview(null);
                setAvatarFile(null);
        }, [user.name, user.phone, isOpen]);

        const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                }
        };

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                // Validate required fields
                if (!name.trim()) {
                        toast.error("Username is required");
                        return;
                }

                if (!phone.trim()) {
                        toast.error("Phone is required");
                        return;
                }

                try {
                        const success = await updateProfile({ username: name, phone });
                        if (success) {
                                toast.success("Profile updated successfully!");
                                onClose();
                        } else {
                                toast.error("Failed to update profile");
                        }
                } catch (error) {
                        console.error("Error updating profile:", error);
                        toast.error("Failed to update profile");
                }
        };

        return (
                <AnimatePresence>
                        {isOpen && (
                                <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={onClose}
                                        className="fixed inset-0  bg-black/50 z-50 flex items-center justify-center p-4"
                                >
                                        <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.9, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="bg-white rounded-lg shadow-xl w-full max-w-md"
                                        >
                                                <div className="p-6 border-b flex justify-between items-center">
                                                        <h2 className="text-xl font-bold">Edit Profile</h2>
                                                        <button
                                                                type="button"
                                                                title="Close"
                                                                onClick={onClose}
                                                                className="text-gray-500 hover:text-gray-800 cursor-pointer"
                                                        >
                                                                <X size={24} />
                                                        </button>
                                                </div>
                                                <form onSubmit={handleSubmit} className="p-6">
                                                        <div className="flex flex-col items-center gap-4 mb-6">
                                                                <div className="relative w-28 h-28">
                                                                        {(avatarPreview || user.avatar) &&
                                                                        typeof (avatarPreview || user.avatar) ===
                                                                                "string" &&
                                                                        (avatarPreview || user.avatar).trim() !== "" ? (
                                                                                <Image
                                                                                        src={
                                                                                                avatarPreview ||
                                                                                                user.avatar
                                                                                        }
                                                                                        alt="Avatar preview"
                                                                                        fill
                                                                                        className="rounded-full object-cover border-2 border-[#EE4D2D]"
                                                                                />
                                                                        ) : (
                                                                                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs border-2 border-[#EE4D2D]">
                                                                                        No Avatar
                                                                                </div>
                                                                        )}
                                                                        <button
                                                                                title="Upload avatar"
                                                                                type="button"
                                                                                onClick={() =>
                                                                                        fileInputRef.current?.click()
                                                                                }
                                                                                className="absolute bottom-0 right-0 bg-[#EE4D2D] text-white p-2 rounded-full hover:bg-[#EE4D2D]/90 transition-colors cursor-pointer"
                                                                        >
                                                                                <Camera size={16} />
                                                                        </button>
                                                                        <input
                                                                                title="Upload avatar"
                                                                                type="file"
                                                                                ref={fileInputRef}
                                                                                onChange={handleAvatarChange}
                                                                                className="hidden"
                                                                                accept="image/png, image/jpeg"
                                                                        />
                                                                </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                                <div>
                                                                        <label
                                                                                htmlFor="name"
                                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                                        >
                                                                                Username
                                                                        </label>
                                                                        <input
                                                                                type="text"
                                                                                id="name"
                                                                                value={name}
                                                                                onChange={(e) =>
                                                                                        setName(e.target.value)
                                                                                }
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D]"
                                                                                disabled={loading}
                                                                        />
                                                                </div>
                                                                <div>
                                                                        <label
                                                                                htmlFor="phone"
                                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                                        >
                                                                                Phone
                                                                        </label>
                                                                        <input
                                                                                type="text"
                                                                                id="phone"
                                                                                value={phone}
                                                                                onChange={(e) =>
                                                                                        setPhone(e.target.value)
                                                                                }
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D]"
                                                                                disabled={loading}
                                                                        />
                                                                </div>
                                                        </div>

                                                        <div className="mt-8 flex justify-end gap-4">
                                                                <Button
                                                                        type="button"
                                                                        title="Cancel"
                                                                        onClickFunction={onClose}
                                                                        className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                                                                        disabled={loading}
                                                                >
                                                                        Cancel
                                                                </Button>
                                                                <Button
                                                                        type="submit"
                                                                        title="Save Changes"
                                                                        className="bg-[#EE4D2D] text-white hover:bg-[#EE4D2D]/90 cursor-pointer"
                                                                        disabled={loading}
                                                                >
                                                                        {loading ? (
                                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                                "Save Changes"
                                                                        )}
                                                                </Button>
                                                        </div>
                                                </form>
                                        </motion.div>
                                </motion.div>
                        )}
                </AnimatePresence>
        );
}
