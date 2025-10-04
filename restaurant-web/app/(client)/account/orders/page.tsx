// Dữ liệu giả cho lịch sử đơn hàng
const orders = [
        { id: "#12345", date: "Oct 04, 2025", total: "$25.50", status: "Delivered" },
        { id: "#12344", date: "Sep 28, 2025", total: "$15.00", status: "Delivered" },
        { id: "#12342", date: "Sep 15, 2025", total: "$35.70", status: "Cancelled" },
];

export default function OrderHistoryPage() {
        return (
                <div className="bg-white p-8 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-6">Order History</h1>
                        <div className="space-y-4">
                                {orders.map((order) => (
                                        <div
                                                key={order.id}
                                                className="border p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                        >
                                                <div>
                                                        <p className="font-bold text-lg">{order.id}</p>
                                                        <p className="text-sm text-gray-500">{order.date}</p>
                                                        <p className="font-semibold">{order.total}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-4">
                                                                <span
                                                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                                order.status === "Delivered"
                                                                                        ? "bg-green-100 text-green-800"
                                                                                        : "bg-red-100 text-red-800"
                                                                        }`}
                                                                >
                                                                        {order.status}
                                                                </span>
                                                        </div>
                                                        <a
                                                                href="#"
                                                                className="text-sm font-semibold text-brand-purple hover:underline"
                                                        >
                                                                View Details
                                                        </a>
                                                </div>
                                        </div>
                                ))}
                        </div>
                </div>
        );
}
