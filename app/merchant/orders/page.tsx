"use client";

import { orderApi } from "@/lib/api/orderApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, DeliveryAddress } from "@/types/order.type";
import { CheckCircle, Package, RefreshCw, XCircle, MapPin, Phone, User, Clock, Store, DollarSign } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

// Helper format tiền tệ
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

export default function MerchantOrdersPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [restaurantIds, setRestaurantIds] = useState<string[]>([]);
    const [rejectReason, setRejectReason] = useState<{ [orderId: string]: string }>({});
    const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);

    // 1. Lấy danh sách ID nhà hàng từ Data bạn gửi
    useEffect(() => {
        const fetchRestaurants = async () => {
            if (!user?.id) return;
            try {
                const response = await restaurantApi.getRestaurantByMerchantId(user.id);
                // Xử lý data trả về (mảng nhà hàng)
                const restaurants = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];

                // Lấy ID: Data bạn gửi dùng trường "id"
                const ids = restaurants.map((r: any) => r.id).filter(Boolean);
                setRestaurantIds(ids);
            } catch (error) {
                console.error("Failed to fetch restaurants:", error);
            }
        };
        fetchRestaurants();
    }, [user?.id]);

    // 2. Fetch Orders
    const fetchOrders = useCallback(async () => {
        if (!user?.id) return;
        try {
            if (orders.length === 0) setLoading(true);
            const merchantOrders = await orderApi.getOrdersByMerchant(user.id);
            setOrders(merchantOrders);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            // Không toast lỗi ở đây để tránh spam nếu auto refresh
        } finally {
            setLoading(false);
        }
    }, [user?.id]); // Bỏ orders.length để tránh loop

    // 3. Socket
    useOrderSocket({
        restaurantId: restaurantIds[0] || null,
        onNewOrder: (notification) => {
            toast.success(`Đơn mới: ${notification.data.orderId}`, { icon: "🔔" });
            fetchOrders();
        },
        onOrderStatusUpdate: () => fetchOrders(),
    });

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // --- Helpers ---

    // Xử lý địa chỉ (Object hoặc String)
    const formatAddress = (address: DeliveryAddress | string | undefined) => {
        if (!address) return "Chưa cập nhật";
        if (typeof address === "string") return address;

        // Nếu là object { street, city... }
        const parts = [address.street, address.city, address.state].filter(Boolean);

        return parts.length > 0 ? parts.join(", ") : "Địa chỉ không hợp lệ";
    };

    // Chuẩn hóa status về chữ thường để so sánh
    const normalizeStatus = (status: string) => status.toLowerCase();

    // Map status backend sang hiển thị
    const getStatusLabel = (status: string) => {
        const s = normalizeStatus(status);
        switch (s) {
            case "pending":
                return "Chờ xác nhận";
            case "confirmed":
                return "Đã nhận đơn";
            case "preparing":
                return "Đang nấu";
            case "ready":
                return "Đã xong món";
            case "delivering":
                return "Đang giao";
            case "completed":
                return "Hoàn thành";
            case "cancelled":
                return "Đã hủy";
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        const s = normalizeStatus(status);
        switch (s) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "confirmed":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "preparing":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "completed":
                return "bg-green-100 text-green-800 border-green-200";
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Logic chuyển trạng thái tiếp theo
    const getNextStatus = (current: string): string | null => {
        const s = normalizeStatus(current);
        if (s === "pending") return "confirmed";
        if (s === "confirmed") return "preparing";
        if (s === "preparing") return "ready";
        if (s === "ready") return "completed"; // Hoặc delivering tùy quy trình
        return null;
    };

    // --- Actions ---

    const updateLocalOrder = (orderId: string, updates: Partial<Order>) => {
        setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, ...updates } : o)));
    };

    const handleAcceptOrder = async (order: Order) => {
        const oldStatus = order.status;
        updateLocalOrder(order.orderId, { status: "confirmed" });

        try {
            await orderApi.acceptOrder(order.orderId);
            toast.success("Đã nhận đơn hàng");
        } catch (error: any) {
            updateLocalOrder(order.orderId, { status: oldStatus }); // Revert
            toast.error(error?.response?.data?.message || "Lỗi nhận đơn");
        }
    };

    const handleRejectOrder = async () => {
        if (!showRejectDialog) return;
        const reason = rejectReason[showRejectDialog];
        if (!reason) return toast.error("Cần nhập lý do");

        // Tìm order đang xử lý
        const order = orders.find((o) => o.orderId === showRejectDialog);
        if (!order) return;

        const oldStatus = order.status;
        updateLocalOrder(order.orderId, { status: "cancelled" });
        setShowRejectDialog(null);

        try {
            await orderApi.rejectOrder(order.orderId, reason);
            toast.success("Đã từ chối đơn");
        } catch (error) {
            updateLocalOrder(order.orderId, { status: oldStatus });
            toast.error("Lỗi từ chối đơn");
        }
    };

    const handleNextStatus = async (order: Order) => {
        const next = getNextStatus(order.status as string);
        if (!next) return;

        const oldStatus = order.status;
        updateLocalOrder(order.orderId, { status: next });

        try {
            await orderApi.updateOrderStatus(order.orderId, next);
            toast.success(`Cập nhật: ${getStatusLabel(next)}`);
        } catch (error) {
            updateLocalOrder(order.orderId, { status: oldStatus });
            toast.error("Lỗi cập nhật trạng thái");
        }
    };

    // Filter logic
    const filteredOrders =
        filterStatus === "ALL"
            ? orders
            : orders.filter((o) => normalizeStatus(o.status as string) === normalizeStatus(filterStatus));

    return (
        <div className="space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Đơn Hàng</h1>
                    <p className="text-gray-500">Quản lý đơn hàng từ {restaurantIds.length} nhà hàng</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Làm mới
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2">
                {["ALL", "pending", "confirmed", "preparing", "completed", "cancelled"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            filterStatus === status
                                ? "bg-yellow-500 text-white"
                                : "bg-white text-gray-600 border hover:bg-gray-50"
                        }`}
                    >
                        {status === "ALL" ? "Tất cả" : getStatusLabel(status)}
                        <span className="ml-2 bg-black/10 px-2 py-0.5 rounded-full text-xs">
                            {status === "ALL"
                                ? orders.length
                                : orders.filter((o) => normalizeStatus(o.status as string) === status).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 font-medium border-b">
                            <tr>
                                <th className="px-6 py-4">Mã Đơn / Quán</th>
                                <th className="px-6 py-4">Khách Hàng</th>
                                <th className="px-6 py-4">Chi Tiết Món</th>
                                <th className="px-6 py-4">Tổng Tiền</th>
                                <th className="px-6 py-4">Trạng Thái</th>
                                <th className="px-6 py-4 text-right">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        Chưa có đơn hàng nào
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                #{order.orderId.slice(-6)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Store className="w-3 h-3" /> {order.restaurantName}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />{" "}
                                                {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium flex items-center gap-1">
                                                <User className="w-3 h-3 text-gray-400" />
                                                {/* Fallback tên khách */}
                                                {order.customerName ||
                                                    order.user?.fullName ||
                                                    order.user?.username ||
                                                    "Khách vãng lai"}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {order.customerPhone ||
                                                    order.user?.phone ||
                                                    order.user?.phoneNumber ||
                                                    "---"}
                                            </div>
                                            <div
                                                className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate max-w-[150px]"
                                                title={
                                                    typeof order.deliveryAddress === "string"
                                                        ? order.deliveryAddress
                                                        : "Địa chỉ"
                                                }
                                            >
                                                <MapPin className="w-3 h-3" />
                                                {formatAddress(order.deliveryAddress)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between gap-2">
                                                        <span className="text-gray-600 dark:text-gray-300">
                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                x{item.quantity}
                                                            </span>{" "}
                                                            {item.productName}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            {order.orderNote && (
                                                <div className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded mt-1 border border-orange-100">
                                                    Note: {order.orderNote}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(order.finalAmount)}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <DollarSign className="w-3 h-3" />
                                                {order.paymentMethod === "cod" ? "Tiền mặt" : order.paymentMethod}
                                            </div>
                                            <span
                                                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                    order.paymentStatus === "completed" ||
                                                    order.paymentStatus === "paid" // Backend dùng 'paid' hoặc 'completed'
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                }`}
                                            >
                                                {order.paymentStatus === "pending"
                                                    ? "Chưa thanh toán"
                                                    : "Đã thanh toán"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                    order.status as string
                                                )}`}
                                            >
                                                {getStatusLabel(order.status as string)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {normalizeStatus(order.status as string) === "pending" ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleAcceptOrder(order)}
                                                        className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                                                        title="Chấp nhận"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowRejectDialog(order.orderId)}
                                                        className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                                                        title="Từ chối"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : getNextStatus(order.status as string) ? (
                                                <button
                                                    onClick={() => handleNextStatus(order)}
                                                    className="text-blue-600 hover:underline text-xs font-medium"
                                                >
                                                    Chuyển:{" "}
                                                    {getStatusLabel(getNextStatus(order.status as string) || "")}
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95">
                        <h3 className="text-lg font-bold mb-2">Từ chối đơn hàng?</h3>
                        <textarea
                            className="w-full border rounded p-2 mb-4 text-sm dark:bg-gray-700"
                            placeholder="Lý do từ chối..."
                            rows={3}
                            value={rejectReason[showRejectDialog] || ""}
                            onChange={(e) => setRejectReason({ ...rejectReason, [showRejectDialog]: e.target.value })}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowRejectDialog(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleRejectOrder}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
