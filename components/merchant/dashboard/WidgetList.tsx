import React, { useState } from "react";
import { Move, Settings, Trash2 } from "lucide-react";

interface Widget {
    id: string;
    icon: string;
    value: string;
    label: string;
}

export default function WidgetList() {
    const [hoveredWidget, setHoveredWidget] = useState<string | null>(null);

    const widgets: Widget[] = [
        {
            id: "lost-sales",
            icon: "📈",
            value: "£0.00",
            label: "Total Lost Sales",
        },
        {
            id: "cash-payments",
            icon: "💳",
            value: "£0.00",
            label: "Total Cash Payments",
        },
        {
            id: "total-sales",
            icon: "📊",
            value: "£0.00",
            label: "Total Sales",
        },
    ];

    const handleMove = (widgetId: string) => {
        console.log("Move widget:", widgetId);
        // Add your move logic here
    };

    const handleSettings = (widgetId: string) => {
        console.log("Settings for widget:", widgetId);
        // Add your settings logic here
    };

    const handleDelete = (widgetId: string) => {
        console.log("Delete widget:", widgetId);
        // Add your delete logic here
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {widgets.map((widget) => (
                <div
                    key={widget.id}
                    className="bg-white rounded-lg shadow-sm border p-6 flex flex-col items-center relative transition-all duration-200 hover:shadow-md"
                    onMouseEnter={() => setHoveredWidget(widget.id)}
                    onMouseLeave={() => setHoveredWidget(null)}
                >
                    {/* Action Icons - Show on hover */}
                    <div
                        className={`absolute top-3 right-3 flex gap-1 transition-all duration-200 ${
                            hoveredWidget === widget.id
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-1 pointer-events-none"
                        }`}
                    >
                        <button
                            onClick={() => handleMove(widget.id)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title="Move widget"
                        >
                            <Move className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => handleSettings(widget.id)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title="Widget settings"
                        >
                            <Settings className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => handleDelete(widget.id)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title="Delete widget"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    </div>

                    {/* Widget Content */}
                    <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-lg mb-4">
                        <span className="text-2xl text-red-500">
                            {widget.icon === "📈" ? (
                                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                                    <path d="M3 3v18h18v-2H5V3H3zm14.5 6.5l-1.41 1.41L12 6.83l-3.09 3.09L7.5 8.5 12 4l6.5 6.5z" />
                                </svg>
                            ) : (
                                widget.icon
                            )}
                        </span>
                    </div>

                    <div className="text-center w-full">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{widget.value}</div>
                        <div className="text-sm text-gray-500 italic">{widget.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
