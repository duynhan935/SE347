"use client";

import { authApi } from "@/lib/api/authApi";
import { User } from "@/types";
import { Edit, Loader2, Search, Trash } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import UserFormModal from "./UserFormModal";

export default function UserList() {
        const [users, setUsers] = useState<User[]>([]);
        const [searchTerm, setSearchTerm] = useState("");
        const [loading, setLoading] = useState(true);

        // 3. State quản lý modal
        const [isModalOpen, setIsModalOpen] = useState(false);
        // State lưu user đang được edit (hoặc null nếu là "add new")
        const [currentUser, setCurrentUser] = useState<User | null>(null);

        // Fetch users from API
        useEffect(() => {
                fetchUsers();
        }, []);

        const fetchUsers = async () => {
                setLoading(true);
                try {
                        const data = await authApi.getAllUsers();
                        setUsers(data);
                } catch (error) {
                        console.error("Failed to fetch users:", error);
                        const errorMessage = error instanceof Error ? error.message : "Failed to load users";
                        toast.error(errorMessage);
                } finally {
                        setLoading(false);
                }
        };

        // Logic tìm kiếm (giữ nguyên)
        const filteredUsers = useMemo(() => {
                if (!searchTerm) return users;
                return users.filter(
                        (user) =>
                                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        const handleSaveUser = async (formData: { username: string; phone: string }) => {
                if (currentUser) {
                        // --- Chế độ UPDATE ---
                        try {
                                const updatedUser = await authApi.updateUser(currentUser.id, {
                                        username: formData.username,
                                        phone: formData.phone || "",
                                });
                                setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
                                toast.success("User updated successfully!");
                        } catch (error) {
                                console.error("Failed to update user", error);
                                let errorMessage = "Failed to update user";
                                if (error instanceof Error) {
                                        errorMessage = error.message;
                                } else if (typeof error === "object" && error !== null && "response" in error) {
                                        const axiosError = error as { response?: { data?: { message?: string } } };
                                        errorMessage = axiosError.response?.data?.message || errorMessage;
                                }
                                toast.error(errorMessage);
                        }
                } else {
                        // --- Chế độ CREATE ---
                        // Note: Backend doesn't have create user endpoint in user-service
                        // Admin might need to use register endpoint or a separate admin service
                        toast.error("Create user functionality is not available. Please use the register page.");
                }

                // Tự động đóng modal sau khi lưu
                handleCloseModal();
                // Refresh users list
                fetchUsers();
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
                } catch (error) {
                        console.error("Failed to delete user", error);
                        let errorMessage = "Failed to delete user";
                        if (error instanceof Error) {
                                errorMessage = error.message;
                        } else if (typeof error === "object" && error !== null && "response" in error) {
                                const axiosError = error as { response?: { data?: { message?: string } } };
                                errorMessage = axiosError.response?.data?.message || errorMessage;
                        }
                        toast.error(errorMessage);
                }
        };

        if (loading) {
                return (
                        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center min-h-[400px]">
                                <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                        </div>
                );
        }

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

                                {/* Note: Add User functionality disabled as backend doesn't have admin create endpoint */}
                                {/* <button
                                        onClick={() => handleOpenModal(null)} // Mở modal ở chế độ "Add"
                                        className="flex items-center gap-2 bg-brand-purple text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-purple/90 transition-colors cursor-pointer"
                                >
                                        <Plus className="w-5 h-5" />
                                        Add User
                                </button> */}
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
                                                                Phone
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Actions
                                                        </th>
                                                </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredUsers.length === 0 ? (
                                                        <tr>
                                                                <td
                                                                        colSpan={5}
                                                                        className="px-6 py-8 text-center text-gray-500"
                                                                >
                                                                        No users found
                                                                </td>
                                                        </tr>
                                                ) : (
                                                        filteredUsers.map((user) => (
                                                                <tr key={user.id}>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                                {user.username}
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
                                                                                {user.phone || "N/A"}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                <button
                                                                                        title="Edit User"
                                                                                        onClick={() =>
                                                                                                handleOpenModal(user)
                                                                                        }
                                                                                        className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer    "
                                                                                >
                                                                                        <Edit className="w-5 h-5 inline-block" />
                                                                                </button>

                                                                                <button
                                                                                        title="Delete User"
                                                                                        onClick={() =>
                                                                                                handleDelete(user.id)
                                                                                        }
                                                                                        className="text-red-600 hover:text-red-900 cursor-pointer"
                                                                                >
                                                                                        <Trash className="w-5 h-5 inline-block" />
                                                                                </button>
                                                                        </td>
                                                                </tr>
                                                        ))
                                                )}
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
