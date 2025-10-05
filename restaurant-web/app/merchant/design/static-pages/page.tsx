"use client";
import HeaderDropdown from "@/components/layout/merchant/HeaderDropdown";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable from "@/components/merchant/common/DataTable";
import SearchFilter from "@/components/merchant/common/SearchFilter";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const staticPageColumns = [
    { label: "Title", checked: true },
    { label: "Language", checked: true },
    { label: "Status", checked: true },
    { label: "Date Updated", checked: true },
    { label: "ID", checked: false },
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

export default function StaticPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);

    const staticPageTableData = [
        { label: "Title", sortable: true, key: "title" },
        { label: "Language", sortable: true, key: "language" },
        { label: "Status", sortable: true, key: "status" },
        { label: "Date Updated", sortable: true, key: "dateUpdated" },
        {
            label: "Setup",
            icon: (
                <SlidersHorizontal
                    size={14}
                    className="text-brand-black cursor-pointer"
                    onClick={() => setOpenSetupModal(true)}
                />
            ),
            tooltip: "Settings",
        },
    ];

    return (
        <div className="min-h-screen">
            <h1 className="text-2xl font-semibold mb-6 text-gray-900">Static Pages</h1>
            {/* Modal setup columns */}
            <ListSetupModal
                open={openSetupModal}
                onClose={() => setOpenSetupModal(false)}
                columns={staticPageColumns}
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Action Bar */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <ActionBar newLabel="New" secondaryLabel="Static Menus" />
                    {/* Search and Filter giống file order */}
                    <SearchFilter
                        searchPlaceholder="Search by name or email."
                        filterOptions={filterOptions}
                        HeaderDropdown={HeaderDropdown}
                        onSearch={(value) => console.log("Search:", value)}
                        onFilterChange={(index, value) => console.log("Filter changed:", index, value)}
                        onClear={() => console.log("Cleared all filters")}
                    />
                </div>
                {/* Table */}
                <DataTable columns={staticPageTableData} emptyText="There are no static pages available." colSpan={7} />
                {/* Footer */}
                <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                    Showing 0-0 of 0 records
                </div>
            </div>
        </div>
    );
}
