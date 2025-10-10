/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import HeaderDropdown from "@/components/layout/merchant/HeaderDropdown";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable, { SortDirection } from "@/components/merchant/common/DataTable";
import SearchFilter from "@/components/merchant/common/SearchFilter";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import { ArrowDown, SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { menuItemsData } from "@/fake-data/menuItemsData";

// Cấu hình cột cho modal setup
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
            { value: "Main Course", label: "Main Course" },
            { value: "Traditional", label: "Traditional" },
            { value: "Salad", label: "Salad" },
            { value: "Seafood", label: "Seafood" },
            { value: "Rice Dishes", label: "Rice Dishes" },
            { value: "Soup", label: "Soup" },
            { value: "Grilled", label: "Grilled" },
        ],
    },
    {
        label: "View all status",
        options: [
            { value: "all", label: "View all status" },
            { value: "Enabled", label: "Enabled" },
            { value: "Disabled", label: "Disabled" },
            { value: "Out of Stock", label: "Out of Stock" },
        ],
    },
];

export default function MenuItemPage() {
    const [openSetupModal, setOpenSetupModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Dữ liệu đã lọc dựa trên tìm kiếm và bộ lọc
    const filteredData = useMemo(() => {
        return menuItemsData.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
            const matchesStatus = statusFilter === "all" || item.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [menuItemsData, searchTerm, categoryFilter, statusFilter]);
    // Dữ liệu sẽ chỉ được lọc lại khi searchTerm, categoryFilter hoặc statusFilter thay đổi khi dùng useMemo để tối ưu hiệu suất

    // Dữ liệu bảng và cột sẽ được
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
            key: "setup", // Thêm key rỗng
            render: () => null, // Không render gì trong cells
        },
    ];

    // Event handlers
    const handleSearch = (value: any) => {
        setSearchTerm(value);
        console.log("Search:", value);
    };

    const handleFilterChange = (index: number, value: any) => {
        if (index === 0) {
            setCategoryFilter(value);
        } else if (index === 1) {
            setStatusFilter(value);
        }
        console.log("Filter changed:", index, value);
    };

    const handleClear = () => {
        setSearchTerm("");
        setCategoryFilter("all");
        setStatusFilter("all");
        console.log("Cleared all filters");
    };

    const handleRowSelect = (selectedItems: any) => {
        console.log("Selected items:", selectedItems);
    };

    const handleSort = (columnKey: string, direction: SortDirection) => {
        console.log(`Sorting ${columnKey} in ${direction} order`);
    };

    return (
        <div className="min-h-screen">
            <h1 className="text-2xl font-semibold mb-6 text-gray-900">Menus</h1>

            {/* Modal setup columns */}
            <ListSetupModal open={openSetupModal} onClose={() => setOpenSetupModal(false)} columns={menuItemColumns} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Action Bar */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <ActionBar newLabel="New" secondaryLabel="..." secondaryIcon={<ArrowDown size={14} />} />

                    {/* Search and Filter */}
                    <SearchFilter
                        searchPlaceholder="Search by name or category"
                        filterOptions={filterOptions}
                        HeaderDropdown={HeaderDropdown}
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                        onClear={handleClear}
                    />
                </div>

                {/* Table */}
                <DataTable
                    columns={menuItemTableData}
                    data={filteredData}
                    emptyText="There are no MenuItem available."
                    colSpan={7}
                    onRowSelect={handleRowSelect}
                    onSort={handleSort}
                />

                {/* Footer */}
                <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                    Showing {filteredData.length > 0 ? "1" : "0"}-{filteredData.length} of {filteredData.length} records
                </div>
            </div>
        </div>
    );
}
