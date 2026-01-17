import api from "../axios";
import type {
    AdminMerchantPerformance,
    AdminOrderStatistics,
    AdminPlatformTrendPoint,
    AdminRevenueAnalytics,
    AdminRevenueByMerchant,
    AdminSystemOverview,
    AdminTopMerchant,
    ApiSuccessResponse,
    MerchantHourlyStatistic,
    MerchantOrderOverview,
    MerchantRevenueAnalytics,
    MerchantRatingStats,
    MerchantRevenueTrendPoint,
    MerchantRestaurantOverview,
    MerchantTimeBasedAnalytics,
    MerchantTopProduct,
} from "@/types/dashboard.type";

function getFilenameFromContentDisposition(headerValue: unknown): string | null {
    if (typeof headerValue !== "string") return null;

    // Examples:
    // content-disposition: attachment; filename="report.pdf"
    // content-disposition: attachment; filename=report.pdf
    const match = headerValue.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i);
    const raw = match?.[1] ?? match?.[2] ?? match?.[3];
    if (!raw) return null;

    try {
        return decodeURIComponent(raw.trim());
    } catch {
        return raw.trim();
    }
}

function toISODateOnly(date: Date): string {
    // Backend expects YYYY-MM-DD
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export type DashboardDateRangePreset = "7d" | "30d" | "90d" | "ytd" | "all";

export function buildDateRangeQuery(preset: DashboardDateRangePreset): { startDate?: string; endDate?: string } {
    if (preset === "all") return {};

    const now = new Date();

    if (preset === "ytd") {
        const start = new Date(now.getFullYear(), 0, 1);
        return { startDate: toISODateOnly(start), endDate: toISODateOnly(now) };
    }

    const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
    const start = new Date(now);
    start.setDate(now.getDate() - days + 1);

    return { startDate: toISODateOnly(start), endDate: toISODateOnly(now) };
}

export const dashboardApi = {
    // ===================== ADMIN =====================
    getAdminOverview: async (params?: { startDate?: string; endDate?: string }): Promise<AdminSystemOverview> => {
        const response = await api.get<ApiSuccessResponse<AdminSystemOverview>>("/admin/dashboard/overview", {
            params,
        });
        return response.data.data;
    },

    getAdminMerchantsPerformance: async (params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<AdminMerchantPerformance[]> => {
        const response = await api.get<ApiSuccessResponse<AdminMerchantPerformance[]>>("/admin/dashboard/merchants", {
            params,
        });
        return Array.isArray(response.data.data) ? response.data.data : [];
    },

    getAdminRevenueAnalytics: async (params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<AdminRevenueAnalytics> => {
        const response = await api.get<ApiSuccessResponse<AdminRevenueAnalytics>>("/admin/dashboard/revenue", {
            params,
        });
        return response.data.data;
    },

    getAdminOrderStatistics: async (params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<AdminOrderStatistics> => {
        const response = await api.get<ApiSuccessResponse<AdminOrderStatistics>>("/admin/dashboard/orders", {
            params,
        });
        return response.data.data;
    },

    getAdminTrends: async (params?: { startDate?: string; endDate?: string }): Promise<AdminPlatformTrendPoint[]> => {
        const response = await api.get<ApiSuccessResponse<AdminPlatformTrendPoint[]>>("/admin/dashboard/trends", {
            params,
        });
        return Array.isArray(response.data.data) ? response.data.data : [];
    },

    getAdminTopMerchants: async (params?: {
        limit?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<AdminTopMerchant[]> => {
        const response = await api.get<ApiSuccessResponse<AdminTopMerchant[]>>("/admin/dashboard/merchants/top", {
            params,
        });
        return Array.isArray(response.data.data) ? response.data.data : [];
    },

    getAdminRevenueByMerchant: async (params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<AdminRevenueByMerchant[]> => {
        const response = await api.get<ApiSuccessResponse<AdminRevenueByMerchant[]>>(
            "/admin/dashboard/revenue/by-merchant",
            {
                params,
            }
        );
        return Array.isArray(response.data.data) ? response.data.data : [];
    },

    // ===================== MERCHANT =====================
    getMerchantOverview: async (
        merchantId: string,
        params?: { startDate?: string; endDate?: string }
    ): Promise<MerchantOrderOverview> => {
        const response = await api.get<ApiSuccessResponse<MerchantOrderOverview>>(
            `/merchant/${merchantId}/dashboard/overview`,
            { params }
        );
        return response.data.data;
    },

    getMerchantRevenueTrend: async (
        merchantId: string,
        params?: { startDate?: string; endDate?: string }
    ): Promise<MerchantRevenueTrendPoint[]> => {
        const response = await api.get<ApiSuccessResponse<MerchantRevenueTrendPoint[]>>(
            `/merchant/${merchantId}/dashboard/revenue/trend`,
            { params }
        );
        return Array.isArray(response.data.data) ? response.data.data : [];
    },

    getMerchantRevenue: async (
        merchantId: string,
        params?: { startDate?: string; endDate?: string }
    ): Promise<MerchantRevenueAnalytics> => {
        const response = await api.get<ApiSuccessResponse<MerchantRevenueAnalytics>>(
            `/merchant/${merchantId}/dashboard/revenue`,
            { params }
        );
        return response.data.data;
    },

    getMerchantTopProducts: async (
        merchantId: string,
        params?: { limit?: number; startDate?: string; endDate?: string }
    ): Promise<MerchantTopProduct[]> => {
        const response = await api.get<ApiSuccessResponse<MerchantTopProduct[]>>(
            `/merchant/${merchantId}/dashboard/products/top`,
            { params }
        );
        return Array.isArray(response.data.data) ? response.data.data : [];
    },

    getMerchantOrderStatusBreakdown: async (
        merchantId: string,
        params?: { startDate?: string; endDate?: string }
    ): Promise<Array<{ status: string; count: number; totalAmount: number }>> => {
        const response = await api.get<
            ApiSuccessResponse<Array<{ status: string; count: number; totalAmount: number }>>
        >(`/merchant/${merchantId}/dashboard/orders/status`, { params });
        return Array.isArray(response.data.data) ? response.data.data : [];
    },

    getMerchantRatingStats: async (
        merchantId: string,
        params?: { startDate?: string; endDate?: string }
    ): Promise<MerchantRatingStats> => {
        const response = await api.get<ApiSuccessResponse<MerchantRatingStats>>(
            `/merchant/${merchantId}/dashboard/ratings`,
            { params }
        );
        return response.data.data;
    },

    getMerchantHourlyStatistics: async (
        merchantId: string,
        params?: { startDate?: string; endDate?: string }
    ): Promise<MerchantHourlyStatistic[]> => {
        const response = await api.get<ApiSuccessResponse<MerchantHourlyStatistic[]>>(
            `/merchant/${merchantId}/dashboard/hourly`,
            { params }
        );
        return Array.isArray(response.data.data) ? response.data.data : [];
    },

    getMerchantTimeAnalytics: async (
        merchantId: string,
        params?: { startDate?: string; endDate?: string }
    ): Promise<MerchantTimeBasedAnalytics> => {
        const response = await api.get<ApiSuccessResponse<MerchantTimeBasedAnalytics>>(
            `/merchant/${merchantId}/dashboard/time-analytics`,
            { params }
        );
        return response.data.data;
    },

    downloadMerchantPdfReport: async (
        merchantId: string,
        params: { startDate: string; endDate: string }
    ): Promise<{ blob: Blob; filename: string }> => {
        const response = await api.get(`/merchant/${merchantId}/reports/pdf`, {
            params,
            responseType: "blob",
        });

        const filename =
            getFilenameFromContentDisposition(response.headers?.["content-disposition"]) ||
            `dashboard-report-${merchantId}-${params.startDate}-${params.endDate}.pdf`;

        return { blob: response.data as Blob, filename };
    },

    getMerchantRestaurantOverview: async (merchantId: string): Promise<MerchantRestaurantOverview> => {
        // This endpoint is served by restaurant-service via api-gateway
        const response = await api.get<MerchantRestaurantOverview>(`/dashboard/merchant/${merchantId}/restaurant`);
        return response.data;
    },
};
