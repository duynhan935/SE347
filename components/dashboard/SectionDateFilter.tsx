"use client";

import { buildDateRangeQuery, type DashboardDateRangePreset } from "@/lib/api/dashboardApi";

type Props = {
    preset: DashboardDateRangePreset;
    startDate: string;
    endDate: string;
    error?: string | null;
    onPresetChange: (preset: DashboardDateRangePreset) => void;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onReset: () => void;
    dense?: boolean;
};

export default function SectionDateFilter({
    preset,
    startDate,
    endDate,
    error,
    onPresetChange,
    onStartDateChange,
    onEndDateChange,
    onReset,
    dense = true,
}: Props) {
    const presetQuery = buildDateRangeQuery(preset);

    return (
        <div className="flex flex-col items-stretch gap-2">
            <div className={dense ? "flex flex-wrap items-end justify-end gap-2" : "flex flex-wrap items-end gap-2"}>
                <div className="flex flex-col">
                    <label className="text-[11px] font-medium text-bodydark mb-1">Range</label>
                    <select
                        value={preset}
                        onChange={(e) => onPresetChange(e.target.value as DashboardDateRangePreset)}
                        className="h-9 rounded-lg border border-stroke bg-transparent px-3 text-sm outline-none dark:border-strokedark dark:bg-meta-4"
                        aria-label="Date range preset"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="ytd">Year to date</option>
                        <option value="all">All time</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-[11px] font-medium text-bodydark mb-1">Start</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="h-9 rounded-lg border border-stroke bg-transparent px-3 text-sm outline-none dark:border-strokedark dark:bg-meta-4"
                        placeholder={presetQuery.startDate ?? ""}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-[11px] font-medium text-bodydark mb-1">End</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="h-9 rounded-lg border border-stroke bg-transparent px-3 text-sm outline-none dark:border-strokedark dark:bg-meta-4"
                        placeholder={presetQuery.endDate ?? ""}
                    />
                </div>

                <button
                    type="button"
                    onClick={onReset}
                    className="h-9 rounded-lg border border-stroke px-3 text-sm font-medium text-black hover:bg-gray dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                >
                    Reset
                </button>
            </div>

            {error ? <div className="text-xs font-medium text-meta-1">{error}</div> : null}
        </div>
    );
}
