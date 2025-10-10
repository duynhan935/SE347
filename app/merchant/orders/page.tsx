"use client";
import HeaderDropdown from "@/components/layout/merchant/HeaderDropdown";
import DataTable from "@/components/merchant/common/DataTable";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import SearchFilter from "@/components/merchant/common/SearchFilter";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const orderColumns = [
    { label: "ID", checked: true },
    { label: "Customer Name", checked: true },
    { label: "Type", checked: true },
    { label: "Order Time Is Asap", checked: true },
    { label: "Order Time", checked: true },
    { label: "Ready Time - Date", checked: true },
    { label: "Status", checked: true },
    { label: "Payment", checked: true },
    { label: "Assigned To", checked: false },
    { label: "Assigned To Group", checked: false },
    { label: "Order Total", checked: true },
    { label: "Telephone", checked: false },
    { label: "Email", checked: false },
    { label: "Date Updated", checked: false },
    { label: "Date Added", checked: false },
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

export default function OrdersPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);

    const orderTableData = [
        {
            label: "ID",
            sortable: true,
            key: "id",
        },
        {
            label: "Customer Name",
            sortable: true,
            key: "customer_name",
        },
        {
            label: "Type",
            sortable: false,
        },
        {
            label: "Order Time Is Asap",
            sortable: true,
            key: "order_time_asap",
        },
        {
            label: "Order Time",
            sortable: true,
            key: "order_time",
        },
        {
            label: "Ready Time - Date",
            sortable: true,
            key: "ready_time",
        },
        {
            label: "Status",
            sortable: true,
            key: "status",
        },
        {
            label: "Payment",
            sortable: false,
        },
        {
            label: "Order Total",
            sortable: true,
            key: "order_total",
        },
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
            sortable: false,
        },
    ];

    const handleSort = (columnKey: string, direction: "asc" | "desc" | null) => {
        console.log(`Sorting ${columnKey} in ${direction} order`);
    };

    return (
        <div className="min-h-screen">
            <h1 className="text-h4 font-semibold mb-6 text-gray-900 ">Orders</h1>

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
                <ListSetupModal open={openSetupModal} onClose={() => setOpenSetupModal(false)} columns={orderColumns} />
                {/* Table */}
                <DataTable
                    columns={orderTableData}
                    emptyText="There are no orders available."
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
