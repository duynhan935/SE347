import { CreateGroupOrderRequest, GroupOrder, GroupOrderPaymentRequest, JoinGroupOrderRequest } from "@/types/groupOrder.type";
import api from "../axios";

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

interface ListResponse<T> {
    success: boolean;
    data: T[];
    pagination: Pagination;
}

export const groupOrderApi = {
    // Create new group order
    createGroupOrder: async (data: CreateGroupOrderRequest): Promise<GroupOrder> => {
        const response = await api.post<ApiResponse<GroupOrder>>("/group-orders", data);
        return response.data.data;
    },

    // Get user's group orders
    getMyGroupOrders: async (params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: GroupOrder[]; pagination: Pagination }> => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append("status", params.status);
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        const response = await api.get<ListResponse<GroupOrder>>(
            `/group-orders/my-orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
        );
        return {
            data: response.data.data,
            pagination: response.data.pagination,
        };
    },

    // Get group order by share token
    getGroupOrderByToken: async (shareToken: string): Promise<GroupOrder> => {
        const response = await api.get<ApiResponse<GroupOrder>>(`/group-orders/${shareToken}`);
        return response.data.data;
    },

    // Join group order
    joinGroupOrder: async (shareToken: string, data: JoinGroupOrderRequest): Promise<GroupOrder> => {
        const response = await api.post<ApiResponse<GroupOrder>>(`/group-orders/${shareToken}/join`, data);
        return response.data.data;
    },

    // Remove participant from group order
    removeParticipant: async (shareToken: string, userId: string): Promise<GroupOrder> => {
        const response = await api.delete<ApiResponse<GroupOrder>>(`/group-orders/${shareToken}/participants/${userId}`);
        return response.data.data;
    },

    // Lock group order
    lockGroupOrder: async (shareToken: string): Promise<GroupOrder> => {
        const response = await api.post<ApiResponse<GroupOrder>>(`/group-orders/${shareToken}/lock`);
        return response.data.data;
    },

    // Confirm group order (create actual order)
    // Backend returns { groupOrder, order } where order has orderId
    confirmGroupOrder: async (shareToken: string): Promise<{ groupOrder: GroupOrder; order: { orderId: string } }> => {
        const response = await api.post<ApiResponse<{ groupOrder: GroupOrder; order: { orderId: string } }>>(
            `/group-orders/${shareToken}/confirm`
        );
        return response.data.data;
    },

    // Cancel group order
    cancelGroupOrder: async (shareToken: string): Promise<GroupOrder> => {
        const response = await api.post<ApiResponse<GroupOrder>>(`/group-orders/${shareToken}/cancel`);
        return response.data.data;
    },

    // Pay for individual participant
    payForParticipant: async (shareToken: string, data: GroupOrderPaymentRequest): Promise<{
        amountPaid: number;
        paymentResult: unknown;
    }> => {
        const response = await api.post<ApiResponse<{
            amountPaid: number;
            paymentResult: unknown;
        }>>(`/group-orders/${shareToken}/pay`, data);
        return response.data.data;
    },

    // Pay for whole group order
    payForWholeGroup: async (shareToken: string, data: GroupOrderPaymentRequest): Promise<{
        amountPaid: number;
        message: string;
    }> => {
        const response = await api.post<ApiResponse<{
            amountPaid: number;
            message: string;
        }>>(`/group-orders/${shareToken}/pay-all`, data);
        return response.data.data;
    },

    // Check payment status
    checkPaymentStatus: async (shareToken: string): Promise<{
        allPaid: boolean;
        totalParticipants: number;
        paidParticipants: number;
        pendingParticipants: number;
        participants: Array<{
            userId: string;
            userName: string;
            paymentStatus: string;
            paidAmount: number;
            totalAmount: number;
        }>;
    }> => {
        const response = await api.get<ApiResponse<{
            allPaid: boolean;
            totalParticipants: number;
            paidParticipants: number;
            pendingParticipants: number;
            participants: Array<{
                userId: string;
                userName: string;
                paymentStatus: string;
                paidAmount: number;
                totalAmount: number;
            }>;
        }>>(`/group-orders/${shareToken}/payment-status`);
        return response.data.data;
    },
};

