export type PayoutRequestStatus = "pending" | "completed" | "rejected";

export type WalletTransactionType = "EARN" | "WITHDRAW";
export type WalletTransactionStatus = "PENDING" | "COMPLETED" | "REJECTED";

export interface WalletSummary {
    balance: number;
    totalEarned: number;
    totalWithdrawn: number;
}

export interface WalletTransaction {
    id: string;
    type: WalletTransactionType;
    amount: number;
    status: WalletTransactionStatus;
    description?: string;
    createdAt: string;
}

export interface WalletTransactionsResponse {
    transactions: WalletTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface BankInfo {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
}

export interface PayoutRequest {
    id: string;
    walletId: string;
    amount: number;
    bankInfo: BankInfo;
    note?: string;
    status: PayoutRequestStatus;
    processedAt?: string;
    createdAt: string;
    updatedAt?: string;
    Wallet?: {
        restaurantId: string;
    };
}

export interface AdminPayoutRequestsResponse {
    requests: PayoutRequest[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}
