"use client";

import { User } from "@/app/(admin)/admin/types/types";
import { authApi } from "@/lib/api/authApi";
import { Edit, Plus, Search, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import UserFormModal from "./UserFormModal";

export default function UserList({ initialUsers }: { initialUsers: User[] }) {
        const [users, setUsers] = useState<User[]>(initialUsers);
        const [searchTerm, setSearchTerm] = useState("");

        // 3. State quản lý modal
        const [isModalOpen, setIsModalOpen] = useState(false);
        // State lưu user đang được edit (hoặc null nếu là "add new")
        const [currentUser, setCurrentUser] = useState<User | null>(null);

        // Logic tìm kiếm (giữ nguyên)
        const filteredUsers = useMemo(() => {
                if (!searchTerm) return users;
                return users.filter(
                        (user) =>
                                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.email.toLowerCase().includes(searchTerm.toLowerCase())
                );
        }, [users, searchTerm]);

        // 4. Các hàm xử lý modal
        const handleOpenModal = (user: User | null) => {
                setCurrentUser(user); // Set user (hoặc null)
                setIsModalOpen(true); // Mở modal
        };

        const handleCloseModal = () => {
                setCurrentUser(null);
                setIsModalOpen(false); // Đóng modal
        };

        // 5. Hàm xử lý logic Save (Create/Update)
        const handleSaveUser = async (formData: { name: string; email: string; role: User["role"] }) => {
                if (currentUser) {
                        // --- Chế độ UPDATE ---
                        try {
                                // Giả lập gọi API
                                // await adminApi.updateUser(currentUser.id, formData);

                                // Cập nhật state UI
                                const updatedUser = { ...currentUser, ...formData };
                                setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
                                // toast.success("User updated successfully!");
                                console.log("Updated user:", updatedUser);
                        } catch (error) {
                                console.error("Failed to update user", error);
                                // toast.error("Failed to update user.");
                        }
                } else {
                        // --- Chế độ CREATE ---
                        try {
                                // Giả lập ID và ngày tạo
                                const newId = `user_${Date.now()}`;
                                const newUser: User = {
                                        id: newId,
                                        createdAt: new Date().toISOString(),
                                        ...formData,
                                };

                                // Giả lập gọi API
                                // const response = await adminApi.createUser(formData);
                                // const newUserFromApi = response.data;

                                // Cập nhật state UI
                                setUsers((prev) => [newUser, ...prev]);
                                // toast.success("User created successfully!");
                                console.log("Created new user:", newUser);
                        } catch (error) {
                                console.error("Failed to create user", error);
                                // toast.error("Failed to create user.");
                        }
                }

                // Tự động đóng modal sau khi lưu
                handleCloseModal();
        };

        // Logic Xóa (giữ nguyên)
        const handleDelete = async (userId: string) => {
                if (!window.confirm("Are you sure you want to delete this user?")) {
                        return;
                }
                try {
                        await authApi.deleteUser(userId);
                        setUsers((prev) => prev.filter((user) => user.id !== userId));
                        toast.success("User deleted successfully!");
                        console.log(`Đã xóa user ${userId}`);
                } catch (error) {
                        console.error("Failed to delete user", error);
                        toast.error("Failed to delete user.");
                }
        };

        return (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                        {/* Header: Search và Nút Add New */}
                        <div className="flex justify-between items-center mb-4">
                                <div className="relative w-full max-w-sm">
                                        <input
                                                type="text"
                                                placeholder="Search by name or email..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                        />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>

                                {/* 6. Thay đổi <Link> thành <button> để mở modal */}
                                <button
                                        onClick={() => handleOpenModal(null)} // Mở modal ở chế độ "Add"
                                        className="flex items-center gap-2 bg-brand-purple text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-purple/90 transition-colors cursor-pointer"
                                >
                                        <Plus className="w-5 h-5" />
                                        Add User
                                </button>
                        </div>

                        <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                                <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Name
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Email
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Role
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Created At
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Actions
                                                        </th>
                                                </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredUsers.map((user) => (
                                                        <tr key={user.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                        {user.name}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                        {user.email}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span
                                                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                                        user.role === "ADMIN"
                                                                                                ? "bg-red-100 text-red-800"
                                                                                                : user.role ===
                                                                                                  "MERCHANT"
                                                                                                ? "bg-blue-100 text-blue-800"
                                                                                                : "bg-gray-100 text-gray-800"
                                                                                }`}
                                                                        >
                                                                                {user.role}
                                                                        </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <button
                                                                                title="Edit User"
                                                                                onClick={() => handleOpenModal(user)}
                                                                                className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer    "
                                                                        >
                                                                                <Edit className="w-5 h-5 inline-block" />
                                                                        </button>

                                                                        <button
                                                                                title="Delete User"
                                                                                onClick={() => handleDelete(user.id)}
                                                                                className="text-red-600 hover:text-red-900 cursor-pointer"
                                                                        >
                                                                                <Trash className="w-5 h-5 inline-block" />
                                                                        </button>
                                                                </td>
                                                        </tr>
                                                ))}
                                        </tbody>
                                </table>
                        </div>

                        <UserFormModal
                                isOpen={isModalOpen}
                                onClose={handleCloseModal}
                                userToEdit={currentUser}
                                onSave={handleSaveUser}
                        />
                </div>
        );
}
