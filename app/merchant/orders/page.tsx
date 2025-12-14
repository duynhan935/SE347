/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { orderApi } from "@/lib/api/orderApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, OrderStatus } from "@/types/order.type";
import {
    CheckCircle,
    Package,
    RefreshCw,
    XCircle,
    MapPin,
    Phone,
    User,
    Clock,
    Store,
    DollarSign,
    Ban,
    ArrowRight,
} from "lucide-react";
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

    // State cho việc từ chối/hủy đơn
    const [actionReason, setActionReason] = useState("");
    // dialogType: 'reject' (từ chối đơn pending) | 'cancel' (hủy đơn đang làm) | null
    const [showActionDialog, setShowActionDialog] = useState<{ type: "reject" | "cancel"; orderId: string } | null>(
        null
    );

    // 1. Fetch Restaurants
    useEffect(() => {
        const fetchRestaurants = async () => {
            if (!user?.id) return;
            try {
                const response = await restaurantApi.getRestaurantByMerchantId(user.id);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const restaurants = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        } finally {
            setLoading(false);
        }
    }, [user?.id]); // Removed orders dependency to avoid infinite loop

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // 3. Socket
    useOrderSocket({
        restaurantId: restaurantIds[0] || null,
        onNewOrder: (notification) => {
            toast.success(`Đơn mới: ${notification.data.orderId.slice(-6)}`, { icon: "🔔" });
            fetchOrders();
        },
        onOrderStatusUpdate: () => fetchOrders(),
    });

    // --- Helpers ---
    const normalizeStatus = (status: string) => status.toLowerCase();

    const getStatusLabel = (status: string) => {
        const s = normalizeStatus(status);
        switch (s) {
            case "pending":
                return "Chờ xác nhận";
            case "confirmed":
                return "Đã nhận đơn";
            case "preparing":
                return "Đang chuẩn bị";
            case "ready":
                return "Sẵn sàng giao";
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
            case "ready":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "completed":
                return "bg-green-100 text-green-800 border-green-200";
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Logic Next Status khớp Backend
    const getNextStatus = (current: string): string | null => {
        const s = normalizeStatus(current);
        if (s === "confirmed") return "preparing";
        if (s === "preparing") return "ready";
        if (s === "ready") return "completed";
        return null;
    };

    const updateLocalOrder = (orderId: string, updates: Partial<Order>) => {
        setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, ...updates } : o)));
    };

    // --- Actions ---

    // 1. Accept
    const handleAcceptOrder = async (order: Order) => {
        const oldStatus = order.status;
        updateLocalOrder(order.orderId, { status: "confirmed" });

        try {
            await orderApi.acceptOrder(order.orderId);
            toast.success("Đã nhận đơn hàng");
        } catch (error: any) {
            updateLocalOrder(order.orderId, { status: oldStatus });
            toast.error(error?.response?.data?.message || "Lỗi nhận đơn");
            fetchOrders(); // Sync lại nếu lỗi
        }
    };

    // 2. Reject (Pending) & Cancel (Accepted)
    const handleConfirmAction = async () => {
        if (!showActionDialog) return;
        const { type, orderId } = showActionDialog;

        if (!actionReason.trim()) return toast.error("Vui lòng nhập lý do");

        const order = orders.find((o) => o.orderId === orderId);
        if (!order) return;

        const oldStatus = order.status;
        updateLocalOrder(orderId, { status: "cancelled" }); // UI update optimistic
        setShowActionDialog(null);
        setActionReason("");

        try {
            if (type === "reject") {
                await orderApi.rejectOrder(orderId, actionReason);
                toast.success("Đã từ chối đơn hàng");
            } else {
                await orderApi.cancelAcceptedOrder(orderId, actionReason);
                toast.success("Đã hủy đơn hàng");
            }
        } catch (error: any) {
            updateLocalOrder(orderId, { status: oldStatus }); // Revert if fail
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
            fetchOrders();
        }
    };

    // 3. Update Status Flow
    const handleNextStatus = async (order: Order) => {
        const next = getNextStatus(order.status as string);
        if (!next) return;

        const oldStatus = order.status;
        updateLocalOrder(order.orderId, { status: next });

        try {
            await orderApi.updateOrderStatus(order.orderId, next);
            toast.success(`Trạng thái: ${getStatusLabel(next)}`);
        } catch (error: any) {
            updateLocalOrder(order.orderId, { status: oldStatus });
            toast.error(error?.response?.data?.message || "Lỗi cập nhật trạng thái");
            fetchOrders();
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản Lý Đơn Hàng</h1>
                    <p className="text-gray-500">Danh sách đơn hàng từ {restaurantIds.length} quán của bạn</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Làm mới
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {["ALL", "pending", "confirmed", "preparing", "ready", "completed", "cancelled"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            filterStatus === status
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-gray-600 border hover:bg-gray-50"
                        }`}
                    >
                        {status === "ALL" ? "Tất cả" : getStatusLabel(status)}
                        <span
                            className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                filterStatus === status ? "bg-white/20" : "bg-gray-100"
                            }`}
                        >
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
                                <th className="px-6 py-4">Mã Đơn / Thời gian</th>
                                <th className="px-6 py-4">Khách Hàng</th>
                                <th className="px-6 py-4">Món Ăn</th>
                                <th className="px-6 py-4">Tổng Tiền</th>
                                <th className="px-6 py-4">Trạng Thái</th>
                                <th className="px-6 py-4 text-right">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Package className="w-12 h-12 text-gray-300 mb-3" />
                                            <p>Không có đơn hàng nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.orderId}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        {/* Cột 1: Mã & Quán */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                #{order.orderId.slice(-6).toUpperCase()}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Store className="w-3 h-3" /> {order.restaurantName}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </td>

                                        {/* Cột 2: Khách hàng */}
                                        <td className="px-6 py-4">
                                            <div className="font-medium flex items-center gap-1">
                                                <User className="w-3 h-3 text-gray-400" />
                                                {order.customerName || order.user?.fullName || "Khách"}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {order.customerPhone || order.user?.phone || "---"}
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
                                                {typeof order.deliveryAddress === "string"
                                                    ? order.deliveryAddress
                                                    : `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`}
                                            </div>
                                        </td>

                                        {/* Cột 3: Items */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1 max-h-[100px] overflow-y-auto custom-scrollbar">
                                                {order.items.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex gap-2 text-gray-600 dark:text-gray-300"
                                                    >
                                                        <span className="font-bold text-gray-900 dark:text-white shrink-0">
                                                            x{item.quantity}
                                                        </span>
                                                        <span className="truncate">{item.productName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {order.orderNote && (
                                                <div className="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded mt-2 border border-yellow-100 inline-block">
                                                    Note: {order.orderNote}
                                                </div>
                                            )}
                                        </td>

                                        {/* Cột 4: Tiền */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-blue-600">
                                                {formatCurrency(order.finalAmount)}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 capitalize">
                                                <DollarSign className="w-3 h-3" />
                                                {order.paymentMethod === "cash" ? "Tiền mặt" : order.paymentMethod}
                                            </div>
                                            <span
                                                className={`text-[10px] px-1.5 py-0.5 rounded border mt-1 inline-block ${
                                                    ["completed", "paid"].includes(order.paymentStatus)
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-gray-50 text-gray-600 border-gray-200"
                                                }`}
                                            >
                                                {["completed", "paid"].includes(order.paymentStatus)
                                                    ? "Đã thanh toán"
                                                    : "Chưa thanh toán"}
                                            </span>
                                        </td>

                                        {/* Cột 5: Trạng thái */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                                    order.status as string
                                                )}`}
                                            >
                                                {getStatusLabel(order.status as string)}
                                            </span>
                                        </td>

                                        {/* Cột 6: Action */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end gap-2">
                                                {/* CASE 1: PENDING -> ACCEPT / REJECT */}
                                                {normalizeStatus(order.status as string) === "pending" && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAcceptOrder(order)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition shadow-sm text-xs font-medium"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" /> Nhận đơn
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setShowActionDialog({
                                                                    type: "reject",
                                                                    orderId: order.orderId,
                                                                })
                                                            }
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition shadow-sm text-xs font-medium"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> Từ chối
                                                        </button>
                                                    </div>
                                                )}

                                                {/* CASE 2: PROCESS -> NEXT STATUS */}
                                                {getNextStatus(order.status as string) && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleNextStatus(order)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm text-xs font-medium"
                                                        >
                                                            {getStatusLabel(
                                                                getNextStatus(order.status as string) || ""
                                                            )}{" "}
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </button>

                                                        {/* Nút hủy cho đơn đang làm (chỉ hiện khi chưa completed/ready) */}
                                                        {["confirmed", "preparing"].includes(
                                                            normalizeStatus(order.status as string)
                                                        ) && (
                                                            <button
                                                                onClick={() =>
                                                                    setShowActionDialog({
                                                                        type: "cancel",
                                                                        orderId: order.orderId,
                                                                    })
                                                                }
                                                                className="p-1.5 text-gray-400 hover:text-red-600 transition"
                                                                title="Hủy đơn này"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {["completed", "cancelled"].includes(
                                                    normalizeStatus(order.status as string)
                                                ) && <span className="text-gray-400 text-xs">-</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject/Cancel Modal */}
            {showActionDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
                        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                            {showActionDialog.type === "reject" ? "Từ chối đơn hàng" : "Hủy đơn hàng"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {showActionDialog.type === "reject"
                                ? "Hành động này sẽ hoàn tiền cho khách (nếu đã thanh toán)."
                                : "Lưu ý: Chỉ hủy khi không thể tiếp tục thực hiện đơn hàng."}
                        </p>
                        <textarea
                            className="w-full border rounded-lg p-3 mb-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Nhập lý do (bắt buộc)..."
                            rows={3}
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowActionDialog(null);
                                    setActionReason("");
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                disabled={!actionReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition shadow-sm"
                            >
                                Xác nhận {showActionDialog.type === "reject" ? "Từ chối" : "Hủy"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
