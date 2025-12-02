import api from "../axios";

export interface Payment {
        _id: string;
        orderId: string;
        userId: string;
        amount: number;
        currency: string;
        paymentMethod: string;
        status: "pending" | "processing" | "completed" | "failed" | "refunded";
        stripePaymentIntentId?: string;
        metadata?: Record<string, unknown>;
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

export interface CreatePaymentResponse {
        success: boolean;
        message: string;
        data: {
                clientSecret?: string;
                paymentId: string;
                status: string;
        };
}

export const paymentApi = {
        // Create payment
        createPayment: async (paymentData: CreatePaymentRequest) => {
                const response = await api.post<CreatePaymentResponse>("/payments", paymentData);
                return response.data;
        },

        // Get payment by order ID
        getPaymentByOrderId: async (orderId: string) => {
                const response = await api.get<{ success: boolean; data: Payment }>(`/payments/order/${orderId}`);
                return response.data.data;
        },

        // Get payment by ID
        getPaymentById: async (paymentId: string) => {
                const response = await api.get<Payment>(`/payments/${paymentId}`);
                return response.data;
        },

        // Get user payments
        getUserPayments: async (userId: string) => {
                const response = await api.get<Payment[]>(`/payments/user/${userId}`);
                return response.data;
        },

        // Refund payment
        refundPayment: async (paymentId: string, amount?: number, reason?: string) => {
                const response = await api.post(`/payments/${paymentId}/refund`, { amount, reason });
                return response.data;
        },
};
