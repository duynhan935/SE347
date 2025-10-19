import UserList from "@/components/admin/users/UserList";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { User } from "../types/types";

// Hàm giả lập API call
async function getUsers(): Promise<User[]> {
        // const response = await adminApi.getAllUsers();
        // return response.data;

        // ---- Dữ liệu giả lập ----
        return [
                {
                        id: "1",
                        name: "Alice",
                        email: "alice@example.com",
                        role: "ADMIN",
                        createdAt: new Date().toISOString(),
                },
                { id: "2", name: "Bob", email: "bob@example.com", role: "USER", createdAt: new Date().toISOString() },
                {
                        id: "3",
                        name: "Charlie",
                        email: "charlie@example.com",
                        role: "MERCHANT",
                        createdAt: new Date().toISOString(),
                },
        ];
}

export default async function AdminUsersPage() {
        const users = await getUsers();

        return (
                <div className="p-6">
                        <h1 className="text-3xl font-bold mb-6">User Management</h1>
                        <Suspense fallback={<Loader2 className="animate-spin" />}>
                                {/* Truyền data đã fetch vào Client Component */}
                                <UserList initialUsers={users} />
                        </Suspense>
                </div>
        );
}
