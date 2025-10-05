"use client";
import HeaderDropdown from "@/components/layout/merchant/HeaderDropdown";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable from "@/components/merchant/common/DataTable";
import SearchFilter from "@/components/merchant/common/SearchFilter";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import RatingDashboard from "@/components/merchant/reviews/RatingDashboard";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const reviewsColumns = [
    { label: "Author", checked: true },
    { label: "Reviewable ID", checked: true },
    { label: "Reviewable Type", checked: true },
    { label: "Status", checked: true },
    { label: "Date Added", checked: true },
    { label: "ID", checked: false },
    { label: "Date Updated", checked: false },
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

export default function ReviewsPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);

    const reviewsTableData = [
        { label: "Author", sortable: true, key: "author" },
        { label: "Reviewable ID", sortable: true, key: "reviewableId" },
        { label: "Reviewable Type", sortable: true, key: "reviewableType" },
        { label: "Status", sortable: true, key: "status" },
        { label: "Date Added", sortable: true, key: "dateAdded" },
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

    const ratingData = {
        quality: { poor: 0.1, average: 0.3, good: 0.6, veryGood: 0.8, excellent: 0.4 },
        service: { poor: 0.2, average: 0.4, good: 0.7, veryGood: 0.9, excellent: 0.5 },
        delivery: { poor: 0.15, average: 0.35, good: 0.65, veryGood: 0.85, excellent: 0.45 },
    };

    return (
        <div className="min-h-screen">
            <h1 className="text-2xl font-semibold mb-6 text-gray-900">Reviews</h1>

            {/* Modal setup columns */}
            <ListSetupModal open={openSetupModal} onClose={() => setOpenSetupModal(false)} columns={reviewsColumns} />

            {/* Rating Charts */}
            <RatingDashboard
                qualityData={ratingData.quality}
                serviceData={ratingData.service}
                deliveryData={ratingData.delivery}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Action Bar */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <ActionBar newLabel="New" />
                    {/* Search and Filter */}
                    <SearchFilter
                        searchPlaceholder="Search by author, restaurant"
                        filterOptions={filterOptions}
                        HeaderDropdown={HeaderDropdown}
                        onSearch={(value) => console.log("Search:", value)}
                        onFilterChange={(index, value) => console.log("Filter changed:", index, value)}
                        onClear={() => console.log("Cleared all filters")}
                    />
                </div>

                {/* Table */}
                <DataTable columns={reviewsTableData} emptyText="There are no reviews available." colSpan={7} />

                {/* Footer */}
                <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                    Showing 0-0 of 0 records
                </div>
            </div>
        </div>
    );
}
