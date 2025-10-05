"use client";
import HeaderDropdown from "@/components/layout/merchant/HeaderDropdown";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable from "@/components/merchant/common/DataTable";
import SearchFilter from "@/components/merchant/common/SearchFilter";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import { SlidersHorizontal, ChevronLeft } from "lucide-react";
import { useState } from "react";

const locationColumns = [
    { label: "Name", checked: true },
    { label: "City", checked: true },
    { label: "State", checked: true },
    { label: "Postcode", checked: true },
    { label: "Telephone", checked: true },
    { label: "Status", checked: true },
];

const filterOptions = [
    {
        label: "View all status",
        options: [
            { value: "all", label: "View all status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "blocked", label: "Blocked" },
        ],
    },
];

export default function LocationsPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);

    const locationTableData = [
        { label: "Name", sortable: true, key: "name" },
        { label: "City", sortable: true, key: "city" },
        { label: "State", sortable: true, key: "state" },
        { label: "Postcode", sortable: true, key: "postcode" },
        { label: "Telephone", sortable: true, key: "telephone" },
        { label: "Status", sortable: true, key: "status" },
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

    const handleBack = () => {
        console.log("Navigate back");
        // Add navigation logic here
    };

    return (
        <div className="min-h-screen">
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={handleBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Locations</h1>
            </div>

            {/* Modal setup columns */}
            <ListSetupModal open={openSetupModal} onClose={() => setOpenSetupModal(false)} columns={locationColumns} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Action Bar */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <ActionBar newLabel="New" />

                    {/* Search and Filter using SearchFilter component */}
                    <SearchFilter
                        searchPlaceholder="Search by name or city"
                        filterOptions={filterOptions}
                        HeaderDropdown={HeaderDropdown}
                        onSearch={(value) => console.log("Search:", value)}
                        onFilterChange={(index, value) => console.log("Filter changed:", index, value)}
                        onClear={() => console.log("Cleared all filters")}
                    />
                </div>

                {/* Table */}
                <DataTable
                    columns={locationTableData}
                    emptyText="There are no locations available."
                    colSpan={8}
                    checkbox={true}
                />
            </div>
        </div>
    );
}
