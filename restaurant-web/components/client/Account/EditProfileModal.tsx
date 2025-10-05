"use client";

import Button from "@/components/Button";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

type EditProfileModalProps = {
        isOpen: boolean;
        onClose: () => void;
        user: {
                name: string;
                avatar: string;
        };
};

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
        const [name, setName] = useState(user.name);
        const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
        const [avatarFile, setAvatarFile] = useState<File | null>(null);
        const fileInputRef = useRef<HTMLInputElement>(null);

        const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                }
        };

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                // Logic xử lý cập nhật profile (gọi API)
                console.log("Updating profile:", { name, avatarFile });
                alert("Profile update logic would run here.");
                onClose(); // Đóng modal sau khi submit
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
                                                                        <Image
                                                                                src={avatarPreview || user.avatar}
                                                                                alt="Avatar preview"
                                                                                fill
                                                                                className="rounded-full object-cover border-2 border-red-500"
                                                                        />
                                                                        <button
                                                                                title="Upload avatar"
                                                                                type="button"
                                                                                onClick={() =>
                                                                                        fileInputRef.current?.click()
                                                                                }
                                                                                className="absolute bottom-0 right-0 bg-brand-purple text-white p-2 rounded-full hover:bg-brand-purple/90 transition-colors cursor-pointer"
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
                                                                                Full Name
                                                                        </label>
                                                                        <input
                                                                                type="text"
                                                                                id="name"
                                                                                value={name}
                                                                                onChange={(e) =>
                                                                                        setName(e.target.value)
                                                                                }
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple"
                                                                        />
                                                                </div>
                                                        </div>

                                                        <div className="mt-8 flex justify-end gap-4">
                                                                <Button
                                                                        type="button"
                                                                        title="Cancel"
                                                                        onClickFunction={onClose}
                                                                        className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                                                                >
                                                                        Cancel
                                                                </Button>
                                                                <Button
                                                                        type="submit"
                                                                        title="Save Changes"
                                                                        className="bg-brand-purple text-white hover:bg-brand-purple/90 cursor-pointer"
                                                                >
                                                                        Save Changes
                                                                </Button>
                                                        </div>
                                                </form>
                                        </motion.div>
                                </motion.div>
                        )}
                </AnimatePresence>
        );
}
