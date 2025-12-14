export interface Wallet {
    id?: string;
    restaurantId: string;
    balance: number;
    createdAt?: string;
    updatedAt?: string;
}

export type WalletTransactionType = "credit" | "debit" | "payout" | string;

export interface WalletTransaction {
    id: string;
    walletId?: string;
    type: WalletTransactionType;
    amount: number;
    description?: string;
    referenceId?: string;
    createdAt: string;
    updatedAt?: string;
}

export type PayoutRequestStatus = "pending" | "completed" | "rejected" | string;

export interface PayoutRequest {
    id: string;
    walletId: string;
    amount: number;
    bankInfo: {
        bankName: string;
        accountNumber: string;
        accountHolderName: string;
    };
    status: PayoutRequestStatus;
    reason?: string | null;
    note?: string | null;
    createdAt: string;
    updatedAt?: string;
    Wallet?: {
        restaurantId: string;
    };
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
}
