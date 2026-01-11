import type { PaymentMethod } from "./order.type";

export type PaymentTransactionStatus =
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded";

export interface Payment {
        id: string; // UUID
        paymentId: string; // String(100), unique
        orderId: string;
        userId: string;
        amount: number; // DECIMAL(10, 2)
        currency: string; // String(3), default 'USD'
        paymentMethod: PaymentMethod;
        paymentGateway?: string; // String(50), default 'stripe'
        transactionId?: string; // String(200)
        status: PaymentTransactionStatus;
        failureReason?: string; // TEXT
        refundAmount?: number; // DECIMAL(10, 2), default 0
        refundReason?: string; // TEXT
        refundTransactionId?: string; // String(200)
        metadata?: Record<string, unknown>; // JSON
        processedAt?: string; // DATE
        refundedAt?: string; // DATE
        createdAt: string;
        updatedAt: string;
}

export interface CreatePaymentRequest {
        orderId: string;
        userId: string;
        amount: number;
        currency?: string;
        paymentMethod: PaymentMethod;
        metadata?: Record<string, unknown>;
}

export interface CreatePaymentResponse {
        success: boolean;
        message: string;
        data: {
                clientSecret?: string;
                paymentId: string;
                status: string;
        };
}

