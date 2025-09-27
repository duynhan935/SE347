"use client";
import HeaderDropdown from "@/components/layout/merchant/HeaderDropdown";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable from "@/components/merchant/common/DataTable";
import SearchFilter from "@/components/merchant/common/SearchFilter";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import { ArrowDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const menuItemColumns = [
    { label: "Name", checked: true },
    { label: "Category", checked: true },
    { label: "Price", checked: true },
    { label: "Stock Qty", checked: true },
    { label: "Special Status", checked: true },
    { label: "Status", checked: true },
    { label: "ID", checked: false },
    { label: "Date Added", checked: false },
    { label: "Date Updated", checked: false },
];

const filterOptions = [
    {
        label: "View all categories",
        options: [
            { value: "all", label: "View all categories" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "blocked", label: "Blocked" },
        ],
    },
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

export default function MenuItemPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);

    const menuItemTableData = [
        { label: "Name", sortable: true, key: "name" },
        { label: "Category", sortable: true, key: "category" },
        { label: "Price", sortable: true, key: "price" },
        { label: "Stock Qty", sortable: true, key: "stockQty" },
        { label: "Special Status", sortable: true, key: "specialStatus" },
        { label: "Status", sortable: true, key: "status" },
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
            <h1 className="text-2xl font-semibold mb-6 text-gray-900">Menus</h1>
            {/* Modal setup columns */}
            <ListSetupModal open={openSetupModal} onClose={() => setOpenSetupModal(false)} columns={menuItemColumns} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Action Bar */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <ActionBar newLabel="New" secondaryLabel="..." secondaryIcon={<ArrowDown size={14} />} />
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
                <DataTable columns={menuItemTableData} emptyText="There are no MenuItem available." colSpan={7} />
                {/* Footer */}
                <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                    Showing 0-0 of 0 records
                </div>
            </div>
        </div>
    );
}
