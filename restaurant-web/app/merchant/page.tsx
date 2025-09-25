"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar, ChartBar } from "@/constants/icons";
import { useState } from "react";
import { format } from "date-fns";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function MerchantDashboard() {
    const [showPicker, setShowPicker] = useState(false);
    const [range, setRange] = useState([
        {
            startDate: new Date(2025, 7, 27, 0, 0),
            endDate: new Date(2025, 8, 25, 0, 0),
            key: "selection",
        },
    ]);

    return (
        <div>
            {/* Thanh chọn ngày tháng động */}
            <div className="relative mb-6">
                <button
                    className="bg-white rounded shadow flex items-center gap-3 px-4 py-3 w-full text-left"
                    onClick={() => setShowPicker((v) => !v)}
                >
                    <Calendar size={20} className="text-gray-700" />
                    <span className="font-medium text-gray-700">
                        {format(range[0].startDate, "MMMM dd, yyyy hh:mm a")} -{" "}
                        {format(range[0].endDate, "MMMM dd, yyyy hh:mm a")}
                    </span>
                    <span className="ml-auto text-gray-400">&#9660;</span>
                </button>
                {showPicker && (
                    <div className="absolute z-10 mt-2 border-1 border-brand-grey p-2 bg-white rounded">
                        <DateRangePicker
                            ranges={range}
                            onChange={(item: any) => setRange([item.selection])}
                            showSelectionPreview={true}
                            moveRangeOnFirstSelection={false}
                            months={2}
                            direction="horizontal"
                            showMonthAndYearPickers={true}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowPicker(false)}>
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-orange-500 text-white rounded"
                                onClick={() => setShowPicker(false)}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex gap-4 mb-6">
                <button className="bg-orange-500 text-white px-4 py-2 rounded">+ Add Widget</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded shadow p-6 flex flex-col items-center">
                    <span className="text-4xl mb-2">📈</span>
                    <div className="text-2xl font-bold">£0.00</div>
                    <div className="text-gray-500">Total Lost Sales</div>
                </div>
                <div className="bg-white rounded shadow p-6 flex flex-col items-center">
                    <span className="text-4xl mb-2">💳</span>
                    <div className="text-2xl font-bold">£0.00</div>
                    <div className="text-gray-500">Total Cash Payments</div>
                </div>
                <div className="bg-white rounded shadow p-6 flex flex-col items-center">
                    <span className="text-4xl mb-2">📊</span>
                    <div className="text-2xl font-bold">£0.00</div>
                    <div className="text-gray-500">Total Sales</div>
                </div>
            </div>
            <div className="bg-white rounded shadow p-6">
                <div className="font-semibold mb-2">
                    <ChartBar size={24} className="inline-block mr-1 mb-1" />
                    Reports Chart
                </div>
                {/* Thay bằng biểu đồ thực tế nếu muốn */}
                <div className="h-48 flex items-center justify-center text-gray-400">[Chart Here]</div>
            </div>
        </div>
    );
}
