export default function ReportsLegend() {
    const legendItems = [
        { name: "Customers", color: "#7DD3FC" },
        { name: "Orders", color: "#93C5FD" },
        { name: "Reservations", color: "#C4B5FD" },
        { name: "Reviews", color: "#FCD34D" },
    ];
    return (
        <div className="flex justify-center gap-6 mb-4">
            {legendItems.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                    <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                </div>
            ))}
        </div>
    );
}
