"use client";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable from "@/components/merchant/common/DataTable";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const webhookColumns = [
    { label: "Name", checked: true },
    { label: "Payload Url", checked: true },
    { label: "Status", checked: true },
];

export default function WebhooksPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);

    const webhookTableData = [
        { label: "Name", sortable: true, key: "name" },
        { label: "Payload Url", sortable: true, key: "payloadUrl" },
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
            <h1 className="text-2xl font-semibold mb-6 text-gray-900">Webhooks</h1>

            {/* Modal setup columns */}
            <ListSetupModal open={openSetupModal} onClose={() => setOpenSetupModal(false)} columns={webhookColumns} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Action Bar */}
                <div className="flex items-center p-4 border-b border-gray-200">
                    <ActionBar newLabel="New" />
                </div>

                {/* Table */}
                <DataTable
                    columns={webhookTableData}
                    emptyText="There are no webhooks available."
                    colSpan={5}
                    checkbox={true}
                />
            </div>
        </div>
    );
}
