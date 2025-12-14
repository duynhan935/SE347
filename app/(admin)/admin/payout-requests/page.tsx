"use client";

import { adminWalletApi } from "@/lib/api/walletApi";
import type { PayoutRequest } from "@/types/wallet.type";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

function formatVnd(amount: number) {
    return amount.toLocaleString("vi-VN") + "₫";
}

function badgeClass(status: string) {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
        case "completed":
            return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
        case "rejected":
            return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
}

export default function AdminPayoutRequestsPage() {
    const [status, setStatus] = useState<string>("");
    const [requests, setRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const getErrorMessage = (e: unknown) => {
        if (typeof e === "string") return e;
        if (e && typeof e === "object") {
            const maybe = e as { response?: { data?: { message?: string } }; message?: string };
            return maybe.response?.data?.message || maybe.message || "Không tải được danh sách";
        }
        return "Không tải được danh sách";
    };

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminWalletApi.getPayoutRequests({ status: status || undefined, page: 1, limit: 50 });
            setRequests(data?.requests || []);
        } catch (e: unknown) {
            setError(getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    async function approve(id: string) {
        setBusyId(id);
        setError(null);
        try {
            await adminWalletApi.approvePayoutRequest(id);
            void load();
        } catch (e: unknown) {
            setError(getErrorMessage(e) || "Duyệt thất bại");
        } finally {
            setBusyId(null);
        }
    }

    async function reject(id: string) {
        const reason = window.prompt("Lý do từ chối?");
        if (!reason) return;
        setBusyId(id);
        setError(null);
        try {
            await adminWalletApi.rejectPayoutRequest(id, reason);
            void load();
        } catch (e: unknown) {
            setError(getErrorMessage(e) || "Từ chối thất bại");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yêu cầu rút tiền</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Duyệt/từ chối yêu cầu rút tiền của Merchant</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-brand-yellow" />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        RestaurantId
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Ngân hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Số tiền
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Không có yêu cầu
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((r) => {
                                        const isBusy = busyId === r.id;
                                        return (
                                            <tr key={r.id}>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {r.Wallet?.restaurantId || "—"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {r.bankInfo?.bankName}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                                            {r.bankInfo?.accountNumber} •{" "}
                                                            {r.bankInfo?.accountHolderName}
                                                        </div>
                                                        {r.note ? (
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                Ghi chú: {r.note}
                                                            </div>
                                                        ) : null}
                                                        {r.reason ? (
                                                            <div className="text-xs text-red-600 dark:text-red-300">
                                                                Lý do: {r.reason}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                                    {formatVnd(r.amount)}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(
                                                            r.status
                                                        )}`}
                                                    >
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm">
                                                    {r.status === "pending" ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                disabled={isBusy}
                                                                onClick={() => approve(r.id)}
                                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg"
                                                            >
                                                                Duyệt
                                                            </button>
                                                            <button
                                                                disabled={isBusy}
                                                                onClick={() => reject(r.id)}
                                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg"
                                                            >
                                                                Từ chối
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 dark:text-gray-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
