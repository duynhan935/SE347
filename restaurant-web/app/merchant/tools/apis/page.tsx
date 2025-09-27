"use client";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable from "@/components/merchant/common/DataTable";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import { SlidersHorizontal, Search, Key } from "lucide-react";
import { useState } from "react";

const apiColumns = [
    { label: "Name", checked: true },
    { label: "Base Endpoint", checked: true },
    { label: "Description", checked: true },
];

export default function APIsPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const apiTableData = [
        { label: "Name", sortable: true, key: "name" },
        { label: "Base Endpoint", sortable: false, key: "baseEndpoint" },
        { label: "Description", sortable: true, key: "description" },
        {
            label: "Setup",
            icon: (
                <SlidersHorizontal
                    size={18}
                    className="text-brand-black cursor-pointer"
                    onClick={() => setOpenSetupModal(true)}
                />
            ),
            tooltip: "Settings",
        },
    ];

    const handleSearch = (value: string) => {
        setSearchValue(value);
        console.log("Search:", value);
    };

    return (
        <div className="min-h-screen">
            <h1 className="text-2xl font-semibold mb-6 text-gray-900">APIs</h1>

            {/* Modal setup columns */}
            <ListSetupModal open={openSetupModal} onClose={() => setOpenSetupModal(false)} columns={apiColumns} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Action Bar */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    {/* Left side - Access tokens button */}
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                        <Key size={16} />
                        Access tokens
                    </button>

                    {/* Right side - Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search api name"
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64"
                        />
                    </div>
                </div>

                {/* Table */}
                <DataTable
                    columns={apiTableData}
                    emptyText="There are no APIs available."
                    colSpan={4}
                    checkbox={true}
                />
            </div>
        </div>
    );
}
