"use client";

import { walletApi } from "@/lib/api/walletApi";
import type { Wallet, WalletTransaction } from "@/types/wallet.type";
import { DollarSign, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatVnd(amount: number) {
    return amount.toLocaleString("vi-VN") + "₫";
}

export default function MerchantWalletPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [amount, setAmount] = useState(50000);
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");
    const [note, setNote] = useState("");

    const canSubmit = useMemo(() => {
        return (
            !submitting &&
            amount >= 50000 &&
            bankName.trim().length > 0 &&
            accountNumber.trim().length > 0 &&
            accountHolderName.trim().length > 0
        );
    }, [submitting, amount, bankName, accountNumber, accountHolderName]);

    const getErrorMessage = (e: unknown) => {
        if (typeof e === "string") return e;
        if (e && typeof e === "object") {
            const maybe = e as { response?: { data?: { message?: string } }; message?: string };
            return maybe.response?.data?.message || maybe.message || "Không tải được ví";
        }
        return "Không tải được ví";
    };

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [w, tx] = await Promise.all([walletApi.getWallet(), walletApi.getTransactions(1, 20)]);
            setWallet(w);
            setTransactions(tx?.transactions || []);
        } catch (e: unknown) {
            setError(getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            await walletApi.requestWithdraw({
                amount,
                bankInfo: {
                    bankName: bankName.trim(),
                    accountNumber: accountNumber.trim(),
                    accountHolderName: accountHolderName.trim(),
                },
                note: note.trim() || undefined,
            });
            setSuccess("Đã gửi yêu cầu rút tiền.");
            void load();
        } catch (e: unknown) {
            setError(getErrorMessage(e) || "Gửi yêu cầu thất bại");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ví doanh thu</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Xem số dư và yêu cầu rút tiền</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-brand-yellow" />
                </div>
            ) : (
                <>
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                            {success}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Số dư hiện tại</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                            {wallet ? formatVnd(wallet.balance) : "—"}
                                        </p>
                                    </div>
                                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Yêu cầu rút tiền
                                </h2>
                                <form className="space-y-4" onSubmit={onSubmit}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Số tiền (≥ 50.000đ)
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Ngân hàng
                                        </label>
                                        <input
                                            type="text"
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                            placeholder="VD: Techcombank"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Số tài khoản
                                        </label>
                                        <input
                                            type="text"
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                            placeholder="VD: 1903xxxx"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Chủ tài khoản
                                        </label>
                                        <input
                                            type="text"
                                            value={accountHolderName}
                                            onChange={(e) => setAccountHolderName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                            placeholder="VD: NGUYEN VAN A"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Ghi chú (tuỳ chọn)
                                        </label>
                                        <input
                                            type="text"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                            placeholder="VD: Rút tiền tuần này"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!canSubmit}
                                        className="w-full px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 disabled:opacity-60 disabled:hover:bg-brand-yellow text-white rounded-lg transition-colors"
                                    >
                                        {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Giao dịch gần đây
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Thời gian
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Loại
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Số tiền
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                Mô tả
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {transactions.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                                                >
                                                    Chưa có giao dịch
                                                </td>
                                            </tr>
                                        ) : (
                                            transactions.map((tx) => (
                                                <tr key={tx.id}>
                                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                        {new Date(tx.createdAt).toLocaleString("vi-VN")}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                        {tx.type}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                                                        {formatVnd(tx.amount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                        {tx.description || "—"}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
