"use client";

import { User } from "@/types";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// 1. Định nghĩa Props
type UserFormModalProps = {
        isOpen: boolean;
        onClose: () => void;
        // userToEdit = null: Chế độ "Add New"
        // userToEdit = User: Chế độ "Edit"
        userToEdit: User | null;
        // Hàm onSave sẽ nhận dữ liệu form để component cha xử lý
        onSave: (userData: { username: string; phone: string }) => void;
};

export default function UserFormModal({ isOpen, onClose, userToEdit, onSave }: UserFormModalProps) {
        // 2. State nội bộ của form
        const [username, setUsername] = useState("");
        const [phone, setPhone] = useState("");
        const [loading, setLoading] = useState(false);

        const isEditMode = userToEdit !== null;
        const title = isEditMode ? "Edit User" : "Add New User";

        // 3. Effect để đồng bộ props 'userToEdit' vào state của form
        // Khi modal mở hoặc user để edit thay đổi -> cập nhật form
        useEffect(() => {
                if (isOpen) {
                        if (isEditMode && userToEdit) {
                                // Chế độ Edit: Nạp dữ liệu của user vào form
                                setUsername(userToEdit.username || "");
                                setPhone(userToEdit.phone || "");
                        } else {
                                // Chế độ Add: Reset form
                                setUsername("");
                                setPhone("");
                        }
                }
        }, [isOpen, userToEdit, isEditMode]);

        // 4. Xử lý khi submit form
        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                if (!username.trim()) {
                        toast.error("Username is required");
                        return;
                }

                setLoading(true);
                try {
                        // Gửi dữ liệu lên component cha (UserList)
                        await onSave({ username: username.trim(), phone: phone.trim() });
                } catch (error) {
                        // Error handling is done in parent component
                } finally {
                        setLoading(false);
                }
        };

        // 5. Nếu modal không mở (isOpen=false) -> không render gì cả
        if (!isOpen) {
                return null;
        }

        // 6. Render giao diện Modal
        return (
                // Lớp phủ (backdrop)
                <div
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex justify-center items-center transition-opacity"
                >
                        {/* Nội dung Modal */}
                        <div
                                onClick={(e) => e.stopPropagation()} // Ngăn bấm vào modal bị đóng
                                className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg"
                        >
                                {/* Nút đóng (X) */}
                                <button
                                        title="Close Modal"
                                        onClick={onClose}
                                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                >
                                        <X className="w-6 h-6" />
                                </button>

                                {/* Tiêu đề */}
                                <h2 className="text-2xl font-bold mb-6">{title}</h2>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                                <label
                                                        htmlFor="username"
                                                        className="block text-sm font-medium text-gray-700"
                                                >
                                                        Username <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                        id="username"
                                                        type="text"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:opacity-50 disabled:bg-gray-100"
                                                        required
                                                        disabled={loading}
                                                />
                                        </div>

                                        <div>
                                                <label
                                                        htmlFor="phone"
                                                        className="block text-sm font-medium text-gray-700"
                                                >
                                                        Phone
                                                </label>
                                                <input
                                                        id="phone"
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:opacity-50 disabled:bg-gray-100"
                                                        placeholder="Enter phone number"
                                                        disabled={loading}
                                                />
                                        </div>

                                        {/* Display read-only fields */}
                                        {isEditMode && userToEdit && (
                                                <>
                                                        <div>
                                                                <label
                                                                        htmlFor="email"
                                                                        className="block text-sm font-medium text-gray-700"
                                                                >
                                                                        Email
                                                                </label>
                                                                <input
                                                                        id="email"
                                                                        type="email"
                                                                        value={userToEdit.email}
                                                                        className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                                                                        disabled
                                                                        readOnly
                                                                />
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                        Email cannot be changed
                                                                </p>
                                                        </div>

                                                        <div>
                                                                <label
                                                                        htmlFor="role"
                                                                        className="block text-sm font-medium text-gray-700"
                                                                >
                                                                        Role
                                                                </label>
                                                                <input
                                                                        id="role"
                                                                        type="text"
                                                                        value={userToEdit.role}
                                                                        className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                                                                        disabled
                                                                        readOnly
                                                                />
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                        Role cannot be changed
                                                                </p>
                                                        </div>
                                                </>
                                        )}

                                        {/* Nút bấm */}
                                        <div className="flex justify-end gap-3 pt-4">
                                                <button
                                                        type="button" // Quan trọng: type="button" để không submit form
                                                        onClick={onClose}
                                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                        disabled={loading}
                                                >
                                                        Cancel
                                                </button>
                                                <button
                                                        type="submit"
                                                        className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                                                        disabled={loading}
                                                >
                                                        {loading ? (
                                                                <>
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                        Saving...
                                                                </>
                                                        ) : (
                                                                "Save"
                                                        )}
                                                </button>
                                        </div>
                                </form>
                        </div>
                </div>
        );
}
