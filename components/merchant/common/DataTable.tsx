/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useMemo } from "react";
import Tooltip from "@/components/merchant/dashboard/Tooltip";
import { ReactNode } from "react";
import { MoveUp, MoveDown, Pencil } from "lucide-react";
import Link from "next/link";

export type SortDirection = "asc" | "desc" | null;

interface Column {
    label: string;
    icon?: ReactNode;
    tooltip?: string;
    sortable?: boolean;
    key?: string;
    render?: (value: any, item: any) => ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data?: any[]; // Optional data array
    emptyText: string;
    colSpan: number;
    checkbox?: boolean;
    onSort?: (columnKey: string, direction: SortDirection) => void;
    onRowSelect?: (selectedItems: any[]) => void; // Callback for row selection
    renderRow?: (item: any, index: number) => ReactNode; // Custom row render function
}

export default function DataTable({
    columns,
    data = [],
    emptyText,
    colSpan,
    checkbox = true,
    onSort,
    onRowSelect,
    renderRow,
}: DataTableProps) {
    const [sortState, setSortState] = useState<Record<string, SortDirection>>({});
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Sort data based on current sort state
    const sortedData = useMemo(() => {
        if (!data.length) return [];

        const sortKey = Object.keys(sortState).find((key) => sortState[key]);
        if (!sortKey) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            const direction = sortState[sortKey];

            // Handle different data types
            if (typeof aValue === "string" && typeof bValue === "string") {
                return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
                return direction === "asc" ? aValue - bValue : bValue - aValue;
            }

            // Default string comparison
            const aStr = String(aValue).toLowerCase();
            const bStr = String(bValue).toLowerCase();
            return direction === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
        });
    }, [data, sortState]);

    const handleSort = (column: Column, index: number) => {
        if (!column.sortable) return;

        const columnKey = column.key || column.label || index.toString();
        const currentSort = sortState[columnKey];

        let newSort: SortDirection;
        if (currentSort === null || currentSort === undefined) {
            newSort = "asc";
        } else if (currentSort === "asc") {
            newSort = "desc";
        } else {
            newSort = "asc";
        }

        // Reset other columns and set current column
        const newSortState: Record<string, SortDirection> = {};
        newSortState[columnKey] = newSort;
        setSortState(newSortState);

        // Call parent callback if provided
        onSort?.(columnKey, newSort);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems(new Set());
            setSelectAll(false);
        } else {
            setSelectedItems(new Set(sortedData.map((_, index) => index)));
            setSelectAll(true);
        }
        onRowSelect?.(selectAll ? [] : sortedData);
    };

    const handleRowSelect = (index: number) => {
        const newSelectedItems = new Set(selectedItems);
        if (newSelectedItems.has(index)) {
            newSelectedItems.delete(index);
        } else {
            newSelectedItems.add(index);
        }
        setSelectedItems(newSelectedItems);
        setSelectAll(newSelectedItems.size === sortedData.length && sortedData.length > 0);

        const selectedData = sortedData.filter((_, idx) => newSelectedItems.has(idx));
        onRowSelect?.(selectedData);
    };

    const getSortIcon = (column: Column, index: number) => {
        if (!column.sortable) return column.icon;

        const columnKey = column.key || column.label || index.toString();
        const currentSort = sortState[columnKey];

        if (currentSort === "asc") {
            return <MoveUp size={14} className="text-gray-400" />;
        } else if (currentSort === "desc") {
            return <MoveDown size={14} className="text-gray-400" />;
        } else {
            return <MoveDown size={14} className="text-gray-300" />;
        }
    };

    const renderCellContent = (column: Column, item: any, index: number) => {
        // If custom render function provided, use it
        if (column.render) {
            return column.render(item[column.key || ""], item);
        }

        // If column has key, get value from data
        if (column.key && item) {
            const value = item[column.key];

            // Handle special rendering based on column type
            if (column.key === "status" && typeof value === "string") {
                return (
                    <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            value.toLowerCase() === "enabled"
                                ? "bg-green-100 text-green-800"
                                : value.toLowerCase() === "disabled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                    >
                        {value}
                    </span>
                );
            }

            if (column.key === "name" && typeof value === "string") {
                return (
                    <div className="flex items-center space-x-2">
                        <Link
                            href={"/merchant/restaurant/menu-items/" + item.id}
                            className="text-sm font-medium text-gray-900 hover:underline"
                        >
                            <Pencil size={18} className="inline-block mr-1 text-gray-400 hover:text-brand-orange" />
                        </Link>

                        <span className="font-medium text-gray-900">{value}</span>
                    </div>
                );
            }

            return <span className="text-sm text-gray-900 ml-5">{value}</span>;
        }

        // If no key or icon column, return icon
        return column.icon;
    };

    // Calculate actual column span including checkbox
    const actualColSpan = checkbox ? colSpan + 1 : colSpan;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        {checkbox && (
                            <th className="px-4 py-3 text-left">
                                <input
                                    type="checkbox"
                                    className="rounded"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                            </th>
                        )}
                        {columns.map((col, idx) => (
                            <th key={idx} className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-1">
                                    {col.tooltip ? (
                                        <Tooltip text={col.tooltip}>
                                            <div
                                                className={`flex items-center gap-1 ${
                                                    col.sortable ? "cursor-pointer hover:text-gray-800" : ""
                                                }`}
                                                onClick={() => handleSort(col, idx)}
                                            >
                                                {getSortIcon(col, idx)}
                                                <span>{col.label}</span>
                                            </div>
                                        </Tooltip>
                                    ) : (
                                        <div
                                            className={`flex items-center gap-1 ${
                                                col.sortable ? "cursor-pointer hover:text-gray-800" : ""
                                            }`}
                                            onClick={() => handleSort(col, idx)}
                                        >
                                            {col.sortable && getSortIcon(col, idx)}
                                            <span>{col.label}</span>
                                            {!col.sortable && col.icon}
                                        </div>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={actualColSpan} className="text-center py-12 text-gray-500 text-sm">
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((item, index) => {
                            // Use custom row render if provided
                            if (renderRow) {
                                return (
                                    <tr key={item.id || index} className="hover:bg-gray-50">
                                        {checkbox && (
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={selectedItems.has(index)}
                                                    onChange={() => handleRowSelect(index)}
                                                />
                                            </td>
                                        )}
                                        {renderRow(item, index)}
                                    </tr>
                                );
                            }

                            // Default row rendering
                            return (
                                <tr key={item.id || index} className="hover:bg-gray-50">
                                    {checkbox && (
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                className="rounded"
                                                checked={selectedItems.has(index)}
                                                onChange={() => handleRowSelect(index)}
                                            />
                                        </td>
                                    )}
                                    {columns.map((column, colIndex) => (
                                        <td key={colIndex} className="px-4 py-4">
                                            {renderCellContent(column, item, index)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
