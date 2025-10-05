"use client";
import HeaderDropdown from "@/components/layout/merchant/HeaderDropdown";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable from "@/components/merchant/common/DataTable";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import SearchFilter from "@/components/merchant/common/SearchFilter";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const staffColumns = [
    { label: "Full Name", checked: true },
    { label: "Email", checked: true },
    { label: "User Groups", checked: true },
    { label: "User Roles", checked: true },
    { label: "Last Login", checked: true },
    { label: "Date Added", checked: true },
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
export default function StaffMembersPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);

    const staffTableData = [
        { label: "Full Name", sortable: true, key: "fullName" },
        { label: "Email", sortable: true, key: "email" },
        { label: "User Groups", sortable: true, key: "userGroups" },
        { label: "User Roles", sortable: true, key: "userRoles" },
        { label: "Last Login", sortable: true, key: "lastLogin" },
        { label: "Date Added", sortable: true, key: "dateAdded" },
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

    return (
        <div className="min-h-screen">
            <h1 className="text-2xl font-semibold mb-6 text-gray-900">Staff members</h1>

            {/* Modal setup columns */}
            <ListSetupModal open={openSetupModal} onClose={() => setOpenSetupModal(false)} columns={staffColumns} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Action Bar */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    {/* Left side - New button and tabs */}
                    <div className="flex items-center">
                        <ActionBar newLabel="New" secondaryLabel="Groups" tertiaryLabel="Roles" />
                    </div>

                    {/* Right side - Search and Filter */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <SearchFilter
                            searchPlaceholder="Search by name or city"
                            filterOptions={filterOptions}
                            HeaderDropdown={HeaderDropdown}
                            onSearch={(value) => console.log("Search:", value)}
                            onFilterChange={(index, value) => console.log("Filter changed:", index, value)}
                            onClear={() => console.log("Cleared all filters")}
                        />
                    </div>
                </div>

                {/* Table */}
                <DataTable
                    columns={staffTableData}
                    emptyText="There are no staff members available."
                    colSpan={8}
                    checkbox={true}
                />
            </div>
        </div>
    );
}
