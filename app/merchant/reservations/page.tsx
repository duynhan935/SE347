"use client";
import HeaderDropdown from "@/components/layout/merchant/HeaderDropdown";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable from "@/components/merchant/common/DataTable";
import SearchFilter from "@/components/merchant/common/SearchFilter";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const reservationColumns = [
    { label: "ID", checked: true },
    { label: "Name", checked: true },
    { label: "Guest(s)", checked: true },
    { label: "Table", checked: true },
    { label: "Status", checked: true },
    { label: "User", checked: true },
    { label: "Time", checked: true },
    { label: "Date", checked: true },
    { label: "Comment", checked: false },
    { label: "Telephone", checked: false },
    { label: "Email", checked: false },
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
        label: "View all status",
        options: [
            { value: "all", label: "View all status" },
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "cancelled", label: "Cancelled" },
        ],
    },
];

export default function ReservationsPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);

    const reservationTableData = [
        { label: "ID", sortable: true, key: "id" },
        { label: "Name", sortable: true, key: "name" },
        { label: "Guest(s)", sortable: true, key: "guests" },
        { label: "Table", sortable: true, key: "table" },
        { label: "Status", sortable: true, key: "status" },
        { label: "User", sortable: true, key: "user" },
        { label: "Time", sortable: true, key: "time" },
        { label: "Date", sortable: true, key: "date" },
        {
            label: "Set up",
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
            <h1 className="text-2xl font-semibold mb-6 text-gray-900">Reservations</h1>

            {/* Modal setup columns */}
            <ListSetupModal
                open={openSetupModal}
                onClose={() => setOpenSetupModal(false)}
                columns={reservationColumns}
            />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <ActionBar newLabel="New" secondaryLabel="List View" />

                    {/* Search and Filter giống file order */}
                    <SearchFilter
                        searchPlaceholder="Search by id, name, guest, table..."
                        filterOptions={filterOptions}
                        HeaderDropdown={HeaderDropdown}
                        onSearch={(value) => console.log("Search:", value)}
                        onFilterChange={(index, value) => console.log("Filter changed:", index, value)}
                        onClear={() => console.log("Cleared all filters")}
                    />
                </div>

                <DataTable
                    columns={reservationTableData}
                    emptyText="There are no reservations available."
                    colSpan={10}
                    onSort={handleSort}
                />

                <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                    Showing 0-0 of 0 records
                </div>
            </div>
        </div>
    );
}
