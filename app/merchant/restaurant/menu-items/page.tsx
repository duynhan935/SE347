/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import HeaderDropdown from "@/components/layout/merchant/HeaderDropdown";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable, { SortDirection } from "@/components/merchant/common/DataTable";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import SearchFilter from "@/components/merchant/common/SearchFilter";
import { useProductStore } from "@/stores/useProductsStores";
import { ArrowDown, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
                        { value: "drinks", label: "Drinks" },
                ],
        },
        {
                label: "View all status",
                options: [
                        { value: "all", label: "View all status" },
                        { value: "Enabled", label: "Enabled" },
                        { value: "Disabled", label: "Disabled" },
                ],
        },
];

export default function MenuItemPage() {
        const [openSetupModal, setOpenSetupModal] = useState(false);
        const [searchTerm, setSearchTerm] = useState("");
        const [categoryFilter, setCategoryFilter] = useState("all");
        const [statusFilter, setStatusFilter] = useState("all");

        const { products, fetchProductsByRestaurantId, loading, error } = useProductStore();

        useEffect(() => {
                const merchantId =
                        "f6M7LxiWsKU3yu1QqxBJrc0ePRG8ciHF60Y9xO3XzzHhRf1FlmC5H0ovQM4slJVwrqwz0aFaz2ZUOJCq45EUY4S1mAYZAoOhkuc4bfF3L34ilHpUbmPgv14qM7OnTOXioewL4YKV0KettlXDBzBOXk6WGOF2r0AD4cAiBZq5PkqTasK9O20iwUUORGDsGlNIrswd35K15ZLhM18fhlXAV9bkd96kSSn9SMiEIz5It1PMdvrKpXRbaYk0r0RdvZ";
                fetchProductsByRestaurantId(merchantId);
        }, [fetchProductsByRestaurantId]);

        // 🔸 Chuyển dữ liệu products trả về từ API thành dữ liệu bảng phù hợp
        const mappedData = useMemo(() => {
                return products.map((p) => ({
                        id: p.id,
                        name: p.productName,
                        category: p.categoryName || "N/A",
                        price: p.productSizes?.[0]?.price ?? 0,
                        stockQty: p.volume ?? 0,
                        specialStatus: p.totalReview ?? 0,
                        status: p.available ? "Enabled" : "Disabled",
                        rating: p.rating ?? 0,
                }));
        }, [products]);

        // 🔸 Lọc dữ liệu theo tìm kiếm & bộ lọc
        const filteredData = useMemo(() => {
                return mappedData.filter((item) => {
                        const matchesSearch =
                                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                item.category.toLowerCase().includes(searchTerm.toLowerCase());

                        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

                        const matchesStatus = statusFilter === "all" || item.status === statusFilter;

                        return matchesSearch && matchesCategory && matchesStatus;
                });
        }, [mappedData, searchTerm, categoryFilter, statusFilter]);

        // 🔸 Cấu hình cột cho DataTable
        const menuItemTableData = [
                { label: "Name", sortable: true, key: "name" },
                { label: "Category", sortable: true, key: "category" },
                { label: "Price", sortable: true, key: "price" },
                { label: "Stock Qty", sortable: true, key: "stockQty" },
                { label: "Reviews", sortable: true, key: "specialStatus" },
                { label: "Rating", sortable: true, key: "rating" },
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
                        key: "setup",
                        render: () => null,
                },
        ];

        // Event handlers
        const handleSearch = (value: any) => setSearchTerm(value);
        const handleFilterChange = (index: number, value: any) => {
                if (index === 0) setCategoryFilter(value);
                else if (index === 1) setStatusFilter(value);
        };
        const handleClear = () => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStatusFilter("all");
        };
        const handleRowSelect = (selectedItems: any) => console.log("Selected items:", selectedItems);
        const handleSort = (columnKey: string, direction: SortDirection) =>
                console.log(`Sorting ${columnKey} in ${direction} order`);

        if (loading) return <p>Đang tải thông tin sản phẩm...</p>;
        if (error) return <p>Đã xảy ra lỗi khi tải thông tin sản phẩm.</p>;

        return (
                <div className="min-h-screen">
                        <h1 className="text-2xl font-semibold mb-6 text-gray-900">Menus</h1>

                        {/* Modal setup columns */}
                        <ListSetupModal
                                open={openSetupModal}
                                onClose={() => setOpenSetupModal(false)}
                                columns={menuItemColumns}
                        />

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                {/* Action Bar */}
                                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                                        <ActionBar
                                                newLabel="New"
                                                secondaryLabel="..."
                                                secondaryIcon={<ArrowDown size={14} />}
                                        />

                                        <SearchFilter
                                                searchPlaceholder="Search by name or category"
                                                filterOptions={filterOptions}
                                                HeaderDropdown={HeaderDropdown}
                                                onSearch={handleSearch}
                                                onFilterChange={handleFilterChange}
                                                onClear={handleClear}
                                        />
                                </div>

                                {/* ✅ Hiển thị bảng bằng dữ liệu thật từ API */}
                                <DataTable
                                        columns={menuItemTableData}
                                        data={filteredData}
                                        emptyText="There are no MenuItem available."
                                        colSpan={7}
                                        onRowSelect={handleRowSelect}
                                        onSort={handleSort}
                                />

                                <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                                        Showing {filteredData.length > 0 ? "1" : "0"}-{filteredData.length} of{" "}
                                        {filteredData.length} records
                                </div>
                        </div>
                </div>
        );
}
