"use client";

import { orderApi } from "@/lib/api/orderApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, OrderStatus } from "@/types/order.type";
import { Package, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MerchantOrdersPage() {
        const { user } = useAuthStore();
        const [orders, setOrders] = useState<Order[]>([]);
        const [loading, setLoading] = useState(true);
        const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");

        useEffect(() => {
                if (user?.id) {
                        fetchOrders();
                }
        }, [user?.id, filterStatus]);

        const fetchOrders = async () => {
                if (!user?.id) return;

                try {
                        setLoading(true);
                        const merchantOrders = await orderApi.getOrdersByMerchant(user.id);
                        setOrders(merchantOrders);
                } catch (error) {
                        console.error("Failed to fetch orders:", error);
                        toast.error("Không thể tải danh sách đơn hàng");
                        setOrders([]);
                } finally {
                        setLoading(false);
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

        const filteredOrders = filterStatus === "ALL" 
                ? orders 
                : orders.filter((order) => order.status === filterStatus);

        const getStatusColor = (status: OrderStatus) => {
                switch (status) {
                        case OrderStatus.PENDING:
                                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
                        case OrderStatus.CONFIRMED:
                                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
                        case OrderStatus.PREPARING:
                                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
                        case OrderStatus.READY:
                                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
                        case OrderStatus.DELIVERING:
                                return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
                        case OrderStatus.DELIVERED:
                                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
                        case OrderStatus.CANCELLED:
                                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
                        default:
                                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
                }
        };

        const getStatusLabel = (status: OrderStatus) => {
                const labels: Record<OrderStatus, string> = {
                        [OrderStatus.PENDING]: "Chờ xử lý",
                        [OrderStatus.CONFIRMED]: "Đã xác nhận",
                        [OrderStatus.PREPARING]: "Đang chuẩn bị",
                        [OrderStatus.READY]: "Sẵn sàng",
                        [OrderStatus.DELIVERING]: "Đang giao",
                        [OrderStatus.DELIVERED]: "Đã giao",
                        [OrderStatus.CANCELLED]: "Đã hủy",
                };
                return labels[status] || status;
        };

        const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
                switch (currentStatus) {
                        case OrderStatus.PENDING:
                                return OrderStatus.CONFIRMED;
                        case OrderStatus.CONFIRMED:
                                return OrderStatus.PREPARING;
                        case OrderStatus.PREPARING:
                                return OrderStatus.READY;
                        case OrderStatus.READY:
                                return OrderStatus.DELIVERING;
                        case OrderStatus.DELIVERING:
                                return OrderStatus.DELIVERED;
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
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                Quản lý và theo dõi các đơn hàng của bạn
                                        </p>
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
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Tổng đơn hàng</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orders.length}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Chờ xử lý</p>
                                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                                                {orders.filter((o) => o.status === OrderStatus.PENDING).length}
                                        </p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Đang chuẩn bị</p>
                                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                                {orders.filter((o) => o.status === OrderStatus.PREPARING).length}
                                        </p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Đã hoàn thành</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                                {orders.filter((o) => o.status === OrderStatus.DELIVERED).length}
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
                                                                        const nextStatus = getNextStatus(order.status);
                                                                        return (
                                                                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                                        {order.orderCode || order.id}
                                                                                                </div>
                                                                                        </td>
                                                                                        <td className="px-6 py-4">
                                                                                                <div className="text-sm text-gray-900 dark:text-white">{order.customerName}</div>
                                                                                                <div className="text-sm text-gray-500 dark:text-gray-400">{order.customerPhone}</div>
                                                                                        </td>
                                                                                        <td className="px-6 py-4">
                                                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                                                        {order.items.length} món
                                                                                                </div>
                                                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                        {order.items.slice(0, 2).map((item) => item.productName).join(", ")}
                                                                                                        {order.items.length > 2 && "..."}
                                                                                                </div>
                                                                                        </td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                                        ${order.totalPrice.toFixed(2)}
                                                                                                </div>
                                                                                        </td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                                                <span
                                                                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                                                                                order.status
                                                                                                        )}`}
                                                                                                >
                                                                                                        {getStatusLabel(order.status)}
                                                                                                </span>
                                                                                        </td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                                                <span
                                                                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                                                                order.paymentStatus === "PAID"
                                                                                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                                                                        : order.paymentStatus === "FAILED"
                                                                                                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                                                                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                                                        }`}
                                                                                                >
                                                                                                        {order.paymentStatus === "PAID"
                                                                                                                ? "Đã thanh toán"
                                                                                                                : order.paymentStatus === "FAILED"
                                                                                                                ? "Thất bại"
                                                                                                                : "Chờ thanh toán"}
                                                                                                </span>
                                                                                        </td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                                                {new Date(order.createdAt).toLocaleString("vi-VN")}
                                                                                        </td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                                                {nextStatus ? (
                                                                                                        <button
                                                                                                                onClick={() => handleUpdateStatus(order.id, nextStatus)}
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
                </div>
        );
}

