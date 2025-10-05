"use client";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable from "@/components/merchant/common/DataTable";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const sliderColumns = [
    { label: "Name", checked: true },
    { label: "Slider code", checked: true },
    { label: "Updated", checked: true },
];

export default function SlidersPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);

    const sliderTableData = [
        { label: "Name", sortable: true, key: "name" },
        { label: "Slider code", sortable: true, key: "sliderCode" },
        { label: "Updated", sortable: true, key: "updated" },
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
            <h1 className="text-2xl font-semibold mb-6 text-gray-900">Sliders</h1>
            {/* Modal setup columns */}
            <ListSetupModal open={openSetupModal} onClose={() => setOpenSetupModal(false)} columns={sliderColumns} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Action Bar */}
                <div className="flex items-center p-4 border-b border-gray-200 gap-2">
                    <ActionBar newLabel="New" secondaryLabel="Banners" />
                </div>
                {/* Table */}
                <DataTable columns={sliderTableData} emptyText="There are no sliders available." colSpan={4} />
                {/* Footer */}
                <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                    Showing 0-0 of 0 records
                </div>
            </div>
        </div>
    );
}
