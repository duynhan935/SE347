/* eslint-disable react/no-children-prop */
"use client";
import MerchantHeader from "@/components/layout/merchant/MerchantHeader";
import MenuItem from "@/components/merchant/dashboard/MenuItem";
import { Calendar, FileText, Gauge, Logo, Megaphone, Paintbrush, Settings, Users, Utensils, Wrench } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const toggleMenu = (menuKey: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuKey]: !prev[menuKey],
        }));
    };

    const menuItems = [
        {
            icon: Gauge,
            label: "Dashboard",
            href: "/merchant",
        },
        {
            icon: FileText,
            label: "Orders",
            href: "/merchant/orders",
        },
        {
            icon: Calendar,
            label: "Reservations",
            href: "/merchant/reservations",
        },
        {
            icon: Users,
            label: "Customers",
            href: "/merchant/customers",
        },
        {
            icon: Utensils,
            label: "Restaurant",
            children: [
                { label: "Menu Items", href: "/merchant/restaurant/menu-items" },
                { label: "Mealtimes", href: "/merchant/restaurant/mealtimes" },
                { label: "Inventory", href: "/merchant/restaurant/inventory" },
                { label: "Dining Areas", href: "/merchant/restaurant/dining-areas" },
            ],
        },
        {
            icon: Megaphone,
            label: "Marketing",
            children: [
                { label: "Coupons", href: "/merchant/marketing/coupons" },
                { label: "Reviews", href: "/merchant/marketing/reviews" },
            ],
        },
        {
            icon: Paintbrush,
            label: "Design",
            children: [
                { label: "Themes", href: "/merchant/design/themes" },
                { label: "Static Pages", href: "/merchant/design/static-pages" },
                { label: "Mail Templates", href: "/merchant/design/mail-templates" },
                { label: "Slide & Banners", href: "/merchant/design/slide-banners" },
            ],
        },
        {
            icon: Wrench,
            label: "Tools",
            children: [
                { label: "APIs", href: "/merchant/tools/apis" },
                { label: "Automation", href: "/merchant/tools/automation" },
                { label: "Webhooks", href: "/merchant/tools/webhooks" },
            ],
        },
        {
            icon: Settings,
            label: "Manage",
            children: [
                { label: "Settings", href: "/merchant/manage/settings" },
                { label: "Locations", href: "/merchant/manage/locations" },
                { label: "Staff members", href: "/merchant/manage/staff" },
                { label: "Request Logs", href: "/merchant/manage/request-logs" },
            ],
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r px-4 py-6">
                <div className="mb-8 flex items-center gap-2">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <Image src={Logo} alt="FoodEats Logo" width={120} height={40} className="h-8 w-auto" />
                    </Link>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item, index) => (
                        <MenuItem
                            key={index}
                            icon={item.icon}
                            label={item.label}
                            href={item.href}
                            children={item.children}
                            isOpen={openMenus[item.label]}
                            onToggle={() => toggleMenu(item.label)}
                        />
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1">
                {/* Header */}
                <MerchantHeader />
                {/* Page content */}
                <div className="p-3 bg-[#f5f5f7]">{children}</div>
            </main>
        </div>
    );
}
