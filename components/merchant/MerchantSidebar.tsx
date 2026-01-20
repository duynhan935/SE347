"use client";

import { useChatStore } from "@/stores/useChatStore";
import { useMerchantOrderStore } from "@/stores/useMerchantOrderStore";
import { Logo } from "@/constants";
import { BarChart3, MessageCircle, Package, Settings, ShoppingBag, Store, Users, Wallet, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MerchantSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

interface MenuItemProps {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

export default function MerchantSidebar({ sidebarOpen, setSidebarOpen }: MerchantSidebarProps) {
    const pathname = usePathname();
    const unreadCountMap = useChatStore((state) => state.unreadCountMap);
    const pendingOrdersCount = useMerchantOrderStore((state) => state.pendingOrdersCount);

    // Calculate total unread count from all rooms
    const unreadCount = Object.values(unreadCountMap).reduce((sum, count) => sum + count, 0);

    const menuItems: MenuItemProps[] = [
        {
            icon: Store,
            label: "Dashboard",
            href: "/merchant",
        },
        {
            icon: MessageCircle,
            label: "Messages",
            href: "/merchant/messages",
        },
        {
            icon: Package,
            label: "Orders",
            href: "/merchant/orders",
        },
        {
            icon: Store,
            label: "Food",
            href: "/merchant/food",
        },
        {
            icon: BarChart3,
            label: "Reports",
            href: "/merchant/reports",
        },
        {
            icon: Wallet,
            label: "Wallet",
            href: "/merchant/wallet",
        },
        {
            icon: Settings,
            label: "Settings",
            href: "/merchant/manage/settings",
        },
    ];

    return (
        <>
            {/* Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={`
					fixed lg:relative left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-y-auto
					bg-white dark:bg-gray-800 border-r dark:border-gray-700
					transition-transform duration-300 ease-in-out lg:transition-none
					${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
				`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b dark:border-gray-700">
                    <Link href="/merchant" className="flex items-center" aria-label="FoodEats">
                        <Image src={Logo} alt="FoodEats Logo" width={120} height={40} className="h-8 w-auto" priority />
                        <span className="sr-only">Merchant Dashboard</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label="Close sidebar"
                        title="Close sidebar"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 space-y-1 px-3 py-4 flex flex-col">
                    <div className="space-y-1">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            const isMessages = item.href === "/merchant/messages";
                            const isOrders = item.href === "/merchant/orders";

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
									flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium relative
									transition-colors duration-200
								${isActive ? "bg-brand-orange text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
								`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="flex-1">{item.label}</span>
                                    {isMessages && unreadCount > 0 && (
                                        <span
                                            className={`h-5 min-w-5 px-1.5 text-xs rounded-full flex items-center justify-center font-bold ${
                                                isActive ? "bg-white text-brand-orange" : "bg-brand-orange text-white"
                                            }`}
                                        >
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                    {isOrders && pendingOrdersCount > 0 && (
                                        <span
                                            className={`h-5 min-w-5 px-1.5 text-xs rounded-full flex items-center justify-center font-bold ${
                                                isActive ? "bg-white text-brand-orange" : "bg-brand-orange text-white"
                                            }`}
                                        >
                                            {pendingOrdersCount > 99 ? "99+" : pendingOrdersCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className="border-t dark:border-gray-700 my-2"></div>

                    {/* Switch to Buying View */}
                    <Link
                        href="/"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 text-brand-orange hover:bg-brand-orange/10 dark:hover:bg-brand-orange/20 border border-brand-orange/30 hover:border-brand-orange/50"
                        title="Switch to buying view"
                    >
                        <ShoppingBag className="h-5 w-5" />
                        <span className="flex-1">Switch to Buying</span>
                    </Link>
                </nav>

                {/* Footer */}
                <div className="border-t dark:border-gray-700 px-6 py-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400">© 2024 Restaurant Platform</div>
                </div>
            </aside>
        </>
    );
}
