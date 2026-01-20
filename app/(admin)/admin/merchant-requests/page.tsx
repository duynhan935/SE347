"use client";

import { authApi } from "@/lib/api/authApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { User as UserType } from "@/types";
import * as Dialog from "@radix-ui/react-dialog";
import { Calendar, CheckCircle, Loader2, Mail, RefreshCw, Search, User, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MerchantRequestsPage() {
    const { markAsRead } = useNotificationStore();
    const confirm = useConfirm();
    const [requests, setRequests] = useState<UserType[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<UserType | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        fetchMerchantRequests();
    }, []);

    const fetchMerchantRequests = async () => {
        setLoading(true);
        try {
            const response = await authApi.getMerchantsPendingConsideration({ page: 0, size: 200, sort: "createdAt,desc" });
            setRequests(response?.content || []);
        } catch (error) {
            console.error("Failed to fetch merchant requests:", error);
            toast.error("Unable to load merchant requests list");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request: UserType) => {
        const ok = await confirm({
            title: "Approve merchant",
            description: `Approve ${request.username} as a merchant?`,
            confirmText: "Approve",
            cancelText: "Cancel",
        });
        if (!ok) return;

        setProcessingId(request.id);
        try {
            await authApi.approveMerchant(request.id);
            toast.success("Merchant approved successfully!");

            // Best-effort: initialize a default restaurant to avoid merchant dashboard 404s.
            // Only run when we have a usable phone; otherwise merchant will complete setup after first login.
            const phone = request.phone?.trim();
            if (phone) {
                try {
                    await restaurantApi.createRestaurant({
                        resName: request.username ? `${request.username}'s Restaurant` : "My Restaurant",
                        address: "Not updated",
                        longitude: 106.809883,
                        latitude: 10.841228,
                        openingTime: "09:00:00",
                        closingTime: "22:00:00",
                        phone,
                        merchantId: request.id,
                    });
                } catch {
                    // Silent: merchant can complete setup later.
                }
            }

            // Mark related notifications as read
            const { notifications } = useNotificationStore.getState();
            notifications
                .filter((n) => n.type === "ADMIN_MERCHANT_REQUEST" && n.merchantId === request.id)
                .forEach((n) => markAsRead(n.id));

            fetchMerchantRequests();
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Unable to approve merchant";
            toast.error(errorMessage);
        } finally {
            setProcessingId(null);
        }
    };

    const openReject = (request: UserType) => {
        setRejectTarget(request);
        setRejectReason("");
        setRejectOpen(true);
    };

    const handleReject = async () => {
        if (!rejectTarget) return;
        const reason = rejectReason.trim();
        if (!reason) {
            toast.error("Please enter a rejection reason");
            return;
        }

        setProcessingId(rejectTarget.id);
        try {
            await authApi.rejectMerchant(rejectTarget.id, { reason });
            toast.success("Merchant rejected successfully!");

            // Mark related notifications as read
            const { notifications } = useNotificationStore.getState();
            notifications
                .filter((n) => n.type === "ADMIN_MERCHANT_REQUEST" && n.merchantId === rejectTarget.id)
                .forEach((n) => markAsRead(n.id));

            fetchMerchantRequests();
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Unable to reject merchant";
            toast.error(errorMessage);
        } finally {
            setProcessingId(null);
            setRejectOpen(false);
            setRejectTarget(null);
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Merchant Requests</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View and approve merchant registration requests from users
                    </p>
                </div>
                <button
                    onClick={fetchMerchantRequests}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-white rounded-lg hover:bg-brand-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Pending Requests</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{requests.length}</p>
                    </div>
                    <div className="h-12 w-px bg-gray-300 dark:bg-gray-700"></div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Found</p>
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
                        placeholder="Search by username or email..."
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
                        <p className="text-lg font-medium mb-2">No requests found</p>
                        <p className="text-sm">All merchant requests have been processed</p>
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
                                                    Pending
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Mail size={16} />
                                                    <span>{request.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <User size={16} />
                                                    <span>Reason: Not provided</span>
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
                                                            Registered:{" "}
                                                            {new Date(request.createdAt).toLocaleDateString("en-US")}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => handleApprove(request)}
                                            disabled={processingId === request.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CheckCircle size={18} />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => openReject(request)}
                                            disabled={processingId === request.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <XCircle size={18} />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog.Root open={rejectOpen} onOpenChange={setRejectOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl outline-none dark:border-gray-700 dark:bg-gray-900">
                        <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                            Reject merchant
                        </Dialog.Title>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Provide a reason to reject {rejectTarget?.username}.
                        </div>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                            className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-yellow dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                            placeholder="Enter rejection reason..."
                        />
                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                disabled={processingId === rejectTarget?.id}
                                onClick={() => setRejectOpen(false)}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={processingId === rejectTarget?.id}
                                onClick={handleReject}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                Reject
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
