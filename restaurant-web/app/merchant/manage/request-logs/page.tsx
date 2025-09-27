"use client";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable from "@/components/merchant/common/DataTable";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import { SlidersHorizontal, ChevronLeft, Search, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";

const requestLogsColumns = [
    { label: "Status Code", checked: true },
    { label: "Requested Url", checked: true },
    { label: "Counter", checked: true },
];

export default function RequestLogsPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const requestLogsTableData = [
        { label: "Status Code", sortable: true, key: "statusCode" },
        { label: "Requested Url", sortable: false, key: "requestedUrl" },
        { label: "Counter", sortable: true, key: "counter" },
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

    const handleBack = () => {
        console.log("Navigate back");
        // Add navigation logic here
    };

    const handleRefresh = () => {
        console.log("Refresh logs");
        // Add refresh logic here
    };

    const handleEmptyLogs = () => {
        console.log("Empty logs");
        // Add empty logs logic here
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        console.log("Search:", value);
    };

    return (
        <div className="min-h-screen">
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={handleBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Request Logs</h1>
            </div>

            {/* Modal setup columns */}
            <ListSetupModal
                open={openSetupModal}
                onClose={() => setOpenSetupModal(false)}
                columns={requestLogsColumns}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Action Bar */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    {/* Left side - Action buttons */}
                    <div className="flex items-center gap-2">
                        {/* Refresh button */}
                        <button
                            onClick={handleRefresh}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>

                        {/* Empty Logs button */}
                        <button
                            onClick={handleEmptyLogs}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Empty Logs
                        </button>
                    </div>

                    {/* Right side - Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, url or status code"
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-80"
                        />
                    </div>
                </div>

                {/* Table */}
                <DataTable
                    columns={requestLogsTableData}
                    emptyText="There are no request logs available."
                    colSpan={5}
                    checkbox={true}
                />
            </div>
        </div>
    );
}
