"use client";

import { useNotifications } from "@/lib/hooks/useNotifications";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { Bell, CheckCircle, Clock, Package, Truck, X, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Format time ago (e.g., "2 minutes ago", "1 hour ago")
const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return "Just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
};

// Get notification icon based on type
const getNotificationIcon = (type: string) => {
    switch (type) {
        case "ORDER_COMPLETED":
            return <CheckCircle className="w-5 h-5 text-green-600" />;
        case "ORDER_CONFIRMED":
            return <Truck className="w-5 h-5 text-blue-600" />;
        case "ORDER_REJECTED":
            return <XCircle className="w-5 h-5 text-red-600" />;
        case "ORDER_ACCEPTED":
            return <Package className="w-5 h-5 text-orange-600" />;
        default:
            return <Bell className="w-5 h-5 text-gray-600" />;
    }
};

// Get notification image placeholder
const getNotificationImage = (type: string): string => {
    // Return placeholder image URLs based on notification type
    switch (type) {
        case "ORDER_COMPLETED":
            return "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop";
        case "ORDER_CONFIRMED":
            return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop";
        case "ORDER_REJECTED":
            return "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=100&h=100&fit=crop";
        case "ORDER_ACCEPTED":
            return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop";
        default:
            return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop";
    }
};

export default function NotificationDropdown() {
    const { isAuthenticated, user, loading } = useAuthStore();
    useNotifications(); // Track order status changes and create notifications
    const { notifications: allNotifications, markAsRead, markAllAsRead } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();

    // Only show order-related notifications (exclude messages, merchant orders, admin requests)
    const orderNotifications = allNotifications.filter(
        (n) =>
            n.type !== "MERCHANT_NEW_ORDER" &&
            n.type !== "ADMIN_MERCHANT_REQUEST" &&
            n.type !== "MESSAGE_RECEIVED"
    );
    const unread = orderNotifications.filter((n) => !n.read).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                triggerRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setIsHovering(false);
            }
        };

        if (isOpen || isHovering) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, isHovering]);

    // Handle notification click
    const handleNotificationClick = (notificationId: string, orderId?: string) => {
        markAsRead(notificationId);
        setIsOpen(false);
        setIsHovering(false);

        if (orderId) {
            router.push(`/orders/${orderId}`);
        } else {
            router.push("/account/orders");
        }
    };

    // Don't render if not authenticated or still loading
    if (!isAuthenticated || !user || loading) {
        return null;
    }

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => {
                    // Delay closing to allow moving to dropdown
                    setTimeout(() => {
                        if (!dropdownRef.current?.matches(":hover")) {
                            setIsHovering(false);
                        }
                    }, 100);
                }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:ring-offset-2"
                aria-label="Notifications"
                title="Notifications"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#EE4D2D] text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {(isOpen || isHovering) && (
                <div
                    ref={dropdownRef}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => {
                        setIsHovering(false);
                        setIsOpen(false);
                    }}
                    className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            {unread > 0 && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {unread} {unread === 1 ? "new" : "new"}
                                </span>
                            )}
                        </div>
                        {unread > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAllAsRead();
                                }}
                                className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 font-medium transition-colors"
                                title="Mark all as read"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {orderNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {orderNotifications.slice(0, 10).map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`group relative w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                                            !notif.read ? "bg-orange-50/50" : "bg-white"
                                        }`}
                                    >
                                        <button
                                            onClick={() => handleNotificationClick(notif.id, notif.orderId)}
                                            className="w-full text-left"
                                        >
                                            <div className="flex items-start gap-3 pr-8">
                                                {/* Image/Icon */}
                                                <div className="flex-shrink-0">
                                                    {notif.type === "ORDER_COMPLETED" ||
                                                    notif.type === "ORDER_CONFIRMED" ||
                                                    notif.type === "ORDER_ACCEPTED" ||
                                                    notif.type === "ORDER_REJECTED" ? (
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                            {getNotificationIcon(notif.type)}
                                                        </div>
                                                    ) : (
                                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                                            <Image
                                                                src={getNotificationImage(notif.type)}
                                                                alt={notif.title}
                                                                width={48}
                                                                height={48}
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`text-sm font-medium text-gray-900 mb-1 ${
                                                            !notif.read ? "font-semibold" : ""
                                                        }`}
                                                    >
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{notif.message}</p>
                                                    {notif.restaurantName && (
                                                        <p className="text-xs text-gray-500 mb-1">Restaurant: {notif.restaurantName}</p>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{formatTimeAgo(notif.createdAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Unread Indicator */}
                                                {!notif.read && (
                                                    <div className="flex-shrink-0">
                                                        <div className="w-2 h-2 bg-[#EE4D2D] rounded-full" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        {/* Mark as Read Button (appears on hover) */}
                                        {!notif.read && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notif.id);
                                                }}
                                                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Mark as read"
                                            >
                                                <X className="w-4 h-4 text-gray-500" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {orderNotifications.length > 0 && (
                        <div className="border-t border-gray-200 px-4 py-3">
                            <Link
                                href="/account/orders"
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsHovering(false);
                                }}
                                className="block w-full text-center text-sm font-medium text-[#EE4D2D] hover:text-[#EE4D2D]/80 transition-colors"
                            >
                                View All Orders
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

