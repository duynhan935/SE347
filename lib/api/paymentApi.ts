import { CreatePaymentRequest, CreatePaymentResponse, Payment } from "@/types/payment.type";
import api from "../axios";


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
