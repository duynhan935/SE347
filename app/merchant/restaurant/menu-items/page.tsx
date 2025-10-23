/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import HeaderDropdown from "@/components/layout/merchant/HeaderDropdown";
import ActionBar from "@/components/merchant/common/ActionBar";
import DataTable, { SortDirection } from "@/components/merchant/common/DataTable";
import ListSetupModal from "@/components/merchant/common/ListSetupModal";
import SearchFilter from "@/components/merchant/common/SearchFilter";
import { useCategoryStore } from "@/stores/categoryStore";
import { useProductStore } from "@/stores/useProductsStores";
import { ArrowDown, Loader2, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const menuItemColumns = [
        { label: "Name", checked: true },
        { label: "Category", checked: true },
        { label: "Price", checked: true },
        { label: "Stock Qty", checked: true },
        { label: "Reviews", checked: true },
        { label: "Rating", checked: false },
        { label: "Status", checked: true },
        { label: "ID", checked: false },
];

export default function MenuItemPage() {
        const router = useRouter();
        const [openSetupModal, setOpenSetupModal] = useState(false);
        const [searchTerm, setSearchTerm] = useState("");
        const [categoryFilter, setCategoryFilter] = useState("all");
        const [statusFilter, setStatusFilter] = useState("all");

        const {
                products,
                fetchProductsByRestaurantId,
                loading: productLoading,
                error: productError,
        } = useProductStore();
        const { categories, fetchAllCategories, loading: categoryLoading, error: categoryError } = useCategoryStore();

        useEffect(() => {
                // Tạm dùng restaurantId mẫu
                const restaurantId =
                        "aLllLYkss6DkGM4fNys8RA08B7ENNcL0niS3FPpEItEWKAb2xg85Dspu8DNt9Fj9Vu9FB0kh5xLSOQcClUOv69rEJJsqHwxAgcXv4b7kLdoxV0PNR7gXRkR5tYZwbxweKkiYmQ35SlqvYHf1jFeehZrPS8OT8fqYrQpHRkUAZKqHPr2ihtUiksD6WXqMlgR1dFtj6DmQ21CZ2lYJJ1nSTrU906s8hidYM2EBQ94hOLfE6pI3IBh104u4cv80KD";
                fetchProductsByRestaurantId(restaurantId);
                fetchAllCategories();
        }, [fetchProductsByRestaurantId, fetchAllCategories]);

        const filterOptions = useMemo(() => {
                const validCategories = Array.isArray(categories) ? categories : [];
                const categoryOptions = validCategories.map((c) => ({
                        value: c.cateName,
                        label: c.cateName,
                }));
                return [
                        {
                                label: "View all categories",
                                options: [{ value: "all", label: "View all categories" }, ...categoryOptions],
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
        }, [categories]);

        const mappedData = useMemo(() => {
                const validProducts = Array.isArray(products) ? products : [];
                return validProducts.map((p) => ({
                        id: p.id,
                        name: p.productName,
                        category: p.categoryName || "N/A",
                        price: p.productSizes?.[0]?.price ?? 0,
                        stockQty: p.volume ?? 0,
                        reviews: p.totalReview ?? 0,
                        rating: p.rating ?? 0,
                        status: p.available ? "Enabled" : "Disabled",
                }));
        }, [products]);

        const filteredData = useMemo(() => {
                return mappedData.filter((item) => {
                        const lowerSearch = searchTerm.toLowerCase();
                        const matchesSearch =
                                item.name.toLowerCase().includes(lowerSearch) ||
                                item.category.toLowerCase().includes(lowerSearch);
                        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
                        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
                        return matchesSearch && matchesCategory && matchesStatus;
                });
        }, [mappedData, searchTerm, categoryFilter, statusFilter]);

        const menuItemTableData = [
                { label: "Name", sortable: true, key: "name" },
                { label: "Category", sortable: true, key: "category" },
                { label: "Price", sortable: true, key: "price" },
                { label: "Stock Qty", sortable: true, key: "stockQty" },
                { label: "Reviews", sortable: true, key: "reviews" },
                { label: "Rating", sortable: true, key: "rating" },
                { label: "Status", sortable: true, key: "status" },
                {
                        label: "Edit",
                        key: "edit",
                        sortable: false,
                        render: (_: any, item: any) => (
                                <Link
                                        href={`/merchant/restaurant/menu-items/${item.id}`}
                                        className="inline-flex items-center justify-center px-3 py-1 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition"
                                >
                                        <Pencil size={14} className="mr-1" />
                                        Edit
                                </Link>
                        ),
                },
        ];

        const handleSearch = (value: string) => setSearchTerm(value);
        const handleFilterChange = (index: number, value: string) => {
                index === 0 ? setCategoryFilter(value) : setStatusFilter(value);
        };
        const handleClear = () => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStatusFilter("all");
        };
        const handleRowSelect = (selectedItems: any[]) => console.log("Selected items:", selectedItems);
        const handleSort = (columnKey: string, direction: SortDirection) =>
                console.log(`Sorting ${columnKey} in ${direction} order`);

        const isLoading = productLoading || categoryLoading;
        const error = productError || categoryError;

        if (isLoading && !products?.length) {
                return (
                        <div className="flex justify-center items-center h-screen">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        </div>
                );
        }
        if (error) return <p className="p-6 text-center text-red-600">Đã xảy ra lỗi: {error} 😭</p>;

        return (
                <div className="min-h-screen p-6 bg-gray-50">
                        <h1 className="text-2xl font-semibold mb-6 text-gray-900">Quản lý món ăn 🍜</h1>

                        <ListSetupModal
                                open={openSetupModal}
                                onClose={() => setOpenSetupModal(false)}
                                columns={menuItemColumns}
                                title="Cài đặt hiển thị danh sách món ăn"
                        />

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="flex flex-wrap justify-between items-center p-4 border-b border-gray-200 gap-4">
                                        <ActionBar
                                                newLabel="Thêm món mới"
                                                secondaryLabel="Hành động"
                                                secondaryIcon={<ArrowDown size={14} />}
                                        />
                                        <SearchFilter
                                                searchPlaceholder="Tìm theo tên hoặc danh mục..."
                                                filterOptions={filterOptions}
                                                HeaderDropdown={HeaderDropdown}
                                                onSearch={handleSearch}
                                                onFilterChange={handleFilterChange}
                                                onClear={handleClear}
                                        />
                                </div>

                                <DataTable
                                        columns={menuItemTableData}
                                        data={filteredData}
                                        emptyText="Chưa có món nào trong menu. Thêm món mới nhé! 🥳"
                                        colSpan={menuItemTableData.length}
                                        onRowSelect={handleRowSelect}
                                        onSort={handleSort}
                                />

                                <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                                        Hiển thị {filteredData.length > 0 ? "1" : "0"} - {filteredData.length} trên tổng
                                        số {filteredData.length} món
                                </div>
                        </div>
                </div>
        );
}
