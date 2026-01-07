export interface Wallet {
        id: string; // UUID
        restaurantId: string; // String(100), unique
        balance: number; // DECIMAL(15, 2), default 0.0
        totalEarned: number; // DECIMAL(15, 2), default 0.0
        totalWithdrawn: number; // DECIMAL(15, 2), default 0.0
        createdAt: string;
        updatedAt: string;
}

export type WalletTransactionType = "EARN" | "WITHDRAW";
export type WalletTransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface WalletTransaction {
        id: string; // UUID
        walletId: string; // UUID
        orderId?: string; // String(100)
        payoutRequestId?: string; // UUID
        type: WalletTransactionType;
        amount: number; // DECIMAL(15, 2)
        status: WalletTransactionStatus; // default 'PENDING'
        description?: string; // TEXT
        createdAt: string;
        updatedAt: string;
}

export type PayoutRequestStatus = "pending" | "processing" | "completed" | "failed";

export interface BankInfo {
        bankName: string;
        accountNumber: string;
        accountHolderName: string;
        [key: string]: unknown; // For additional bank info fields
}

export interface PayoutRequest {
        id: string; // UUID
        walletId: string; // UUID
        amount: number; // DECIMAL(15, 2)
        bankInfo: BankInfo; // JSON
        status: PayoutRequestStatus; // default 'pending'
        note?: string; // TEXT
        processedAt?: string; // DATE
        createdAt: string;
        updatedAt: string;
}

export interface CreatePayoutRequest {
        walletId: string;
        amount: number;
        bankInfo: BankInfo;
        note?: string;
}

