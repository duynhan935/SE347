"use client";

import { BarChart3, Package, Settings, Store, Users, X } from "lucide-react";
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

        const menuItems: MenuItemProps[] = [
                {
                        icon: Store,
                        label: "Dashboard",
                        href: "/merchant",
                },
                {
                        icon: Package,
                        label: "Đơn Hàng",
                        href: "/merchant/orders",
                },
                {
                        icon: Store,
                        label: "Món Ăn",
                        href: "/merchant/food",
                },
                {
                        icon: Users,
                        label: "Staff",
                        href: "/merchant/manage/staff",
                },
                {
                        icon: BarChart3,
                        label: "Reports",
                        href: "/merchant/reports",
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
                                <div
                                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                                        onClick={() => setSidebarOpen(false)}
                                />
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
                                        <Link href="/merchant" className="flex items-center gap-2">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow">
                                                        <Store className="h-6 w-6 text-white" />
                                                </div>
                                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                        Merchant
                                                </span>
                                        </Link>
                                        <button
                                                onClick={() => setSidebarOpen(false)}
                                                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                                <X className="h-6 w-6" />
                                        </button>
                                </div>

                                {/* Menu Items */}
                                <nav className="flex-1 space-y-1 px-3 py-4">
                                        {menuItems.map((item, index) => {
                                                const Icon = item.icon;
                                                const isActive = pathname === item.href;

                                                return (
                                                        <Link
                                                                key={index}
                                                                href={item.href}
                                                                onClick={() => setSidebarOpen(false)}
                                                                className={`
									flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium
									transition-colors duration-200
									${isActive ? "bg-brand-yellow text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
								`}
                                                        >
                                                                <Icon className="h-5 w-5" />
                                                                {item.label}
                                                        </Link>
                                                );
                                        })}
                                </nav>

                                {/* Footer */}
                                <div className="border-t dark:border-gray-700 px-6 py-4">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                © 2024 Restaurant Platform
                                        </div>
                                </div>
                        </aside>
                </>
        );
}
