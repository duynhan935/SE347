"use client";
import { useState } from "react";
import Tooltip from "@/components/merchant/dashboard/Tooltip";
import { ReactNode } from "react";
import { MoveUp, MoveDown } from "lucide-react";

type SortDirection = "asc" | "desc" | null;

interface Column {
    label: string;
    icon?: ReactNode;
    tooltip?: string;
    sortable?: boolean;
    key?: string; // Unique key for sorting
}

interface DataTableProps {
    columns: Column[];
    emptyText: string;
    colSpan: number;
    checkbox?: boolean;
    onSort?: (columnKey: string, direction: SortDirection) => void;
}

export default function DataTable({ columns, emptyText, colSpan, checkbox = true, onSort }: DataTableProps) {
    const [sortState, setSortState] = useState<Record<string, SortDirection>>({});

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
        const newSortState = { ...sortState, [columnKey]: newSort };
        setSortState(newSortState);

        // Call parent callback if provided
        onSort?.(columnKey, newSort);
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

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        {checkbox && (
                            <th className="px-4 py-3 text-left">
                                <input type="checkbox" className="rounded" />
                            </th>
                        )}
                        {columns.map((col, idx) => (
                            <th key={idx} className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-1">
                                    {col.tooltip ? (
                                        <Tooltip text={col.label}>
                                            <div
                                                className={col.sortable ? "cursor-pointer" : ""}
                                                onClick={() => handleSort(col, idx)}
                                            >
                                                {getSortIcon(col, idx)}
                                            </div>
                                        </Tooltip>
                                    ) : (
                                        <>
                                            <div
                                                className={col.sortable ? "cursor-pointer" : ""}
                                                onClick={() => handleSort(col, idx)}
                                            >
                                                {getSortIcon(col, idx)}
                                            </div>
                                            <span>{col.label}</span>
                                        </>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={colSpan} className="text-center py-12 text-gray-500 text-sm">
                            {emptyText}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
