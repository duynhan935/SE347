import api from "../axios";

export interface Payment {
        id: string;
        paymentId: string;
        orderId: string;
        userId: string;
        amount: string | number;
        currency: string;
        paymentMethod: "cash" | "card" | "wallet";
        paymentGateway?: string;
        transactionId?: string | null;
        status: "pending" | "processing" | "completed" | "failed" | "refunded";
        failureReason?: string | null;
        refundAmount?: string | number;
        refundReason?: string | null;
        refundTransactionId?: string | null;
        metadata?: Record<string, unknown> | null;
        processedAt?: string | null;
        refundedAt?: string | null;
        createdAt: string;
        updatedAt: string;
}

export interface CreatePaymentRequest {
        orderId: string;
        userId: string;
        amount: number;
        currency?: string;
        paymentMethod: string;
        metadata?: Record<string, unknown>;
}

export interface CardPaymentInitData {
        clientSecret: string;
        paymentId: string;
        status: string;
}

export type CreatePaymentData = CardPaymentInitData | Payment;

export interface CreatePaymentResponse {
        success: boolean;
        message: string;
        data: CreatePaymentData;
}

export const paymentApi = {
        // Create payment
        createPayment: async (paymentData: CreatePaymentRequest) => {
                const response = await api.post<CreatePaymentResponse>("/payments", paymentData);
                return response.data;
        },

        // Get payment by order ID
        getPaymentByOrderId: async (orderId: string) => {
                // Validate orderId before making request
                if (!orderId || typeof orderId !== "string" || orderId === "undefined" || orderId === "null") {
                        throw new Error(`Invalid orderId: ${orderId}. Order ID must be a valid string.`);
                }

                const response = await api.get<{ success: boolean; data: Payment }>(`/payments/order/${orderId}`);
                return response.data.data;
        },

        // Get payment by ID
        getPaymentById: async (paymentId: string) => {
                const response = await api.get<{ success: boolean; data: Payment }>(`/payments/${paymentId}`);
                return response.data.data;
        },

        // Get user payments
        getUserPayments: async (userId: string) => {
                const response = await api.get<{ success: boolean; data?: Payment[]; pagination?: unknown }>(
                        `/payments/user/${userId}`
                );
                return {
                        payments: Array.isArray(response.data.data) ? response.data.data : [],
                        pagination: response.data.pagination,
                };
        },

        // Refund payment
        refundPayment: async (paymentId: string, amount?: number, reason?: string) => {
                const response = await api.post(`/payments/${paymentId}/refund`, { amount, reason });
                return response.data;
        },
};
