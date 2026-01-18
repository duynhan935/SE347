"use client";

import { useNotificationStore } from "@/stores/useNotificationStore";
import { Logo } from "@/constants";
import {
    ChevronDown,
    Clock,
    Grid3x3,
    Home,
    LayoutDashboard,
    MessageCircle,
    Percent,
    Ruler,
    Settings,
    Store,
    Users,
    Utensils,
    X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface MenuItem {
    label: string;
    icon: React.ElementType;
    href?: string;
    children?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
    },
    {
        label: "Messages",
        icon: MessageCircle,
        href: "/admin/messages",
    },
    {
        label: "Manage Users",
        icon: Users,
        href: "/admin/users",
    },
    {
        label: "Manage Merchants",
        icon: Store,
        href: "/admin/merchants",
    },
    {
        label: "Merchant Requests",
        icon: Clock,
        href: "/admin/merchant-requests",
    },
    {
        label: "Manage Restaurants",
        icon: Utensils,
        href: "/admin/restaurants",
    },
    {
        label: "Categories",
        icon: Grid3x3,
        href: "/admin/categories",
    },
    {
        label: "Sizes",
        icon: Ruler,
        href: "/admin/sizes",
    },
    {
        label: "Promotions",
        icon: Percent,
        href: "/admin/promotions",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/admin/settings",
    },
];

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
    const pathname = usePathname();
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const notifications = useNotificationStore((state) => state.notifications);

    // Calculate pending merchant requests count from notifications
    const pendingMerchantCount = notifications.filter((n) => n.type === "ADMIN_MERCHANT_REQUEST" && !n.read).length;

    return (
        <>
            {/* Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-white dark:bg-gray-900 duration-300 ease-linear lg:static lg:translate-x-0 border-r border-gray-200 dark:border-gray-800 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
                    <Link href="/admin/dashboard" className="flex items-center" aria-label="FoodEats">
                        <Image src={Logo} alt="FoodEats Logo" width={120} height={40} className="h-8 w-auto" priority />
                        <span className="sr-only">Admin Panel</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"
                        aria-label="Close sidebar"
                        title="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Menu */}
                <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-1">
                    <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6 flex flex-col h-full">
                        <div className="flex-1">
                            <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-500 dark:text-gray-400">MENU</h3>
                            <ul className="mb-6 flex flex-col gap-1.5">
                                {menuItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;

                                    if (item.children) {
                                        const isOpen = openSubmenu === item.label;
                                        return (
                                            <li key={item.label}>
                                                <button
                                                    onClick={() => setOpenSubmenu(isOpen ? null : item.label)}
                                                    className="group relative flex w-full items-center gap-2.5 rounded-lg px-4 py-2 font-medium text-gray-700 dark:text-gray-300 duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    <Icon size={20} />
                                                    {item.label}
                                                    <ChevronDown
                                                        size={16}
                                                        className={`ml-auto transition-transform ${
                                                            isOpen ? "rotate-180" : ""
                                                        }`}
                                                    />
                                                </button>
                                                {isOpen && (
                                                    <ul className="mt-2 ml-10 flex flex-col gap-1">
                                                        {item.children.map((child) => (
                                                            <li key={child.href}>
                                                                <Link
                                                                    href={child.href}
                                                                    className={`block rounded-md px-4 py-2 text-sm ${
                                                                        pathname === child.href
                                                                            ? "bg-brand-orange text-white"
                                                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                    }`}
                                                                >
                                                                    {child.label}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    }

                                    const isMerchantRequests = item.href === "/admin/merchant-requests";

                                    return (
                                        <li key={item.label}>
                                            <Link
                                                href={item.href!}
                                                className={`group relative flex items-center gap-2.5 rounded-lg px-4 py-2 font-medium duration-300 ease-in-out ${
                                                    isActive
                                                        ? "bg-brand-orange text-white"
                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }`}
                                            >
                                                <Icon size={20} />
                                                <span className="flex-1">{item.label}</span>
                                                {isMerchantRequests && pendingMerchantCount > 0 && (
                                                    <span
                                                        className={`h-5 min-w-5 px-1.5 text-xs rounded-full flex items-center justify-center font-bold ${
                                                            isActive
                                                                ? "bg-white text-brand-orange"
                                                                : "bg-brand-orange text-white"
                                                        }`}
                                                    >
                                                        {pendingMerchantCount > 99 ? "99+" : pendingMerchantCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                        {/* Back to Home Page */}
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 font-medium duration-300 ease-in-out text-brand-orange hover:bg-brand-orange/10 dark:hover:bg-brand-orange/20 border border-brand-orange/30 hover:border-brand-orange/50"
                            title="Back to homepage"
                        >
                            <Home size={20} />
                            <span>Back to Home Page</span>
                        </Link>
                    </nav>
                </div>
            </aside>
        </>
    );
}
