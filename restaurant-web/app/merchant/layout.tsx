"use client";
import MerchantHeader from "@/components/layout/merchant/MerchantHeader";
import {
    Bell,
    Calendar,
    FileText,
    Gauge,
    Logo,
    Megaphone,
    MessageCircleQuestionMark,
    Paintbrush,
    Settings,
    Store,
    User,
    Users,
    Utensils,
    Wrench,
} from "@/constants";
import Image from "next/image";
import Link from "next/link";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
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
                    <Link href="/merchant" className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100">
                        <Gauge size={20} />
                        Dashboard
                    </Link>
                    <Link
                        href="/merchant/orders"
                        className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                    >
                        <FileText size={20} />
                        Orders
                    </Link>
                    <Link
                        href="/merchant/reservations"
                        className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                    >
                        <Calendar size={20} />
                        Reservations
                    </Link>
                    <Link
                        href="/merchant/customers"
                        className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                    >
                        <Users size={20} />
                        Customers
                    </Link>
                    <Link
                        href="/merchant/restaurant"
                        className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                    >
                        <Utensils size={20} />
                        Restaurant
                    </Link>
                    <Link
                        href="/merchant/marketing"
                        className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                    >
                        <Megaphone size={20} />
                        Marketing
                    </Link>
                    <Link
                        href="/merchant/design"
                        className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                    >
                        <Paintbrush size={20} />
                        Design
                    </Link>
                    <Link
                        href="/merchant/tools"
                        className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                    >
                        <Wrench size={20} />
                        Tools
                    </Link>
                    <Link
                        href="/merchant/manage"
                        className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100"
                    >
                        <Settings size={20} />
                        Manage
                    </Link>
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
