"use client";
import HeaderDropdown from "@/components/layout/merchant/HeaderDropdown";
import DataTable from "@/components/merchant/common/DataTable";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import SearchFilter from "@/components/merchant/common/SearchFilter";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const inventoryColumns = [
    { label: "Stock ID", checked: true },
    { label: "Type", checked: true },
    { label: "Name", checked: true },
    { label: "Low Stock Threshold", checked: true },
    { label: "Quantity", checked: true },
];

const filterOptions = [
    {
        label: "View all assignees",
        options: [
            { value: "all", label: "View all assignees" },
            { value: "me", label: "Assigned To Me" },
            { value: "other", label: "Assigned To Other User" },
            { value: "unassigned", label: "Yet to be Assigned" },
        ],
    },
    {
        label: "View all Status",
        options: [
            { value: "all", label: "View all Status" },
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
        ],
    },
];

export default function InventoryPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);

    const inventoryTableData = [
        { label: "Stock ID", sortable: true, key: "stockId" },
        { label: "Type", sortable: true, key: "type" },
        { label: "Name", sortable: true, key: "name" },
        { label: "Low Stock Threshold", sortable: true, key: "lowStockThreshold" },
        { label: "Quantity", sortable: true, key: "quantity" },
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

    const handleSort = (columnKey: string, direction: "asc" | "desc" | null) => {
        console.log(`Sorting ${columnKey} in ${direction} order`);
    };

    return (
        <div className="min-h-screen">
            <h1 className="text-h4 font-semibold mb-6 text-gray-900 ">Inventory</h1>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div></div>

                    {/* Search and Filter */}
                    <SearchFilter
                        searchPlaceholder="Search by id, customer name, phone..."
                        filterOptions={filterOptions}
                        HeaderDropdown={HeaderDropdown}
                        onSearch={(value) => console.log("Search:", value)}
                        onFilterChange={(index, value) => console.log("Filter changed:", index, value)}
                        onClear={() => console.log("Cleared all filters")}
                    />
                </div>

                {/* List Setup Modal */}
                <ListSetupModal
                    open={openSetupModal}
                    onClose={() => setOpenSetupModal(false)}
                    columns={inventoryColumns}
                />
                {/* Table */}
                <DataTable
                    columns={inventoryTableData}
                    emptyText="There are no inventory items available."
                    colSpan={11}
                    onSort={handleSort}
                />

                {/* Footer */}
                <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                    Showing 0-0 of 0 records
                </div>
            </div>
        </div>
    );
}
