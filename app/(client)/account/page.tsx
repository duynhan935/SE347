"use client";
import Button from "@/components/Button";
import EditProfileModal from "@/components/client/Account/EditProfileModal";
import { useAuthStore } from "@/stores/useAuthStore";
import { Heart, Loader2, Mail, PackageCheck, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Stats and orders are still dummy data since backend might not have these yet
const stats = [
        { name: "Total Orders", value: "17", icon: ShoppingBag },
        { name: "Last Order Status", value: "Delivered", icon: PackageCheck },
        { name: "Favorite Dish", value: "Burger", icon: Heart },
];

const recentOrders = [
        { id: "#12345", date: "Oct 04, 2025", total: "$25.50", status: "Delivered" },
        { id: "#12344", date: "Sep 28, 2025", total: "$15.00", status: "Delivered" },
];

export default function ProfilePage() {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [mounted, setMounted] = useState(false);
        const { user, fetchProfile, loading } = useAuthStore();

        useEffect(() => {
                setMounted(true);
                // Fetch user profile data
                fetchProfile();
        }, [fetchProfile]);
        if (!mounted || loading) {
                return (
                        <div className="flex items-center justify-center min-h-screen">
                                <Loader2 className="animate-spin text-brand-purple" />
                        </div>
                );
        }

        if (!user) {
                return (
                        <div className="text-center py-12">
                                <p className="text-gray-500">No user data available</p>
                        </div>
                );
        }

        // Generate avatar from username
        const avatarInitial = user.username.charAt(0).toUpperCase();
        const avatarUrl = `https://placehold.co/100x100/EFE8D8/333?text=${avatarInitial}`;

        return (
                <>
                        <div className="space-y-8">
                                {/* ✨ 1. Welcome Banner & Profile Summary */}
                                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl flex flex-col sm:flex-row items-center gap-6">
                                        <div className="relative w-24 h-24 flex-shrink-0">
                                                <Image
                                                        src={avatarUrl}
                                                        alt="User Avatar"
                                                        fill
                                                        className="rounded-full object-cover"
                                                />
                                        </div>
                                        <div className="text-center sm:text-left flex-grow">
                                                <p className="text-sm text-gray-500">Welcome back,</p>
                                                <h1 className="text-2xl md:text-3xl font-bold text-brand-black">
                                                        {user.username}
                                                </h1>
                                                <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2 mt-1">
                                                        <Mail className="w-4 h-4" />
                                                        {user.email}
                                                </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                                <Button
                                                        className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm !py-2 !px-4 cursor-pointer"
                                                        onClickFunction={() => setIsModalOpen(true)}
                                                >
                                                        Edit Profile
                                                </Button>
                                        </div>
                                </div>

                                {/* ✨ 2. Thẻ "Quick Stats" */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {stats.map((stat) => (
                                                <div
                                                        key={stat.name}
                                                        className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl flex items-center gap-4"
                                                >
                                                        <div className="bg-brand-yellowlight p-3 rounded-full">
                                                                <stat.icon className="w-6 h-6 text-brand-purple" />
                                                        </div>
                                                        <div>
                                                                <p className="text-sm text-gray-500">{stat.name}</p>
                                                                <p className="text-xl font-bold">{stat.value}</p>
                                                        </div>
                                                </div>
                                        ))}
                                </div>

                                {/* ✨ 3. Phần "Recent Orders" */}
                                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl">
                                        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                                        <div className="space-y-4">
                                                {recentOrders.map((order) => (
                                                        <div
                                                                key={order.id}
                                                                className="border p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                                        >
                                                                <div>
                                                                        <p className="font-semibold text-brand-black">
                                                                                {order.id}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                                {order.date}
                                                                        </p>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                        <p className="font-semibold">{order.total}</p>
                                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                                {order.status}
                                                                        </span>
                                                                </div>
                                                        </div>
                                                ))}
                                        </div>
                                        <div className="text-right mt-4">
                                                <a
                                                        href="/account/orders"
                                                        className="text-sm font-semibold text-brand-purple hover:underline"
                                                >
                                                        View All Orders →
                                                </a>
                                        </div>
                                </div>
                        </div>
                        <EditProfileModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                user={{
                                        name: user.username,
                                        avatar: avatarUrl,
                                        phone: user.phone,
                                }}
                        />
                </>
        );
}
