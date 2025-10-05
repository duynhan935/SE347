import React from "react";

interface RatingData {
    poor: number;
    average: number;
    good: number;
    veryGood: number;
    excellent: number;
}

interface RatingChartProps {
    title: string;
    data: RatingData;
    color?: string;
}

export default function RatingChart({ title, data, color = "#ef4444" }: RatingChartProps) {
    const maxValue = Math.max(data.poor, data.average, data.good, data.veryGood, data.excellent);

    const getBarHeight = (value: number) => {
        if (maxValue === 0) return 0;
        return (value / maxValue) * 100;
    };

    const categories = [
        { label: "Poor", value: data.poor },
        { label: "Average", value: data.average },
        { label: "Good", value: data.good },
        { label: "Very Good", value: data.veryGood },
        { label: "Excellent", value: data.excellent },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            {/* Title with color indicator */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: color }} />
                <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            </div>

            {/* Chart container */}
            <div className="relative h-32 mb-4">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
                    <span>1.0</span>
                    <span>0.5</span>
                    <span>0</span>
                </div>

                {/* Chart area */}
                <div className="ml-8 h-full flex items-end justify-between gap-1">
                    {categories.map((category, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                            {/* Bar */}
                            <div
                                className="w-full min-h-[2px] transition-all duration-300 ease-in-out"
                                style={{
                                    height: `${getBarHeight(category.value)}%`,
                                    backgroundColor: color,
                                    opacity: category.value === 0 ? 0.3 : 1,
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 ml-8">
                    <div className="h-full relative">
                        {/* Horizontal grid lines */}
                        <div className="absolute top-0 w-full border-t border-gray-100" />
                        <div className="absolute top-1/2 w-full border-t border-gray-100" />
                        <div className="absolute bottom-0 w-full border-t border-gray-100" />
                    </div>
                </div>
            </div>

            {/* X-axis labels */}
            <div className="ml-8 flex justify-between text-xs text-gray-500">
                {categories.map((category, index) => (
                    <span key={index} className="text-center flex-1">
                        {category.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
