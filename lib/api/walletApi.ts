import api from "../axios";
import type {
    AdminPayoutRequestsResponse,
    BankInfo,
    PayoutRequest,
    WalletSummary,
    WalletTransactionsResponse,
} from "@/types/wallet.type";

type ApiSuccess<T> = {
    success: boolean;
    message?: string;
    data: T;
};

export const walletApi = {
    // Merchant/Restaurant wallet
    getWallet: () => api.get<ApiSuccess<WalletSummary>>("/wallets"),

    getTransactions: (params?: { page?: number; limit?: number }) =>
        api.get<ApiSuccess<WalletTransactionsResponse>>("/wallets/transactions", { params }),

    requestWithdraw: (payload: { amount: number; bankInfo: BankInfo; note?: string }) =>
        api.post<ApiSuccess<PayoutRequest>>("/wallets/withdraw", payload),

    // Admin wallet
    getPayoutRequests: (params?: { status?: "pending" | "completed" | "rejected"; page?: number; limit?: number }) =>
        api.get<ApiSuccess<AdminPayoutRequestsResponse>>("/admin/wallets/payout-requests", { params }),

    approvePayoutRequest: (id: string) =>
        api.post<ApiSuccess<PayoutRequest>>(`/admin/wallets/payout-requests/${id}/approve`),

    rejectPayoutRequest: (id: string, reason: string) =>
        api.post<ApiSuccess<PayoutRequest>>(`/admin/wallets/payout-requests/${id}/reject`, { reason }),
};
