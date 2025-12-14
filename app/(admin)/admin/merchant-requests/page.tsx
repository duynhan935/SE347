"use client";

import { authApi } from "@/lib/api/authApi";
import { User as UserType } from "@/types";
import { Calendar, CheckCircle, Loader2, Mail, RefreshCw, Search, User, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MerchantRequestsPage() {
    const [requests, setRequests] = useState<UserType[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMerchantRequests();
    }, []);

    const fetchMerchantRequests = async () => {
        setLoading(true);
        try {
            const pendingMerchants = await authApi.getMerchantRequests();
            setRequests(pendingMerchants);
        } catch (error) {
            console.error("Failed to fetch merchant requests:", error);
            toast.error("Không thể tải danh sách yêu cầu merchant");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string) => {
        if (!confirm("Bạn có chắc chắn muốn phê duyệt merchant này?")) {
            return;
        }

        setProcessingId(userId);
        try {
            await authApi.approveMerchant(userId);
            toast.success("Đã phê duyệt merchant thành công!");
            fetchMerchantRequests();
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Không thể phê duyệt merchant";
            toast.error(errorMessage);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (userId: string) => {
        const reason = prompt("Nhập lý do từ chối:");
        if (!reason || reason.trim() === "") {
            return;
        }

        setProcessingId(userId);
        try {
            await authApi.rejectMerchant(userId, { reason: reason.trim() });
            toast.success("Đã từ chối merchant thành công!");
            fetchMerchantRequests();
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Không thể từ chối merchant";
            toast.error(errorMessage);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRequests = requests.filter((request) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            request.username.toLowerCase().includes(searchLower) || request.email.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Yêu cầu Merchant</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Xem và phê duyệt các yêu cầu trở thành merchant từ users
                    </p>
                </div>
                <button
                    onClick={fetchMerchantRequests}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-white rounded-lg hover:bg-brand-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    <span>Làm mới</span>
                </button>
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tổng yêu cầu chờ duyệt</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{requests.length}</p>
                    </div>
                    <div className="h-12 w-px bg-gray-300 dark:bg-gray-700"></div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Đã tìm thấy</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                            {filteredRequests.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên đăng nhập hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                </div>
            </div>

            {/* Requests List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-brand-yellow" size={40} />
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p className="text-lg font-medium mb-2">Không có yêu cầu nào</p>
                        <p className="text-sm">Tất cả các yêu cầu merchant đã được xử lý</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredRequests.map((request) => (
                            <div
                                key={request.id}
                                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                            {request.username.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {request.username}
                                                </h3>
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-medium rounded-full">
                                                    Chờ duyệt
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Mail size={16} />
                                                    <span>{request.email}</span>
                                                </div>
                                                {request.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <User size={16} />
                                                        <span>{request.phone}</span>
                                                    </div>
                                                )}
                                                {request.createdAt && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Calendar size={16} />
                                                        <span>
                                                            Đăng ký:{" "}
                                                            {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => handleApprove(request.id)}
                                            disabled={processingId === request.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CheckCircle size={18} />
                                            <span>Phê duyệt</span>
                                        </button>
                                        <button
                                            onClick={() => handleReject(request.id)}
                                            disabled={processingId === request.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <XCircle size={18} />
                                            <span>Từ chối</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
