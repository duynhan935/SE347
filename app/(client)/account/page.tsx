"use client";
import Button from "@/components/Button";
import EditProfileModal from "@/components/client/Account/EditProfileModal";
import { orderApi } from "@/lib/api/orderApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order } from "@/types/order.type";
import { Heart, Loader2, Mail, PackageCheck, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface RecentOrder {
    id: string; // Unique key for React
    displayId: string; // Display text for order ID
    date: string;
    total: string;
    status: string;
    statusClass?: string;
}

interface Stats {
    name: string;
    value: string;
    icon: typeof ShoppingBag;
}

export default function ProfilePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState<Stats[]>([
        { name: "Total Orders", value: "0", icon: ShoppingBag },
        { name: "Last Order Status", value: "N/A", icon: PackageCheck },
        { name: "Favorite Dish", value: "N/A", icon: Heart },
    ]);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const { user, fetchProfile, loading } = useAuthStore();

    // Fetch orders and calculate stats
    const fetchOrdersAndStats = useCallback(async () => {
        if (!user?.id) {
            setOrdersLoading(false);
            return;
        }

        try {
            setOrdersLoading(true);
            const { orders } = await orderApi.getOrdersByUser(user.id);

            // Sort orders by createdAt (newest first)
            const sortedOrders = [...orders].sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });

            // Calculate stats
            const totalOrders = sortedOrders.length;
            const lastOrder = sortedOrders.length > 0 ? sortedOrders[0] : null;
            const lastOrderStatus = lastOrder?.status || "N/A";

            // Find favorite dish (most ordered item)
            const dishCountMap = new Map<string, number>();
            sortedOrders.forEach((order: Order) => {
                order.items?.forEach((item) => {
                    const dishName = item.productName || "Unknown";
                    dishCountMap.set(dishName, (dishCountMap.get(dishName) || 0) + item.quantity);
                });
            });

            let favoriteDish = "N/A";
            let maxCount = 0;
            dishCountMap.forEach((count, dishName) => {
                if (count > maxCount) {
                    maxCount = count;
                    favoriteDish = dishName;
                }
            });

                        // Format status for display
                        const formatStatus = (status: string): string => {
                                const statusMap: Record<string, string> = {
                                        pending: "Pending",
                                        confirmed: "Confirmed",
                                        preparing: "Preparing",
                                        ready: "Ready",
                                        completed: "Completed",
                                        cancelled: "Cancelled",
                                };
                                return statusMap[status.toLowerCase()] || status;
                        };

            // Get status badge color classes
            const getStatusBadgeClass = (status: string): string => {
                const statusLower = status.toLowerCase();
                if (statusLower.includes("completed")) {
                    return "bg-green-100 text-green-800";
                }
                if (statusLower.includes("cancelled")) {
                    return "bg-red-100 text-red-800";
                }
                if (statusLower.includes("pending")) {
                    return "bg-yellow-100 text-yellow-800";
                }
                if (statusLower.includes("preparing") || statusLower.includes("ready")) {
                    return "bg-blue-100 text-blue-800";
                }
                if (statusLower.includes("confirmed")) {
                    return "bg-indigo-100 text-indigo-800";
                }
                return "bg-gray-100 text-gray-800";
            };

            setStats([
                { name: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag },
                {
                    name: "Last Order Status",
                    value: formatStatus(lastOrderStatus),
                    icon: PackageCheck,
                },
                { name: "Favorite Dish", value: favoriteDish, icon: Heart },
            ]);

            // Get recent orders (last 2-3)
            const recent = sortedOrders.slice(0, 3).map((order: Order, index: number) => {
                const orderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                      })
                    : "N/A";

                                        const status = formatStatus(order.status || "pending");

                // Ensure unique ID by combining orderCode/id with index and createdAt timestamp
                const orderId = order.orderId || `order-${index}`;
                const uniqueId = order.createdAt
                    ? `${orderId}-${new Date(order.createdAt).getTime()}`
                    : `${orderId}-${index}`;

                return {
                    id: uniqueId,
                    displayId: order.orderId || `#${index + 1}`,
                    date: orderDate,
                    total: `$${Number(order.finalAmount || 0).toFixed(2)}`,
                    status,
                    statusClass: getStatusBadgeClass(status),
                };
            });

            setRecentOrders(recent);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Failed to load order data");
        } finally {
            setOrdersLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        setMounted(true);
        // Fetch user profile data
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (mounted && user?.id && !loading) {
            fetchOrdersAndStats();
        }
    }, [mounted, user?.id, loading, fetchOrdersAndStats]);
    if (!mounted || loading || ordersLoading) {
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
            <div className="custom-container p-3 sm:p-1 md:p-12 space-y-8">
                {/* ✨ 1. Welcome Banner & Profile Summary - Improved design */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-purple to-purple-600 p-0.5">
                                <div className="w-full h-full rounded-full bg-white p-1">
                                        <Image src={avatarUrl} alt="User Avatar" fill className="rounded-full object-cover" />
                                </div>
                        </div>
                    </div>
                    <div className="text-center sm:text-left flex-grow">
                        <p className="text-sm text-gray-500 font-medium">Chào mừng trở lại,</p>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{user.username}</h1>
                        <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2 mt-2">
                            <Mail className="w-4 h-4" />
                            {user.email}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Button
                            className="bg-brand-purple text-white hover:bg-brand-purple/90 text-sm !py-3 !px-6 cursor-pointer rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-200"
                            onClickFunction={() => setIsModalOpen(true)}
                        >
                            Chỉnh sửa hồ sơ
                        </Button>
                    </div>
                </div>

                {/* ✨ 2. Thẻ "Quick Stats" - Improved design */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div
                            key={stat.name}
                            className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 flex items-center gap-4"
                        >
                            <div className="bg-gradient-to-br from-brand-purple/10 to-purple-100 p-4 rounded-xl">
                                <stat.icon className="w-6 h-6 text-brand-purple" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
                                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ✨ 3. Phần "Recent Orders" - Improved design */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
                    <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">Hoạt động gần đây</h2>
                    {recentOrders.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="border border-gray-200 p-5 rounded-xl hover:border-brand-purple/30 transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">{order.displayId}</p>
                                            <p className="text-sm text-gray-500 mt-1">{order.date}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold text-lg text-gray-900">{order.total}</p>
                                            <span
                                                className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                                                    order.statusClass || "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-right mt-6">
                                <Link
                                    href="/account/orders"
                                    className="text-sm font-bold text-brand-purple hover:text-brand-purple/80 transition-colors inline-flex items-center gap-1"
                                >
                                    Xem tất cả đơn hàng →
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">Chưa có đơn hàng nào</p>
                            <Link
                                href="/restaurants"
                                className="text-sm font-bold text-brand-purple hover:text-brand-purple/80 transition-colors inline-flex items-center gap-1"
                            >
                                Bắt đầu đặt hàng →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <EditProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={{
                    name: user?.username || "",
                    avatar: avatarUrl,
                    phone: user?.phone || "",
                }}
            />
        </>
    );
}
