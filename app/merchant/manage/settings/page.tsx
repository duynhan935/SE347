"use client";
import SettingCard from "@/components/merchant/setting/SettingCard";
import {
    AlertTriangle,
    Users,
    Flag,
    CreditCard,
    FileText,
    GitBranch,
    DollarSign,
    ShoppingCart,
    Utensils,
    Languages,
} from "lucide-react";

export default function SettingsDashboard() {
    const handleSettingClick = (settingName: string) => {
        console.log(`${settingName} clicked`);
    };

    const settingsData = [
        {
            icon: <AlertTriangle size={25} color="red" />,
            title: "General",
            description: "Configure your restaurant name, email, logo and geolocation settings",
            variant: "warning" as const,
        },
        {
            icon: <FileText size={25} />,
            title: "Order",
            description: "Configure guest order, order emails, order status workflow and taxation settings",
        },
        {
            icon: <Utensils size={25} />,
            title: "Reservation",
            description: "Configure reservation settings",
        },
        {
            icon: <Users size={25} />,
            title: "Customer registration",
            description: "Configure registration email confirmation ...",
        },
        {
            icon: <GitBranch size={25} />,
            title: "Statuses",
            description: "Manage your order and reservation statuses.",
        },
        {
            icon: <Languages size={25} />,
            title: "Languages",
            description: "Manage languages available on your site.",
        },
        {
            icon: <Flag size={25} />,
            title: "Countries",
            description: "Manage countries available on your site.",
        },
        {
            icon: <DollarSign size={25} />,
            title: "Currencies",
            description: "Manage currencies available on your site.",
        },
        {
            icon: <AlertTriangle size={25} color="red" />,
            title: "Advanced",
            description: "Manage advanced system settings such as enabling/disabling maintenance.",
            variant: "warning" as const,
        },
        {
            icon: <CreditCard size={25} />,
            title: "Payment Gateways",
            description: "Manage payment gateways and settings",
        },
        {
            icon: <ShoppingCart size={25} />,
            title: "Cart Settings",
            description: "Manage cart conditions and tipping settings.",
        },
    ];

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-semibold mb-8 text-gray-900">Settings</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {settingsData.map((setting, index) => (
                        <SettingCard
                            key={index}
                            icon={setting.icon}
                            title={setting.title}
                            description={setting.description}
                            variant={setting.variant}
                            onClick={() => handleSettingClick(setting.title)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
