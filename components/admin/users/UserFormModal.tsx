"use client";

import { User } from "@/app/(admin)/admin/types/types"; // Giả định
import { X } from "lucide-react";
import { useEffect, useState } from "react";
// import { toast } from "react-toastify"; // Giả định

// 1. Định nghĩa Props
type UserFormModalProps = {
        isOpen: boolean;
        onClose: () => void;
        // userToEdit = null: Chế độ "Add New"
        // userToEdit = User: Chế độ "Edit"
        userToEdit: User | null;
        // Hàm onSave sẽ nhận dữ liệu form để component cha xử lý
        onSave: (userData: { name: string; email: string; role: User["role"] }) => void;
};

export default function UserFormModal({ isOpen, onClose, userToEdit, onSave }: UserFormModalProps) {
        // 2. State nội bộ của form
        const [name, setName] = useState("");
        const [email, setEmail] = useState("");
        const [role, setRole] = useState<User["role"]>("USER");

        const isEditMode = userToEdit !== null;
        const title = isEditMode ? "Edit User" : "Add New User";

        // 3. Effect để đồng bộ props 'userToEdit' vào state của form
        // Khi modal mở hoặc user để edit thay đổi -> cập nhật form
        useEffect(() => {
                if (isOpen) {
                        if (isEditMode) {
                                // Chế độ Edit: Nạp dữ liệu của user vào form
                                setName(userToEdit.name);
                                setEmail(userToEdit.email);
                                setRole(userToEdit.role);
                        } else {
                                // Chế độ Add: Reset form
                                setName("");
                                setEmail("");
                                setRole("USER");
                        }
                }
        }, [isOpen, userToEdit, isEditMode]);

        // 4. Xử lý khi submit form
        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                if (!name || !email) {
                        // toast.error("Please fill in all fields."); // Báo lỗi nếu cần
                        alert("Please fill in all fields."); // Dùng tạm alert
                        return;
                }

                // Gửi dữ liệu lên component cha (UserList)
                onSave({ name, email, role });
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
                                                        htmlFor="name"
                                                        className="block text-sm font-medium text-gray-700"
                                                >
                                                        Full Name
                                                </label>
                                                <input
                                                        id="name"
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                                />
                                        </div>

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
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                                />
                                        </div>

                                        <div>
                                                <label
                                                        htmlFor="role"
                                                        className="block text-sm font-medium text-gray-700"
                                                >
                                                        Role
                                                </label>
                                                <select
                                                        id="role"
                                                        value={role}
                                                        onChange={(e) => setRole(e.target.value as User["role"])}
                                                        className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                                >
                                                        <option value="USER">User</option>
                                                        <option value="MERCHANT">Merchant</option>
                                                        <option value="ADMIN">Admin</option>
                                                </select>
                                        </div>

                                        {/* Nút bấm */}
                                        <div className="flex justify-end gap-3 pt-4">
                                                <button
                                                        type="button" // Quan trọng: type="button" để không submit form
                                                        onClick={onClose}
                                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                                >
                                                        Cancel
                                                </button>
                                                <button
                                                        type="submit"
                                                        className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90"
                                                >
                                                        Save
                                                </button>
                                        </div>
                                </form>
                        </div>
                </div>
        );
}
