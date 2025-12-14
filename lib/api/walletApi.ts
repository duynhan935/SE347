import api from "@/lib/axios";
import type { Pagination, PayoutRequest, Wallet, WalletTransaction } from "@/types/wallet.type";

export const walletApi = {
    getWallet: async (): Promise<Wallet> => {
        const res = await api.get("/wallet");
        return res.data?.data;
    },

    getTransactions: async (
        page = 1,
        limit = 20
    ): Promise<{ transactions: WalletTransaction[]; pagination: Pagination }> => {
        const res = await api.get(`/wallet/transactions?page=${page}&limit=${limit}`);
        return res.data?.data;
    },

    requestWithdraw: async (payload: {
        amount: number;
        bankInfo: { bankName: string; accountNumber: string; accountHolderName: string };
        note?: string;
    }): Promise<PayoutRequest> => {
        const res = await api.post("/wallet/withdraw", payload);
        return res.data?.data;
    },
};

export const adminWalletApi = {
    getPayoutRequests: async (
        params: { status?: string; page?: number; limit?: number } = {}
    ): Promise<{ requests: PayoutRequest[]; pagination: Pagination }> => {
        const search = new URLSearchParams();
        if (params.status) search.append("status", params.status);
        if (params.page) search.append("page", String(params.page));
        if (params.limit) search.append("limit", String(params.limit));

        const qs = search.toString();
        const res = await api.get(`/admin/wallets/payout-requests${qs ? `?${qs}` : ""}`);
        return res.data?.data;
    },

    approvePayoutRequest: async (id: string) => {
        const res = await api.post(`/admin/wallets/payout-requests/${id}/approve`);
        return res.data;
    },

    rejectPayoutRequest: async (id: string, reason: string) => {
        const res = await api.post(`/admin/wallets/payout-requests/${id}/reject`, { reason });
        return res.data;
    },
};
