/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Calendar } from "@/constants/icons";
import { format } from "date-fns";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function DateRangeSelector({ range, setRange }: { range: any[]; setRange: (r: any[]) => void }) {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    // Sử dụng useRef để tham chiếu đến phần tử div chứa date picker

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                // Nếu phần tử div tồn tại và phần tử ta click không nằm trong div đó thì đóng date picker
                setShowPicker(false);
            }
        }
        if (showPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPicker]);

    // khi component được render thì useEffect sẽ gắn sự kiện click vào document, nếu khi ấy date picker đang mở (showPicker = true) thì
    // hàm handleClickOutside sẽ kiểm tra nếu click xảy ra bên ngoài div chứa date picker thì đóng nó lại (setShowPicker(false))

    return (
        <div className="relative" ref={pickerRef}>
            {/* gán ref cho div chứa date picker để nó biết phần tử nào đang được tham chiếu */}
            <button
                className="bg-white rounded shadow flex items-center gap-3 px-4 py-3 w-full text-left cursor-pointer"
                onClick={() => setShowPicker((v) => !v)}
            >
                <Calendar size={20} className="text-gray-700" />
                <span className="font-medium text-gray-700 text-p3">
                    {format(range[0].startDate, "MMMM dd, yyyy hh:mm a")} -{" "}
                    {format(range[0].endDate, "MMMM dd, yyyy hh:mm a")}
                </span>
                <span className="ml-auto text-gray-400 ">&#9660;</span>
            </button>
            {showPicker && (
                <div className="absolute right-0 top-full mt-2 z-10 border-2 bg-white p-2">
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
                        <button
                            className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
                            onClick={() => setShowPicker(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-orange-500 text-white rounded cursor-pointer"
                            onClick={() => setShowPicker(false)}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
