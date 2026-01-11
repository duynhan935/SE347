"use client";

import { orderApi } from "@/lib/api/orderApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, OrderStatus } from "@/types/order.type";
import { CheckCircle, Package, RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MerchantOrdersPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
    const [restaurantIds, setRestaurantIds] = useState<string[]>([]);
    const [rejectReason, setRejectReason] = useState<{ [orderId: string]: string }>({});
    const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);

    // Get restaurant IDs for socket connection
    useEffect(() => {
        const fetchRestaurants = async () => {
            if (!user?.id) return;
            try {
                const response = await restaurantApi.getRestaurantByMerchantId(user.id);
                const restaurants = response.data || [];
                const ids = restaurants.map((r: { id?: string; _id?: string }) => r.id || r._id || "").filter(Boolean);
                setRestaurantIds(ids);
            } catch (error) {
                console.error("Failed to fetch restaurants:", error);
            }
        };
        fetchRestaurants();
    }, [user?.id]);

    // Connect to socket for each restaurant
    useOrderSocket({
        restaurantId: restaurantIds[0] || null, // Join first restaurant room (backend supports multiple)
        onNewOrder: (notification) => {
            toast.success(`Đơn hàng mới: ${notification.data.orderId}`, {
                icon: "🔔",
            });
            fetchOrders(); // Refresh orders
        },
    });

    const fetchOrders = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const merchantOrders = await orderApi.getOrdersByMerchant(user.id);
            console.log("Fetched merchant orders:", merchantOrders);
            setOrders(merchantOrders);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Không thể tải danh sách đơn hàng");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchOrders();
        }
    }, [user?.id, filterStatus, fetchOrders]);

    const handleAcceptOrder = async (order: Order) => {
        const orderId = (order as Order & { orderId?: string }).orderId || order.orderId;
        try {
            await orderApi.acceptOrder(orderId);
            toast.success("Đã chấp nhận đơn hàng thành công");
            // Refresh orders immediately
            await fetchOrders();
            // Also refresh after a short delay to ensure backend has processed
            setTimeout(() => {
                fetchOrders();
            }, 1000);
        } catch (error: unknown) {
            console.error("Failed to accept order:", error);
            const errorMessage =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast.error(errorMessage || "Không thể chấp nhận đơn hàng");
        }
    };

    const handleRejectOrder = async (order: Order) => {
        const orderId = (order as Order & { orderId?: string }).orderId || order.orderId;
        const reason = rejectReason[orderId]?.trim();
        if (!reason) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
        }

        try {
            await orderApi.rejectOrder(orderId, reason);
            toast.success("Đã từ chối đơn hàng");
            setShowRejectDialog(null);
            setRejectReason((prev) => {
                const next = { ...prev };
                delete next[orderId];
                return next;
            });
            // Refresh orders immediately
            await fetchOrders();
            // Also refresh after a short delay to ensure backend has processed
            setTimeout(() => {
                fetchOrders();
            }, 1000);
        } catch (error: unknown) {
            console.error("Failed to reject order:", error);
            const errorMessage =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast.error(errorMessage || "Không thể từ chối đơn hàng");
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await orderApi.updateOrderStatus(orderId, newStatus);
            toast.success("Cập nhật trạng thái đơn hàng thành công");
            fetchOrders();
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast.error("Không thể cập nhật trạng thái đơn hàng");
        }
    };

    // Backend already uses lowercase statuses that match our enum values
    const normalizeStatus = (status: string): OrderStatus => status as OrderStatus;

    const filteredOrders =
        filterStatus === "ALL" ? orders : orders.filter((order) => normalizeStatus(order.status) === filterStatus);

    const getStatusColor = (status: string) => {
        const normalizedStatus = normalizeStatus(status);
        switch (normalizedStatus) {
            case OrderStatus.PENDING:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case OrderStatus.CONFIRMED:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case OrderStatus.PREPARING:
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            case OrderStatus.READY:
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case OrderStatus.COMPLETED:
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
            case OrderStatus.CANCELLED:
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    const getStatusLabel = (status: string) => {
        const normalizedStatus = normalizeStatus(status);
        const labels: Record<OrderStatus, string> = {
            [OrderStatus.PENDING]: "Chờ xử lý",
            [OrderStatus.CONFIRMED]: "Đã xác nhận",
            [OrderStatus.PREPARING]: "Đang chuẩn bị",
            [OrderStatus.READY]: "Sẵn sàng",
            [OrderStatus.COMPLETED]: "Đã hoàn thành",
            [OrderStatus.CANCELLED]: "Đã hủy",
        };
        return labels[normalizedStatus] || status;
    };

    const getNextStatus = (currentStatus: string): OrderStatus | null => {
        const normalizedStatus = normalizeStatus(currentStatus);
        switch (normalizedStatus) {
            case OrderStatus.PENDING:
                return OrderStatus.CONFIRMED;
            case OrderStatus.CONFIRMED:
                return OrderStatus.PREPARING;
            case OrderStatus.PREPARING:
                return OrderStatus.READY;
            case OrderStatus.READY:
                return OrderStatus.COMPLETED;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản Lý Đơn Hàng</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý và theo dõi các đơn hàng của bạn</p>
                </div>
                <button
                    onClick={fetchOrders}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                    Làm mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                    key="total-orders"
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tổng đơn hàng</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orders.length}</p>
                </div>
                <div
                    key="pending-orders"
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400">Chờ xử lý</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                        {orders.filter((o) => o.status === OrderStatus.PENDING).length}
                    </p>
                </div>
                <div
                    key="preparing-orders"
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400">Đang chuẩn bị</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {orders.filter((o) => o.status === OrderStatus.PREPARING).length}
                    </p>
                </div>
                <div
                    key="delivered-orders"
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400">Đã hoàn thành</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {orders.filter((o) => o.status === OrderStatus.COMPLETED).length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo:</span>
                    {(["ALL", ...Object.values(OrderStatus)] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterStatus === status
                                    ? "bg-brand-yellow text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            }`}
                        >
                            {status === "ALL" ? "Tất cả" : getStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Đang tải đơn hàng...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Chưa có đơn hàng nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Mã đơn
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Sản phẩm
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Tổng tiền
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Thanh toán
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredOrders.map((order) => {
                                    const normalizedStatus = normalizeStatus(order.status);
                                    const nextStatus = getNextStatus(order.status);
                                    return (
                                        <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {order.orderId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {order.userId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {order.items.length} món
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {order.items
                                                        .slice(0, 2)
                                                        .map((item) => item.productName)
                                                        .join(", ")}
                                                    {order.items.length > 2 && "..."}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    ${Number(order.finalAmount).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                        normalizedStatus
                                                    )}`}
                                                >
                                                    {getStatusLabel(normalizedStatus)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        order.paymentStatus === "paid" ||
                                                        order.paymentStatus === "completed"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                            : order.paymentStatus === "failed"
                                                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                    }`}
                                                >
                                                    {order.paymentStatus === "paid" ||
                                                    order.paymentStatus === "completed"
                                                        ? "Đã thanh toán"
                                                        : order.paymentStatus === "failed"
                                                        ? "Thất bại"
                                                        : "Chờ thanh toán"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(order.createdAt).toLocaleString("vi-VN")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {normalizeStatus(order.status) === OrderStatus.PENDING ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleAcceptOrder(order)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-xs font-medium"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Chấp nhận
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const orderId =
                                                                    (
                                                                        order as Order & {
                                                                            orderId?: string;
                                                                        }
                                                                    ).orderId || order.orderId;
                                                                setShowRejectDialog(orderId);
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs font-medium"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            Từ chối
                                                        </button>
                                                    </div>
                                                ) : nextStatus ? (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.orderId, nextStatus)}
                                                        className="text-brand-yellow hover:text-brand-yellow/80"
                                                    >
                                                        Cập nhật
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reject Dialog */}
            {showRejectDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Từ chối đơn hàng</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Vui lòng nhập lý do từ chối đơn hàng này:
                        </p>
                        <textarea
                            value={rejectReason[showRejectDialog] || ""}
                            onChange={(e) =>
                                setRejectReason((prev) => ({
                                    ...prev,
                                    [showRejectDialog]: e.target.value,
                                }))
                            }
                            placeholder="Ví dụ: Hết nguyên liệu, quán đóng cửa..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow mb-4"
                            rows={4}
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowRejectDialog(null);
                                    setRejectReason((prev) => {
                                        const next = { ...prev };
                                        delete next[showRejectDialog];
                                        return next;
                                    });
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => {
                                    const order = orders.find((o) => {
                                        const oId =
                                            (
                                                o as Order & {
                                                    orderId?: string;
                                                }
                                            ).orderId || o.orderId;
                                        return oId === showRejectDialog;
                                    });
                                    if (order) {
                                        handleRejectOrder(order);
                                    }
                                }}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
