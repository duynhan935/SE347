"use client";

import UserList from "@/components/admin/users/UserList";

export default function AdminUsersPage() {
        return (
                <div className="p-6">
                        <h1 className="text-3xl font-bold mb-6">User Management</h1>
                        <UserList />
                </div>
        );
}
