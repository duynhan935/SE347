"use client";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable from "@/components/merchant/common/DataTable";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const automationColumns = [
    { label: "Name", checked: true },
    { label: "Code", checked: true },
    { label: "Event", checked: true },
    { label: "Status", checked: true },
];

export default function AutomationsPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);

    const automationTableData = [
        { label: "Name", sortable: true, key: "name" },
        { label: "Code", sortable: true, key: "code" },
        { label: "Event", sortable: false, key: "event" },
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

    return (
        <div className="min-h-screen">
            <h1 className="text-2xl font-semibold mb-6 text-gray-900">Automations</h1>

            {/* Modal setup columns */}
            <ListSetupModal
                open={openSetupModal}
                onClose={() => setOpenSetupModal(false)}
                columns={automationColumns}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Action Bar */}
                <div className="flex items-center p-4 border-b border-gray-200">
                    <ActionBar newLabel="New" />
                </div>

                {/* Table */}
                <DataTable
                    columns={automationTableData}
                    emptyText="There are no automations available."
                    colSpan={6}
                    checkbox={true}
                />
            </div>
        </div>
    );
}
