"use client";

import { walletApi } from "@/lib/api/walletApi";
import { formatDateTime } from "@/lib/formatters";
import type { PayoutRequest } from "@/types/wallet.type";
import { CheckCircle, Clock, XCircle, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useWalletNotifications } from "@/lib/hooks/useWalletNotifications";
import { useAuthStore } from "@/stores/useAuthStore";

const formatUSD = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value || 0);

type StatusFilter = "all" | "pending" | "completed" | "failed";

export default function AdminPayoutsPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<PayoutRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);

    // Enable wallet notifications
    useWalletNotifications({
        userId: user?.id || null,
        userRole: user?.role,
        isAuthenticated,
    });
    // Listen for new payout requests and auto-refresh
    const notifications = useNotificationStore((state) => state.notifications);
    useEffect(() => {
        const latestPayoutRequest = notifications.find((n) => n.type === "PAYOUT_REQUEST" && !n.read);
        if (latestPayoutRequest) {
            // Auto-refresh when new payout request arrives
            fetchRequests();
        }
    }, [notifications]);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const params: { status?: "pending" | "completed" | "rejected"; page: number; limit: number } = {
                page,
                limit: 20,
            };

            if (statusFilter !== "all") {
                params.status = statusFilter as "pending" | "completed" | "rejected";
            }

            const response = await walletApi.getPayoutRequests(params);
            setRequests(response.data.data.requests);
            setTotalPages(Math.ceil(response.data.data.pagination.total / 20) || 1);
        } catch (error) {
            console.error("Failed to load payout requests:", error);
            toast.error("Failed to load payout requests");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, page]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (request: PayoutRequest) => {
        if (!confirm(`Approve withdrawal of ${formatUSD(request.amount)}?`)) return;

        try {
            setProcessingId(request.id);
            await walletApi.approvePayoutRequest(request.id);
            toast.success("Payout approved successfully!");

            // Send notification to merchant via backend SSE
            // The notification will be sent automatically by backend

            await fetchRequests();
        } catch (error: unknown) {
            console.error("Failed to approve payout:", error);
            const message =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast.error(message || "Failed to approve payout");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        try {
            setRejectingId(selectedRequest.id);
            await walletApi.rejectPayoutRequest(selectedRequest.id, rejectReason.trim());
            toast.success("Payout rejected");

            // Notification will be sent automatically by backend via SSE

            setSelectedRequest(null);
            setRejectReason("");
            await fetchRequests();
        } catch (error: unknown) {
            console.error("Failed to reject payout:", error);
            const message =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast.error(message || "Failed to reject payout");
        } finally {
            setRejectingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock className="h-3 w-3" />
                        Pending
                    </span>
                );
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                    </span>
                );
            case "failed":
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <XCircle className="h-3 w-3" />
                        Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payout Requests</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Review and approve merchant withdrawals</p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
                {(["all", "pending", "completed", "failed"] as StatusFilter[]).map((status) => (
                    <button
                        key={status}
                        onClick={() => {
                            setStatusFilter(status);
                            setPage(1);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            statusFilter === status
                                ? "bg-brand-orange text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Requests Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-brand-orange" size={40} />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Restaurant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Bank Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                No payout requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                                    {formatDateTime(request.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                                    {request.Wallet?.restaurantId || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                                    {formatUSD(request.amount)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                                                    <div className="space-y-1">
                                                        <div>
                                                            <span className="font-medium">Bank:</span>{" "}
                                                            {request.bankInfo.bankName}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Acc:</span>{" "}
                                                            {request.bankInfo.accountNumber}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Name:</span>{" "}
                                                            {request.bankInfo.accountHolderName}
                                                        </div>
                                                        {request.note && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                Note: {request.note}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(request.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {request.status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleApprove(request)}
                                                                disabled={processingId === request.id}
                                                                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                                            >
                                                                {processingId === request.id ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                        Processing...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle className="h-4 w-4" />
                                                                        Approve
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedRequest(request)}
                                                                disabled={rejectingId === request.id}
                                                                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {request.status !== "pending" && (
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            {request.processedAt
                                                                ? formatDateTime(request.processedAt)
                                                                : "—"}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Reject Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reject Payout Request</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Amount: <span className="font-semibold">{formatUSD(selectedRequest.amount)}</span>
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Reason for rejection *
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                                placeholder="Enter reason for rejection..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedRequest(null);
                                    setRejectReason("");
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || rejectingId === selectedRequest.id}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {rejectingId === selectedRequest.id ? "Rejecting..." : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
