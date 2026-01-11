"use client";

import { walletApi } from "@/lib/api/walletApi";
import type { BankInfo, WalletSummary, WalletTransaction } from "@/types/wallet.type";
import { Loader2, Wallet as WalletIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value || 0);

export default function MerchantWalletPage() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [wallet, setWallet] = useState<WalletSummary | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [amount, setAmount] = useState<number>(50000);
    const [bankInfo, setBankInfo] = useState<BankInfo>({
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
    });
    const [note, setNote] = useState("");

    const canSubmitWithdraw = useMemo(() => {
        if (submitting) return false;
        if (!amount || amount < 50000) return false;
        if (!bankInfo.bankName.trim()) return false;
        if (!bankInfo.accountNumber.trim()) return false;
        if (!bankInfo.accountHolderName.trim()) return false;
        return true;
    }, [amount, bankInfo, submitting]);

    const fetchAll = useCallback(async (nextPage: number) => {
        try {
            setLoading(true);
            const [walletRes, txRes] = await Promise.all([
                walletApi.getWallet(),
                walletApi.getTransactions({ page: nextPage, limit: 20 }),
            ]);

            setWallet(walletRes.data.data);
            setTransactions(txRes.data.data.transactions);
            setTotalPages(txRes.data.data.pagination.totalPages || 1);
        } catch (error) {
            console.error("Failed to load wallet:", error);
            toast.error("Không thể tải dữ liệu ví");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll(page);
    }, [fetchAll, page]);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmitWithdraw) return;

        try {
            setSubmitting(true);
            await walletApi.requestWithdraw({
                amount,
                bankInfo: {
                    bankName: bankInfo.bankName.trim(),
                    accountNumber: bankInfo.accountNumber.trim(),
                    accountHolderName: bankInfo.accountHolderName.trim(),
                },
                note: note.trim() || undefined,
            });
            toast.success("Đã gửi yêu cầu rút tiền");
            setNote("");
            setAmount(50000);
            setBankInfo({ bankName: "", accountNumber: "", accountHolderName: "" });
            await fetchAll(1);
            setPage(1);
        } catch (error: unknown) {
            console.error("Withdraw failed:", error);
            const message =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast.error(message || "Không thể gửi yêu cầu rút tiền");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !wallet) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-brand-yellow" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ví nhà hàng</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Theo dõi doanh thu và rút tiền</p>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <WalletIcon className="h-5 w-5" />
                    <span className="font-semibold">{formatVnd(wallet?.balance ?? 0)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Số dư hiện tại</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatVnd(wallet?.balance ?? 0)}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tổng đã kiếm</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{formatVnd(wallet?.totalEarned ?? 0)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tổng đã rút</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{formatVnd(wallet?.totalWithdrawn ?? 0)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Yêu cầu rút tiền</h2>
                    <form className="space-y-4" onSubmit={handleWithdraw}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Số tiền (tối thiểu 50.000đ)
                            </label>
                            <input
                                type="number"
                                min={50000}
                                step={1000}
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ngân hàng
                            </label>
                            <input
                                type="text"
                                value={bankInfo.bankName}
                                onChange={(e) => setBankInfo((prev) => ({ ...prev, bankName: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Số tài khoản
                            </label>
                            <input
                                type="text"
                                value={bankInfo.accountNumber}
                                onChange={(e) => setBankInfo((prev) => ({ ...prev, accountNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Chủ tài khoản
                            </label>
                            <input
                                type="text"
                                value={bankInfo.accountHolderName}
                                onChange={(e) =>
                                    setBankInfo((prev) => ({ ...prev, accountHolderName: e.target.value }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ghi chú (tuỳ chọn)
                            </label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!canSubmitWithdraw}
                            className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                                canSubmitWithdraw
                                    ? "bg-brand-yellow text-white hover:bg-brand-yellow/90"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Giao dịch</h2>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-sm disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Page {page} / {totalPages}
                            </span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Loại
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Số tiền
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Mô tả
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Chưa có giao dịch
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                                {tx.createdAt ? new Date(tx.createdAt).toLocaleString("vi-VN") : ""}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                                {tx.type === "EARN" ? "Doanh thu" : "Rút tiền"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                                <span className={tx.amount >= 0 ? "text-green-600" : "text-red-600"}>
                                                    {formatVnd(tx.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                                {tx.status}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {tx.description || ""}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
